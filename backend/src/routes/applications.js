import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

/**
 * Shared matching engine — skill overlap + verification bonus
 * Returns a score 0–100
 */
export function computeMatchScore(studentSkills, jobSkills) {
  if (!jobSkills.length) return 0;

  let totalWeight = 0;
  let earnedWeight = 0;

  for (const js of jobSkills) {
    const weight = js.requiredLevel || 1;
    totalWeight += weight;

    const ss = studentSkills.find(s => s.skillId === js.skillId);
    if (ss) {
      // Verified skills get full credit, self-claimed get 70%
      const verificationMultiplier = ss.status === 'self_claimed' ? 0.7 : 1.0;
      earnedWeight += weight * verificationMultiplier;
    }
  }

  return Math.round((earnedWeight / totalWeight) * 100);
}

/**
 * POST /api/applications — student applies to a job
 */
router.post('/', authorize('student'), async (req, res, next) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ error: 'jobId required' });

    const student = await prisma.student.findUnique({
      where: { userId: req.user.id },
      include: { skills: true },
    });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { skills: true },
    });
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const matchScore = computeMatchScore(student.skills, job.skills);

    const application = await prisma.application.upsert({
      where: { studentId_jobId: { studentId: student.id, jobId } },
      update: { matchScore },
      create: { studentId: student.id, jobId, matchScore },
    });

    // Notify recruiter via socket
    const io = req.app.get('io');
    io?.to(`company_${job.companyId}`).emit('new_application', {
      applicationId: application.id,
      jobTitle: job.title,
      matchScore,
    });

    res.status(201).json({ application, matchScore });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/applications/mine — student's own applications
 */
router.get('/mine', authorize('student'), async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    const applications = await prisma.application.findMany({
      where: { studentId: student.id },
      include: {
        job: {
          include: { company: { select: { name: true, logoUrl: true } } },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    res.json({ applications });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/applications/job/:jobId — recruiter views applicants for a job
 */
router.get('/job/:jobId', authorize('recruiter'), async (req, res, next) => {
  try {
    const applications = await prisma.application.findMany({
      where: { jobId: req.params.jobId },
      include: {
        student: {
          include: {
            skills: { include: { skill: true } },
            college: { select: { name: true } },
          },
        },
      },
      orderBy: { matchScore: 'desc' },
    });

    res.json({ applications });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/applications/:id/status — recruiter updates application status
 */
router.patch('/:id/status', authorize('recruiter'), async (req, res, next) => {
  try {
    const validStatuses = ['applied', 'shortlisted', 'interview', 'offer', 'rejected'];
    const { status } = req.body;

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    // Verify the application belongs to a job owned by this recruiter's company
    const company = await prisma.company.findUnique({ where: { userId: req.user.id } });
    if (!company) return res.status(404).json({ error: 'Company profile not found' });

    const existingApp = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { job: true },
    });
    if (!existingApp) return res.status(404).json({ error: 'Application not found' });
    if (existingApp.job.companyId !== company.id) {
      return res.status(403).json({ error: 'Not authorized to update this application' });
    }

    const application = await prisma.application.update({
      where: { id: req.params.id },
      data: { status },
      include: { student: { include: { user: true } }, job: true },
    });

    // Notify student
    const io = req.app.get('io');
    io?.to(`student_${application.studentId}`).emit('application_status_update', {
      applicationId: application.id,
      jobTitle: application.job.title,
      status,
    });

    res.json({ application });
  } catch (err) {
    next(err);
  }
});

export default router;
