import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();
  const { isAuthenticated, isDoctor } = useAuth();

  const handleReturn = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (isDoctor) {
      navigate('/doctor/patients');
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', padding: '24px' }}>
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '16px', padding: '40px', maxWidth: '440px', width: '100%', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
          <HelpCircle size={32} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
          404 — Page Not Found
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '13.5px', lineHeight: '1.6', marginBottom: '24px' }}>
          The requested path does not exist in the TrustGuard-IoMT operational platform.
        </p>
        <button
          onClick={handleReturn}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'var(--accent)', color: '#04131c', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
        >
          <ArrowLeft size={16} /> Return to Application
        </button>
      </div>
    </div>
  );
}

export default NotFound;
