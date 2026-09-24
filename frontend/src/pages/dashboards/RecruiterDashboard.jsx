import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Users, BriefcaseBusiness, TrendingUp, BookOpen, LogOut,
  Zap, Plus, Search, Filter, CheckCircle2, AlertCircle, X,
  Building2, Sliders, ShieldCheck, ExternalLink, ChevronRight, Check
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { connectSocket, disconnectSocket } from '../../lib/socket';

export default function RecruiterDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'jobs' | 'simulator' | 'candidates'
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Post Job Modal state
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [newJobForm, setNewJobForm] = useState({
    title: '', description: '', type: 'internship',
    stipend: '', location: '', skillsInput: 'React, Node.js, PostgreSQL',
  });
  const [postingJob, setPostingJob] = useState(false);

  // Selected job for applicant inspection
  const [selectedJob, setSelectedJob] = useState(null);

  // Real-time toast for new applications
  const [newAppToast, setNewAppToast] = useState(null);

  // What-If Simulator state
  const [simSkills, setSimSkills] = useState(['React', 'Node.js', 'PostgreSQL']);
  const [newSimSkill, setNewSimSkill] = useState('');
  const [minScore, setMinScore] = useState(60);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [simResults, setSimResults] = useState(null);
  const [runningSim, setRunningSim] = useState(false);

  const fetchRecruiterData = async () => {
    try {
      setLoading(true);
      const [profRes, jobsRes, candRes] = await Promise.all([
        api.get('/recruiter/profile'),
        api.get('/recruiter/jobs'),
        api.get('/recruiter/candidates'),
      ]);

      setProfile(profRes.data.company);
      setJobs(jobsRes.data.jobs || []);
      setCandidates(candRes.data.candidates || []);
    } catch (err) {
      console.error('Error fetching recruiter data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiterData();
  }, []);

  // Connect socket for real-time new-application notifications
  useEffect(() => {
    if (!profile) return;
    const socket = connectSocket(user, profile.id);

    const handleNewApp = ({ jobTitle, matchScore }) => {
      setNewAppToast({ jobTitle, matchScore });
      setTimeout(() => setNewAppToast(null), 5000);
      fetchRecruiterData();
    };

    socket.on('new_application', handleNewApp);
    return () => {
      socket.off('new_application', handleNewApp);
      disconnectSocket();
    };
  }, [profile?.id]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Run What-If Simulator
  const runSimulator = async () => {
    if (!simSkills.length) return;
    try {
      setRunningSim(true);
      const res = await api.post('/recruiter/simulate-filter', {
        skills: simSkills,
        minScore,
        verifiedOnly,
      });
      setSimResults(res.data);
    } catch (err) {
      console.error('Simulator error:', err);
    } finally {
      setRunningSim(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'simulator' && !simResults) {
      runSimulator();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, simResults]);

  // Handle Create Job
  const handleCreateJob = async (e) => {
    e.preventDefault();
    setPostingJob(true);
    try {
      const skills = newJobForm.skillsInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => ({ skillName: s, requiredLevel: 2 }));

      await api.post('/jobs', {
        title: newJobForm.title.trim(),
        description: newJobForm.description.trim(),
        type: newJobForm.type,
        stipend: newJobForm.stipend.trim() || undefined,
        location: newJobForm.location.trim() || undefined,
        skills,
      });

      setShowPostJobModal(false);
      setNewJobForm({
        title: '', description: '', type: 'internship',
        stipend: '', location: '', skillsInput: 'React, Node.js, PostgreSQL',
      });
      fetchRecruiterData();
    } catch (err) {
      console.error('Error creating job:', err);
    } finally {
      setPostingJob(false);
    }
  };

  // Handle Application Status Update
  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await api.patch(`/applications/${appId}/status`, { status: newStatus });
      fetchRecruiterData();
    } catch (err) {
      console.error('Error updating application status:', err);
    }
  };

  // Aggregated stats
  const allApplications = jobs.flatMap(j => j.applications || []);
  const shortlistedCount = allApplications.filter(a => a.status === 'shortlisted').length;
  const offersCount = allApplications.filter(a => a.status === 'offer').length;

  const navItems = [
    { key: 'overview', label: 'Overview', icon: <BarChart3 size={15} /> },
    { key: 'jobs', label: 'Job Postings', icon: <BriefcaseBusiness size={15} />, badge: jobs.length },
    { key: 'simulator', label: 'What-If Skill Simulator', icon: <Sliders size={15} /> },
    { key: 'candidates', label: 'Candidate Pool', icon: <Users size={15} />, badge: candidates.length },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Real-time toast */}
      {newAppToast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: 'var(--color-surface)', border: '1px solid rgba(226, 255, 66, 0.4)',
          borderRadius: 'var(--radius-lg)', padding: '14px 18px',
          boxShadow: 'var(--shadow-xl)', maxWidth: 340,
        }}>
          <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.875rem' }}>
            ⚡ New Application Received
          </p>
          <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
            <strong>{newAppToast.jobTitle}</strong> — Match Score: <strong style={{ color: 'var(--color-amber-600)' }}>{Math.round(newAppToast.matchScore || 0)}%</strong>
          </p>
        </div>
      )}
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
              Employer Portal
            </span>
          </div>
        </div>

        {/* Role badge */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border-subtle)' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(234, 179, 8, 0.12)', color: 'var(--color-amber-600)',
            border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: 'var(--radius-full)',
            padding: '3px 10px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            <Building2 size={12} /> {profile?.name || 'Partner Company'}
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
              {profile?.name || user?.name || 'Recruiter'}
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

          <button
            onClick={() => setShowPostJobModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--color-accent)', color: '#0F0F0D',
              border: 'none', borderRadius: 'var(--radius-md)', padding: '7px 16px',
              fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(226, 255, 66, 0.25)',
            }}
          >
            <Plus size={14} /> Post New Opening
          </button>
        </div>

        <div style={{ padding: '32px' }}>
          {/* ─── TAB 1: OVERVIEW ────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.85rem', letterSpacing: '-0.025em', color: 'var(--color-text-primary)', margin: '0 0 4px' }}>
                  Recruitment Pipeline & Talent Inflow
                </h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                  Manage verified applications, post technical criteria, and filter pre-assessed candidates.
                </p>
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                {[
                  { label: 'Active Openings', value: jobs.length, icon: <BriefcaseBusiness size={16} /> },
                  { label: 'Total Applicants', value: allApplications.length, icon: <Users size={16} /> },
                  { label: 'Shortlisted', value: shortlistedCount, icon: <TrendingUp size={16} /> },
                  { label: 'Offers Released', value: offersCount, icon: <CheckCircle2 size={16} /> },
                ].map((s, i) => (
                  <div key={i} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{s.label}</span>
                      <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--color-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
                        {s.icon}
                      </div>
                    </div>
                    <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '-0.03em' }}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Recent Applicants Section */}
              <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <div>
                    <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>
                      Incoming Candidate Stream
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                      Real-time applicant matches with verified skill credentials
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {allApplications.slice(0, 6).map((app, idx) => (
                    <div
                      key={app.id || idx}
                      style={{
                        padding: '14px 16px', borderRadius: 'var(--radius-md)',
                        background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-subtle)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ minWidth: 200 }}>
                        <h4 style={{ margin: '0 0 2px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {app.student?.name || 'Applicant'}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                          {app.student?.college?.name || 'Partner College'} • {app.student?.targetRole || 'Engineer'}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        {app.student?.skills?.slice(0, 3).map(sk => (
                          <span
                            key={sk.id}
                            style={{
                              fontSize: '0.7rem', padding: '2px 8px', borderRadius: 'var(--radius-full)',
                              background: sk.status !== 'self_claimed' ? 'rgba(226, 255, 66, 0.15)' : 'var(--color-surface)',
                              border: sk.status !== 'self_claimed' ? '1px solid rgba(226, 255, 66, 0.4)' : '1px solid var(--color-border)',
                              color: 'var(--color-text-primary)', fontWeight: 500,
                            }}
                          >
                            {sk.skill.name}
                          </span>
                        ))}
                      </div>

                      {/* Match & Status Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{
                          fontSize: '0.8rem', fontWeight: 700, padding: '3px 8px', borderRadius: '999px',
                          background: (app.matchScore || 0) >= 80 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                          color: (app.matchScore || 0) >= 80 ? '#22c55e' : '#eab308',
                        }}>
                          {Math.round(app.matchScore || 0)}% Match
                        </span>

                        <select
                          value={app.status}
                          onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                          style={{
                            padding: '6px 10px', borderRadius: 'var(--radius-md)',
                            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                            color: 'var(--color-text-primary)', fontSize: '0.78rem', fontWeight: 600,
                          }}
                        >
                          <option value="applied">Applied</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="interview">Interview</option>
                          <option value="offer">Offer</option>
                          <option value="rejected">Reject</option>
                        </select>
                      </div>
                    </div>
                  ))}

                  {allApplications.length === 0 && (
                    <p style={{ margin: 0, padding: '30px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}>
                      No candidate applications received yet.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── TAB 2: JOB POSTINGS ────────────────────────────────────── */}
          {activeTab === 'jobs' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, margin: '0 0 6px', color: 'var(--color-text-primary)' }}>
                    Your Open Roles & Requisitions
                  </h2>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                    Active internships and entry-level positions mapped to candidate skill requirements.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {jobs.map(job => (
                  <div
                    key={job.id}
                    style={{
                      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
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
                        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                          {job.location || 'Remote'} • {job.stipend || 'Competitive'} • Posted on {new Date(job.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: 'var(--radius-full)',
                          background: 'rgba(226, 255, 66, 0.12)', color: 'var(--color-amber-600)',
                          fontSize: '0.78rem', fontWeight: 700,
                        }}>
                          {job.applications?.length || 0} Applicants
                        </span>
                      </div>
                    </div>

                    <p style={{ margin: '0 0 16px', fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                      {job.description}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-tertiary)', marginRight: 4 }}>
                        Required:
                      </span>
                      {job.skills?.map(sk => (
                        <span
                          key={sk.id}
                          style={{
                            fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px',
                            background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-subtle)',
                            color: 'var(--color-text-secondary)', fontWeight: 500,
                          }}
                        >
                          {sk.skill.name} (Lvl {sk.requiredLevel})
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                {jobs.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border)' }}>
                    <BriefcaseBusiness size={36} color="var(--color-text-tertiary)" style={{ margin: '0 auto 12px' }} />
                    <h3 style={{ margin: '0 0 6px', color: 'var(--color-text-primary)' }}>No active job listings</h3>
                    <p style={{ margin: '0 0 16px', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                      Post your first role to start receiving matched applicants!
                    </p>
                    <button
                      onClick={() => setShowPostJobModal(true)}
                      style={{ padding: '9px 18px', borderRadius: 'var(--radius-md)', background: 'var(--color-accent)', color: '#0F0F0D', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Post a Role Now
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ─── TAB 3: WHAT-IF SKILL SIMULATOR ─────────────────────────── */}
          {activeTab === 'simulator' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, margin: '0 0 6px', color: 'var(--color-text-primary)' }}>
                  Interactive "What-If" Skill & Talent Simulator
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                  Simulate hiring criteria variations in real-time to assess talent availability across university cohorts before publishing a job.
                </p>
              </div>

              {/* Simulation Controls Panel */}
              <div style={{
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: 28,
              }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  Define Simulation Criteria
                </h3>

                {/* Skills tags */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                    Required Technical Skillset
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                    {simSkills.map((sk, idx) => (
                      <span
                        key={idx}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '4px 10px', borderRadius: 'var(--radius-full)',
                          background: 'rgba(226, 255, 66, 0.12)', border: '1px solid rgba(226, 255, 66, 0.3)',
                          color: 'var(--color-text-primary)', fontSize: '0.8rem', fontWeight: 600,
                        }}
                      >
                        {sk}
                        <button
                          onClick={() => setSimSkills(simSkills.filter((_, i) => i !== idx))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--color-text-tertiary)' }}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 8, maxWidth: 340 }}>
                    <input
                      type="text"
                      placeholder="Add another skill e.g. Docker, Python"
                      value={newSimSkill}
                      onChange={e => setNewSimSkill(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newSimSkill.trim()) {
                            setSimSkills([...simSkills, newSimSkill.trim()]);
                            setNewSimSkill('');
                          }
                        }
                      }}
                      style={{
                        flex: 1, padding: '7px 12px', borderRadius: 'var(--radius-md)',
                        background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)', fontSize: '0.85rem',
                      }}
                    />
                    <button
                      onClick={() => {
                        if (newSimSkill.trim()) {
                          setSimSkills([...simSkills, newSimSkill.trim()]);
                          setNewSimSkill('');
                        }
                      }}
                      style={{
                        padding: '7px 14px', borderRadius: 'var(--radius-md)',
                        background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Slider for Min Score & Checkbox */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                        Minimum Qualification Threshold
                      </label>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-amber-600)' }}>
                        {minScore}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={95}
                      step={5}
                      value={minScore}
                      onChange={e => setMinScore(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--color-accent)', cursor: 'pointer' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="checkbox"
                      id="verifiedOnly"
                      checked={verifiedOnly}
                      onChange={e => setVerifiedOnly(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: 'var(--color-accent)', cursor: 'pointer' }}
                    />
                    <label htmlFor="verifiedOnly" style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)', cursor: 'pointer' }}>
                      Require <strong>Assessment-Verified</strong> credentials only
                    </label>
                  </div>

                  <div>
                    <button
                      onClick={runSimulator}
                      disabled={runningSim}
                      style={{
                        width: '100%', padding: '10px 18px', borderRadius: 'var(--radius-md)',
                        background: 'var(--color-accent)', color: '#0F0F0D',
                        border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(226, 255, 66, 0.25)',
                      }}
                    >
                      {runningSim ? 'Running Simulation...' : 'Calculate Candidate Reach'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Simulation Results Display */}
              {simResults && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
                    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Total University Pool</span>
                      <p style={{ margin: '8px 0 0', fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {simResults.totalInPool} students
                      </p>
                    </div>

                    <div style={{ background: 'var(--color-surface)', border: '1px solid rgba(226, 255, 66, 0.4)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Qualifying Candidates</span>
                      <p style={{ margin: '8px 0 0', fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--color-amber-600)' }}>
                        {simResults.qualifyingCount} qualified
                      </p>
                    </div>

                    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Talent Reach Rate</span>
                      <p style={{ margin: '8px 0 0', fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 600, color: '#22c55e' }}>
                        {simResults.qualificationRate}%
                      </p>
                    </div>
                  </div>

                  {/* Qualified Candidate Cards */}
                  <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    Simulated Qualified Candidates ({simResults.qualifyingCount})
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {simResults.candidates?.map(cand => (
                      <div
                        key={cand.id}
                        style={{
                          padding: '14px 18px', borderRadius: 'var(--radius-md)',
                          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                        }}
                      >
                        <div>
                          <h4 style={{ margin: '0 0 2px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {cand.name}
                          </h4>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                            {cand.college} • {cand.targetRole || 'Engineering Student'}
                          </p>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            padding: '4px 10px', borderRadius: 'var(--radius-full)',
                            background: cand.matchPercentage >= 80 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                            color: cand.matchPercentage >= 80 ? '#22c55e' : '#eab308',
                            fontSize: '0.8rem', fontWeight: 700,
                          }}>
                            {cand.matchPercentage}% Match ({cand.matchedCount}/{simSkills.length} skills)
                          </span>
                        </div>
                      </div>
                    ))}

                    {simResults.qualifyingCount === 0 && (
                      <p style={{ margin: 0, padding: '30px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '0.85rem' }}>
                        No candidates qualify under these exact thresholds. Try lowering the threshold or broadening the required skills.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ─── TAB 4: CANDIDATE POOL ──────────────────────────────────── */}
          {activeTab === 'candidates' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, margin: '0 0 6px', color: 'var(--color-text-primary)' }}>
                  University Talent Directory
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                  Directly discover pre-assessed candidates across partner academic institutions.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {candidates.map(cand => (
                  <div
                    key={cand.id}
                    style={{
                      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)', padding: '20px',
                      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 260 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {cand.name}
                        </h3>
                        <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '999px', background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}>
                          {cand.targetRole || 'Engineer'}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 10px', fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
                        {cand.college?.name || 'Partner College'}
                      </p>

                      {/* Skills badges */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {cand.skills?.map(sk => {
                          const isVerified = sk.status !== 'self_claimed';
                          return (
                            <span
                              key={sk.id}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                fontSize: '0.72rem', padding: '2px 8px', borderRadius: 'var(--radius-full)',
                                background: isVerified ? 'rgba(226, 255, 66, 0.12)' : 'var(--color-bg-secondary)',
                                border: isVerified ? '1px solid rgba(226, 255, 66, 0.35)' : '1px solid var(--color-border)',
                                color: isVerified ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                                fontWeight: 500,
                              }}
                            >
                              {isVerified && <ShieldCheck size={11} color="#eab308" />}
                              {sk.skill.name} {sk.score ? `(${sk.score}%)` : ''}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', display: 'block', marginBottom: 6 }}>
                        {cand.projects?.length || 0} Portfolio Projects
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Post Job Modal */}
          <AnimatePresence>
            {showPostJobModal && (
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
                    width: '100%', maxWidth: 520, background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)',
                    padding: '28px', boxShadow: 'var(--shadow-xl)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>
                      Post New Opportunity
                    </h3>
                    <button
                      onClick={() => setShowPostJobModal(false)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)' }}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleCreateJob} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 5 }}>
                        Job Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Full-Stack Developer Intern"
                        value={newJobForm.title}
                        onChange={e => setNewJobForm({ ...newJobForm, title: e.target.value })}
                        style={{
                          width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)',
                          background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                          color: 'var(--color-text-primary)', fontSize: '0.85rem',
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 5 }}>
                          Role Type
                        </label>
                        <select
                          value={newJobForm.type}
                          onChange={e => setNewJobForm({ ...newJobForm, type: e.target.value })}
                          style={{
                            width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)',
                            background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                            color: 'var(--color-text-primary)', fontSize: '0.85rem',
                          }}
                        >
                          <option value="internship">Internship</option>
                          <option value="job">Full-Time Job</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 5 }}>
                          Stipend / CTC
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. ₹35,000 / month"
                          value={newJobForm.stipend}
                          onChange={e => setNewJobForm({ ...newJobForm, stipend: e.target.value })}
                          style={{
                            width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)',
                            background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                            color: 'var(--color-text-primary)', fontSize: '0.85rem',
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 5 }}>
                        Location
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Bengaluru / Hybrid"
                        value={newJobForm.location}
                        onChange={e => setNewJobForm({ ...newJobForm, location: e.target.value })}
                        style={{
                          width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)',
                          background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                          color: 'var(--color-text-primary)', fontSize: '0.85rem',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 5 }}>
                        Required Skills (Comma-separated)
                      </label>
                      <input
                        type="text"
                        placeholder="React, Node.js, PostgreSQL"
                        value={newJobForm.skillsInput}
                        onChange={e => setNewJobForm({ ...newJobForm, skillsInput: e.target.value })}
                        style={{
                          width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)',
                          background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                          color: 'var(--color-text-primary)', fontSize: '0.85rem',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 5 }}>
                        Job Description *
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Key responsibilities and project expectations..."
                        value={newJobForm.description}
                        onChange={e => setNewJobForm({ ...newJobForm, description: e.target.value })}
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
                        onClick={() => setShowPostJobModal(false)}
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
                        disabled={postingJob}
                        style={{
                          padding: '8px 20px', borderRadius: 'var(--radius-md)',
                          background: 'var(--color-accent)', color: '#0F0F0D',
                          fontWeight: 600, border: 'none', fontSize: '0.85rem', cursor: 'pointer',
                        }}
                      >
                        {postingJob ? 'Publishing...' : 'Publish Job Listing'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
