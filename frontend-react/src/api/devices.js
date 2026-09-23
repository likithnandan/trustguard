import { apiClient } from './client';
import { API_BASE_URL, API_ENDPOINTS } from './config';

/**
 * TrustGuard-IoMT Medical IoT Device Management API Client
 */
export const deviceApi = {
  /**
   * Retrieves all registered devices in the IoMT registry.
   */
  async listDevices({ department, status } = {}) {
    const params = new URLSearchParams();
    if (department && department !== 'all') params.append('department', department);
    if (status && status !== 'all') params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient(`${API_ENDPOINTS.DEVICES}${query}`);
  },

  /**
   * Retrieves full profile and assigned patient info for a device.
   */
  async getDevice(deviceId) {
    const cleanId = encodeURIComponent(deviceId.trim().toUpperCase());
    return apiClient(API_ENDPOINTS.DEVICE_DETAIL(cleanId));
  },

  /**
   * Registers a new Medical IoT device and returns the one-time provisioning key.
   */
  async createDevice(deviceData) {
    return apiClient(API_ENDPOINTS.DEVICES, {
      method: 'POST',
      body: JSON.stringify(deviceData),
    });
  },

  /**
   * Assigns / binds a Medical IoT device to a patient.
   */
  async assignDeviceToPatient(patientId, deviceId) {
    const cleanPId = encodeURIComponent(patientId.trim().toUpperCase());
    const cleanDId = encodeURIComponent(deviceId.trim().toUpperCase());
    return apiClient(API_ENDPOINTS.ASSIGN_DEVICE(cleanPId, cleanDId), {
      method: 'POST',
    });
  },

  /**
   * Unassigns a device from its current active patient.
   */
  async unassignDevice(deviceId) {
    const cleanDId = encodeURIComponent(deviceId.trim().toUpperCase());
    return apiClient(`${API_BASE_URL}/api/v1/devices/${cleanDId}/unassign`, {
      method: 'POST',
    });
  },
};

export default deviceApi;
