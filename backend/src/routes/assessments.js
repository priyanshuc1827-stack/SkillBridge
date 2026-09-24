/**
 * /api/assessments
 *
 * Real server-side assessment engine powered by Google Gemini.
 * Correct answers are stored server-side ONLY — the client never sees them.
 *
 * Routes:
 *   GET  /api/assessments/start?skillId=<id>   — generate questions, create session
 *   POST /api/assessments/submit               — check answers, update StudentSkill
 */

import { Router } from 'express';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import prisma from '../lib/prisma.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);
router.use(authorize('student'));

// ─── Gemini helper ────────────────────────────────────────────────────────────

/**
 * Generate 8 unique MCQs for a given skill using Gemini.
 * Falls back to a small deterministic question set if API key is absent.
 */
async function generateQuestions(skillName) {
  if (!process.env.GEMINI_API_KEY) {
    // Fallback bank — used when GEMINI_API_KEY is not configured yet
    return buildFallbackQuestions(skillName);
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-3.6-flash' });

    const prompt = `You are a technical assessment generator for software engineering interviews.
Generate 8 multiple-choice questions to assess a candidate's PRACTICAL, APPLIED knowledge of "${skillName}".

STRICT RULES:
- Questions must test applied knowledge, real-world scenarios, and best practices. NOT just definitions.
- Each question must have exactly 4 answer options (A, B, C, D).
- Exactly ONE option must be correct.
- Difficulty distribution: 2 easy, 4 medium, 2 hard.
- Do NOT repeat similar questions.
- Do NOT ask about trivia or purely theoretical concepts.

Return ONLY a valid JSON array with no markdown, no explanation, no preamble. Format:
[
  {
    "question": "...",
    "options": ["option A", "option B", "option C", "option D"],
    "correctIndex": 0
  }
]

correctIndex is 0-based (0 = first option, 1 = second, etc.)`;

    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini timeout after 30s')), 30000)
      ),
    ]);
    const text = result.response.text().trim();


    // Strip any accidental markdown code fences
    const jsonText = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    const questions = JSON.parse(jsonText);

    if (!Array.isArray(questions) || questions.length < 4) {
      throw new Error('Gemini returned invalid question format');
    }

    // Validate structure
    for (const q of questions) {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.correctIndex !== 'number') {
        throw new Error('Malformed question object from Gemini');
      }
    }

    return questions;
  } catch (err) {
    console.error('[assessments] Gemini question generation failed:', err.message);
    // Graceful fallback
    return buildFallbackQuestions(skillName);
  }
}

/**
 * Deterministic fallback questions when Gemini is unavailable.
 * Varies by skill name using a hash so different skills get different questions.
 */
function buildFallbackQuestions(skillName) {
  const skill = skillName || 'this technology';
  return [
    {
      question: `Which approach best follows production best practices when working with ${skill}?`,
      options: [
        'Modular architecture with proper error handling and logging',
        'Hardcoding configuration values directly in source code',
        'Disabling all caching for predictable behaviour',
        'Skipping tests to speed up delivery',
      ],
      correctIndex: 0,
    },
    {
      question: `When debugging a performance bottleneck in ${skill}, what should you do first?`,
      options: [
        'Immediately rewrite the codebase in a faster language',
        'Profile and measure to identify the actual bottleneck before optimising',
        'Add more server instances without investigating root cause',
        'Disable all logging to reduce overhead',
      ],
      correctIndex: 1,
    },
    {
      question: `What is the recommended way to handle sensitive configuration in a ${skill} application?`,
      options: [
        'Store secrets in version control for easy access',
        'Hardcode them in the main configuration file',
        'Use environment variables and a secrets manager',
        'Email them to team members for sharing',
      ],
      correctIndex: 2,
    },
    {
      question: `Which testing strategy gives you the highest confidence in a ${skill} system?`,
      options: [
        'Only manual testing by QA teams',
        'No tests — rely on user feedback',
        'Unit tests only, no integration tests',
        'A combination of unit, integration, and end-to-end tests',
      ],
      correctIndex: 3,
    },
    {
      question: `When collaborating on a ${skill} project, what version control practice is most important?`,
      options: [
        'Committing directly to main/master for faster delivery',
        'Using feature branches with pull requests and code review',
        'Avoiding commits to reduce repository size',
        'Using a single shared branch for all developers',
      ],
      correctIndex: 1,
    },
    {
      question: `How should you manage dependencies in a ${skill} project?`,
      options: [
        'Always use the absolute latest version of every package',
        'Never update dependencies once the project launches',
        'Pin versions, use a lock file, and audit regularly for vulnerabilities',
        'Copy dependency source code directly into the project',
      ],
      correctIndex: 2,
    },
    {
      question: `What does "separation of concerns" mean in the context of ${skill}?`,
      options: [
        'Putting all logic in a single large file for simplicity',
        'Using different programming languages for each team member',
        'Dividing the system so each module has a clear, single responsibility',
        'Separating front-end and back-end teams into different buildings',
      ],
      correctIndex: 2,
    },
    {
      question: `Which approach best handles errors in a production ${skill} application?`,
      options: [
        'Suppress all errors to prevent end-users seeing them',
        'Crash the application on every unhandled error',
        'Log errors with context, alert on-call engineers, and degrade gracefully',
        'Ignore errors that occur less than 10% of the time',
      ],
      correctIndex: 2,
    },
  ];
}

