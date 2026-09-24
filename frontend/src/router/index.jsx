import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Pages
import Landing from '../pages/Landing';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import StudentDashboard from '../pages/dashboards/StudentDashboard';
import CollegeDashboard from '../pages/dashboards/CollegeDashboard';
import RecruiterDashboard from '../pages/dashboards/RecruiterDashboard';

// Protected route wrapper
function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'var(--color-bg)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div className="skeleton" style={{ width: 120, height: 8, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: 80, height: 8 }} />
      </div>
    </div>
  );

  if (!user) return <Navigate to="/auth/login" replace />;

  if (allowedRole && user.role !== allowedRole) {
    // Redirect to correct dashboard
    const paths = { student: '/dashboard/student', college: '/dashboard/college', recruiter: '/dashboard/recruiter' };
    return <Navigate to={paths[user.role] || '/'} replace />;
  }

  return children;
}

// Public-only route (redirect logged-in users)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    const paths = { student: '/dashboard/student', college: '/dashboard/college', recruiter: '/dashboard/recruiter' };
    return <Navigate to={paths[user.role] || '/'} replace />;
  }
  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />

        {/* Auth — redirect if already logged in */}
        <Route path="/auth/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/auth/signup" element={<PublicRoute><Signup /></PublicRoute>} />

        {/* Protected dashboards */}
        <Route
          path="/dashboard/student"
          element={<ProtectedRoute allowedRole="student"><StudentDashboard /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/college"
          element={<ProtectedRoute allowedRole="college"><CollegeDashboard /></ProtectedRoute>}
        />
        <Route
          path="/dashboard/recruiter"
          element={<ProtectedRoute allowedRole="recruiter"><RecruiterDashboard /></ProtectedRoute>}
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
