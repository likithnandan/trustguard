import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

/**
 * TrustGuard-IoMT Dashboard & Analytics API Client
 */
export const dashboardApi = {
  /**
   * Retrieves overall Admin Dashboard KPIs, trust metrics, and decision distribution.
   */
  async getDashboardSummary({ startDate, endDate } = {}) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient(`${API_ENDPOINTS.DASHBOARD_SUMMARY}${query}`);
  },

  /**
   * Retrieves all monitored devices with real-time trust evaluation and assignments.
   */
  async getDashboardDevices({ filterStatus, startDate, endDate } = {}) {
    const params = new URLSearchParams();
    if (filterStatus && filterStatus !== 'all') params.append('filter_status', filterStatus);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient(`${API_ENDPOINTS.DASHBOARD_DEVICES}${query}`);
  },

  /**
   * Retrieves historical trust evaluation time-series for charts.
   */
  async getTrustTrend({ period = '7d', startDate, endDate } = {}) {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient(`${API_ENDPOINTS.DASHBOARD_TREND}${query}`);
  },

  /**
   * Retrieves detailed historical trust evaluations with XAI factors for a selected device.
   */
  async getTrustHistory({ deviceId, limit = 30 } = {}) {
    const params = new URLSearchParams();
    if (deviceId) params.append('device_id', deviceId);
    if (limit) params.append('limit', limit);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient(`${API_ENDPOINTS.DASHBOARD_TRUST_HISTORY}${query}`);
  },

  /**
   * Retrieves active security alerts for the dashboard.
   */
  async getDashboardAlerts({ category = 'All', startDate, endDate } = {}) {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient(`${API_ENDPOINTS.DASHBOARD_ALERTS}${query}`);
  },

  /**
   * Acknowledges a single security alert.
   */
  async acknowledgeAlert(alertId) {
    return apiClient(API_ENDPOINTS.ACKNOWLEDGE_ALERT(alertId), {
      method: 'POST',
    });
  },

  /**
   * Batch acknowledges all active security alerts.
   */
  async acknowledgeAllAlerts() {
    return apiClient(API_ENDPOINTS.ACKNOWLEDGE_ALL_ALERTS, {
      method: 'POST',
    });
  },

  /**
   * Retrieves comprehensive AI analytics, subscore distributions, and risk predictions.
   */
  async getAnalytics({ startDate, endDate } = {}) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient(`${API_ENDPOINTS.DASHBOARD_ANALYTICS}${query}`);
  },

  /**
   * Retrieves hospital floor plan risk heatmap distribution.
   */
  async getHeatmap() {
    return apiClient(API_ENDPOINTS.DASHBOARD_HEATMAP);
  },

  /**
   * Retrieves predictive maintenance metrics and recommendations.
   */
  async getMaintenance() {
    return apiClient(API_ENDPOINTS.DASHBOARD_MAINTENANCE);
  },

  /**
   * Retrieves analytical reports across operational views.
   */
  async getReports({ tab = 'overview', startDate, endDate } = {}) {
    const params = new URLSearchParams();
    if (tab) {
      params.append('tab', tab);
      params.append('type', tab);
    }
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient(`${API_ENDPOINTS.DASHBOARD_REPORTS}${query}`);
  },
};
