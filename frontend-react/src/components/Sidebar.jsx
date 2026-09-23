import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  LayoutDashboard,
  Users,
  Cpu,
  ShieldCheck,
  TrendingUp,
  Grid,
  Wrench,
  AlertTriangle,
  FileText,
  Smartphone,
  Settings,
  UserCheck,
  LogOut,
  Stethoscope,
} from 'lucide-react';

const ADMIN_NAV_ITEMS = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/patients', label: 'Inpatient Census', icon: Users },
  { path: '/admin/devices', label: 'Device Registry', icon: Cpu },
  { path: '/admin/trust', label: 'Trust Engine (XAI)', icon: ShieldCheck },
  { path: '/admin/analytics', label: 'AI Risk Analytics', icon: TrendingUp },
  { path: '/admin/heatmap', label: 'Risk Heat Map', icon: Grid },
  { path: '/admin/maintenance', label: 'Maintenance Advisor', icon: Wrench },
  { path: '/admin/alerts', label: 'Security Alerts', icon: AlertTriangle },
  { path: '/admin/reports', label: 'Analytical Reports', icon: FileText },
  { path: '/admin/device-profiles', label: 'Device Profiles', icon: Smartphone },
  { path: '/admin/settings', label: 'System Settings', icon: Settings },
  { path: '/admin/users', label: 'User Management', icon: UserCheck },
];

export function Sidebar({ isMobileOpen, onCloseMobile }) {
  const { user, logout, isDoctor, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--sidebar)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
        zIndex: 40,
      }}
    >
      {/* Brand Header */}
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
            boxShadow: '0 0 16px rgba(62,201,255,0.3)',
            flexShrink: 0,
          }}
        >
          <Shield size={20} color="#04131c" strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: '700', color: '#fff', letterSpacing: '-0.2px' }}>
            TrustGuard-IoMT
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
            Medical IoT Platform
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
        <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.8px', color: 'var(--muted)', textTransform: 'uppercase', padding: '8px 10px 4px', fontFamily: 'var(--font-mono)' }}>
          Operational Modules
        </div>

        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
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
                marginBottom: '2px',
                transition: 'background 0.15s, color 0.15s',
              })}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {/* Doctor Portal Quick Link if user is Doctor or Admin */}
        {(isDoctor || isAdmin) && (
          <>
            <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.8px', color: 'var(--muted)', textTransform: 'uppercase', padding: '16px 10px 4px', fontFamily: 'var(--font-mono)' }}>
              Clinical Portal
            </div>
            <NavLink
              to="/doctor/patients"
              onClick={onCloseMobile}
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
                marginBottom: '2px',
              })}
            >
              <Stethoscope size={16} />
              <span>Doctor Portal</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* User Footer Profile */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg-topbar)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--panel-2)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: '700',
                color: 'var(--accent)',
                flexShrink: 0,
              }}
            >
              {user?.full_name ? user.full_name.substring(0, 2).toUpperCase() : 'TG'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {user?.full_name || 'System User'}
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                {user?.role || 'Administrator'}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign Out"
            aria-label="Sign Out"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
