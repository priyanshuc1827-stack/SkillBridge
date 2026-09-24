import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, BadgeCheck, BriefcaseBusiness, BarChart3,
  Settings, LogOut, Bell, User, Zap, ChevronRight,
  BookOpen, TrendingUp, Star, Clock, Plus, ExternalLink,
  CheckCircle2, AlertCircle, X, Search, Sparkles, Building2,
  Trash2, ShieldCheck, Award, ArrowUpRight, Check
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { connectSocket, disconnectSocket } from '../../lib/socket';

// ─── Shared Dashboard Layout ──────────────────────────────────────────────────

function DashboardLayout({ children, navItems, activeNav, onNavChange, role, user, onLogout }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 250, flexShrink: 0,
        borderRight: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid var(--color-border-subtle)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 'var(--radius-md)',
            background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(226, 255, 66, 0.25)',
          }}>
            <Zap size={16} color="#0F0F0D" strokeWidth={2.5} />
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.05rem', color: 'var(--color-text-primary)', letterSpacing: '-0.02em', display: 'block', lineHeight: 1.2 }}>
              SkillBridge
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-tertiary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Academia-Industry
            </span>
          </div>
        </div>

        {/* Role badge */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border-subtle)' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(226, 255, 66, 0.12)', color: 'var(--color-amber-600)',
            border: '1px solid rgba(226, 255, 66, 0.3)',
            borderRadius: 'var(--radius-full)', padding: '3px 10px',
            fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            <GraduationCap size={12} /> {role}
          </span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {navItems.map(item => {
            const active = activeNav === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavChange(item.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 'var(--radius-md)',
                  background: active ? 'var(--color-bg-secondary)' : 'transparent',
                  border: active ? '1px solid var(--color-border)' : '1px solid transparent',
                  cursor: 'pointer', width: '100%', textAlign: 'left',
                  color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  fontSize: '0.875rem', fontWeight: active ? 600 : 400,
                  transition: 'all var(--transition-fast)',
                }}
                onMouseOver={e => { if (!active) e.currentTarget.style.background = 'var(--color-bg-secondary)'; }}
                onMouseOut={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ color: active ? 'var(--color-accent)' : 'currentColor', display: 'flex' }}>
                  {item.icon}
                </span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge != null && (
                  <span style={{
                    fontSize: '0.7rem', padding: '1px 6px', borderRadius: '999px',
                    background: active ? 'var(--color-accent)' : 'var(--color-border)',
                    color: active ? '#0F0F0D' : 'var(--color-text-secondary)', fontWeight: 600,
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User section */}
        <div style={{
          padding: '12px 10px', borderTop: '1px solid var(--color-border-subtle)',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 12px', borderRadius: 'var(--radius-md)',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 'var(--radius-full)',
              background: 'var(--color-amber-50)', border: '1px solid var(--color-amber-300)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-amber-600)',
              flexShrink: 0,
            }}>
              {user?.name?.[0]?.toUpperCase() ?? 'S'}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name ?? 'Student'}
              </p>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px', borderRadius: 'var(--radius-md)',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-tertiary)', fontSize: '0.8125rem', width: '100%', textAlign: 'left',
              transition: 'all var(--transition-fast)',
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'var(--color-bg-secondary)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-tertiary)'; }}
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          background: 'color-mix(in srgb, var(--color-bg) 94%, transparent)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--color-border-subtle)',
          padding: '0 32px', height: 58,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.15rem',
            color: 'var(--color-text-primary)', letterSpacing: '-0.02em', margin: 0,
          }}>
            {navItems.find(n => n.key === activeNav)?.label ?? 'Dashboard'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              borderRadius: '999px', padding: '3px 10px', fontSize: '0.72rem', fontWeight: 600,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Live Sync Active
            </span>
          </div>
        </div>

        <div style={{ padding: '32px', flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, delta, subtext }) {
  return (
    <div style={{
      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)', padding: '20px 24px',
      boxShadow: 'var(--shadow-sm)', transition: 'all var(--transition-base)',
    }}
      onMouseOver={e => e.currentTarget.style.borderColor = 'var(--color-border-strong)'}
      onMouseOut={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{label}</span>
        <div style={{
          width: 32, height: 32, borderRadius: 'var(--radius-md)',
          background: 'var(--color-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-text-secondary)',
        }}>
          {icon}
        </div>
      </div>
      <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '-0.03em' }}>
        {value}
      </p>
      {delta && (
        <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--color-amber-600)', fontWeight: 500 }}>{delta}</p>
      )}
      {subtext && (
        <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>{subtext}</p>
      )}
    </div>
  );
}

// ─── Skill Assessment Quiz Modal ───────────────────────────────────────────────

