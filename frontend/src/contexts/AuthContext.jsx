import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { getDashboardPath } from '../lib/utils';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('sb_token');
    const storedUser = localStorage.getItem('sb_user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('sb_token');
        localStorage.removeItem('sb_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('sb_token', data.token);
    localStorage.setItem('sb_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const signup = useCallback(async (payload) => {
    const { data } = await api.post('/auth/signup', payload);
    localStorage.setItem('sb_token', data.token);
    localStorage.setItem('sb_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sb_token');
    localStorage.removeItem('sb_user');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      const refreshed = {
        ...data.user,
        name: data.user.student?.name || data.user.college?.name || data.user.company?.name || data.user.email,
      };
      setUser(refreshed);
      localStorage.setItem('sb_user', JSON.stringify(refreshed));
      return refreshed;
    } catch {
      logout();
    }
  }, [logout]);

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    dashboardPath: user ? getDashboardPath(user.role) : '/',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