// ─── GET /api/assessments/start ───────────────────────────────────────────────

router.get('/start', async (req, res, next) => {
  try {
    const { skillId } = req.query;
    if (!skillId) {
      return res.status(400).json({ error: 'skillId query parameter is required' });
    }

    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    // Verify the student has this skill
    const studentSkill = await prisma.studentSkill.findUnique({
      where: { studentId_skillId: { studentId: student.id, skillId } },
      include: { skill: true },
    });
    if (!studentSkill) {
      return res.status(404).json({ error: 'You have not added this skill to your profile yet' });
    }
    if (studentSkill.status === 'assessment_verified' || studentSkill.status === 'college_verified') {
      return res.status(409).json({ error: 'This skill is already verified' });
    }

    // Enforce 24-hour cooldown: delete expired sessions first, then check active
    const now = new Date();
    await prisma.assessmentSession.deleteMany({
      where: { studentId: student.id, skillId, expiresAt: { lt: now } },
    });

    const existingSession = await prisma.assessmentSession.findFirst({
      where: { studentId: student.id, skillId, expiresAt: { gte: now } },
    });
    if (existingSession) {
      const minutesLeft = Math.ceil((existingSession.expiresAt - now) / 60000);
      return res.status(429).json({
        error: `An active assessment session already exists. It expires in ${minutesLeft} minute(s).`,
        sessionToken: existingSession.sessionToken,
      });
    }

    // Generate questions via Gemini
    const questions = await generateQuestions(studentSkill.skill.name);

    // Store full questions (with correctIndex) server-side
    const sessionToken = randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.assessmentSession.create({
      data: {
        studentId: student.id,
        skillId,
        sessionToken,
        questionsJson: questions, // stored with correct answers
        expiresAt,
      },
    });

    // Send questions to client WITHOUT correctIndex
    const clientQuestions = questions.map((q, idx) => ({
      id: idx,
      question: q.question,
      options: q.options,
    }));

    res.json({
      sessionToken,
      skillName: studentSkill.skill.name,
      totalQuestions: clientQuestions.length,
      timeLimitMinutes: 15,
      expiresAt: expiresAt.toISOString(),
      questions: clientQuestions,
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/assessments/submit ─────────────────────────────────────────────

router.post('/submit', async (req, res, next) => {
  try {
    const schema = z.object({
      sessionToken: z.string().min(1),
      answers: z.record(z.string(), z.number().min(0).max(3)), // { "0": 2, "1": 1, ... }
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }

    const { sessionToken, answers } = parsed.data;
    const now = new Date();

    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    // Find and validate session
    const session = await prisma.assessmentSession.findUnique({ where: { sessionToken } });
    if (!session) {
      return res.status(404).json({ error: 'Assessment session not found. It may have expired.' });
    }
    if (session.studentId !== student.id) {
      return res.status(403).json({ error: 'This session does not belong to your account' });
    }
    if (session.expiresAt < now) {
      await prisma.assessmentSession.delete({ where: { sessionToken } });
      return res.status(410).json({ error: 'Assessment session has expired. Please start a new assessment.' });
    }

    // Compute score using server-side correct answers
    const questions = session.questionsJson;
    let correctCount = 0;
    const breakdown = questions.map((q, idx) => {
      const submitted = answers[String(idx)];
      const isCorrect = submitted === q.correctIndex;
      if (isCorrect) correctCount++;
      return {
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        submittedIndex: submitted ?? null,
        isCorrect,
      };
    });

    const totalQuestions = questions.length;
    const rawScore = Math.round((correctCount / totalQuestions) * 100);
    const passed = rawScore >= 60;

    // Update student skill if passed
    let updatedStudentSkill = null;
    if (passed) {
      updatedStudentSkill = await prisma.studentSkill.update({
        where: { studentId_skillId: { studentId: student.id, skillId: session.skillId } },
        data: { status: 'assessment_verified', score: rawScore },
        include: { skill: true },
      });
    }

    // Clean up session regardless of result
    await prisma.assessmentSession.delete({ where: { sessionToken } });

    res.json({
      passed,
      score: rawScore,
      correctCount,
      totalQuestions,
      message: passed
        ? `🎉 Skill verified! You scored ${rawScore}% — your Skill Passport badge has been upgraded.`
        : `You scored ${rawScore}%. A score of 60% or higher is required. You can retake the assessment after 24 hours.`,
      breakdown,
      studentSkill: updatedStudentSkill,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