function SkillQuizModal({ skill, onClose, onVerified }) {
  const [step, setStep] = useState('loading'); // 'loading' | 'quiz' | 'submitting' | 'result' | 'error'
  const [sessionToken, setSessionToken] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // seconds

  // Fetch questions from server on mount
  useEffect(() => {
    const startAssessment = async () => {
      try {
        const res = await api.get(`/assessments/start?skillId=${skill.skillId}`);
        setSessionToken(res.data.sessionToken);
        setQuestions(res.data.questions);
        setTimeLeft(res.data.timeLimitMinutes * 60);
        setStep('quiz');
      } catch (err) {
        const msg = err.response?.data?.error || 'Failed to start assessment. Please try again.';
        setError(msg);
        setStep('error');
      }
    };
    startAssessment();
  }, [skill.skillId]);

  // Countdown timer
  useEffect(() => {
    if (step !== 'quiz') return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, step]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const timeColor = timeLeft < 120 ? '#ef4444' : timeLeft < 300 ? '#eab308' : 'var(--color-text-secondary)';

  const handleSelect = (qIdx, optIdx) => {
    setAnswers(prev => ({ ...prev, [String(qIdx)]: optIdx }));
  };

  const handleSubmit = async () => {
    setStep('submitting');
    try {
      const res = await api.post('/assessments/submit', {
        sessionToken,
        answers,
      });
      setResult(res.data);
      setStep('result');
    } catch (err) {
      const msg = err.response?.data?.error || 'Submission failed. Please try again.';
      setError(msg);
      setStep('error');
    }
  };

  const allAnswered = questions.length > 0 && Object.keys(answers).length >= questions.length;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0, 0, 0, 0.72)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          width: '100%', maxWidth: 600, background: 'var(--color-surface)',
          border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)',
          padding: '28px', boxShadow: 'var(--shadow-xl)', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--radius-md)',
              background: 'rgba(226, 255, 66, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-amber-600)',
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--color-text-primary)' }}>
                Skill Verification Assessment
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                {skill?.skill?.name} • {questions.length} Questions • AI-Generated
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {step === 'quiz' && (
              <span style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: 700, color: timeColor }}>
                {formatTime(timeLeft)}
              </span>
            )}
            {(step === 'loading' || step === 'error' || step === 'result') && (
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)' }}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Loading */}
        {step === 'loading' && (
          <div style={{ padding: '50px 20px', textAlign: 'center' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%', border: '3px solid var(--color-accent)',
              borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px',
            }} />
            <h4 style={{ margin: '0 0 8px', color: 'var(--color-text-primary)' }}>Generating Your Assessment</h4>
            <p style={{ margin: 0, color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}>
              AI is creating unique questions for <strong>{skill?.skill?.name}</strong>...
            </p>
          </div>
        )}

        {/* Error */}
        {step === 'error' && (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#ef4444',
            }}>
              <AlertCircle size={28} />
            </div>
            <h4 style={{ margin: '0 0 8px', color: 'var(--color-text-primary)' }}>Assessment Unavailable</h4>
            <p style={{ margin: '0 0 20px', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{error}</p>
            <button onClick={onClose} style={{
              padding: '10px 24px', borderRadius: 'var(--radius-md)', background: 'var(--color-border)',
              color: 'var(--color-text-primary)', border: 'none', cursor: 'pointer',
            }}>Close</button>
          </div>
        )}

        {/* Quiz */}
        {step === 'quiz' && (
          <>
            {/* Progress */}
            <div style={{ marginBottom: 16, flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--color-text-tertiary)', marginBottom: 6 }}>
                <span>{Object.keys(answers).length} of {questions.length} answered</span>
                <span style={{ color: timeColor, fontWeight: 600 }}>Time: {formatTime(timeLeft)}</span>
              </div>
              <div style={{ height: 4, background: 'var(--color-bg-secondary)', borderRadius: 2 }}>
                <div style={{
                  height: '100%', borderRadius: 2, background: 'var(--color-accent)',
                  width: `${(Object.keys(answers).length / questions.length) * 100}%`,
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4, display: 'flex', flexDirection: 'column', gap: 18 }}>
              {questions.map((q, qIdx) => (
                <div key={q.id} style={{ background: 'var(--color-bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ margin: '0 0 12px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                    {qIdx + 1}. {q.question}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {q.options.map((opt, optIdx) => {
                      const selected = answers[String(qIdx)] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelect(qIdx, optIdx)}
                          style={{
                            textAlign: 'left', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                            border: selected ? '1.5px solid var(--color-accent)' : '1px solid var(--color-border)',
                            background: selected ? 'rgba(226, 255, 66, 0.1)' : 'var(--color-surface)',
                            color: selected ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                            fontSize: '0.8125rem', cursor: 'pointer', transition: 'all 0.15s ease',
                            display: 'flex', alignItems: 'center', gap: 10,
                          }}
                        >
                          <span style={{
                            width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                            border: selected ? '1.5px solid var(--color-accent)' : '1.5px solid var(--color-border)',
                            background: selected ? 'var(--color-accent)' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {selected && <Check size={12} color="#0F0F0D" strokeWidth={3} />}
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 20, flexShrink: 0 }}>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 16px', borderRadius: 'var(--radius-md)', background: 'transparent',
                  border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)',
                  fontSize: '0.85rem', cursor: 'pointer',
                }}
              >
                Abandon
              </button>
              <button
                onClick={handleSubmit}
                disabled={!allAnswered}
                style={{
                  padding: '10px 24px', borderRadius: 'var(--radius-md)',
                  background: allAnswered ? 'var(--color-accent)' : 'var(--color-border)',
                  color: allAnswered ? '#0F0F0D' : 'var(--color-text-tertiary)',
                  fontWeight: 600, border: 'none',
                  fontSize: '0.875rem', cursor: allAnswered ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s ease',
                }}
              >
                Submit Assessment ({Object.keys(answers).length}/{questions.length})
              </button>
            </div>
          </>
        )}

        {/* Submitting */}
        {step === 'submitting' && (
          <div style={{ padding: '50px 20px', textAlign: 'center' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%', border: '3px solid var(--color-accent)',
              borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px',
            }} />
            <h4 style={{ margin: '0 0 8px', color: 'var(--color-text-primary)' }}>Evaluating Your Answers</h4>
            <p style={{ margin: 0, color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}>
              Scoring against verified answer key...
            </p>
          </div>
        )}

        {/* Result */}
        {step === 'result' && result && (
          <div style={{ overflowY: 'auto', paddingRight: 4 }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: result.passed ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                color: result.passed ? '#22c55e' : '#ef4444',
              }}>
                {result.passed ? <CheckCircle2 size={38} /> : <AlertCircle size={38} />}
              </div>
              <h3 style={{ margin: '0 0 6px', fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--color-text-primary)' }}>
                {result.passed ? `Verified! ${result.score}%` : `${result.score}% — Not Passed`}
              </h3>
              <p style={{ margin: '0 0 6px', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                {result.correctCount} of {result.totalQuestions} correct
              </p>
              <p style={{ margin: 0, color: result.passed ? '#22c55e' : '#ef4444', fontSize: '0.8rem', fontWeight: 500 }}>
                {result.passed ? '🎉 Your Skill Passport badge has been upgraded to Assessment Verified!' : '60% required to pass. You can retry after 24 hours.'}
              </p>
            </div>

            {/* Answer breakdown */}
            {result.breakdown && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                <h4 style={{ margin: '0 0 8px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Answer Review
                </h4>
                {result.breakdown.map((item, idx) => (
                  <div key={idx} style={{
                    padding: '12px 14px', borderRadius: 'var(--radius-md)',
                    background: item.isCorrect ? 'rgba(34, 197, 94, 0.07)' : 'rgba(239, 68, 68, 0.07)',
                    border: `1px solid ${item.isCorrect ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                  }}>
                    <p style={{ margin: '0 0 6px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {idx + 1}. {item.question}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.775rem', color: item.isCorrect ? '#22c55e' : '#ef4444' }}>
                      {item.isCorrect ? '✓ Correct' : `✗ You chose: "${item.options[item.submittedIndex] ?? 'No answer'}" → Correct: "${item.options[item.correctIndex]}"`}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => { if (result.passed) onVerified(); onClose(); }}
              style={{
                width: '100%', padding: '11px 24px', borderRadius: 'var(--radius-md)',
                background: 'var(--color-accent)', color: '#0F0F0D',
                fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '0.9rem',
              }}
            >
              {result.passed ? 'Done — Return to Passport' : 'Close'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── Resume Upload Card ────────────────────────────────────────────────────────

function ResumeUploadCard({ onSkillsExtracted }) {
  const [uploadState, setUploadState] = useState('idle'); // 'idle' | 'uploading' | 'done' | 'error'
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [addingSkills, setAddingSkills] = useState(false);
  const [addSuccessMsg, setAddSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [resumeUrl, setResumeUrl] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    setUploadState('uploading');
    setExtractedSkills([]);
    setSelectedSkills([]);
    setAddSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await api.post('/student/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setExtractedSkills(res.data.extractedSkills || []);
      setSelectedSkills((res.data.extractedSkills || []).map((_, i) => i)); // select all by default
      setResumeUrl(res.data.resumeUrl);
      setUploadState('done');
    } catch (err) {
      const msg = err.response?.data?.error || 'Upload failed. Please try again.';
      setErrorMsg(msg);
      setUploadState('error');
    }
    // Clear file input so same file can be re-uploaded
    e.target.value = '';
  };

  const handleAddSkills = async () => {
    if (!selectedSkills.length) return;
    setAddingSkills(true);
    try {
      const skillsToAdd = selectedSkills.map(i => extractedSkills[i]);
      await Promise.all(
        skillsToAdd.map(sk => api.post('/student/skills', { skillName: sk.name, category: sk.category || 'Other' }))
      );
      setAddSuccessMsg(`✓ Added ${skillsToAdd.length} skill${skillsToAdd.length !== 1 ? 's' : ''} to your Skill Passport!`);
      setExtractedSkills([]);
      setSelectedSkills([]);
      onSkillsExtracted();
    } catch (err) {
      setErrorMsg('Some skills could not be added (they may already exist on your profile).');
    } finally {
      setAddingSkills(false);
    }
  };

  const toggleSkill = (idx) => {
    setSelectedSkills(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  return (
    <div style={{
      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)', padding: '24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 'var(--radius-md)',
          background: 'rgba(226, 255, 66, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Sparkles size={16} color="var(--color-amber-600)" />
        </div>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>
          AI Resume Parser
        </h3>
      </div>
      <p style={{ margin: '0 0 18px', fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
        Upload your resume (PDF or DOCX) — AI will extract your technical skills and add them to your Skill Passport.
      </p>

      {/* Upload Zone */}
      {uploadState !== 'done' && (
        <label style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '28px 20px', borderRadius: 'var(--radius-md)',
          border: uploadState === 'uploading' ? '2px dashed var(--color-accent)' : '2px dashed var(--color-border)',
          cursor: uploadState === 'uploading' ? 'not-allowed' : 'pointer',
          background: 'var(--color-bg-secondary)', transition: 'border-color 0.2s ease',
          marginBottom: 14,
        }}>
          {uploadState === 'uploading' ? (
            <>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--color-accent)',
                borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', marginBottom: 12,
              }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                Uploading & parsing with AI...
              </span>
            </>
          ) : (
            <>
              <BookOpen size={28} color="var(--color-text-tertiary)" style={{ marginBottom: 10 }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>
                Drop your resume here or click to browse
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                PDF or DOCX, max 5MB
              </span>
            </>
          )}
          <input
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            disabled={uploadState === 'uploading'}
            style={{ display: 'none' }}
          />
        </label>
      )}

      {/* Error state */}
      {uploadState === 'error' && (
        <div style={{
          padding: '10px 14px', borderRadius: 'var(--radius-md)',
          background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)',
          color: '#ef4444', fontSize: '0.8125rem', marginBottom: 12,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <AlertCircle size={15} /> {errorMsg}
        </div>
      )}

      {/* Success message */}
      {addSuccessMsg && (
        <div style={{
          padding: '10px 14px', borderRadius: 'var(--radius-md)',
          background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)',
          color: '#22c55e', fontSize: '0.8125rem',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <CheckCircle2 size={15} /> {addSuccessMsg}
        </div>
      )}

      {/* Extracted skills list */}
      {uploadState === 'done' && extractedSkills.length > 0 && (
        <>
          {resumeUrl && (
            <div style={{
              padding: '8px 12px', borderRadius: 'var(--radius-md)',
              background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)',
              color: '#22c55e', fontSize: '0.78rem', marginBottom: 14,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <CheckCircle2 size={13} /> Resume uploaded successfully
            </div>
          )}

          <p style={{ margin: '0 0 10px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Found {extractedSkills.length} skills — select which to add:
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 16 }}>
            {extractedSkills.map((sk, idx) => {
              const sel = selectedSkills.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => toggleSkill(idx)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '4px 12px', borderRadius: 'var(--radius-full)',
                    border: sel ? '1.5px solid var(--color-accent)' : '1px solid var(--color-border)',
                    background: sel ? 'rgba(226, 255, 66, 0.12)' : 'var(--color-bg-secondary)',
                    color: sel ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s ease',
                  }}
                >
                  {sel && <Check size={11} color="var(--color-amber-600)" strokeWidth={3} />}
                  {sk.name}
                  {sk.category && <span style={{ fontSize: '0.68rem', opacity: 0.6 }}>· {sk.category}</span>}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleAddSkills}
              disabled={!selectedSkills.length || addingSkills}
              style={{
                flex: 1, padding: '9px 16px', borderRadius: 'var(--radius-md)',
                background: selectedSkills.length && !addingSkills ? 'var(--color-accent)' : 'var(--color-border)',
                color: selectedSkills.length && !addingSkills ? '#0F0F0D' : 'var(--color-text-tertiary)',
                fontWeight: 600, border: 'none', fontSize: '0.85rem',
                cursor: selectedSkills.length && !addingSkills ? 'pointer' : 'not-allowed',
              }}
            >
              {addingSkills ? 'Adding...' : `Add ${selectedSkills.length} Selected Skill${selectedSkills.length !== 1 ? 's' : ''}`}
            </button>
            <button
              onClick={() => { setUploadState('idle'); setExtractedSkills([]); setSelectedSkills([]); }}
              style={{
                padding: '9px 14px', borderRadius: 'var(--radius-md)',
                background: 'transparent', border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)', fontSize: '0.85rem', cursor: 'pointer',
              }}
            >
              Clear
            </button>
          </div>
        </>
      )}

      {uploadState === 'done' && extractedSkills.length === 0 && (
        <div style={{ padding: '12px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}>
          No technical skills found in the uploaded resume. Try a different file.
          <button
            onClick={() => setUploadState('idle')}
            style={{ display: 'block', margin: '10px auto 0', background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Try another file
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Student Dashboard Main ───────────────────────────────────────────────────

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeNav, setActiveNav] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Skill passport form states
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCat, setNewSkillCat] = useState('Frontend');
  const [verifyingSkill, setVerifyingSkill] = useState(null);

  // Profile form states
  const [profileForm, setProfileForm] = useState({ name: '', targetRole: '', bio: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Project form states
  const [newProj, setNewProj] = useState({ title: '', description: '', link: '', techStack: '' });
  const [showProjModal, setShowProjModal] = useState(false);

  // Job search and filter
  const [jobSearch, setJobSearch] = useState('');
  const [jobFilter, setJobFilter] = useState('all'); // 'all' | 'internship' | 'job'
  const [applyingJobId, setApplyingJobId] = useState(null);

  // Real-time notification toast
  const [statusToast, setStatusToast] = useState(null);

  // Load all student data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [profRes, matchRes, appsRes] = await Promise.all([
        api.get('/student/profile'),
        api.get('/student/matches'),
        api.get('/applications/mine'),
      ]);

      setProfile(profRes.data.student);
      setProfileForm({
        name: profRes.data.student?.name || '',
        targetRole: profRes.data.student?.targetRole || '',
        bio: profRes.data.student?.bio || '',
      });
      setMatches(matchRes.data.matches || []);
      setApplications(appsRes.data.applications || []);
    } catch (err) {
      console.error('Error fetching student data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Connect socket for real-time notifications
  useEffect(() => {
    if (!user?.profileId) return;
    const socket = connectSocket(user);

    const handleStatusUpdate = ({ jobTitle, status }) => {
      setStatusToast({ jobTitle, status });
      setTimeout(() => setStatusToast(null), 5000);
      fetchData(); // refresh applications list
    };

    socket.on('application_status_update', handleStatusUpdate);
    return () => {
      socket.off('application_status_update', handleStatusUpdate);
      disconnectSocket();
    };
  }, [user?.profileId]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Add Skill
  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    try {
      await api.post('/student/skills', {
        skillName: newSkillName.trim(),
        category: newSkillCat,
      });
      setNewSkillName('');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Skill
  const handleDeleteSkill = async (skillId) => {
    try {
      await api.delete(`/student/skills/${skillId}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Save Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await api.patch('/student/profile', profileForm);
      setProfile(res.data.student);
      setProfileSuccessMsg('Profile updated successfully!');
      setTimeout(() => setProfileSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Add Project
  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProj.title.trim()) return;
    try {
      const stack = newProj.techStack.split(',').map(s => s.trim()).filter(Boolean);
      await api.post('/student/projects', {
        title: newProj.title.trim(),
        description: newProj.description.trim() || undefined,
        link: newProj.link.trim() || undefined,
        techStack: stack,
      });
      setNewProj({ title: '', description: '', link: '', techStack: '' });
      setShowProjModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Project
  const handleDeleteProject = async (id) => {
    try {
      await api.delete(`/student/projects/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Apply to Job
  const handleApply = async (jobId) => {
    setApplyingJobId(jobId);
    try {
      await api.post('/applications', { jobId });
      await fetchData();
    } catch (err) {
      console.error('Error applying to job:', err);
    } finally {
      setApplyingJobId(null);
    }
  };

  const verifiedSkillsCount = profile?.skills?.filter(s => s.status !== 'self_claimed').length || 0;
  const totalSkillsCount = profile?.skills?.length || 0;
  const avgMatchScore = matches.length
    ? Math.round(matches.reduce((sum, m) => sum + (m.matchScore || 0), 0) / matches.length)
    : 0;

  const STUDENT_NAV = [
    { key: 'overview', label: 'Overview', icon: <BarChart3 size={15} /> },
    { key: 'skills', label: 'Skill Passport', icon: <BadgeCheck size={15} />, badge: verifiedSkillsCount },
    { key: 'jobs', label: 'Jobs & Matching', icon: <BriefcaseBusiness size={15} />, badge: matches.length },
    { key: 'applications', label: 'My Applications', icon: <Clock size={15} />, badge: applications.length },
    { key: 'profile', label: 'My Profile', icon: <User size={15} /> },
  ];

  return (
    <DashboardLayout
      navItems={STUDENT_NAV}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      role="Student"
      user={user}
      onLogout={handleLogout}
    >
      {/* Real-time toast notification */}
      {statusToast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)', padding: '14px 18px',
          boxShadow: 'var(--shadow-xl)', maxWidth: 340,
          animation: 'fadeIn 0.2s ease',
        }}>
          <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.875rem' }}>
            📬 Application Update
          </p>
          <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
            <strong>{statusToast.jobTitle}</strong> — status changed to <strong style={{ textTransform: 'capitalize' }}>{statusToast.status}</strong>
          </p>
        </div>
      )}
      {/* ─── TAB 1: OVERVIEW ────────────────────────────────────────────── */}
      {activeNav === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {/* Welcome Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(226, 255, 66, 0.08) 0%, rgba(255, 255, 255, 0) 100%)',
            border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)',
            padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ maxWidth: 640 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--color-bg-secondary)', padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                <Sparkles size={13} color="var(--color-amber-600)" />
                AI Skill Passport Verified
              </div>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.85rem',
                letterSpacing: '-0.025em', color: 'var(--color-text-primary)', margin: '0 0 8px',
              }}>
                Welcome back, {profile?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Student'} 👋
              </h1>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.925rem', margin: '0 0 16px', lineHeight: 1.5 }}>
                {profile?.targetRole ? `Target Role: ${profile.targetRole} • ` : ''}
                {profile?.college?.name || 'Associated with Partner Institution'}.
                Your profile is active for recruiter discovery.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setActiveNav('skills')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 'var(--radius-md)',
                    background: 'var(--color-accent)', color: '#0F0F0D',
                    border: 'none', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer',
                  }}
                >
                  <BadgeCheck size={14} /> Open Skill Passport
                </button>
                <button
                  onClick={() => setActiveNav('jobs')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 'var(--radius-md)',
                    background: 'var(--color-surface)', color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border)', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer',
                  }}
                >
                  <BriefcaseBusiness size={14} /> View Matched Jobs
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            <StatCard
              label="Total Skills"
              value={totalSkillsCount}
              icon={<BookOpen size={16} />}
              subtext={`${verifiedSkillsCount} verified credentials`}
            />
            <StatCard
              label="Verified Skills"
              value={verifiedSkillsCount}
              icon={<BadgeCheck size={16} />}
              delta={totalSkillsCount > verifiedSkillsCount ? `${totalSkillsCount - verifiedSkillsCount} pending quiz →` : 'All verified!'}
            />
            <StatCard
              label="Active Applications"
              value={applications.length}
              icon={<BriefcaseBusiness size={16} />}
              subtext="Track pipeline progress"
            />
            <StatCard
              label="Avg. Match Score"
              value={`${avgMatchScore}%`}
              icon={<TrendingUp size={16} />}
              subtext="Against active postings"
            />
          </div>

          {/* Two-column layout: Top Matches & Skill Readiness */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
            {/* Top Matched Jobs */}
            <div style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)', padding: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div>
                  <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--color-text-primary)' }}>
                    Top Matched Opportunities
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-tertiary)' }}>
                    Ranked by your verified skill overlap
                  </p>
                </div>
                <button
                  onClick={() => setActiveNav('jobs')}
                  style={{ background: 'none', border: 'none', color: 'var(--color-amber-600)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  View all →
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {matches.slice(0, 3).map(job => (
                  <div key={job.id} style={{
                    padding: '14px 16px', borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-subtle)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {job.title}
                        </h4>
                        <span style={{
                          fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px',
                          background: job.type === 'internship' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(168, 85, 247, 0.1)',
                          color: job.type === 'internship' ? '#3b82f6' : '#a855f7', fontWeight: 600, textTransform: 'capitalize',
                        }}>
                          {job.type}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                        {job.company?.name} • {job.stipend || 'Competitive'}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '3px 8px', borderRadius: 'var(--radius-full)',
                        background: job.matchScore >= 80 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                        color: job.matchScore >= 80 ? '#22c55e' : '#eab308',
                        fontWeight: 700, fontSize: '0.8rem',
                      }}>
                        {job.matchScore}% Match
                      </div>
                    </div>
                  </div>
                ))}

                {matches.length === 0 && (
                  <p style={{ margin: 0, padding: '20px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}>
                    No job postings available yet.
                  </p>
                )}
              </div>
            </div>

            {/* Quick Skill Passport Overview */}
            <div style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)', padding: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div>
                  <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--color-text-primary)' }}>
                    Skill Passport Badges
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-tertiary)' }}>
                    Verified credentials visible to recruiters
                  </p>
                </div>
                <button
                  onClick={() => setActiveNav('skills')}
                  style={{ background: 'none', border: 'none', color: 'var(--color-amber-600)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Manage →
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {profile?.skills?.map(sk => {
                  const isVerified = sk.status !== 'self_claimed';
                  return (
                    <div
                      key={sk.id}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '6px 12px', borderRadius: 'var(--radius-full)',
                        background: isVerified ? 'rgba(226, 255, 66, 0.12)' : 'var(--color-bg-secondary)',
                        border: isVerified ? '1px solid rgba(226, 255, 66, 0.35)' : '1px solid var(--color-border)',
                        color: isVerified ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                        fontSize: '0.8125rem', fontWeight: 500,
                      }}
                    >
                      {isVerified ? (
                        <BadgeCheck size={14} color="#eab308" />
                      ) : (
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-border-strong)' }} />
                      )}
                      <span>{sk.skill.name}</span>
                      {sk.score && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-amber-600)' }}>
                          {sk.score}%
                        </span>
                      )}
                    </div>
                  );
                })}

                {(!profile?.skills || profile.skills.length === 0) && (
                  <p style={{ margin: 0, padding: '16px 0', color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}>
                    No skills added yet. Add your first skill in the Skill Passport tab!
                  </p>
                )}
              </div>

              {/* Verified seal notice */}
              <div style={{
                padding: '12px 14px', borderRadius: 'var(--radius-md)',
                background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <ShieldCheck size={18} color="#3b82f6" flexShrink={0} />
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                  Verified skills carry <strong>3x weighting</strong> in the recruiter talent matching algorithm.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── TAB 2: SKILL PASSPORT ──────────────────────────────────────── */}
      {activeNav === 'skills' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, margin: '0 0 6px', color: 'var(--color-text-primary)' }}>
                Digital Skill Passport
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                Tamper-proof verifiable credentials that prove your hands-on competencies to hiring partners.
              </p>
            </div>

            {/* Quick Add Skill Form */}
            <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="e.g. React, Docker, Python..."
                value={newSkillName}
                onChange={e => setNewSkillName(e.target.value)}
                style={{
                  padding: '8px 14px', borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)', fontSize: '0.85rem', width: 210,
                }}
              />
              <select
                value={newSkillCat}
                onChange={e => setNewSkillCat(e.target.value)}
                style={{
                  padding: '8px 12px', borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)', fontSize: '0.85rem',
                }}
              >
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Database">Database</option>
                <option value="DevOps">DevOps / Cloud</option>
                <option value="AI / ML">AI / ML</option>
                <option value="Mobile">Mobile</option>
              </select>
              <button
                type="submit"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 'var(--radius-md)',
                  background: 'var(--color-accent)', color: '#0F0F0D',
                  border: 'none', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer',
                }}
              >
                <Plus size={14} /> Add Skill
              </button>
            </form>
          </div>

          {/* Skill Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {profile?.skills?.map(sk => {
              const isVerified = sk.status !== 'self_claimed';
              return (
                <div
                  key={sk.id}
                  style={{
                    background: 'var(--color-surface)',
                    border: isVerified ? '1px solid rgba(226, 255, 66, 0.4)' : '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)', padding: '20px',
                    position: 'relative', boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
                        color: 'var(--color-text-tertiary)', display: 'block', marginBottom: 2,
                      }}>
                        {sk.skill.category || 'Technical Competency'}
                      </span>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {sk.skill.name}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleDeleteSkill(sk.skillId)}
                      title="Remove skill"
                      style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', padding: 4 }}
                      onMouseOver={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-tertiary)'}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Verification Status Banner */}
                  <div style={{
                    padding: '8px 12px', borderRadius: 'var(--radius-md)', marginBottom: 14,
                    background: isVerified ? 'rgba(34, 197, 94, 0.1)' : 'var(--color-bg-secondary)',
                    border: isVerified ? '1px solid rgba(34, 197, 94, 0.25)' : '1px solid var(--color-border-subtle)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {isVerified ? (
                        <>
                          <BadgeCheck size={16} color="#22c55e" />
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#22c55e' }}>
                            Assessment Verified
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={16} color="var(--color-amber-600)" />
                          <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                            Self-Claimed
                          </span>
                        </>
                      )}
                    </div>

                    {isVerified && sk.score && (
                      <span style={{
                        fontSize: '0.8rem', fontWeight: 700, color: '#22c55e',
                        background: 'rgba(34, 197, 94, 0.2)', padding: '2px 8px', borderRadius: '999px',
                      }}>
                        {sk.score}% Score
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  {!isVerified ? (
                    <button
                      onClick={() => setVerifyingSkill(sk)}
                      style={{
                        width: '100%', padding: '8px 14px', borderRadius: 'var(--radius-md)',
                        background: 'var(--color-accent)', color: '#0F0F0D',
                        border: 'none', fontWeight: 600, fontSize: '0.8125rem',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}
                    >
                      <ShieldCheck size={14} /> Verify With 3-Min Quiz
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>
                      <span>Badge ID: SB-{sk.id.slice(-6).toUpperCase()}</span>
                      <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Check size={12} /> Active on Profile
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {(!profile?.skills || profile.skills.length === 0) && (
            <div style={{
              textAlign: 'center', padding: '60px 20px', background: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border)',
            }}>
              <BadgeCheck size={36} color="var(--color-text-tertiary)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ margin: '0 0 6px', color: 'var(--color-text-primary)' }}>Your Skill Passport is Empty</h3>
              <p style={{ margin: '0 0 16px', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                Add your technical skills using the form above to start matching with employers!
              </p>
            </div>
          )}

          {/* Verification Modal */}
          <AnimatePresence>
            {verifyingSkill && (
              <SkillQuizModal
                skill={verifyingSkill}
                onClose={() => setVerifyingSkill(null)}
                onVerified={fetchData}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ─── TAB 3: JOBS & MATCHING ENGINE ──────────────────────────────── */}
      {activeNav === 'jobs' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {/* Header & Filters */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, margin: '0 0 6px', color: 'var(--color-text-primary)' }}>
                Industry Opportunities & Match Engine
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                Every role is ranked against your Skill Passport with automatic skill gap analysis.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: 220 }}>
                <Search size={14} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--color-text-tertiary)' }} />
                <input
                  type="text"
                  placeholder="Search by role or company..."
                  value={jobSearch}
                  onChange={e => setJobSearch(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px 8px 34px', borderRadius: 'var(--radius-md)',
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)', fontSize: '0.85rem',
                  }}
                />
              </div>

              <select
                value={jobFilter}
                onChange={e => setJobFilter(e.target.value)}
                style={{
                  padding: '8px 14px', borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)', fontSize: '0.85rem',
                }}
              >
                <option value="all">All Types</option>
                <option value="internship">Internships Only</option>
                <option value="job">Full-Time Jobs Only</option>
              </select>
            </div>
          </div>

          {/* Job Listings with Skill Gap */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {matches
              .filter(m => {
                if (jobFilter !== 'all' && m.type !== jobFilter) return false;
                if (jobSearch && !m.title.toLowerCase().includes(jobSearch.toLowerCase()) && !m.company?.name.toLowerCase().includes(jobSearch.toLowerCase())) {
                  return false;
                }
                return true;
              })
              .map(job => (
                <div
                  key={job.id}
                  style={{
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)', padding: '24px',
                    boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 280 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {job.title}
                        </h3>
                        <span style={{
                          fontSize: '0.72rem', padding: '2px 8px', borderRadius: '999px',
                          background: job.type === 'internship' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(168, 85, 247, 0.1)',
                          color: job.type === 'internship' ? '#3b82f6' : '#a855f7', fontWeight: 600, textTransform: 'capitalize',
                        }}>
                          {job.type}
                        </span>
                      </div>

                      <p style={{ margin: '0 0 12px', fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 14 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <Building2 size={14} /> {job.company?.name}
                        </span>
                        <span>•</span>
                        <span>{job.location || 'Remote / Hybrid'}</span>
                        <span>•</span>
                        <span style={{ fontWeight: 600, color: 'var(--color-amber-600)' }}>{job.stipend || 'Competitive Compensation'}</span>
                      </p>

                      <p style={{ margin: '0 0 16px', fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                        {job.description}
                      </p>

                      {/* Skill Gap Analysis Section */}
                      <div style={{ background: 'var(--color-bg-secondary)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                          <Sparkles size={13} color="var(--color-amber-600)" />
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            Skill Gap & Overlap Analysis
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                          {/* Matched skills */}
                          {job.matchedSkills?.map((ms, idx) => (
                            <span
                              key={idx}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                padding: '3px 10px', borderRadius: 'var(--radius-full)',
                                background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)',
                                color: '#22c55e', fontSize: '0.75rem', fontWeight: 600,
                              }}
                            >
                              <CheckCircle2 size={12} /> {ms.name} ({ms.status === 'self_claimed' ? 'Claimed' : 'Verified'})
                            </span>
                          ))}

                          {/* Missing skills */}
                          {job.missingSkills?.map((ms, idx) => (
                            <span
                              key={idx}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                padding: '3px 10px', borderRadius: 'var(--radius-full)',
                                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)',
                                color: '#ef4444', fontSize: '0.75rem', fontWeight: 500,
                              }}
                            >
                              <AlertCircle size={12} /> Missing: {ms.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right column: Match score dial & Apply button */}
                    <div style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      justifyContent: 'center', minWidth: 140, textAlign: 'center',
                      borderLeft: '1px solid var(--color-border-subtle)', paddingLeft: 20,
                    }}>
                      <div style={{
                        width: 72, height: 72, borderRadius: '50%',
                        background: job.matchScore >= 80 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                        border: `3px solid ${job.matchScore >= 80 ? '#22c55e' : '#eab308'}`,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 12,
                      }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: job.matchScore >= 80 ? '#22c55e' : '#eab308', lineHeight: 1 }}>
                          {job.matchScore}%
                        </span>
                        <span style={{ fontSize: '0.6rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                          Match
                        </span>
                      </div>

                      {job.hasApplied ? (
                        <div style={{
                          padding: '8px 16px', borderRadius: 'var(--radius-md)',
                          background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)',
                          color: '#22c55e', fontSize: '0.8125rem', fontWeight: 600,
                          display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                          <Check size={14} /> Applied
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApply(job.id)}
                          disabled={applyingJobId === job.id}
                          style={{
                            width: '100%', padding: '9px 16px', borderRadius: 'var(--radius-md)',
                            background: 'var(--color-accent)', color: '#0F0F0D',
                            border: 'none', fontWeight: 600, fontSize: '0.85rem',
                            cursor: applyingJobId === job.id ? 'wait' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            boxShadow: '0 2px 8px rgba(226, 255, 66, 0.25)',
                          }}
                        >
                          {applyingJobId === job.id ? 'Applying...' : 'Apply Now'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      )}

      {/* ─── TAB 4: MY APPLICATIONS ─────────────────────────────────────── */}
      {activeNav === 'applications' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, margin: '0 0 6px', color: 'var(--color-text-primary)' }}>
              Application Pipeline
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: 0 }}>
              Live status updates on your applications with recruiter review stages.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {applications.map(app => {
              const statusConfig = {
                applied: { label: 'Applied', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' },
                shortlisted: { label: 'Shortlisted', color: '#eab308', bg: 'rgba(234, 179, 8, 0.12)' },
                interview: { label: 'Interview Scheduled', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.12)' },
                offer: { label: 'Offer Received 🎉', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' },
                rejected: { label: 'Archived', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' },
              }[app.status] || { label: app.status, color: 'var(--color-text-secondary)', bg: 'var(--color-bg-secondary)' };

              return (
                <div
                  key={app.id}
                  style={{
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {app.job.title}
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                        {app.job.company.name}
                      </p>
                    </div>

                    <span style={{
                      padding: '3px 10px', borderRadius: '999px',
                      background: statusConfig.bg, color: statusConfig.color,
                      fontSize: '0.75rem', fontWeight: 600,
                    }}>
                      {statusConfig.label}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)',
                    marginTop: 16, fontSize: '0.78rem',
                  }}>
                    <span style={{ color: 'var(--color-text-tertiary)' }}>
                      Match Score: <strong style={{ color: 'var(--color-text-primary)' }}>{Math.round(app.matchScore || 0)}%</strong>
                    </span>
                    <span style={{ color: 'var(--color-text-tertiary)' }}>
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {applications.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '60px 20px', background: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border)',
            }}>
              <BriefcaseBusiness size={36} color="var(--color-text-tertiary)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ margin: '0 0 6px', color: 'var(--color-text-primary)' }}>No active applications</h3>
              <p style={{ margin: '0 0 16px', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                Explore open positions and submit your verified application!
              </p>
              <button
                onClick={() => setActiveNav('jobs')}
                style={{
                  padding: '9px 18px', borderRadius: 'var(--radius-md)',
                  background: 'var(--color-accent)', color: '#0F0F0D',
                  border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                }}
              >
                Browse Matching Roles
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* ─── TAB 5: MY PROFILE & PROJECTS ───────────────────────────────── */}
      {activeNav === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
            {/* Edit Profile Form */}
            <div style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)', padding: '24px',
            }}>
              <h3 style={{ margin: '0 0 6px', fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--color-text-primary)' }}>
                Personal Information
              </h3>
              <p style={{ margin: '0 0 20px', fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                Keep your details updated for recruiter screening
              </p>

              {profileSuccessMsg && (
                <div style={{
                  padding: '10px 14px', borderRadius: 'var(--radius-md)',
                  background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)',
                  color: '#22c55e', fontSize: '0.8125rem', fontWeight: 500, marginBottom: 16,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <CheckCircle2 size={16} /> {profileSuccessMsg}
                </div>
              )}

              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 5 }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                    style={{
                      width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)',
                      background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)', fontSize: '0.875rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 5 }}>
                    Target Role / Specialization
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Full Stack Developer, ML Engineer"
                    value={profileForm.targetRole}
                    onChange={e => setProfileForm({ ...profileForm, targetRole: e.target.value })}
                    style={{
                      width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)',
                      background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)', fontSize: '0.875rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 5 }}>
                    Bio & Career Objective
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Write a brief overview of your background, achievements, and career goals..."
                    value={profileForm.bio}
                    onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                    style={{
                      width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)',
                      background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)', fontSize: '0.875rem', resize: 'vertical',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 5 }}>
                    Affiliated Institution
                  </label>
                  <input
                    type="text"
                    disabled
                    value={profile?.college?.name || 'Default Partner College'}
                    style={{
                      width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)',
                      background: 'var(--color-border-subtle)', border: '1px solid var(--color-border)',
                      color: 'var(--color-text-tertiary)', fontSize: '0.875rem', cursor: 'not-allowed',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  style={{
                    padding: '10px 18px', borderRadius: 'var(--radius-md)',
                    background: 'var(--color-accent)', color: '#0F0F0D',
                    border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                    marginTop: 8,
                  }}
                >
                  {isSavingProfile ? 'Saving Changes...' : 'Save Profile Details'}
                </button>
              </form>
            </div>

            {/* ── Resume Upload & Skill Extraction ── */}
            <ResumeUploadCard onSkillsExtracted={() => fetchData()} />

            {/* Project Portfolio */}
            <div style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)', padding: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--color-text-primary)' }}>
                    Proof of Work Portfolio
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                    Projects verifying your practical expertise
                  </p>
                </div>
                <button
                  onClick={() => setShowProjModal(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 14px', borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  <Plus size={14} /> Add Project
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {profile?.projects?.map(proj => (
                  <div
                    key={proj.id}
                    style={{
                      padding: '14px 16px', borderRadius: 'var(--radius-md)',
                      background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {proj.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {proj.link && (
                          <a
                            href={proj.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--color-amber-600)', display: 'flex' }}
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <button
                          onClick={() => handleDeleteProject(proj.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', padding: 2 }}
                          onMouseOver={e => e.currentTarget.style.color = '#ef4444'}
                          onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-tertiary)'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {proj.description && (
                      <p style={{ margin: '0 0 10px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                        {proj.description}
                      </p>
                    )}

                    {proj.techStack?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {proj.techStack.map((tech, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px',
                              background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)',
                              color: 'var(--color-text-secondary)', fontWeight: 500,
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {(!profile?.projects || profile.projects.length === 0) && (
                  <p style={{ margin: 0, padding: '24px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}>
                    No projects added yet. Click "+ Add Project" to showcase your work!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Add Project Modal */}
          <AnimatePresence>
            {showProjModal && (
              <div style={{
                position: 'fixed', inset: 0, zIndex: 100,
                background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
              }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  style={{
                    width: '100%', maxWidth: 460, background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)',
                    padding: '24px', boxShadow: 'var(--shadow-xl)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.15rem', color: 'var(--color-text-primary)' }}>
                      Add Portfolio Project
                    </h3>
                    <button
                      onClick={() => setShowProjModal(false)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)' }}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleAddProject} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 5 }}>
                        Project Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Distributed E-Commerce Microservices"
                        value={newProj.title}
                        onChange={e => setNewProj({ ...newProj, title: e.target.value })}
                        style={{
                          width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)',
                          background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                          color: 'var(--color-text-primary)', fontSize: '0.85rem',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 5 }}>
                        Description
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Key features built and technical challenges solved..."
                        value={newProj.description}
                        onChange={e => setNewProj({ ...newProj, description: e.target.value })}
                        style={{
                          width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)',
                          background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                          color: 'var(--color-text-primary)', fontSize: '0.85rem',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 5 }}>
                        GitHub or Demo URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://github.com/..."
                        value={newProj.link}
                        onChange={e => setNewProj({ ...newProj, link: e.target.value })}
                        style={{
                          width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)',
                          background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                          color: 'var(--color-text-primary)', fontSize: '0.85rem',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 5 }}>
                        Tech Stack (Comma-separated)
                      </label>
                      <input
                        type="text"
                        placeholder="React, Node.js, PostgreSQL, Docker"
                        value={newProj.techStack}
                        onChange={e => setNewProj({ ...newProj, techStack: e.target.value })}
                        style={{
                          width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)',
                          background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                          color: 'var(--color-text-primary)', fontSize: '0.85rem',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                      <button
                        type="button"
                        onClick={() => setShowProjModal(false)}
                        style={{
                          padding: '8px 16px', borderRadius: 'var(--radius-md)',
                          background: 'transparent', border: '1px solid var(--color-border)',
                          color: 'var(--color-text-secondary)', fontSize: '0.85rem', cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{
                          padding: '8px 20px', borderRadius: 'var(--radius-md)',
                          background: 'var(--color-accent)', color: '#0F0F0D',
                          fontWeight: 600, border: 'none', fontSize: '0.85rem', cursor: 'pointer',
                        }}
                      >
                        Add to Profile
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </DashboardLayout>
  );
}
