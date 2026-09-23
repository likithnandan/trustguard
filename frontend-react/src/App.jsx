import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Devices from './pages/Devices';
import Trust from './pages/Trust';
import Analytics from './pages/Analytics';
import HeatMap from './pages/HeatMap';
import Maintenance from './pages/Maintenance';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import DeviceProfiles from './pages/DeviceProfiles';
import Settings from './pages/Settings';
import Users from './pages/Users';
import DoctorPortal from './pages/DoctorPortal';
import AdminLayout from './layouts/AdminLayout';
import DoctorLayout from './layouts/DoctorLayout';
import AccessDenied from './pages/AccessDenied';
import NotFound from './pages/NotFound';

import './App.css';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<Login />} />

          {/* Root Redirection */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin & Operational Routes (Administrator & Technician) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['Administrator', 'Technician']}>
                  <AdminLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route
              path="dashboard"
              element={<Dashboard />}
            />
            <Route
              path="patients"
              element={<Patients />}
            />
            <Route
              path="devices"
              element={<Devices />}
            />
            <Route
              path="trust"
              element={<Trust />}
            />
            <Route
              path="analytics"
              element={<Analytics />}
            />
            <Route
              path="heatmap"
              element={<HeatMap />}
            />
            <Route
              path="maintenance"
              element={<Maintenance />}
            />
            <Route
              path="alerts"
              element={<Alerts />}
            />
            <Route
              path="reports"
              element={<Reports />}
            />
            <Route
              path="device-profiles"
              element={<DeviceProfiles />}
            />
            <Route
              path="settings"
              element={<Settings />}
            />
            <Route
              path="users"
              element={<Users />}
            />
          </Route>

          {/* Doctor Portal Routes */}
          <Route
            path="/doctor"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['Doctor', 'Administrator']}>
                  <DoctorLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/doctor/patients" replace />} />
            <Route
              path="patients"
              element={<DoctorPortal />}
            />
          </Route>

          {/* Error & Fallback Routes */}
          <Route path="/access-denied" element={<AccessDenied />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
