import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Eye, EyeOff, ArrowLeft, AlertCircle, GraduationCap, Users, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import { FormField, inputStyle } from './Login';

const signupSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .regex(/^[A-Za-z\s'-]+$/, 'Name must contain only letters and spaces'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
  role: z.enum(['student', 'college', 'recruiter']),
  targetRole: z.string().optional(),
  collegeId: z.string().optional(),
  domain: z.string().optional(),
  industry: z.string().optional(),
});

const ROLES = [
  {
    key: 'student',
    label: 'Student',
    icon: <GraduationCap size={20} strokeWidth={1.75} />,
    description: 'Build a verified Skill Passport and get matched to the right opportunities',
  },
  {
    key: 'college',
    label: 'College / TPO',
    icon: <Users size={20} strokeWidth={1.75} />,
    description: 'Track placement analytics and verify student skills at scale',
  },
  {
    key: 'recruiter',
    label: 'Company',
    icon: <Shield size={20} strokeWidth={1.75} />,
    description: 'Post roles with required skills and find verified candidates',
  },
];

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'student';

  const [selectedRole, setSelectedRole] = useState(defaultRole);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [colleges, setColleges] = useState([]);

  // Fetch college list for student signup dropdown
  useEffect(() => {
    api.get('/college/list')
      .then(res => setColleges(res.data.colleges || []))
      .catch(() => {}); // silent fail — field becomes optional text input
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
    defaultValues: { role: defaultRole },
  });

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setValue('role', role);
  };

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const user = await signup({ ...data, role: selectedRole });
      const paths = { student: '/dashboard/student', college: '/dashboard/college', recruiter: '/dashboard/recruiter' };
      navigate(paths[user.role] || '/');
    } catch (err) {
      setServerError(err.response?.data?.error || 'Signup failed. Please try again.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--color-bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: `linear-gradient(var(--color-border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--color-border-subtle) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
        maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 100%)',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{
          position: 'relative', zIndex: 1,
          width: '100%', maxWidth: 480,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '40px',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <Link to="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: '0.8125rem', color: 'var(--color-text-tertiary)',
          textDecoration: 'none', marginBottom: 32,
          transition: 'color var(--transition-fast)',
        }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-tertiary)'}
        >
          <ArrowLeft size={13} /> Back to home
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 'var(--radius-md)',
            background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 20,
          }}>
            <Zap size={18} color="#0F0F0D" strokeWidth={2.5} />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.75rem',
            letterSpacing: '-0.025em', color: 'var(--color-text-primary)', margin: '0 0 8px',
          }}>
            Create your account
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Start verifying your skills on SkillBridge
          </p>
        </div>

        {/* Role selector */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 10 }}>
            I am a…
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {ROLES.map(r => {
              const active = selectedRole === r.key;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => handleRoleSelect(r.key)}
                  style={{
                    background: active ? 'var(--color-amber-50)' : 'var(--color-bg)',
                    border: `1.5px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 8px',
                    cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    color: active ? 'var(--color-amber-600)' : 'var(--color-text-secondary)',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {r.icon}
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
                    {r.label}
                  </span>
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: 8 }}>
            {ROLES.find(r => r.key === selectedRole)?.description}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {serverError && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '12px 14px', borderRadius: 'var(--radius-md)',
              background: 'color-mix(in srgb, #EF4444 8%, transparent)',
              border: '1px solid color-mix(in srgb, #EF4444 25%, transparent)',
              fontSize: '0.875rem', color: '#B91C1C',
            }}>
              <AlertCircle size={16} style={{ marginTop: 1, flexShrink: 0 }} />
              {serverError}
            </div>
          )}

          <input type="hidden" {...register('role')} value={selectedRole} />

          <FormField label={selectedRole === 'student' ? 'Full name' : selectedRole === 'college' ? 'College / University name' : 'Company name'} error={errors.name?.message}>
            <input
              {...register('name')}
              id="name"
              type="text"
              placeholder={selectedRole === 'student' ? 'Priya Sharma' : selectedRole === 'college' ? 'IIT Bombay' : 'Infosys Ltd.'}
              style={inputStyle(!!errors.name)}
              autoComplete="name"
            />
          </FormField>

          <FormField label="Email address" error={errors.email?.message}>
            <input
              {...register('email')}
              id="email"
              type="email"
              placeholder="you@example.com"
              style={inputStyle(!!errors.email)}
              autoComplete="email"
            />
          </FormField>

          {/* Role-specific fields */}
          <AnimatePresence mode="wait">
            {selectedRole === 'student' && (
              <motion.div
                key="student-field"
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                <FormField label="Target role (optional)" error={errors.targetRole?.message}>
                  <input
                    {...register('targetRole')}
                    id="targetRole"
                    type="text"
                    placeholder="e.g. Frontend Developer, Data Analyst"
                    style={inputStyle(false)}
                  />
                </FormField>
                {colleges.length > 0 && (
                  <FormField label="Your College / Institution (optional)" error={errors.collegeId?.message}>
                    <select
                      {...register('collegeId')}
                      id="collegeId"
                      style={inputStyle(false)}
                    >
                      <option value="">— Select your college —</option>
                      {colleges.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </FormField>
                )}
              </motion.div>
            )}
            {selectedRole === 'college' && (
              <motion.div
                key="college-field"
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
              >
                <FormField label="Domain (e.g. iitb.ac.in)" error={errors.domain?.message}>
                  <input
                    {...register('domain')}
                    id="domain"
                    type="text"
                    placeholder="iitb.ac.in"
                    style={inputStyle(false)}
                  />
                </FormField>
              </motion.div>
            )}
            {selectedRole === 'recruiter' && (
              <motion.div
                key="recruiter-field"
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
              >
                <FormField label="Industry" error={errors.industry?.message}>
                  <input
                    {...register('industry')}
                    id="industry"
                    type="text"
                    placeholder="e.g. Technology, Finance, Healthcare"
                    style={inputStyle(false)}
                  />
                </FormField>
              </motion.div>
            )}
          </AnimatePresence>

          <FormField label="Password" error={errors.password?.message}>
            <div style={{ position: 'relative' }}>
              <input
                {...register('password')}
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                style={{ ...inputStyle(!!errors.password), paddingRight: 44 }}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-text-tertiary)', padding: 0,
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </FormField>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              background: 'var(--color-ink-900)', color: 'var(--color-bg)',
              border: 'none', borderRadius: 'var(--radius-md)',
              padding: '12px', fontSize: '0.9375rem', fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
              marginTop: 4,
              transition: 'opacity var(--transition-fast)',
              letterSpacing: '-0.01em',
            }}
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p style={{
          marginTop: 24, textAlign: 'center', fontSize: '0.875rem',
          color: 'var(--color-text-secondary)',
        }}>
          Already have an account?{' '}
          <Link to="/auth/login" style={{ color: 'var(--color-text-primary)', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 3 }}>
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
