import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/jobs — public list of active jobs
 */
router.get('/', async (req, res, next) => {
  try {
    const { type, search } = req.query;

    const jobs = await prisma.job.findMany({
      where: {
        isActive: true,
        ...(type ? { type } : {}),
        ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
      },
      include: {
        company: { select: { name: true, industry: true, logoUrl: true } },
        skills: { include: { skill: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ jobs });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/jobs/:id — single job detail
 */
router.get('/:id', async (req, res, next) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        company: { select: { name: true, industry: true, logoUrl: true } },
        skills: { include: { skill: true } },
      },
    });

    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({ job });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/jobs — create a job listing (recruiter only)
 */
router.post('/', authenticate, authorize('recruiter'), async (req, res, next) => {
  try {
    const schema = z.object({
      title: z.string().min(3),
      description: z.string().min(20),
      stipend: z.string().optional(),
      type: z.enum(['internship', 'job']),
      location: z.string().optional(),
      skills: z.array(z.object({
        skillName: z.string(),
        requiredLevel: z.number().min(1).max(5).optional(),
      })).optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }

    const company = await prisma.company.findUnique({ where: { userId: req.user.id } });
    if (!company) return res.status(404).json({ error: 'Company profile not found' });

    const job = await prisma.$transaction(async (tx) => {
      const newJob = await tx.job.create({
        data: {
          companyId: company.id,
          title: parsed.data.title,
          description: parsed.data.description,
          stipend: parsed.data.stipend || null,
          type: parsed.data.type,
          location: parsed.data.location || null,
        },
      });

      // Upsert required skills
      if (parsed.data.skills?.length) {
        for (const s of parsed.data.skills) {
          const skill = await tx.skill.upsert({
            where: { name: s.skillName },
            update: {},
            create: { name: s.skillName },
          });
          await tx.jobSkill.create({
            data: { jobId: newJob.id, skillId: skill.id, requiredLevel: s.requiredLevel || 1 },
          });
        }
      }

      return tx.job.findUnique({
        where: { id: newJob.id },
        include: { skills: { include: { skill: true } }, company: true },
      });
    });

    res.status(201).json({ job });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/jobs/:id — update a job listing (recruiter who owns it only)
 */
router.patch('/:id', authenticate, authorize('recruiter'), async (req, res, next) => {
  try {
    const schema = z.object({
      title: z.string().min(3).optional(),
      description: z.string().min(20).optional(),
      stipend: z.string().optional(),
      type: z.enum(['internship', 'job']).optional(),
      location: z.string().optional(),
      isActive: z.boolean().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
    }

    const company = await prisma.company.findUnique({ where: { userId: req.user.id } });
    if (!company) return res.status(404).json({ error: 'Company profile not found' });

    // Verify ownership
    const existing = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Job not found' });
    if (existing.companyId !== company.id) return res.status(403).json({ error: 'You do not own this job listing' });

    const job = await prisma.job.update({
      where: { id: req.params.id },
      data: parsed.data,
      include: {
        skills: { include: { skill: true } },
        company: { select: { name: true, industry: true } },
      },
    });

    res.json({ job });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/jobs/:id — deactivate (soft-delete) a job listing
 */
router.delete('/:id', authenticate, authorize('recruiter'), async (req, res, next) => {
  try {
    const company = await prisma.company.findUnique({ where: { userId: req.user.id } });
    if (!company) return res.status(404).json({ error: 'Company profile not found' });

    const existing = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Job not found' });
    if (existing.companyId !== company.id) return res.status(403).json({ error: 'You do not own this job listing' });

    await prisma.job.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    res.json({ message: 'Job listing has been closed successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
