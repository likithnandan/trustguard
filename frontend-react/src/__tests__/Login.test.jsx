import { describe, it, expect } from 'vitest';

describe('Login Authentication Unit Tests', () => {
  it('validates @gmail.com domain requirements correctly', () => {
    const isGmail = (email) => /^[^\s@]+@gmail\.com$/i.test(email.trim());
    expect(isGmail('admin@gmail.com')).toBe(true);
    expect(isGmail('doctor@hospital.org')).toBe(false);
    expect(isGmail('invalid-email')).toBe(false);
  });

  it('evaluates password strength based on entropy levels', () => {
    const evaluateStrength = (pw) => {
      let score = 0;
      if (pw.length >= 8) score++;
      if (pw.length >= 12) score++;
      if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
      if (/\d/.test(pw)) score++;
      if (/[^A-Za-z0-9]/.test(pw)) score++;
      if (score <= 2) return 'weak';
      if (score <= 3) return 'medium';
      return 'strong';
    };

    expect(evaluateStrength('12345')).toBe('weak');
    expect(evaluateStrength('Admin1234')).toBe('medium');
    expect(evaluateStrength('Admin@12345!')).toBe('strong');
  });

  it('enforces 6-digit formatting for 2FA OTP codes', () => {
    const isValidOtp = (code) => /^\d{6}$/.test(code.trim());
    expect(isValidOtp('123456')).toBe(true);
    expect(isValidOtp('12345')).toBe(false);
    expect(isValidOtp('abcdef')).toBe(false);
  });
});
