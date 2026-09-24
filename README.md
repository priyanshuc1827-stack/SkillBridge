# SkillBridge — SIH 2026

> Academia-Industry Collaboration Portal connecting Students, Colleges/TPOs, and Companies through verified skills.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React + Vite, Tailwind CSS v4, Framer Motion, Recharts, Lucide |
| Backend | Node.js + Express, Socket.io |
| ORM | Prisma |
| Database | PostgreSQL on Supabase |
| Auth | JWT with role-based middleware |
| Validation | Zod |

## Quick Start

### Prerequisites
- Node.js v18+ and npm
- Supabase project with PostgreSQL

### Backend

```bash
cd backend
cp .env.example .env
# Fill in DATABASE_URL and DIRECT_URL in .env
npm install
npx prisma migrate dev
npm run dev
```

Runs on `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`

## 👥 Demo Accounts

For pre-seeded test accounts across all 3 roles (Students, Colleges, and Recruiters), see **[DEMO_ACCOUNTS.md](./DEMO_ACCOUNTS.md)**.
- **Universal Password:** `Demo@1234`
- **Seed Script:** `cd backend && npm run db:seed`

## Project Structure

```
SIH-Finale/
├── backend/
│   ├── prisma/schema.prisma     # All DB tables
│   ├── src/
│   │   ├── index.js             # Express + Socket.io entry
│   │   ├── lib/prisma.js        # Prisma singleton
│   │   ├── middleware/auth.js   # JWT + role guards
│   │   └── routes/              # auth, student, jobs, applications
│   └── .env                     # DATABASE_URL, JWT_SECRET
└── frontend/
    └── src/
        ├── contexts/AuthContext.jsx  # Auth state + API calls
        ├── lib/api.js                # Axios + interceptors
        ├── router/index.jsx          # Protected routes
        └── pages/
            ├── Landing.jsx           # Public landing page
            ├── auth/                 # Login, Signup
            └── dashboards/           # Student, College, Recruiter
```

## Design System

- **Palette**: Ink (`#0F0F0D`) + Amber (`#F59E0B`) on warm off-white (`#FAFAF7`)
- **Fonts**: Fraunces (display/headings) + Inter (body)
- **Tokens**: Defined as CSS custom properties in `index.css`

## Features Built

- [x] Landing page (hero, how-it-works, 3 roles)
- [x] Auth: signup + login for all 3 roles
- [x] JWT with role-based middleware
- [x] Database schema (12 tables)
- [x] Dashboard shells for all 3 roles
- [ ] Skill Passport + Assessments
- [ ] Job/internship posting
- [ ] Matching engine
- [ ] College skill heatmap
- [ ] Application tracking pipeline
