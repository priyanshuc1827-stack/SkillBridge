/**
 * POST /api/student/resume
 *
 * Accepts a PDF or DOCX resume upload (multipart/form-data, field: "resume").
 * Uploads the file to Supabase Storage and uses Gemini to extract technical skills.
 *
 * Returns: { resumeUrl, extractedSkills: [{ name, category }] }
 *
 * Gracefully degrades if GEMINI_API_KEY or SUPABASE_* env vars are not set.
 */

import { Router } from 'express';
import multer from 'multer';
import prisma from '../lib/prisma.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);
router.use(authorize('student'));

// Multer: store in memory (no disk writes), max 5MB, PDF and DOCX only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are accepted'), false);
    }
  },
});

// ─── Supabase Storage upload helper ──────────────────────────────────────────

async function uploadToSupabase(buffer, filename, mimetype) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    // Return null — caller handles graceful degradation
    return null;
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

  try {
    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(filename, buffer, { contentType: mimetype, upsert: true });

    if (error) {
      console.warn(`[Supabase Storage] Upload warning: ${error.message}`);
      return null;
    }

    const { data: publicData } = supabase.storage.from('resumes').getPublicUrl(data.path);
    return publicData.publicUrl;
  } catch (err) {
    console.warn(`[Supabase Storage] Upload failed: ${err.message}`);
    return null;
  }
}

// ─── Gemini skill extraction helper ──────────────────────────────────────────

async function extractSkillsFromResume(buffer, mimetype) {
  if (!process.env.GEMINI_API_KEY) return [];

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-3.6-flash' });

    const base64 = buffer.toString('base64');
    const prompt = `You are a resume parser specialised in software engineering profiles.
Extract ALL technical skills, programming languages, frameworks, tools, platforms, and databases from this resume.

RULES:
- Include only technical/hard skills. Exclude soft skills (communication, teamwork, etc.).
- Normalise skill names (e.g., "node" → "Node.js", "react.js" → "React", "postgres" → "PostgreSQL").
- Assign each skill a category from: Programming, Frontend, Backend, Database, DevOps, AI/ML, Data Science, Cloud, Mobile, Architecture, Testing, Other.
- Return ONLY a JSON array. No markdown, no explanation.

Format:
[{"name": "React", "category": "Frontend"}, {"name": "PostgreSQL", "category": "Database"}]`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: mimetype, data: base64 } },
    ]);

    const text = result.response.text().trim();
    const jsonText = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    const skills = JSON.parse(jsonText);

    if (!Array.isArray(skills)) return [];

    return skills.filter(s => typeof s.name === 'string' && s.name.length > 0);
  } catch (err) {
    console.error('[resume] Gemini extraction failed:', err.message);
    return [];
  }
}

// ─── POST /api/student/resume ─────────────────────────────────────────────────

router.post('/', upload.single('resume'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please attach a PDF or DOCX file.' });
    }

    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    const filename = `${student.id}_${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    // Run upload and skill extraction in parallel
    const [resumeUrl, extractedSkills] = await Promise.all([
      uploadToSupabase(req.file.buffer, filename, req.file.mimetype),
      extractSkillsFromResume(req.file.buffer, req.file.mimetype),
    ]);

    // Update resumeUrl if upload succeeded
    if (resumeUrl) {
      await prisma.student.update({
        where: { id: student.id },
        data: { resumeUrl },
      });
    }

    res.json({
      message: resumeUrl
        ? `Resume uploaded successfully. Found ${extractedSkills.length} technical skills.`
        : `Resume processed locally. Found ${extractedSkills.length} technical skills. (Storage not configured — file not persisted)`,
      resumeUrl: resumeUrl || null,
      extractedSkills,
    });
  } catch (err) {
    // Multer errors (file type, size)
    if (err.message?.includes('PDF') || err.message?.includes('DOCX') || err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

export default router;
