# 👥 SkillBridge — Demo Accounts Directory

> Quick-reference guide for evaluators, judges, and developers to test all three role-based dashboards in SkillBridge.

---

## 🔑 Global Demo Password

All pre-seeded demo accounts share the exact same password:

```text
Demo@1234
```

> **Login URL:** `http://localhost:5173/login`

---

## 🎓 1. Student Accounts

Students can view their **Skill Passport**, take assessments, see match scores, browse matching jobs, and track applications in real time.

| Name | Login Email | Target Role | College | Pre-seeded Highlights |
| :--- | :--- | :--- | :--- | :--- |
| **Arjun Sharma** *(Recommended)* | `arjun.sharma@student.iitb.ac.in` | Full-Stack Developer | IIT Bombay | 7 skills, 2 projects, Shortlisted for Frontend Intern at TechCorp |
| **Priya Patel** *(Recommended)* | `priya.patel@student.vit.ac.in` | Data Scientist | VIT Vellore | 6 skills (Python, ML), 2 projects, In Interview stage at DataVision |
| **Rahul Gupta** | `rahul.gupta@student.iitb.ac.in` | Backend Engineer | IIT Bombay | 7 skills (Java, Node.js, SQL, Docker), 1 distributed systems project |
| **Sneha Reddy** | `sneha.reddy@student.srmist.edu.in` | Frontend Developer | SRM Institute | 5 skills (React, TailwindCSS), 1 WCAG component library project |
| **Karan Mehta** | `karan.mehta@student.vit.ac.in` | ML Engineer | VIT Vellore | 5 skills (PyTorch, CV), Applied to ML Engineer at DataVision |
| **Aisha Khan** | `aisha.khan@student.srmist.edu.in` | Data Analyst | SRM Institute | 5 skills (SQL, Power BI), 1 sales analytics dashboard project |

---

## 🏢 2. Recruiter / Company Accounts

Recruiters can post jobs, define required skill weights, filter student applicants, review skill badges, and update application statuses (Applied → Shortlisted → Interview → Offered).

| Company Name | Login Email | Industry | Posted Jobs in System |
| :--- | :--- | :--- | :--- |
| **TechCorp Solutions** *(Recommended)* | `hr@techcorp.io` | Technology | • Frontend Developer Intern<br>• Full-Stack Developer |
| **DataVision Analytics** *(Recommended)* | `talent@datavision.ai` | Data & AI | • Data Science Intern<br>• ML Engineer |
| **GreenBridge Finance** | `careers@greenbridge.fin` | FinTech | • Backend Developer Intern |
| **CloudNine Systems** | `recruit@cloudnine.dev` | Cloud & DevOps | • DevOps Intern |

---

## 🏛️ 3. College / TPO Accounts

Training & Placement Officers (TPOs) can monitor student skill analytics, view curriculum-industry alignment, and verify student claims.

| College / University | Login Email | Domain | Registered Students |
| :--- | :--- | :--- | :--- |
| **IIT Bombay** *(Recommended)* | `tpo@iitbombay.edu` | `iitb.ac.in` | Arjun Sharma, Rahul Gupta |
| **VIT Vellore** | `placements@vit.edu` | `vit.ac.in` | Priya Patel, Karan Mehta |
| **SRM Institute of Science & Technology** | `tpo@srmuniv.edu` | `srmist.edu.in` | Sneha Reddy, Aisha Khan |

---

## 🚀 Recommended Walkthrough for Demo / Presentation

To showcase end-to-end multi-role real-time collaboration:

1. **Step 1 — Login as Recruiter:**
   - Email: `hr@techcorp.io` | Password: `Demo@1234`
   - Observe posted listings (**Frontend Developer Intern** and **Full-Stack Developer**).
   - Check the **Applications** pipeline to see **Arjun Sharma** in the pipeline.

2. **Step 2 — Open Second Browser Window / Incognito:**
   - Login as Student: `arjun.sharma@student.iitb.ac.in` | Password: `Demo@1234`
   - View Arjun's **Skill Passport**, verified badges, and match score calculation.
   - When the recruiter changes Arjun's status in Window 1, observe the real-time notification in Window 2!

3. **Step 3 — Login as College TPO:**
   - Email: `tpo@iitbombay.edu` | Password: `Demo@1234`
   - View college placement readiness metrics, enrolled student progress, and department skill heatmaps.

---

## 🛠️ Re-Seeding Database

If you ever need to reset or re-populate the demo data:

```bash
cd backend
npm run db:seed
```
