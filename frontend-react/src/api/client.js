/**
 * Centralized Fetch Wrapper for TrustGuard-IoMT
 * Automatically attaches Authorization Bearer tokens from localStorage,
 * parses JSON, handles 401 unauthorized & 403 forbidden responses.
 */

export async function apiClient(url, options = {}) {
  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Clear token and handle unauthorized session expiry
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
      
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      throw new Error('Unauthorized or expired session. Please log in again.');
    }

    if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData.detail || errorData.message || 'Access Forbidden: Insufficient role permissions.';
      throw new Error(msg);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`[API Error] ${options.method || 'GET'} ${url}:`, error.message);
    throw error;
  }
}

export default apiClient;
