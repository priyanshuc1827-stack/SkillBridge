import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);
router.use(authorize('recruiter'));

/**
 * GET /api/recruiter/profile — company profile
 */
router.get('/profile', async (req, res, next) => {
  try {
    const company = await prisma.company.findUnique({
      where: { userId: req.user.id },
      include: {
        _count: { select: { jobs: true } },
      },
    });

    if (!company) return res.status(404).json({ error: 'Company profile not found' });
    res.json({ company });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/recruiter/jobs — all jobs posted by this company with applicant counts
 */
router.get('/jobs', async (req, res, next) => {
  try {
    const company = await prisma.company.findUnique({ where: { userId: req.user.id } });
    if (!company) return res.status(404).json({ error: 'Company profile not found' });

    const jobs = await prisma.job.findMany({
      where: { companyId: company.id },
      include: {
        skills: { include: { skill: true } },
        applications: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                targetRole: true,
                college: { select: { name: true } },
                skills: { include: { skill: true } },
              },
            },
          },
          orderBy: { matchScore: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ jobs });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/recruiter/candidates — browse and search candidate pool
 */
router.get('/candidates', async (req, res, next) => {
  try {
    const { skill, verifiedOnly } = req.query;

    const students = await prisma.student.findMany({
      include: {
        college: { select: { name: true } },
        skills: {
          include: { skill: true },
          where: verifiedOnly === 'true'
            ? { status: { not: 'self_claimed' } }
            : undefined,
        },
        projects: true,
      },
      orderBy: { name: 'asc' },
    });

    // If skill query is provided, filter students who possess it
    let filtered = students;
    if (skill) {
      const sLower = skill.toLowerCase();
      filtered = students.filter((st) =>
        st.skills.some((sk) => sk.skill.name.toLowerCase().includes(sLower))
      );
    }

    res.json({ candidates: filtered });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/recruiter/simulate-filter — "What-If" Skill Simulator
 * Calculates how many candidates qualify based on selected skill combinations and thresholds
 */
router.post('/simulate-filter', async (req, res, next) => {
  try {
    const schema = z.object({
      skills: z.array(z.string()).min(1),
      minScore: z.number().min(0).max(100).default(60),
      verifiedOnly: z.boolean().default(false),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }

    const { skills, minScore, verifiedOnly } = parsed.data;

    const allStudents = await prisma.student.findMany({
      include: {
        college: { select: { name: true } },
        skills: { include: { skill: true } },
      },
    });

    const results = allStudents.map((student) => {
      let matchedCount = 0;
      let verifiedCount = 0;
      let totalScoreSum = 0;

      for (const requiredSkill of skills) {
        const studentSkill = student.skills.find(
          (s) => s.skill.name.toLowerCase() === requiredSkill.toLowerCase()
        );

        if (studentSkill) {
          if (!verifiedOnly || studentSkill.status !== 'self_claimed') {
            matchedCount++;
            if (studentSkill.status !== 'self_claimed') verifiedCount++;
            totalScoreSum += studentSkill.score || 70;
          }
        }
      }

      const matchPercentage = Math.round((matchedCount / skills.length) * 100);
      const avgScore = matchedCount > 0 ? Math.round(totalScoreSum / matchedCount) : 0;
      const qualifies = matchPercentage >= minScore;

      return {
        id: student.id,
        name: student.name,
        targetRole: student.targetRole,
        college: student.college?.name || 'Partner College',
        matchPercentage,
        avgScore,
        qualifies,
        matchedCount,
        verifiedCount,
      };
    });

    const qualifyingCandidates = results.filter((r) => r.qualifies).sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.json({
      totalInPool: allStudents.length,
      qualifyingCount: qualifyingCandidates.length,
      qualificationRate: Math.round((qualifyingCandidates.length / allStudents.length) * 100) || 0,
      candidates: qualifyingCandidates,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
