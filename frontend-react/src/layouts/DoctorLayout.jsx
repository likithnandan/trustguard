import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, Shield, LogOut, ArrowLeft } from 'lucide-react';

export function DoctorLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {/* Doctor Sidebar */}
      <aside
        style={{
          width: '280px',
          backgroundColor: 'var(--sidebar)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          flexShrink: 0,
        }}
      >
        <div style={{ padding: '20px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(62,201,255,0.35)',
              flexShrink: 0,
            }}
          >
            <Stethoscope size={20} color="#04131c" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: '700', color: '#fff' }}>
              Patient Monitor
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              Doctor Portal
            </div>
          </div>
        </div>

        {/* Doctor Inpatient Navigation */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.8px', color: 'var(--muted)', textTransform: 'uppercase', padding: '8px 10px 4px', fontFamily: 'var(--font-mono)' }}>
            Clinical Monitoring
          </div>
          <NavLink
            to="/doctor/patients"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 12px',
              borderRadius: '8px',
              fontSize: '12.8px',
              fontWeight: isActive ? '600' : '500',
              color: isActive ? 'var(--accent)' : 'var(--text-dim)',
              backgroundColor: isActive ? 'var(--accent-soft)' : 'transparent',
              textDecoration: 'none',
              marginBottom: '4px',
            })}
          >
            <Stethoscope size={16} />
            <span>Inpatient Verification</span>
          </NavLink>

          {isAdmin && (
            <button
              onClick={() => navigate('/admin/dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '9px 12px',
                marginTop: '12px',
                background: 'var(--panel-2)',
                border: '1px solid var(--border-soft)',
                borderRadius: '8px',
                color: 'var(--accent)',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={14} /> Back to Admin
            </button>
          )}
        </nav>

        {/* Doctor Footer Profile */}
        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg-topbar)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#fff' }}>
                {user?.full_name || 'Dr. Rivera'}
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>
                ● Online (Doctor)
              </div>
            </div>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              title="Sign Out"
              aria-label="Sign Out"
              style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: '6px' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Doctor Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflow: 'hidden' }}>
        <header style={{ height: '60px', backgroundColor: 'var(--bg-topbar)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '600', color: '#fff' }}>
              Doctor-Facing Continuous Trust Verification
            </h1>
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
            Simulated IoMT Telemetry Stream
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DoctorLayout;
