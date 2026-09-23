import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

export const authApi = {
  /**
   * Log in user with email and password
   * @returns {Promise<{ message: string, token?: string, email: string, full_name: string, role: string, requires_otp?: boolean }>}
   */
  async login(email, password) {
    return apiClient(API_ENDPOINTS.AUTH_LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Verify Doctor login OTP
   */
  async verifyLoginOtp(email, code) {
    return apiClient(API_ENDPOINTS.AUTH_VERIFY_LOGIN_OTP, {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  },

  /**
   * Register new user
   */
  async signup(email, password, full_name, role = 'Administrator') {
    return apiClient(API_ENDPOINTS.AUTH_SIGNUP, {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name, role }),
    });
  },

  /**
   * Verify Signup Email OTP
   */
  async verifySignupOtp(email, code) {
    return apiClient(API_ENDPOINTS.AUTH_VERIFY_SIGNUP_OTP, {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  },

  /**
   * Resend OTP code
   */
  async resendOtp(email, purpose) {
    return apiClient(API_ENDPOINTS.AUTH_RESEND_OTP, {
      method: 'POST',
      body: JSON.stringify({ email, purpose }),
    });
  },

  /**
   * Request password reset code
   */
  async forgotPassword(email) {
    return apiClient(API_ENDPOINTS.AUTH_FORGOT_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Set new password with reset code
   */
  async resetPassword(email, code, new_password) {
    return apiClient(API_ENDPOINTS.AUTH_RESET_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ email, code, new_password }),
    });
  },

  /**
   * Get current authenticated user profile
   */
  async getMe() {
    return apiClient(API_ENDPOINTS.AUTH_ME);
  },

  /**
   * Admin: List registered users
   */
  async listUsers() {
    return apiClient(API_ENDPOINTS.AUTH_USERS);
  },

  /**
   * Admin: Block/Suspend a user
   */
  async blockUser(email) {
    return apiClient(API_ENDPOINTS.AUTH_BLOCK_USER, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Admin: Unblock a user
   */
  async unblockUser(email) {
    return apiClient(API_ENDPOINTS.AUTH_UNBLOCK_USER, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Admin: Delete user account
   */
  async deleteUser(email) {
    return apiClient(API_ENDPOINTS.AUTH_DELETE_USER, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Check password strength
   */
  async checkPasswordStrength(password) {
    return apiClient(API_ENDPOINTS.AUTH_PASSWORD_STRENGTH, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  },
};
