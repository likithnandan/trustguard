import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [user, setUser] = useState(() => {
    const email = localStorage.getItem('userEmail');
    const fullName = localStorage.getItem('userName');
    const role = localStorage.getItem('userRole');
    if (email && role) {
      return { email, full_name: fullName || 'User', role };
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        try {
          const profile = await authApi.getMe();
          setUser({
            email: profile.email,
            full_name: profile.full_name,
            role: profile.role,
            created_at: profile.created_at,
          });
          localStorage.setItem('userEmail', profile.email);
          localStorage.setItem('userName', profile.full_name);
          localStorage.setItem('userRole', profile.role);
        } catch (err) {
          console.warn('[AuthContext] Stored session invalid or expired:', err.message);
          logout();
        }
      }
      setIsLoading(false);
    }

    initAuth();
  }, []);

  const login = (newToken, userData) => {
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('userEmail', userData.email);
    localStorage.setItem('userName', userData.full_name || userData.userName || 'User');
    localStorage.setItem('userRole', userData.role);

    setToken(newToken);
    setUser({
      email: userData.email,
      full_name: userData.full_name || userData.userName || 'User',
      role: userData.role,
    });
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    setToken(null);
    setUser(null);
  };

  const hasRole = (roles) => {
    if (!user?.role) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token),
    isLoading,
    login,
    logout,
    role: user?.role || null,
    hasRole,
    isAdmin: user?.role === 'Administrator',
    isDoctor: user?.role === 'Doctor',
    isTechnician: user?.role === 'Technician',
  };


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
