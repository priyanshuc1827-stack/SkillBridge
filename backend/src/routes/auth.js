import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { generateToken, authenticate } from '../middleware/auth.js';

const router = Router();

// ─── Validation Schemas ───────────────────────────────────────────────────────

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['student', 'college', 'recruiter'], {
    errorMap: () => ({ message: 'Role must be student, college, or recruiter' }),
  }),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  // Optional role-specific fields
  collegeId: z.string().optional(),
  targetRole: z.string().optional(),
  industry: z.string().optional(),
  domain: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password required'),
});

// ─── Helper ───────────────────────────────────────────────────────────────────

function buildTokenPayload(user, profile) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    profileId: profile?.id ?? null,
    name: profile?.name ?? user.email,
  };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/signup
 */
router.post('/signup', async (req, res, next) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { email, password, role, name, collegeId, targetRole, industry, domain } = parsed.data;

    // Check existing user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Create user + role-specific profile in a transaction
    let profile;
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { email, passwordHash, role },
      });

      if (role === 'student') {
        profile = await tx.student.create({
          data: {
            userId: newUser.id,
            name,
            targetRole: targetRole || null,
            collegeId: collegeId || null,
          },
        });
      } else if (role === 'college') {
        profile = await tx.college.create({
          data: {
            userId: newUser.id,
            name,
            domain: domain || null,
          },
        });
      } else if (role === 'recruiter') {
        profile = await tx.company.create({
          data: {
            userId: newUser.id,
            name,
            industry: industry || null,
          },
        });
      }

      return newUser;
    });

    const token = generateToken(buildTokenPayload(user, profile));

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name,
        profileId: profile?.id,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Fetch role-specific profile
    let profile = null;
    if (user.role === 'student') {
      profile = await prisma.student.findUnique({ where: { userId: user.id } });
    } else if (user.role === 'college') {
      profile = await prisma.college.findUnique({ where: { userId: user.id } });
    } else if (user.role === 'recruiter') {
      profile = await prisma.company.findUnique({ where: { userId: user.id } });
    }

    const token = generateToken(buildTokenPayload(user, profile));

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: profile?.name ?? email,
        profileId: profile?.id,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me  — requires valid JWT
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        student: true,
        college: true,
        company: true,
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const { passwordHash, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (err) {
    next(err);
  }
});

export default router;
