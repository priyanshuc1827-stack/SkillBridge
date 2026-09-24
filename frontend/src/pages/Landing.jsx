import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import {
  Search,
  BadgeCheck,
  Zap,
  BriefcaseBusiness,
  GraduationCap,
  Building2,
  Users,
  ArrowRight,
  Code2,
  ExternalLink,
  Globe,
  Moon,
  Sun,
  ChevronRight,
  Star,
  TrendingUp,
  Shield,
} from 'lucide-react';

// ─── Animation Variants ──────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } },
};

// ─── Scroll Reveal Wrapper ────────────────────────────────────────────────────

function Reveal({ children, className, delay = 0, variants = fadeUp }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={prefersReduced || inView ? 'visible' : 'hidden'}
      variants={variants}
      style={delay ? { transitionDelay: `${delay}ms` } : {}}
    >
      {children}
    </motion.div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar({ dark, toggleDark }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: scrolled
          ? 'color-mix(in srgb, var(--color-bg) 92%, transparent)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--color-border-subtle)' : '1px solid transparent',
        transition: 'background 250ms ease-out, border-color 250ms ease-out',
      }}
    >
      <div className="container-editorial" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 'var(--radius-md)',
            background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={18} color="#0F0F0D" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.125rem', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
            SkillBridge
          </span>
        </Link>

        {/* Nav links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <NavLink href="#how-it-works">How it works</NavLink>
          <NavLink href="#roles">For you</NavLink>

          <button
            onClick={toggleDark}
            aria-label="Toggle dark mode"
            style={{
              background: 'none', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)', padding: '6px 8px',
              cursor: 'pointer', color: 'var(--color-text-secondary)',
              display: 'flex', alignItems: 'center', transition: 'all var(--transition-fast)',
            }}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <Link to="/auth/login" style={{
            textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500,
            color: 'var(--color-text-secondary)', transition: 'color var(--transition-fast)',
          }}
            onMouseOver={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
          >
            Log in
          </Link>
          <Link to="/auth/signup" style={{
            textDecoration: 'none', background: 'var(--color-ink-900)',
            color: 'var(--color-bg)', padding: '8px 20px', borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6,
            transition: 'background var(--transition-fast)',
          }}
            onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
            onMouseOut={e => e.currentTarget.style.opacity = '1'}
          >
            Get started <ChevronRight size={14} />
          </Link>
        </nav>
      </div>
    </motion.header>
  );
}

function NavLink({ href, children }) {
  return (
    <a href={href} style={{
      textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500,
      color: 'var(--color-text-secondary)', transition: 'color var(--transition-fast)',
    }}
      onMouseOver={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
      onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
    >
      {children}
    </a>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section style={{ paddingTop: 128, paddingBottom: 80, position: 'relative', overflow: 'hidden' }}>
      {/* Subtle grid background */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: `linear-gradient(var(--color-border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--color-border-subtle) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)',
      }} />

      <div className="container-editorial" style={{ position: 'relative', zIndex: 1 }}>
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}
        >
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'var(--color-amber-50)', color: 'var(--color-amber-600)',
            border: '1px solid', borderColor: 'var(--color-amber-300)',
            borderRadius: 'var(--radius-full)', padding: '4px 14px', fontSize: '0.8125rem', fontWeight: 500,
          }}>
            <Star size={12} fill="currentColor" />
            SIH 2026 — Academia-Industry Portal
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut', delay: 0.06 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            color: 'var(--color-text-primary)',
            maxWidth: '14ch',
            marginBottom: 28,
          }}
        >
          We don't just help students find jobs —
          <span style={{ color: 'var(--color-accent)', fontStyle: 'italic' }}> we help them become ready</span>
          {' '}for the right one.
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut', delay: 0.12 }}
          style={{
            fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
            color: 'var(--color-text-secondary)',
            maxWidth: '52ch',
            marginBottom: 40,
            lineHeight: 1.65,
          }}
        >
          SkillBridge connects students, college placement offices, and companies
          through verified skills — not just a resume. Real assessments, transparent
          match scores, and gap analysis that actually tells you what to do next.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut', delay: 0.18 }}
          style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}
        >
          <Link
            to="/auth/signup"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'var(--color-accent)', color: '#0F0F0D',
              padding: '12px 28px', borderRadius: 'var(--radius-md)',
              fontSize: '0.9375rem', fontWeight: 600, textDecoration: 'none',
              boxShadow: '0 2px 12px rgba(245, 158, 11, 0.35)',
              transition: 'all var(--transition-fast)',
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'var(--color-amber-400)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'var(--color-accent)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Get started free <ArrowRight size={16} />
          </Link>
          <Link
            to="/auth/login"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'transparent', color: 'var(--color-text-primary)',
              padding: '12px 24px', borderRadius: 'var(--radius-md)',
              fontSize: '0.9375rem', fontWeight: 500, textDecoration: 'none',
              border: '1px solid var(--color-border)',
              transition: 'all var(--transition-fast)',
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'var(--color-surface-raised)'; e.currentTarget.style.borderColor = 'var(--color-ink-300)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
          >
            Log in
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          style={{ marginTop: 52, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}
        >
          {[
            { icon: <GraduationCap size={14} />, label: '500+ Students' },
            { icon: <Building2 size={14} />, label: '40+ Colleges' },
            { icon: <BriefcaseBusiness size={14} />, label: '120+ Companies' },
          ].map((s, i) => (
            <span key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', fontWeight: 500,
            }}>
              {s.icon} {s.label}
              {i < 2 && <span style={{ marginLeft: 8, color: 'var(--color-border)', userSelect: 'none' }}>·</span>}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: '01',
    icon: <Search size={22} strokeWidth={1.75} />,
    title: 'Discover',
    description: 'Students build a verified Skill Passport. Companies post roles with required skill levels — not vague job descriptions.',
  },
  {
    number: '02',
    icon: <BadgeCheck size={22} strokeWidth={1.75} />,
    title: 'Verify',
    description: 'Take short, targeted assessments per skill. College TPOs can co-verify. No more self-rated 10/10 Excel skills.',
  },
  {
    number: '03',
    icon: <TrendingUp size={22} strokeWidth={1.75} />,
    title: 'Match',
    description: 'Our scoring engine computes a transparent match % — not a black-box. Tells you exactly which skills close the gap.',
  },
  {
    number: '04',
    icon: <BriefcaseBusiness size={22} strokeWidth={1.75} />,
    title: 'Get Hired',
    description: 'Apply directly. Recruiters see verified skill breakdowns, match scores, and project work — not just a PDF.',
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: '96px 0', background: 'var(--color-bg-secondary)' }}>
      <div className="container-editorial">
        <Reveal>
          <div style={{ marginBottom: 56 }}>
            <span style={{
              display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 12,
            }}>
              The Process
            </span>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 500,
              fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', letterSpacing: '-0.025em',
              color: 'var(--color-text-primary)', margin: 0, maxWidth: '22ch',
            }}>
              Four steps from classroom to career-ready
            </h2>
          </div>
        </Reveal>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 2,
          }}
        >
          {STEPS.map((step, i) => (
            <motion.div key={i} variants={fadeUp}>
              <div style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '32px 28px',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
                transition: 'box-shadow var(--transition-base)',
              }}
                onMouseOver={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
              >
                {/* Step number watermark */}
                <span style={{
                  position: 'absolute', top: 16, right: 20,
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: '4rem', color: 'var(--color-border-subtle)',
                  lineHeight: 1, userSelect: 'none', letterSpacing: '-0.04em',
                }}>{step.number}</span>

                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-md)',
                  background: 'var(--color-amber-50)', color: 'var(--color-amber-600)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20,
                }}>
                  {step.icon}
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.25rem',
                  letterSpacing: '-0.02em', marginBottom: 10, color: 'var(--color-text-primary)',
                }}>{step.title}</h3>
                <p style={{
                  fontSize: '0.9rem', color: 'var(--color-text-secondary)',
                  lineHeight: 1.65, margin: 0,
                }}>{step.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Three Roles ──────────────────────────────────────────────────────────────

const ROLES = [
  {
    icon: <GraduationCap size={24} strokeWidth={1.75} />,
    role: 'Students',
    tagline: 'Know exactly where you stand',
    features: [
      'Build a verified Skill Passport',
      'Take assessments — earn trust',
      'See your match % before applying',
      'Get a gap analysis, not a rejection',
    ],
    cta: { label: 'Join as Student', href: '/auth/signup?role=student' },
    accentBg: 'var(--color-amber-50)',
    accentColor: 'var(--color-amber-600)',
  },
  {
    icon: <Users size={24} strokeWidth={1.75} />,
    role: 'Colleges & TPOs',
    tagline: 'Real placement intelligence',
    features: [
      'Skill heatmap vs. industry demand',
      'Track placement pipeline in real time',
      'Co-verify student skills',
      'Aggregate analytics for accreditation',
    ],
    cta: { label: 'Join as College', href: '/auth/signup?role=college' },
    accentBg: 'color-mix(in srgb, var(--color-ink-100) 50%, transparent)',
    accentColor: 'var(--color-ink-700)',
  },
  {
    icon: <Shield size={24} strokeWidth={1.75} />,
    role: 'Companies & Recruiters',
    tagline: 'Hire on evidence, not hope',
    features: [
      'Post roles with specific skill requirements',
      'Filter candidates by verified match %',
      'Run a "Candidate Simulator" before posting',
      'What-If: see impact of adding a skill requirement',
    ],
    cta: { label: 'Join as Company', href: '/auth/signup?role=recruiter' },
    accentBg: 'color-mix(in srgb, var(--color-amber-50) 40%, transparent)',
    accentColor: 'var(--color-amber-600)',
  },
];

function ThreeRoles() {
  return (
    <section id="roles" style={{ padding: '96px 0' }}>
      <div className="container-editorial">
        <Reveal>
          <div style={{ marginBottom: 56 }}>
            <span style={{
              display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 12,
            }}>
              Built for everyone
            </span>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 500,
              fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', letterSpacing: '-0.025em',
              color: 'var(--color-text-primary)', margin: 0, maxWidth: '22ch',
            }}>
              One platform, three perspectives
            </h2>
          </div>
        </Reveal>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}
        >
          {ROLES.map((r, i) => (
            <motion.div key={i} variants={fadeUp}>
              <div style={{
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                height: '100%',
                display: 'flex', flexDirection: 'column',
                background: 'var(--color-surface)',
                transition: 'box-shadow var(--transition-base), transform var(--transition-base)',
              }}
                onMouseOver={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {/* Card header */}
                <div style={{ padding: '28px 28px 24px', borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 'var(--radius-md)',
                    background: r.accentBg, color: r.accentColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 16,
                  }}>
                    {r.icon}
                  </div>
                  <h3 style={{
                    fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.25rem',
                    letterSpacing: '-0.02em', marginBottom: 6, color: 'var(--color-text-primary)',
                  }}>{r.role}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: 0, fontWeight: 500 }}>
                    {r.tagline}
                  </p>
                </div>

                {/* Features */}
                <div style={{ padding: '24px 28px', flex: 1 }}>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {r.features.map((f, j) => (
                      <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                        <span style={{ color: 'var(--color-accent)', marginTop: 2, flexShrink: 0 }}>
                          <BadgeCheck size={15} strokeWidth={2} />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div style={{ padding: '0 28px 28px' }}>
                  <Link to={r.cta.href} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 16px', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)', textDecoration: 'none',
                    color: 'var(--color-text-primary)', fontSize: '0.875rem', fontWeight: 500,
                    transition: 'all var(--transition-fast)', background: 'var(--color-surface-raised)',
                  }}
                    onMouseOver={e => { e.currentTarget.style.background = 'var(--color-bg-tertiary)'; e.currentTarget.style.borderColor = 'var(--color-ink-300)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'var(--color-surface-raised)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                  >
                    {r.cta.label}
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--color-border)',
      background: 'var(--color-bg-secondary)',
      padding: '48px 0',
    }}>
      <div className="container-editorial">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
          {/* Brand */}
          <div style={{ maxWidth: 280 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 'var(--radius-md)',
                background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Zap size={15} color="#0F0F0D" strokeWidth={2.5} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                SkillBridge
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', lineHeight: 1.6, margin: 0 }}>
              Academia-Industry Collaboration Portal — SIH 2026 hackathon project.
            </p>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
            {[
              { heading: 'Platform', links: ['How it works', 'For Students', 'For Colleges', 'For Companies'] },
              { heading: 'Legal', links: ['Privacy Policy', 'Terms of Service'] },
            ].map((col, i) => (
              <div key={i}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: 12 }}>
                  {col.heading}
                </p>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {col.links.map((l, j) => (
                    <li key={j}>
                      <a href="#" style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', textDecoration: 'none', transition: 'color var(--transition-fast)' }}
                        onMouseOver={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
                        onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                      >{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--color-border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
        }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-tertiary)', margin: 0 }}>
            © 2026 SkillBridge. Built for Smart India Hackathon 2026.
          </p>
          <div style={{ display: 'flex', gap: 16 }}>
            {[Code2, ExternalLink, Globe].map((Icon, i) => (
              <a key={i} href="#" style={{
                color: 'var(--color-text-tertiary)', transition: 'color var(--transition-fast)',
              }}
                onMouseOver={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-tertiary)'}
              >
                <Icon size={18} strokeWidth={1.5} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default function Landing() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Navbar dark={dark} toggleDark={() => setDark(d => !d)} />
      <main>
        <Hero />
        <HowItWorks />
        <ThreeRoles />
      </main>
      <Footer />
    </div>
  );
}
