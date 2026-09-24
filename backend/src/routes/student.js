import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);
router.use(authorize('student'));

/**
 * GET /api/student/profile — get own profile with skills, projects, college
 */
router.get('/profile', async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.id },
      include: {
        skills: {
          include: { skill: true },
          orderBy: { status: 'desc' },
        },
        projects: {
          orderBy: { id: 'desc' },
        },
        college: true,
      },
    });

    if (!student) return res.status(404).json({ error: 'Student profile not found' });
    res.json({ student });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/student/profile — update profile fields
 */
router.patch('/profile', async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(2).optional(),
      targetRole: z.string().optional(),
      bio: z.string().max(500).optional(),
      resumeUrl: z.string().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }

    const student = await prisma.student.update({
      where: { userId: req.user.id },
      data: parsed.data,
      include: {
        skills: { include: { skill: true } },
        projects: true,
        college: true,
      },
    });

    res.json({ student });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/student/skills — add a self-claimed skill
 */
router.post('/skills', async (req, res, next) => {
  try {
    const schema = z.object({
      skillName: z.string().min(1),
      category: z.string().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }

    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    const cleanName = parsed.data.skillName.trim();

    // Upsert skill
    const skill = await prisma.skill.upsert({
      where: { name: cleanName },
      update: {},
      create: { name: cleanName, category: parsed.data.category || 'Technical' },
    });

    // Upsert student_skill
    const studentSkill = await prisma.studentSkill.upsert({
      where: { studentId_skillId: { studentId: student.id, skillId: skill.id } },
      update: {},
      create: { studentId: student.id, skillId: skill.id, status: 'self_claimed' },
      include: { skill: true },
    });

    res.status(201).json({ studentSkill });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/student/skills/verify — verify a skill with an assessment simulation
 */
router.post('/skills/verify', async (req, res, next) => {
  try {
    const schema = z.object({
      skillId: z.string().min(1),
      score: z.number().min(50).max(100).optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }

    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    // Generate score between 80 and 98 if not provided
    const score = parsed.data.score || Math.floor(Math.random() * 18) + 81;

    const studentSkill = await prisma.studentSkill.update({
      where: {
        studentId_skillId: {
          studentId: student.id,
          skillId: parsed.data.skillId,
        },
      },
      data: {
        status: 'assessment_verified',
        score,
      },
      include: { skill: true },
    });

    res.json({
      message: `Skill verified with a score of ${score}%!`,
      studentSkill,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/student/skills/:skillId — delete a skill
 */
router.delete('/skills/:skillId', async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    await prisma.studentSkill.delete({
      where: {
        studentId_skillId: {
          studentId: student.id,
          skillId: req.params.skillId,
        },
      },
    });

    res.json({ message: 'Skill removed' });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/student/matches — Matching Engine: compute match % and skill gap for all active jobs
 */
router.get('/matches', async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.id },
      include: {
        skills: { include: { skill: true } },
        applications: true,
      },
    });

    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    const jobs = await prisma.job.findMany({
      where: { isActive: true },
      include: {
        company: { select: { name: true, industry: true, logoUrl: true } },
        skills: { include: { skill: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const appliedJobIds = new Map(
      student.applications.map((app) => [app.jobId, app.status])
    );

    const matches = jobs.map((job) => {
      const requiredSkills = job.skills.map((js) => js.skill);
      let totalWeight = 0;
      let earnedWeight = 0;
      const matchedSkills = [];
      const missingSkills = [];

      for (const js of job.skills) {
        const weight = js.requiredLevel || 1;
        totalWeight += weight;

        const studentSkill = student.skills.find((s) => s.skillId === js.skillId);
        if (studentSkill) {
          const multiplier = studentSkill.status === 'self_claimed' ? 0.75 : 1.0;
          earnedWeight += weight * multiplier;
          matchedSkills.push({
            name: js.skill.name,
            status: studentSkill.status,
            score: studentSkill.score,
          });
        } else {
          missingSkills.push({
            name: js.skill.name,
            requiredLevel: js.requiredLevel,
          });
        }
      }

      const matchScore = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 50;

      return {
        ...job,
        matchScore,
        matchedSkills,
        missingSkills,
        hasApplied: appliedJobIds.has(job.id),
        applicationStatus: appliedJobIds.get(job.id) || null,
      };
    });

    // Sort by match score descending
    matches.sort((a, b) => b.matchScore - a.matchScore);

    res.json({ matches });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/student/projects — add a project
 */
router.post('/projects', async (req, res, next) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      link: z.string().url().optional().or(z.literal('')),
      techStack: z.array(z.string()).optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }

    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    const project = await prisma.project.create({
      data: {
        studentId: student.id,
        title: parsed.data.title,
        description: parsed.data.description || null,
        link: parsed.data.link || null,
        techStack: parsed.data.techStack || [],
      },
    });

    res.status(201).json({ project });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/student/projects/:id — delete a project
 */
router.delete('/projects/:id', async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    await prisma.project.deleteMany({
      where: {
        id: req.params.id,
        studentId: student.id,
      },
    });

    res.json({ message: 'Project removed' });
  } catch (err) {
    next(err);
  }
});

export default router;
