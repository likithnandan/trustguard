import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AccessDenied from '../pages/AccessDenied';

export function RoleRoute({ allowedRoles, children }) {
  const { role, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)', color: 'var(--accent)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '12px' }}>🛡️</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>Verifying Access Role...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <AccessDenied requiredRoles={allowedRoles} currentRole={role} />;
  }

  return children;
}

export default RoleRoute;
