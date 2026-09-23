import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export function AccessDenied({ requiredRoles = [], currentRole = '' }) {
  const navigate = useNavigate();
  const { isDoctor, logout } = useAuth();

  const handleReturn = () => {
    if (isDoctor) {
      navigate('/doctor/patients');
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '24px' }}>
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '40px', maxWidth: '480px', width: '100%', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--red-bg)', color: 'var(--red)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
          <ShieldAlert size={32} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
          Access Restricted
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '13.5px', lineHeight: '1.6', marginBottom: '20px' }}>
          Your account role (<strong style={{ color: 'var(--accent)' }}>{currentRole || 'Unknown'}</strong>) does not have authorization to access this operational view.
        </p>

        {requiredRoles.length > 0 && (
          <div style={{ background: 'var(--panel-2)', border: '1px solid var(--border-soft)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '24px', fontFamily: 'var(--font-mono)' }}>
            Required: {requiredRoles.join(', ')}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={handleReturn}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'var(--accent)', color: '#04131c', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
          >
            <ArrowLeft size={16} /> Return to Portal
          </button>
          <button
            onClick={logout}
            style={{ padding: '10px 18px', background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: '500', fontSize: '13px', cursor: 'pointer' }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default AccessDenied;
