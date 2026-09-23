import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

/**
 * TrustGuard-IoMT Patient Management API Client
 */
export const patientApi = {
  /**
   * Retrieves all registered patients with assigned devices.
   */
  async listPatients({ department, status, doctorId } = {}) {
    const params = new URLSearchParams();
    if (department && department !== 'all') params.append('department', department);
    if (status && status !== 'all') params.append('status_filter', status);
    if (doctorId) params.append('doctor_id', doctorId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient(`${API_ENDPOINTS.PATIENTS}${query}`);
  },

  /**
   * Retrieves details for a single patient by ID.
   */
  async getPatient(patientId) {
    const cleanId = encodeURIComponent(patientId.trim().toUpperCase());
    return apiClient(API_ENDPOINTS.PATIENT_DETAIL(cleanId));
  },

  /**
   * Registers a new patient.
   */
  async createPatient(patientData) {
    return apiClient(API_ENDPOINTS.PATIENTS, {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
  },

  /**
   * Updates an existing patient.
   */
  async updatePatient(patientId, updateData) {
    const cleanId = encodeURIComponent(patientId.trim().toUpperCase());
    return apiClient(API_ENDPOINTS.PATIENT_DETAIL(cleanId), {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  /**
   * Unbinds a specific device from a patient.
   */
  async unassignDevice(patientId, deviceId) {
    const cleanPId = encodeURIComponent(patientId.trim().toUpperCase());
    const cleanDId = encodeURIComponent(deviceId.trim().toUpperCase());
    return apiClient(API_ENDPOINTS.UNASSIGN_DEVICE(cleanPId, cleanDId), {
      method: 'POST',
    });
  },
};

export default patientApi;
