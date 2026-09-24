import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Users, TrendingUp, BadgeCheck, BookOpen, LogOut,
  Zap, Bell, Search, Filter, AlertTriangle, ArrowUpRight,
  ShieldCheck, CheckCircle2, ChevronRight, Briefcase, GraduationCap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

export default function CollegeDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'heatmap' | 'students' | 'placements'
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCollegeData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, studentsRes] = await Promise.all([
        api.get('/college/analytics'),
        api.get('/college/students'),
      ]);
      setAnalytics(analyticsRes.data);
      setStudents(studentsRes.data.students || []);
    } catch (err) {
      console.error('Error fetching college data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollegeData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { key: 'overview', label: 'Overview', icon: <BarChart3 size={15} /> },
    { key: 'heatmap', label: 'Skill Heatmap & Gap', icon: <TrendingUp size={15} /> },
    { key: 'students', label: 'Students Directory', icon: <Users size={15} />, badge: students.length },
    { key: 'placements', label: 'Placement Funnel', icon: <BadgeCheck size={15} /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 250, flexShrink: 0,
        borderRight: '1px solid var(--color-border)',
        background: 'var(--color-surface)', display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
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
              College & TPO Portal
            </span>
          </div>
        </div>

        {/* Role badge */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border-subtle)' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6',
            border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 'var(--radius-full)',
            padding: '3px 10px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            <GraduationCap size={12} /> Institutional Admin
          </span>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {navItems.map((item) => {
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: active ? 'var(--color-bg-secondary)' : 'transparent',
                  border: active ? '1px solid var(--color-border)' : '1px solid transparent',
                  cursor: 'pointer', width: '100%', textAlign: 'left',
                  color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  fontSize: '0.875rem', fontWeight: active ? 600 : 400,
                  transition: 'all var(--transition-fast)',
                }}
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

        {/* User footer */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--color-border-subtle)' }}>
          <div style={{ padding: '8px 12px', marginBottom: 4 }}>
            <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name ?? 'Institution'}
            </p>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
              borderRadius: 'var(--radius-md)', background: 'transparent', border: 'none',
              cursor: 'pointer', color: 'var(--color-text-tertiary)', fontSize: '0.8125rem', width: '100%',
            }}
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          background: 'color-mix(in srgb, var(--color-bg) 94%, transparent)',
          backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--color-border-subtle)',
          padding: '0 32px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.15rem', color: 'var(--color-text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
            {navItems.find(n => n.key === activeTab)?.label}
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
            Academic Year 2026–2027 • TPO Analytics Active
          </span>
        </div>

        <div style={{ padding: '32px' }}>
          {/* ─── TAB 1: OVERVIEW ────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.85rem', letterSpacing: '-0.025em', color: 'var(--color-text-primary)', margin: '0 0 4px' }}>
                  Institutional Analytics & Placement Health
                </h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                  Real-time visibility into student skill acquisition, verification rates, and recruiter placements.
                </p>
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                {[
                  { label: 'Registered Students', value: analytics?.totalStudents ?? students.length, icon: <Users size={16} />, sub: 'Verified in registry' },
                  { label: 'Total Skills Ingested', value: analytics?.totalSkillsClaimed ?? 0, icon: <BookOpen size={16} />, sub: 'Across all cohorts' },
                  { label: 'Assessment Verified', value: analytics?.totalVerified ?? 0, icon: <ShieldCheck size={16} />, sub: 'Passed technical quiz' },
                  { label: 'Offers Generated', value: analytics?.placementFunnel?.offer ?? 0, icon: <BadgeCheck size={16} />, sub: 'Hired by partners' },
                ].map((s, i) => (
                  <div key={i} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{s.label}</span>
                      <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--color-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
                        {s.icon}
                      </div>
                    </div>
                    <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '-0.03em' }}>{s.value}</p>
                    <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Two Column: Top Skills & Placement Snapshot */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
                {/* Top Institution Skills */}
                <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div>
                      <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>
                        Dominant Skill Clusters
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                        Highest volume skills among your students
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('heatmap')}
                      style={{ background: 'none', border: 'none', color: 'var(--color-amber-600)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Heatmap →
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {(analytics?.heatmapData || []).slice(0, 5).map((item, idx) => (
                      <div key={idx} style={{ padding: '12px 14px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{item.name}</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                            <strong>{item.count}</strong> students ({item.verified} verified)
                          </span>
                        </div>
                        <div style={{ width: '100%', height: 6, background: 'var(--color-border)', borderRadius: 999, overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(100, (item.count / (students.length || 1)) * 100)}%`, height: '100%', background: 'var(--color-accent)' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Placement Funnel Progress */}
                <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div>
                      <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>
                        Placement Stage Distribution
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                        Active student candidate pipeline
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('placements')}
                      style={{ background: 'none', border: 'none', color: 'var(--color-amber-600)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Funnel View →
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[
                      { stage: 'Applied to Postings', count: analytics?.placementFunnel?.applied || 0, color: '#3b82f6' },
                      { stage: 'Shortlisted by Recruiters', count: analytics?.placementFunnel?.shortlisted || 0, color: '#eab308' },
                      { stage: 'Technical Interviews', count: analytics?.placementFunnel?.interview || 0, color: '#a855f7' },
                      { stage: 'Offers Extended', count: analytics?.placementFunnel?.offer || 0, color: '#22c55e' },
                    ].map((step, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: step.color }} />
                          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)', fontWeight: 500 }}>{step.stage}</span>
                        </div>
                        <span style={{ fontSize: '1rem', fontWeight: 700, color: step.color }}>{step.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── TAB 2: SKILL HEATMAP & DEMAND GAP ──────────────────────── */}
          {activeTab === 'heatmap' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, margin: '0 0 6px', color: 'var(--color-text-primary)' }}>
                  Campus Skill Heatmap & Industry Deficit Gap
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                  Compare the talent output of your institution against active corporate hiring demand to guide curriculum updates.
                </p>
              </div>

              {/* Industry Demand vs College Supply Gap Table */}
              <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <AlertTriangle size={18} color="#eab308" />
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    Curricular Gap Warning: Industry Demand vs Campus Supply
                  </h3>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                        <th style={{ padding: '12px 14px' }}>Target Skill</th>
                        <th style={{ padding: '12px 14px' }}>Industry Job Demand</th>
                        <th style={{ padding: '12px 14px' }}>Campus Talent Supply</th>
                        <th style={{ padding: '12px 14px' }}>Deficit / Surplus</th>
                        <th style={{ padding: '12px 14px' }}>TPO Recommendation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(analytics?.demandVsSupply || []).map((row, idx) => {
                        const hasDeficit = row.gap > 0;
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                            <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                              {row.skill}
                            </td>
                            <td style={{ padding: '12px 14px', color: 'var(--color-text-primary)' }}>
                              {row.demand} postings
                            </td>
                            <td style={{ padding: '12px 14px', color: 'var(--color-text-primary)' }}>
                              {row.supply} students
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <span style={{
                                padding: '3px 8px', borderRadius: 'var(--radius-full)',
                                background: hasDeficit ? 'rgba(239, 68, 68, 0.12)' : 'rgba(34, 197, 94, 0.12)',
                                color: hasDeficit ? '#ef4444' : '#22c55e', fontWeight: 700, fontSize: '0.78rem',
                              }}>
                                {hasDeficit ? `Deficit (-${row.gap})` : 'Equilibrium'}
                              </span>
                            </td>
                            <td style={{ padding: '12px 14px', color: 'var(--color-text-secondary)' }}>
                              {hasDeficit ? 'Recommend campus workshop / lab electives' : 'Supply meets corporate demand'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Full Skill Matrix Grid */}
              <h3 style={{ margin: '0 0 16px', fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Comprehensive Skill Proficiency Matrix
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                {(analytics?.heatmapData || []).map((sk, idx) => (
                  <div key={idx} style={{
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)', padding: '16px', boxShadow: 'var(--shadow-sm)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{sk.name}</h4>
                      <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: 'var(--color-bg-secondary)', color: 'var(--color-text-tertiary)' }}>
                        {sk.category || 'General'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                      <span>Students: <strong>{sk.count}</strong></span>
                      <span>Verified: <strong>{sk.verified}</strong></span>
                    </div>

                    {sk.avgScore && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-amber-600)', fontWeight: 600 }}>
                        <span>Avg Quiz Score:</span>
                        <span>{sk.avgScore}%</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ─── TAB 3: STUDENTS DIRECTORY ──────────────────────────────── */}
          {activeTab === 'students' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, margin: '0 0 6px', color: 'var(--color-text-primary)' }}>
                    Student Talent Directory
                  </h2>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                    Enrolled students with verified Skill Passports and application activity.
                  </p>
                </div>

                <div style={{ position: 'relative', width: 240 }}>
                  <Search size={14} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--color-text-tertiary)' }} />
                  <input
                    type="text"
                    placeholder="Search by student name..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%', padding: '8px 12px 8px 34px', borderRadius: 'var(--radius-md)',
                      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)', fontSize: '0.85rem',
                    }}
                  />
                </div>
              </div>

              {/* Student Cards List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {students
                  .filter(st => !searchQuery || st.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(st => (
                    <div
                      key={st.id}
                      style={{
                        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-lg)', padding: '20px',
                        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 260 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {st.name}
                          </h3>
                          <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '999px', background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}>
                            {st.targetRole || 'Engineering Student'}
                          </span>
                        </div>

                        {st.bio && (
                          <p style={{ margin: '0 0 12px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                            {st.bio}
                          </p>
                        )}

                        {/* Verified skills badges */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                          {st.skills?.map(sk => {
                            const isVerified = sk.status !== 'self_claimed';
                            return (
                              <span
                                key={sk.id}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 5,
                                  fontSize: '0.72rem', padding: '3px 8px', borderRadius: 'var(--radius-full)',
                                  background: isVerified ? 'rgba(226, 255, 66, 0.12)' : 'var(--color-bg-secondary)',
                                  border: isVerified ? '1px solid rgba(226, 255, 66, 0.35)' : '1px solid var(--color-border)',
                                  color: isVerified ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                                  fontWeight: 500,
                                }}
                              >
                                {isVerified && <BadgeCheck size={12} color="#eab308" />}
                                {sk.skill.name} {sk.score ? `(${sk.score}%)` : ''}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right stats */}
                      <div style={{ textAlign: 'right', minWidth: 140 }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>
                          Applications: <strong style={{ color: 'var(--color-text-primary)' }}>{st.applications?.length || 0}</strong>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                          Projects: <strong style={{ color: 'var(--color-text-primary)' }}>{st.projects?.length || 0}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}

          {/* ─── TAB 4: PLACEMENT FUNNEL ─────────────────────────────────── */}
          {activeTab === 'placements' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, margin: '0 0 6px', color: 'var(--color-text-primary)' }}>
                  Institutional Placement Funnel
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                  End-to-end recruitment conversion progression for campus drives.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                {[
                  { title: '1. Applied', count: analytics?.placementFunnel?.applied || 0, desc: 'Total applications logged', color: '#3b82f6' },
                  { title: '2. Shortlisted', count: analytics?.placementFunnel?.shortlisted || 0, desc: 'Profiles reviewed by HR', color: '#eab308' },
                  { title: '3. Technical Interview', count: analytics?.placementFunnel?.interview || 0, desc: 'Live technical rounds', color: '#a855f7' },
                  { title: '4. Offer Extended', count: analytics?.placementFunnel?.offer || 0, desc: 'Confirmed corporate offers', color: '#22c55e' },
                ].map((col, idx) => (
                  <div key={idx} style={{
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)', padding: '24px', textAlign: 'center',
                    borderTop: `4px solid ${col.color}`,
                  }}>
                    <h3 style={{ margin: '0 0 8px', fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {col.title}
                    </h3>
                    <p style={{ margin: '0 0 16px', fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 700, color: col.color }}>
                      {col.count}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-tertiary)' }}>
                      {col.desc}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
