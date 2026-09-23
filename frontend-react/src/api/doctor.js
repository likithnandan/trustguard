import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

/**
 * TrustGuard-IoMT Doctor Portal API Client
 */
export const doctorApi = {
  /**
   * Retrieves all admitted patients with verified telemetry vitals and trust status.
   */
  async getDoctorPatients() {
    return apiClient(API_ENDPOINTS.DOCTOR_PATIENTS);
  },

  /**
   * Retrieves detailed verified patient record by ID.
   */
  async getDoctorPatientDetail(patientId) {
    return apiClient(API_ENDPOINTS.DOCTOR_PATIENT_DETAIL(patientId));
  },

  /**
   * Retrieves chronological trust evaluation history for a patient.
   */
  async getDoctorPatientHistory(patientId, limit = 15) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient(`${API_ENDPOINTS.DOCTOR_PATIENT_HISTORY(patientId)}${query}`);
  },
};
