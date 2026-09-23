import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const ROUTE_TITLES = {
  '/admin/dashboard': 'Continuous Trust Operations Dashboard',
  '/admin/patients': 'Inpatient Census & Multi-Device Monitoring',
  '/admin/devices': 'Medical IoT Device Registry',
  '/admin/trust': 'Continuous Trust Engine & XAI Attribution',
  '/admin/analytics': 'AI Predictive Risk Analytics',
  '/admin/heatmap': 'Hospital Department Risk Heat Map',
  '/admin/maintenance': 'Derived Maintenance Advisor & Drift Forecasting',
  '/admin/alerts': 'Security Incident Response & Anomaly Alerts',
  '/admin/reports': 'Analytical Reports & HIPAA-Aligned Records',
  '/admin/device-profiles': 'Dynamic Device Profiles Drawer',
  '/admin/settings': 'System Security & Access Settings',
  '/admin/users': 'Account Control & User Management',
};

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const currentTitle = ROUTE_TITLES[location.pathname] || 'Operational Overview';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {/* Sidebar Navigation */}
      <Sidebar isMobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflow: 'hidden' }}>
        <Topbar onToggleMobile={() => setMobileOpen(!mobileOpen)} title={currentTitle} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
