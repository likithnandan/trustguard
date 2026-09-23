import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Activity, LogOut, Menu } from 'lucide-react';

export function Topbar({ onToggleMobile, title = 'Operational Overview' }) {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        height: '60px',
        backgroundColor: 'var(--bg-topbar)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Left Title & Mobile Hamburger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {onToggleMobile && (
          <button
            onClick={onToggleMobile}
            aria-label="Toggle menu"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '6px',
            }}
          >
            <Menu size={20} />
          </button>
        )}

        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '600', color: '#fff' }}>
            {title}
          </h1>
        </div>
      </div>

      {/* Right Controls & Verification Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Continuous AI Verification Status Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--green-bg)',
            border: '1px solid rgba(45,212,160,0.3)',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '11.5px',
            fontWeight: '600',
            color: 'var(--green)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)' }}></span>
          <span>Continuous AI Active</span>
        </div>

        {/* User Role Badge */}
        <div
          style={{
            padding: '4px 10px',
            background: 'var(--panel-2)',
            border: '1px solid var(--border-soft)',
            borderRadius: '6px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent)',
          }}
        >
          {user?.role || 'Administrator'}
        </div>

        {/* Sign Out Button */}
        <button
          onClick={logout}
          aria-label="Sign Out"
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            color: 'var(--muted)',
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
        >
          <LogOut size={14} />
          <span>Exit</span>
        </button>
      </div>
    </header>
  );
}

export default Topbar;
