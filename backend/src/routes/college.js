import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/college/list — PUBLIC: list all colleges for student signup dropdown
 */
router.get('/list', async (_req, res, next) => {
  try {
    const colleges = await prisma.college.findMany({
      select: { id: true, name: true, domain: true },
      orderBy: { name: 'asc' },
    });
    res.json({ colleges });
  } catch (err) {
    next(err);
  }
});

router.use(authenticate);
router.use(authorize('college'));


/**
 * GET /api/college/profile — college profile with student count
 */
router.get('/profile', async (req, res, next) => {
  try {
    const college = await prisma.college.findUnique({
      where: { userId: req.user.id },
      include: { _count: { select: { students: true } } },
    });

    if (!college) return res.status(404).json({ error: 'College profile not found' });
    res.json({ college });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/college/students — all students at this college with skills
 */
router.get('/students', async (req, res, next) => {
  try {
    const college = await prisma.college.findUnique({ where: { userId: req.user.id } });
    if (!college) return res.status(404).json({ error: 'College not found' });

    const students = await prisma.student.findMany({
      where: { collegeId: college.id },
      include: {
        skills: { include: { skill: true } },
        applications: { include: { job: { select: { title: true, company: { select: { name: true } } } } } },
        projects: true,
      },
      orderBy: { name: 'asc' },
    });

    res.json({ students });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/college/analytics — skill heatmap + placement stats
 */
router.get('/analytics', async (req, res, next) => {
  try {
    const college = await prisma.college.findUnique({ where: { userId: req.user.id } });
    if (!college) return res.status(404).json({ error: 'College not found' });

    const students = await prisma.student.findMany({
      where: { collegeId: college.id },
      include: {
        skills: { include: { skill: true } },
        applications: true,
      },
    });

    // Skill frequency & avg scores
    const skillMap = {};
    for (const st of students) {
      for (const ss of st.skills) {
        const key = ss.skill.name;
        if (!skillMap[key]) {
          skillMap[key] = { name: key, category: ss.skill.category, count: 0, verified: 0, totalScore: 0, scoreCount: 0 };
        }
        skillMap[key].count++;
        if (ss.status !== 'self_claimed') skillMap[key].verified++;
        if (ss.score != null) {
          skillMap[key].totalScore += ss.score;
          skillMap[key].scoreCount++;
        }
      }
    }

    const heatmapData = Object.values(skillMap)
      .map(s => ({
        ...s,
        avgScore: s.scoreCount > 0 ? Math.round(s.totalScore / s.scoreCount) : null,
      }))
      .sort((a, b) => b.count - a.count);

    // Placement funnel
    const allApps = students.flatMap(s => s.applications);
    const placementFunnel = {
      applied: allApps.filter(a => a.status === 'applied').length,
      shortlisted: allApps.filter(a => a.status === 'shortlisted').length,
      interview: allApps.filter(a => a.status === 'interview').length,
      offer: allApps.filter(a => a.status === 'offer').length,
      rejected: allApps.filter(a => a.status === 'rejected').length,
    };

    // Demand vs supply — compare job skill demand with student skills
    const jobSkills = await prisma.jobSkill.findMany({
      where: { job: { isActive: true } },
      include: { skill: true },
    });

    const demandMap = {};
    for (const js of jobSkills) {
      demandMap[js.skill.name] = (demandMap[js.skill.name] || 0) + 1;
    }

    const demandVsSupply = Object.entries(demandMap)
      .map(([name, demand]) => ({
        skill: name,
        demand,
        supply: skillMap[name]?.count || 0,
        gap: demand - (skillMap[name]?.count || 0),
      }))
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 12);

    res.json({
      totalStudents: students.length,
      totalSkillsClaimed: Object.values(skillMap).reduce((a, s) => a + s.count, 0),
      totalVerified: Object.values(skillMap).reduce((a, s) => a + s.verified, 0),
      heatmapData,
      placementFunnel,
      demandVsSupply,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/college/students/:studentId/skills/:skillId/verify
 * TPO marks a student's skill as college_verified (third tier of Skill Passport)
 */
router.post('/students/:studentId/skills/:skillId/verify', async (req, res, next) => {
  try {
    const college = await prisma.college.findUnique({ where: { userId: req.user.id } });
    if (!college) return res.status(404).json({ error: 'College profile not found' });

    // Ensure student belongs to this college
    const student = await prisma.student.findFirst({
      where: { id: req.params.studentId, collegeId: college.id },
    });
    if (!student) {
      return res.status(403).json({ error: 'Student is not enrolled at your college' });
    }

    const studentSkill = await prisma.studentSkill.findUnique({
      where: {
        studentId_skillId: {
          studentId: req.params.studentId,
          skillId: req.params.skillId,
        },
      },
      include: { skill: true },
    });
    if (!studentSkill) {
      return res.status(404).json({ error: 'Student does not have this skill on their profile' });
    }

    const updated = await prisma.studentSkill.update({
      where: {
        studentId_skillId: {
          studentId: req.params.studentId,
          skillId: req.params.skillId,
        },
      },
      data: { status: 'college_verified' },
      include: { skill: true },
    });

    // Emit real-time notification to student
    const io = req.app.get('io');
    if (io) {
      io.to(`student_${req.params.studentId}`).emit('skill_college_verified', {
        skillName: updated.skill.name,
        collegeName: college.name,
        message: `Your ${updated.skill.name} skill has been verified by ${college.name}! 🎓`,
      });
    }

    res.json({
      message: `${updated.skill.name} has been marked as college-verified for ${student.name}`,
      studentSkill: updated,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
