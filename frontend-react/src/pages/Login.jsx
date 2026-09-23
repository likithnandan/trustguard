import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Key,
  User,
  UserCheck,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import styles from './Login.module.css';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Mode: 'login' | 'signup' | 'otp' | 'forgot' | 'reset'
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Administrator');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [otpPurpose, setOtpPurpose] = useState('login'); // 'login' | 'signup' | 'reset'

  // Gmail email validation
  const isGmail = (e) => /^[^\s@]+@gmail\.com$/i.test(e.trim());

  // Password strength
  const getPasswordStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 2) return { label: 'Weak', level: 1, color: 'var(--red)' };
    if (score <= 3) return { label: 'Medium', level: 2, color: 'var(--amber)' };
    return { label: 'Strong', level: 3, color: 'var(--green)' };
  };

  const strength = password ? getPasswordStrength(password) : null;
  const newStrength = newPassword ? getPasswordStrength(newPassword) : null;

  // Demo account quick-fill handler
  const fillDemoAccount = (demoEmail, demoPass, demoRole) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setRole(demoRole);
    setMode('login');
    setErrorMessage('');
    setInfoMessage(`Filled demo credentials for ${demoRole}. Click 'Enter System' below.`);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (!isGmail(email)) {
      setErrorMessage('Only @gmail.com email addresses are accepted.');
      return;
    }

    setIsLoading(true);

    try {
      const data = await authApi.login(email.trim(), password);

      if (data.requires_otp) {
        // Doctor account requires OTP code
        setOtpPurpose('login');
        setMode('otp');
        if (data.demo_otp) {
          setOtpCode(data.demo_otp);
          setInfoMessage(`Demo Mode: Verification code is ${data.demo_otp} (Auto-filled & printed in backend terminal).`);
        } else {
          setInfoMessage(`We sent a 6-digit verification code to ${email}. Enter it to complete sign-in.`);
        }
        setIsLoading(false);
        return;
      }


      // Successful login without OTP
      login(data.token, {
        email: data.email,
        full_name: data.full_name,
        role: data.role,
      });

      // Navigate based on role or original destination
      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (data.role === 'Doctor') {
        navigate('/doctor/patients', { replace: true });
      } else {
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('not verified')) {
        setOtpPurpose('signup');
        setMode('otp');
        setInfoMessage(`Email not verified yet. A new verification code was sent to ${email}.`);
      } else {
        setErrorMessage(err.message || 'Login failed. Please verify your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!fullName || !email || !password) {
      setErrorMessage('Please fill in all registration fields.');
      return;
    }

    if (!isGmail(email)) {
      setErrorMessage('Only @gmail.com email addresses are accepted.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.signup(email.trim(), password, fullName.trim(), role);
      setOtpPurpose('signup');
      setMode('otp');
      setInfoMessage(`Account created! A 6-digit verification code was sent to ${email}.`);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to register account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!otpCode || otpCode.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setIsLoading(true);

    try {
      const data = otpPurpose === 'signup'
        ? await authApi.verifySignupOtp(email.trim(), otpCode.trim())
        : await authApi.verifyLoginOtp(email.trim(), otpCode.trim());

      login(data.token, {
        email: data.email,
        full_name: data.full_name,
        role: data.role,
      });

      if (data.role === 'Doctor') {
        navigate('/doctor/patients', { replace: true });
      } else {
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Invalid or expired verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!email || !isGmail(email)) {
      setErrorMessage('Please enter a valid @gmail.com address.');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.forgotPassword(email.trim());
      setMode('reset');
      setInfoMessage(`A 6-digit password reset code was sent to ${email}.`);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!otpCode || otpCode.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit reset code.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.resetPassword(email.trim(), otpCode.trim(), newPassword);
      setMode('login');
      setPassword('');
      setOtpCode('');
      setNewPassword('');
      setInfoMessage('Password successfully updated! You can now log in.');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setErrorMessage('');
    try {
      await authApi.resendOtp(email.trim(), otpPurpose);
      setInfoMessage('A new verification code has been dispatched.');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to resend code.');
    }
  };

  return (
    <div className={styles.stage}>
      <div className={styles.gridBg}></div>
      <div className={styles.glowOrb}></div>

      {/* Animated ECG Waveform */}
      <div className={styles.ecgWrap}>
        <svg viewBox="0 0 560 90" width="100%" height="100%">
          <path className={styles.ecgPath} d="M0,45 L110,45 L135,45 L150,15 L168,78 L184,45 L215,45 L228,30 L242,45 L560,45" />
        </svg>
      </div>

      {/* Animated Morphing Trust Shield */}
      <div className={styles.shieldWrap}>
        <svg viewBox="0 0 96 96" width="100%" height="100%">
          <path className={styles.shieldOutline} d="M48 6 L86 20 V46 C86 70 70 86 48 92 C26 86 10 70 10 46 V20 Z" />
          <path className={styles.shieldFill} d="M48 10 L82 23 V46 C82 68 67 82 48 88 C29 82 14 68 14 46 V23 Z" fill="rgba(62,201,255,0.14)" stroke="none" />
          <g className={styles.shieldFill}>
            <circle className={styles.shieldPulse} cx="48" cy="46" r="4" fill="var(--accent)" />
          </g>
          <path className={styles.shieldCheck} d="M34 47 L44 57 L64 35" />
        </svg>
      </div>

      <div className={styles.content}>
        <div className={styles.eyebrow}>
          <span className={styles.dot}></span> SYSTEM ONLINE
        </div>

        <div className={styles.hero}>
          <h1 className={styles.brandTitle}>
            An Intelligent <span>AI-Driven</span> Continuous Trust Verification for Medical IoT
          </h1>
          <p className={styles.brandSub}>
            Continuously verifying device integrity and data authenticity across connected medical devices.
          </p>
        </div>

        <div className={styles.card}>
        {/* Quick Demo Credentials Bar */}
        <div style={{ marginBottom: '16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 12px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Sparkles size={12} color="var(--accent)" />
            <span>Quick-Fill Demo Roles</span>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@gmail.com', 'Admin@12345', 'Administrator')}
              style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(62,201,255,0.1)', border: '1px solid rgba(62,201,255,0.3)', color: 'var(--accent)', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('doctor.smith@gmail.com', 'Doctor@12345', 'Doctor')}
              style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
            >
              Doctor (OTP)
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('tech@gmail.com', 'Tech@12345', 'Technician')}
              style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#fcd34d', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
            >
              Technician
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className={styles.errorBanner} role="alert">
            {errorMessage}
          </div>
        )}

        {infoMessage && (
          <div style={{ background: 'rgba(45, 212, 160, 0.1)', border: '1px solid rgba(45, 212, 160, 0.35)', color: '#7fe8c8', padding: '10px 14px', borderRadius: '8px', fontSize: '12.5px', marginBottom: '18px', lineHeight: '1.4' }}>
            {infoMessage}
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="authEmail">Email Address</label>
              <div className={styles.inputWrap}>
                <input
                  id="authEmail"
                  type="email"
                  className={styles.input}
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              {email && (
                <div className={`${styles.hint} ${isGmail(email) ? styles.hintOk : styles.hintError}`}>
                  {isGmail(email) ? '✓ Valid @gmail.com domain' : 'Only @gmail.com addresses are accepted'}
                </div>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="authPassword">Password</label>
              <div className={styles.inputWrap}>
                <input
                  id="authPassword"
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className={styles.togglePassBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {strength && (
                <div>
                  <div className={styles.strengthMeter}>
                    <div className={styles.strengthBar} style={{ background: strength.level >= 1 ? strength.color : undefined }}></div>
                    <div className={styles.strengthBar} style={{ background: strength.level >= 2 ? strength.color : undefined }}></div>
                    <div className={styles.strengthBar} style={{ background: strength.level >= 3 ? strength.color : undefined }}></div>
                  </div>
                  <div className={styles.strengthLabel} style={{ color: strength.color }}>
                    {strength.label} password
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? 'Verifying Credentials...' : 'Enter System →'}
            </button>

            <div className={styles.helperRow}>
              <span>New here? <button type="button" onClick={() => { setMode('signup'); setErrorMessage(''); setInfoMessage(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 0, fontWeight: '600' }}>Create account</button></span>
              <button type="button" onClick={() => { setMode('forgot'); setErrorMessage(''); setInfoMessage(''); }} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 0 }}>Forgot access?</button>
            </div>
          </form>
        )}

        {/* SIGNUP FORM */}
        {mode === 'signup' && (
          <form onSubmit={handleSignupSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="signupFullName">Full Name</label>
              <div className={styles.inputWrap}>
                <input
                  id="signupFullName"
                  type="text"
                  className={styles.input}
                  placeholder="Dr. Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="signupRole">Account Role Scope</label>
              <select
                id="signupRole"
                className={styles.input}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Administrator">Administrator (Full Ops & Security)</option>
                <option value="Doctor">Doctor (Inpatient Vitals & Clinical Actions)</option>
                <option value="Technician">Technician (Device Provisioning & Maintenance)</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="signupEmail">Email Address</label>
              <div className={styles.inputWrap}>
                <input
                  id="signupEmail"
                  type="email"
                  className={styles.input}
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {email && (
                <div className={`${styles.hint} ${isGmail(email) ? styles.hintOk : styles.hintError}`}>
                  {isGmail(email) ? '✓ Valid @gmail.com domain' : 'Only @gmail.com addresses are accepted'}
                </div>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="signupPassword">Password</label>
              <div className={styles.inputWrap}>
                <input
                  id="signupPassword"
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={styles.togglePassBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {strength && (
                <div>
                  <div className={styles.strengthMeter}>
                    <div className={styles.strengthBar} style={{ background: strength.level >= 1 ? strength.color : undefined }}></div>
                    <div className={styles.strengthBar} style={{ background: strength.level >= 2 ? strength.color : undefined }}></div>
                    <div className={styles.strengthBar} style={{ background: strength.level >= 3 ? strength.color : undefined }}></div>
                  </div>
                  <div className={styles.strengthLabel} style={{ color: strength.color }}>
                    {strength.label} password
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? 'Registering Account...' : 'Register Account →'}
            </button>

            <div className={styles.helperRow}>
              <span>Already registered? <button type="button" onClick={() => { setMode('login'); setErrorMessage(''); setInfoMessage(''); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 0, fontWeight: '600' }}>Sign in</button></span>
            </div>
          </form>
        )}

        {/* OTP VERIFICATION FORM */}
        {mode === 'otp' && (
          <form onSubmit={handleOtpSubmit}>
            <div style={{ marginBottom: '16px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <Key size={24} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                Enter Verification Code
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
                {otpPurpose === 'signup' ? 'Verify your email to activate your account.' : 'Two-Factor verification required for sign-in.'}
              </p>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="otpCode">6-Digit Code</label>
              <input
                id="otpCode"
                type="text"
                maxLength={6}
                className={styles.input}
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                style={{ textAlign: 'center', letterSpacing: '6px', fontSize: '20px', fontFamily: 'var(--font-mono)' }}
                required
              />
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? 'Verifying Code...' : 'Verify & Continue →'}
            </button>

            <div className={styles.helperRow}>
              <button
                type="button"
                onClick={handleResendOtp}
                className={styles.helperLink}
                style={{ background: 'none', border: 'none', padding: 0 }}
              >
                Resend code
              </button>
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMessage(''); setInfoMessage(''); }}
                className={styles.helperLink}
                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--muted)' }}
              >
                Back to login
              </button>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD STEP 1 */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPasswordSubmit}>
            <div style={{ marginBottom: '16px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <RotateCcw size={24} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                Reset Access
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
                Enter your account email to receive a 6-digit reset code.
              </p>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="forgotEmail">Email Address</label>
              <div className={styles.inputWrap}>
                <input
                  id="forgotEmail"
                  type="email"
                  className={styles.input}
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? 'Sending Code...' : 'Send Verification Code →'}
            </button>

            <div className={styles.helperRow}>
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMessage(''); setInfoMessage(''); }}
                className={styles.helperLink}
                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--muted)' }}
              >
                Back to login
              </button>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD STEP 2: RESET */}
        {mode === 'reset' && (
          <form onSubmit={handleResetPasswordSubmit}>
            <div style={{ marginBottom: '16px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(45,212,160,0.1)', color: 'var(--green)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <Key size={24} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>
                Set New Password
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
                Enter the code sent to {email} and choose your new password.
              </p>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="resetCode">6-Digit Reset Code</label>
              <input
                id="resetCode"
                type="text"
                maxLength={6}
                className={styles.input}
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                style={{ textAlign: 'center', letterSpacing: '6px', fontSize: '20px', fontFamily: 'var(--font-mono)' }}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="newPass">New Password</label>
              <input
                id="newPass"
                type="password"
                className={styles.input}
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              {newStrength && (
                <div>
                  <div className={styles.strengthMeter}>
                    <div className={styles.strengthBar} style={{ background: newStrength.level >= 1 ? newStrength.color : undefined }}></div>
                    <div className={styles.strengthBar} style={{ background: newStrength.level >= 2 ? newStrength.color : undefined }}></div>
                    <div className={styles.strengthBar} style={{ background: newStrength.level >= 3 ? newStrength.color : undefined }}></div>
                  </div>
                  <div className={styles.strengthLabel} style={{ color: newStrength.color }}>
                    {newStrength.label} password
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? 'Updating Password...' : 'Save New Password & Log In →'}
            </button>

            <div className={styles.helperRow}>
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMessage(''); setInfoMessage(''); }}
                className={styles.helperLink}
                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--muted)' }}
              >
                Back to login
              </button>
            </div>
          </form>
        )}
      </div>

      <div className={styles.verifyLine}>
        <span>VERIFYING TRUST</span>
        <span className={styles.bar}><span></span></span>
      </div>

      <div style={{ marginTop: '16px', fontSize: '11.5px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>Continuous AI Verification</span>
        <span>•</span>
        <span>45% DT + 55% DA Policy</span>
      </div>
    </div>
  </div>
  );
}

export default Login;
