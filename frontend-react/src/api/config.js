/**
 * TrustGuard-IoMT Centralized API Endpoints Configuration
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Authentication & User Accounts (auth.py)
  AUTH_LOGIN: `${API_BASE_URL}/auth/login`,
  AUTH_VERIFY_LOGIN_OTP: `${API_BASE_URL}/auth/verify-login-otp`,
  AUTH_SIGNUP: `${API_BASE_URL}/auth/signup`,
  AUTH_VERIFY_SIGNUP_OTP: `${API_BASE_URL}/auth/verify-signup-otp`,
  AUTH_RESEND_OTP: `${API_BASE_URL}/auth/resend-otp`,
  AUTH_FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
  AUTH_RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  AUTH_PASSWORD_STRENGTH: `${API_BASE_URL}/auth/password-strength`,
  AUTH_ME: `${API_BASE_URL}/auth/me`,
  AUTH_USERS: `${API_BASE_URL}/auth/users`,
  AUTH_BLOCK_USER: `${API_BASE_URL}/auth/block-user`,
  AUTH_UNBLOCK_USER: `${API_BASE_URL}/auth/unblock-user`,
  AUTH_DELETE_USER: `${API_BASE_URL}/auth/delete-user`,

  // Dashboard & Analytics (dashboard_api.py)
  DASHBOARD_SUMMARY: `${API_BASE_URL}/api/v1/dashboard/summary`,
  DASHBOARD_DEVICES: `${API_BASE_URL}/api/v1/dashboard/devices`,
  DASHBOARD_TREND: `${API_BASE_URL}/api/v1/dashboard/trust-trend`,
  DASHBOARD_TRUST_HISTORY: `${API_BASE_URL}/api/v1/dashboard/trust-history`,
  DASHBOARD_HEATMAP: `${API_BASE_URL}/api/v1/dashboard/heatmap`,
  DASHBOARD_MAINTENANCE: `${API_BASE_URL}/api/v1/dashboard/maintenance`,
  DASHBOARD_ANALYTICS: `${API_BASE_URL}/api/v1/dashboard/analytics`,
  DASHBOARD_ALERTS: `${API_BASE_URL}/api/v1/dashboard/alerts`,
  DASHBOARD_REPORTS: `${API_BASE_URL}/api/v1/dashboard/reports`,
  ACKNOWLEDGE_ALERT: (id) => `${API_BASE_URL}/api/v1/dashboard/alerts/${id}/acknowledge`,
  ACKNOWLEDGE_ALL_ALERTS: `${API_BASE_URL}/api/v1/dashboard/alerts/acknowledge-all`,

  // Clinical & Device Management (management_api.py)
  PATIENTS: `${API_BASE_URL}/api/v1/patients`,
  PATIENT_DETAIL: (id) => `${API_BASE_URL}/api/v1/patients/${id}`,
  DEVICES: `${API_BASE_URL}/api/v1/devices`,
  DEVICE_DETAIL: (id) => `${API_BASE_URL}/api/v1/devices/${id}`,
  ASSIGN_DEVICE: (patientId, deviceId) => `${API_BASE_URL}/api/v1/patients/${patientId}/assign-device/${deviceId}`,
  UNASSIGN_DEVICE: (patientId, deviceId) => `${API_BASE_URL}/api/v1/patients/${patientId}/unassign-device/${deviceId}`,

  // Doctor Portal (doctor_api.py)
  DOCTOR_PATIENTS: `${API_BASE_URL}/api/v1/doctor/patients`,
  DOCTOR_PATIENT_DETAIL: (id) => `${API_BASE_URL}/api/v1/doctor/patients/${id}`,
  DOCTOR_PATIENT_HISTORY: (id) => `${API_BASE_URL}/api/v1/doctor/patients/${id}/history`,

  // Telemetry & Machine Learning (telemetry_api.py, backend.py)
  TELEMETRY_INGEST: `${API_BASE_URL}/api/v1/telemetry/ingest`,
  EVALUATE: `${API_BASE_URL}/evaluate`,
};
