import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Zap, Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema), mode: 'onBlur' });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const user = await login(data.email, data.password);
      const paths = { student: '/dashboard/student', college: '/dashboard/college', recruiter: '/dashboard/recruiter' };
      navigate(paths[user.role] || '/');
    } catch (err) {
      setServerError(err.response?.data?.error || 'Login failed. Please try again.');
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
          width: '100%', maxWidth: 420,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '40px',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Back link */}
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
        <div style={{ marginBottom: 32 }}>
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
            Welcome back
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: 0 }}>
            Log in to your SkillBridge account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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

          <FormField label="Email address" error={errors.email?.message}>
            <input
              {...register('email')}
              type="email"
              id="email"
              placeholder="you@example.com"
              style={inputStyle(!!errors.email)}
              autoComplete="email"
            />
          </FormField>

          <FormField label="Password" error={errors.password?.message}>
            <div style={{ position: 'relative' }}>
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="••••••••"
                style={{ ...inputStyle(!!errors.password), paddingRight: 44 }}
                autoComplete="current-password"
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
              transition: 'opacity var(--transition-fast)',
              letterSpacing: '-0.01em',
            }}
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={{
          marginTop: 24, textAlign: 'center', fontSize: '0.875rem',
          color: 'var(--color-text-secondary)',
        }}>
          Don't have an account?{' '}
          <Link to="/auth/signup" style={{ color: 'var(--color-text-primary)', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 3 }}>
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

// ─── Shared form helpers ──────────────────────────────────────────────────────

export function FormField({ label, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontSize: '0.8125rem', fontWeight: 600,
        color: 'var(--color-text-primary)', letterSpacing: '0.01em',
      }}>
        {label}
      </label>
      {children}
      {error && (
        <span style={{
          fontSize: '0.75rem',
          color: '#DC2626',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 5,
          lineHeight: 1.4,
          fontWeight: 500,
          animation: 'fadeIn 0.15s ease-out',
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginTop: 1, flexShrink: 0 }}>
            <circle cx="6" cy="6" r="5.5" stroke="#DC2626" />
            <path d="M6 4v3M6 8.5v.01" stroke="#DC2626" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          {error}
        </span>
      )}
    </div>
  );
}

export function inputStyle(hasError) {
  return {
    width: '100%',
    padding: '10px 12px',
    border: `1.5px solid ${hasError ? '#DC2626' : 'var(--color-border)'}`,
    borderRadius: 'var(--radius-md)',
    background: hasError
      ? 'color-mix(in srgb, #DC2626 4%, var(--color-bg))'
      : 'var(--color-bg)',
    color: 'var(--color-text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 150ms ease-out, background 150ms ease-out, box-shadow 150ms ease-out',
    fontFamily: 'var(--font-body)',
    boxSizing: 'border-box',
    boxShadow: hasError ? '0 0 0 3px color-mix(in srgb, #DC2626 12%, transparent)' : 'none',
  };
}
