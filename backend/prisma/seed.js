/**
 * SkillBridge — Demo Seed Data
 * Populates the DB with realistic demo accounts for judge demonstrations.
 *
 * Run: node prisma/seed.js   (or: npm run db:seed)
 *
 * Demo password for ALL accounts: Demo@1234
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const DEMO_PASSWORD = 'Demo@1234';

async function main() {
  console.log('🌱 Starting SkillBridge demo seed...\n');

  const hash = await bcrypt.hash(DEMO_PASSWORD, 12);

  // ─── 1. Skills ────────────────────────────────────────────────────────────
  console.log('📚 Creating skills...');
  const skillData = [
    { name: 'JavaScript',        category: 'Programming' },
    { name: 'Python',             category: 'Programming' },
    { name: 'React',              category: 'Frontend' },
    { name: 'Node.js',            category: 'Backend' },
    { name: 'SQL',                category: 'Database' },
    { name: 'Machine Learning',   category: 'AI/ML' },
    { name: 'Data Analysis',      category: 'Data Science' },
    { name: 'Java',               category: 'Programming' },
    { name: 'TypeScript',         category: 'Programming' },
    { name: 'REST APIs',          category: 'Backend' },
    { name: 'Git',                category: 'DevOps' },
    { name: 'Docker',             category: 'DevOps' },
    { name: 'TailwindCSS',        category: 'Frontend' },
    { name: 'PostgreSQL',         category: 'Database' },
    { name: 'Deep Learning',      category: 'AI/ML' },
    { name: 'Data Visualization', category: 'Data Science' },
    { name: 'System Design',      category: 'Architecture' },
    { name: 'MongoDB',            category: 'Database' },
  ];

  const skills = {};
  for (const s of skillData) {
    const skill = await prisma.skill.upsert({
      where: { name: s.name },
      update: {},
      create: s,
    });
    skills[s.name] = skill;
  }
  console.log(`   ✓ ${skillData.length} skills created\n`);

  // ─── 2. Colleges ──────────────────────────────────────────────────────────
  console.log('🏛️  Creating colleges...');

  const collegesData = [
    {
      email: 'tpo@iitbombay.edu',
      name: 'IIT Bombay',
      domain: 'iitb.ac.in',
    },
    {
      email: 'placements@vit.edu',
      name: 'VIT Vellore',
      domain: 'vit.ac.in',
    },
    {
      email: 'tpo@srmuniv.edu',
      name: 'SRM Institute of Science and Technology',
      domain: 'srmist.edu.in',
    },
  ];

  const colleges = {};
  for (const c of collegesData) {
    const existing = await prisma.user.findUnique({ where: { email: c.email } });
    if (existing) {
      colleges[c.name] = await prisma.college.findUnique({ where: { userId: existing.id } });
      console.log(`   ~ College already exists: ${c.name}`);
      continue;
    }
    const user = await prisma.user.create({
      data: { email: c.email, passwordHash: hash, role: 'college' },
    });
    const college = await prisma.college.create({
      data: { userId: user.id, name: c.name, domain: c.domain },
    });
    colleges[c.name] = college;
    console.log(`   ✓ ${c.name} (${c.email})`);
  }
  console.log();

  // ─── 3. Companies ─────────────────────────────────────────────────────────
  console.log('🏢 Creating companies...');

  const companiesData = [
    {
      email: 'hr@techcorp.io',
      name: 'TechCorp Solutions',
      industry: 'Technology',
    },
    {
      email: 'talent@datavision.ai',
      name: 'DataVision Analytics',
      industry: 'Data & Artificial Intelligence',
    },
    {
      email: 'careers@greenbridge.fin',
      name: 'GreenBridge Finance',
      industry: 'FinTech',
    },
    {
      email: 'recruit@cloudnine.dev',
      name: 'CloudNine Systems',
      industry: 'Cloud & Infrastructure',
    },
  ];

  const companies = {};
  for (const c of companiesData) {
    const existing = await prisma.user.findUnique({ where: { email: c.email } });
    if (existing) {
      companies[c.name] = await prisma.company.findUnique({ where: { userId: existing.id } });
      console.log(`   ~ Company already exists: ${c.name}`);
      continue;
    }
    const user = await prisma.user.create({
      data: { email: c.email, passwordHash: hash, role: 'recruiter' },
    });
    const company = await prisma.company.create({
      data: { userId: user.id, name: c.name, industry: c.industry },
    });
    companies[c.name] = company;
    console.log(`   ✓ ${c.name} (${c.email})`);
  }
  console.log();

  // ─── 4. Jobs ──────────────────────────────────────────────────────────────
  console.log('💼 Creating job listings...');

  const jobsData = [
    {
      companyName: 'TechCorp Solutions',
      title: 'Frontend Developer Intern',
      description: 'Join our product team to build beautiful, responsive UIs. You will work closely with designers and backend engineers to ship features that reach millions of users.',
      stipend: '₹25,000/month',
      type: 'internship',
      location: 'Bengaluru (Hybrid)',
      skills: [
        { name: 'React', level: 3 },
        { name: 'JavaScript', level: 3 },
        { name: 'TypeScript', level: 2 },
        { name: 'TailwindCSS', level: 2 },
        { name: 'Git', level: 2 },
      ],
    },
    {
      companyName: 'TechCorp Solutions',
      title: 'Full-Stack Developer',
      description: 'Build and scale core platform features end-to-end. You will own entire features from database design to frontend polish. Strong debugging skills and a product mindset are essential.',
      stipend: '₹18–24 LPA',
      type: 'job',
      location: 'Bengaluru',
      skills: [
        { name: 'Node.js', level: 4 },
        { name: 'React', level: 3 },
        { name: 'PostgreSQL', level: 3 },
        { name: 'REST APIs', level: 3 },
        { name: 'Docker', level: 2 },
        { name: 'System Design', level: 2 },
      ],
    },
    {
      companyName: 'DataVision Analytics',
      title: 'Data Science Intern',
      description: 'Work with our data science team on real-world prediction models and dashboards for enterprise clients. You will clean data, train models, and present findings to stakeholders.',
      stipend: '₹20,000/month',
      type: 'internship',
      location: 'Remote',
      skills: [
        { name: 'Python', level: 3 },
        { name: 'Machine Learning', level: 2 },
        { name: 'Data Analysis', level: 3 },
        { name: 'SQL', level: 2 },
        { name: 'Data Visualization', level: 2 },
      ],
    },
    {
      companyName: 'DataVision Analytics',
      title: 'ML Engineer',
      description: 'Design and productionise machine learning models that power our core analytics platform. Experience with deep learning frameworks and MLOps pipelines is a plus.',
      stipend: '₹20–28 LPA',
      type: 'job',
      location: 'Mumbai',
      skills: [
        { name: 'Python', level: 4 },
        { name: 'Machine Learning', level: 4 },
        { name: 'Deep Learning', level: 3 },
        { name: 'SQL', level: 3 },
        { name: 'Docker', level: 2 },
      ],
    },
    {
      companyName: 'GreenBridge Finance',
      title: 'Backend Developer Intern',
      description: 'Build secure, high-throughput APIs for our payments and reconciliation platform. You will work with Java microservices and gain exposure to real-world fintech architecture.',
      stipend: '₹22,000/month',
      type: 'internship',
      location: 'Pune (On-site)',
      skills: [
        { name: 'Java', level: 3 },
        { name: 'REST APIs', level: 2 },
        { name: 'SQL', level: 2 },
        { name: 'Git', level: 2 },
      ],
    },
    {
      companyName: 'CloudNine Systems',
      title: 'DevOps Intern',
      description: 'Help us build and maintain CI/CD pipelines, container orchestration, and monitoring for our cloud infrastructure. Hands-on experience with Docker and Linux is required.',
      stipend: '₹18,000/month',
      type: 'internship',
      location: 'Remote',
      skills: [
        { name: 'Docker', level: 2 },
        { name: 'Git', level: 2 },
        { name: 'Python', level: 2 },
      ],
    },
  ];

  const jobMap = {};
  for (const j of jobsData) {
    const company = companies[j.companyName];
    if (!company) { console.log(`   ⚠ Company not found: ${j.companyName}`); continue; }

    const existing = await prisma.job.findFirst({
      where: { companyId: company.id, title: j.title },
    });
    if (existing) {
      jobMap[j.title] = existing;
      console.log(`   ~ Job already exists: ${j.title}`);
      continue;
    }

    const job = await prisma.job.create({
      data: {
        companyId: company.id,
        title: j.title,
        description: j.description,
        stipend: j.stipend,
        type: j.type,
        location: j.location,
      },
    });

    for (const s of j.skills) {
      const skill = skills[s.name];
      if (skill) {
        await prisma.jobSkill.create({
          data: { jobId: job.id, skillId: skill.id, requiredLevel: s.level },
        });
      }
    }

    jobMap[j.title] = job;
    console.log(`   ✓ ${j.title} @ ${j.companyName}`);
  }
  console.log();

  // ─── 5. Students ──────────────────────────────────────────────────────────
  console.log('🎓 Creating students...');

  const studentsData = [
    {
      email: 'arjun.sharma@student.iitb.ac.in',
      name: 'Arjun Sharma',
      targetRole: 'Full-Stack Developer',
      collegeName: 'IIT Bombay',
      bio: 'Final year CS student at IIT Bombay passionate about building scalable web applications.',
      skills: [
        { name: 'JavaScript',  status: 'assessment_verified', score: 88 },
        { name: 'React',       status: 'assessment_verified', score: 82 },
        { name: 'Node.js',     status: 'assessment_verified', score: 79 },
        { name: 'PostgreSQL',  status: 'college_verified',    score: 75 },
        { name: 'TypeScript',  status: 'self_claimed',        score: null },
        { name: 'Git',         status: 'assessment_verified', score: 90 },
        { name: 'Docker',      status: 'self_claimed',        score: null },
      ],
      projects: [
        {
          title: 'EduTrack — Student Progress Tracker',
          description: 'A full-stack platform for tracking student progress with real-time dashboards. Used by 200+ students in my department.',
          link: 'https://github.com/arjun/edutrack',
          techStack: ['React', 'Node.js', 'PostgreSQL'],
        },
        {
          title: 'SkillMap API',
          description: 'RESTful API for mapping skill gaps between job requirements and candidate profiles, with a matching score engine.',
          link: 'https://github.com/arjun/skillmap-api',
          techStack: ['Node.js', 'Express', 'MongoDB'],
        },
      ],
    },
    {
      email: 'priya.patel@student.vit.ac.in',
      name: 'Priya Patel',
      targetRole: 'Data Scientist',
      collegeName: 'VIT Vellore',
      bio: 'Pre-final year student specialising in AI/ML with a focus on NLP and predictive analytics.',
      skills: [
        { name: 'Python',             status: 'assessment_verified', score: 92 },
        { name: 'Machine Learning',   status: 'assessment_verified', score: 85 },
        { name: 'Data Analysis',      status: 'assessment_verified', score: 88 },
        { name: 'SQL',                status: 'college_verified',    score: 78 },
        { name: 'Data Visualization', status: 'assessment_verified', score: 80 },
        { name: 'Deep Learning',      status: 'self_claimed',        score: null },
      ],
      projects: [
        {
          title: 'Crop Yield Prediction Model',
          description: 'ML model predicting crop yields using satellite imagery and weather data, achieving 91% accuracy. Deployed as a REST API.',
          link: 'https://github.com/priya/crop-yield-ml',
          techStack: ['Python', 'scikit-learn', 'FastAPI'],
        },
        {
          title: 'Sentiment Dashboard',
          description: 'Real-time Twitter sentiment analysis dashboard for brand monitoring with interactive charts.',
          link: 'https://github.com/priya/sentiment-dash',
          techStack: ['Python', 'Streamlit', 'VADER'],
        },
      ],
    },
    {
      email: 'rahul.gupta@student.iitb.ac.in',
      name: 'Rahul Gupta',
      targetRole: 'Backend Engineer',
      collegeName: 'IIT Bombay',
      bio: 'Systems programmer focused on distributed systems and backend scalability. Open source contributor.',
      skills: [
        { name: 'Java',         status: 'assessment_verified', score: 91 },
        { name: 'Node.js',      status: 'assessment_verified', score: 83 },
        { name: 'REST APIs',    status: 'college_verified',    score: 87 },
        { name: 'SQL',          status: 'assessment_verified', score: 86 },
        { name: 'Docker',       status: 'assessment_verified', score: 74 },
        { name: 'System Design',status: 'self_claimed',        score: null },
        { name: 'PostgreSQL',   status: 'assessment_verified', score: 80 },
      ],
      projects: [
        {
          title: 'Distributed Task Queue',
          description: 'A Redis-backed distributed task queue in Java handling 10,000+ tasks/second. Used in a college project management system.',
          link: 'https://github.com/rahul/dist-queue',
          techStack: ['Java', 'Redis', 'Docker'],
        },
      ],
    },
    {
      email: 'sneha.reddy@student.srmist.edu.in',
      name: 'Sneha Reddy',
      targetRole: 'Frontend Developer',
      collegeName: 'SRM Institute of Science and Technology',
      bio: 'Passionate about accessible, pixel-perfect UIs. Design systems enthusiast.',
      skills: [
        { name: 'React',       status: 'assessment_verified', score: 87 },
        { name: 'JavaScript',  status: 'assessment_verified', score: 83 },
        { name: 'TailwindCSS', status: 'assessment_verified', score: 90 },
        { name: 'TypeScript',  status: 'self_claimed',        score: null },
        { name: 'Git',         status: 'college_verified',    score: 85 },
      ],
      projects: [
        {
          title: 'AccessiKit — UI Component Library',
          description: 'A WCAG 2.1 compliant React component library with 30+ components and full keyboard navigation support.',
          link: 'https://github.com/sneha/accessikit',
          techStack: ['React', 'TypeScript', 'Storybook'],
        },
      ],
    },
    {
      email: 'karan.mehta@student.vit.ac.in',
      name: 'Karan Mehta',
      targetRole: 'ML Engineer',
      collegeName: 'VIT Vellore',
      bio: 'Research-oriented student working on computer vision and model deployment at scale.',
      skills: [
        { name: 'Python',           status: 'assessment_verified', score: 89 },
        { name: 'Deep Learning',    status: 'assessment_verified', score: 82 },
        { name: 'Machine Learning', status: 'college_verified',    score: 84 },
        { name: 'Data Analysis',    status: 'assessment_verified', score: 77 },
        { name: 'Docker',           status: 'self_claimed',        score: null },
      ],
      projects: [
        {
          title: 'FaceSecure — Liveness Detection',
          description: 'Real-time face liveness detection system using deep learning, achieving 96.8% accuracy. Integrated with a Flask API.',
          link: 'https://github.com/karan/facesecure',
          techStack: ['Python', 'PyTorch', 'OpenCV', 'Flask'],
        },
      ],
    },
    {
      email: 'aisha.khan@student.srmist.edu.in',
      name: 'Aisha Khan',
      targetRole: 'Data Analyst',
      collegeName: 'SRM Institute of Science and Technology',
      bio: 'Data-driven thinker who loves turning messy datasets into clear decisions.',
      skills: [
        { name: 'SQL',                status: 'assessment_verified', score: 91 },
        { name: 'Data Analysis',      status: 'assessment_verified', score: 86 },
        { name: 'Python',             status: 'assessment_verified', score: 78 },
        { name: 'Data Visualization', status: 'college_verified',    score: 88 },
        { name: 'Machine Learning',   status: 'self_claimed',        score: null },
      ],
      projects: [
        {
          title: 'E-Commerce Sales Dashboard',
          description: 'Interactive Power BI dashboard analysing ₹50Cr+ in e-commerce transactions, surfacing top revenue drivers and churn signals.',
          link: 'https://github.com/aisha/ecom-dashboard',
          techStack: ['Python', 'Pandas', 'Power BI', 'SQL'],
        },
      ],
    },
  ];

  for (const s of studentsData) {
    const college = colleges[s.collegeName];
    const existing = await prisma.user.findUnique({ where: { email: s.email } });

    if (existing) {
      console.log(`   ~ Student already exists: ${s.name}`);
      continue;
    }

    const user = await prisma.user.create({
      data: { email: s.email, passwordHash: hash, role: 'student' },
    });

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        name: s.name,
        targetRole: s.targetRole,
        bio: s.bio,
        collegeId: college?.id ?? null,
      },
    });

    // Skills
    for (const sk of s.skills) {
      const skill = skills[sk.name];
      if (!skill) continue;
      await prisma.studentSkill.create({
        data: {
          studentId: student.id,
          skillId: skill.id,
          status: sk.status,
          score: sk.score,
        },
      });
    }

    // Projects
    for (const p of s.projects) {
      await prisma.project.create({
        data: {
          studentId: student.id,
          title: p.title,
          description: p.description,
          link: p.link,
          techStack: p.techStack,
        },
      });
    }

    // Seed a couple of applications for demo
    const frontendJob = jobMap['Frontend Developer Intern'];
    const mlJob       = jobMap['ML Engineer'];
    const dsJob       = jobMap['Data Science Intern'];

    if (s.name === 'Arjun Sharma' && frontendJob) {
      const studentSkills = await prisma.studentSkill.findMany({ where: { studentId: student.id } });
      const jobSkills     = await prisma.jobSkill.findMany({ where: { jobId: frontendJob.id } });
      const score = computeSimpleMatch(studentSkills, jobSkills);
      await prisma.application.create({
        data: { studentId: student.id, jobId: frontendJob.id, status: 'shortlisted', matchScore: score },
      });
    }
    if (s.name === 'Priya Patel' && dsJob) {
      const studentSkills = await prisma.studentSkill.findMany({ where: { studentId: student.id } });
      const jobSkills     = await prisma.jobSkill.findMany({ where: { jobId: dsJob.id } });
      const score = computeSimpleMatch(studentSkills, jobSkills);
      await prisma.application.create({
        data: { studentId: student.id, jobId: dsJob.id, status: 'interview', matchScore: score },
      });
    }
    if (s.name === 'Karan Mehta' && mlJob) {
      const studentSkills = await prisma.studentSkill.findMany({ where: { studentId: student.id } });
      const jobSkills     = await prisma.jobSkill.findMany({ where: { jobId: mlJob.id } });
      const score = computeSimpleMatch(studentSkills, jobSkills);
      await prisma.application.create({
        data: { studentId: student.id, jobId: mlJob.id, status: 'applied', matchScore: score },
      });
    }

    console.log(`   ✓ ${s.name} — ${s.skills.length} skills, ${s.projects.length} projects`);
  }

  console.log('\n✅ Seed complete!\n');
  console.log('─────────────────────────────────────────────────────');
  console.log('  Demo accounts (password for all: Demo@1234)');
  console.log('─────────────────────────────────────────────────────');
  console.log('\n  STUDENTS');
  for (const s of studentsData) {
    console.log(`    ${s.email.padEnd(45)} → ${s.targetRole}`);
  }
  console.log('\n  COLLEGES');
  for (const c of collegesData) {
    console.log(`    ${c.email.padEnd(45)} → ${c.name}`);
  }
  console.log('\n  COMPANIES');
  for (const c of companiesData) {
    console.log(`    ${c.email.padEnd(45)} → ${c.name}`);
  }
  console.log('─────────────────────────────────────────────────────\n');
}

/** Simplified matching for seed (no import cycle) */
function computeSimpleMatch(studentSkills, jobSkills) {
  if (!jobSkills.length) return 0;
  let total = 0, earned = 0;
  for (const js of jobSkills) {
    const w = js.requiredLevel || 1;
    total += w;
    const ss = studentSkills.find(s => s.skillId === js.skillId);
    if (ss) earned += w * (ss.status === 'self_claimed' ? 0.7 : 1.0);
  }
  return Math.round((earned / total) * 100);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
