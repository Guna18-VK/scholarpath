import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { saveEmail, isEmailSaved } from '../utils/savedEmails';
import './AuthPages.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);   // 1 = register form, 2 = OTP, 3 = save email prompt
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [slowWarning, setSlowWarning] = useState(false);

  // ─── Validation ───────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ─── Step 1: Register ─────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSlowWarning(false);

    // Show slow warning after 5 seconds (Render free tier cold start)
    const slowTimer = setTimeout(() => setSlowWarning(true), 5000);

    try {
      const res = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      clearTimeout(slowTimer);
      setSlowWarning(false);
      setUserId(res.data.userId);
      setStep(2);

      // Always show OTP on screen for immediate verification
      if (res.data.devOtp) {
        setOtp(res.data.devOtp.split(''));
        toast.success(`OTP auto-filled! Check your email too.`, { duration: 6000 });
      } else {
        toast.success('OTP sent to your email!');
      }
    } catch (err) {
      clearTimeout(slowTimer);
      setSlowWarning(false);
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── OTP input handlers ───────────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  // ─── Step 2: Verify OTP ───────────────────────────────────────────────────
  const handleVerify = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) { toast.error('Enter complete 6-digit OTP'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { userId, otp: otpString });
      localStorage.setItem('token', res.data.token);
      toast.success('Email verified! 🎉');

      // Store credentials for login page pre-fill
      sessionStorage.setItem('registered_email', form.email);
      sessionStorage.setItem('registered_password', form.password);

      // If email already saved, skip the prompt and go straight to dashboard
      if (isEmailSaved(form.email)) {
        navigate('/dashboard');
      } else {
        setStep(3); // show save email prompt
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 3: Save email choice ────────────────────────────────────────────
  const handleSaveEmail = () => {
    saveEmail(form.email);
    toast.success('Email saved! It will appear as a suggestion next time.');
    navigate('/dashboard');
  };

  const handleDontSave = () => {
    navigate('/dashboard');
  };

  // ─── Resend OTP ───────────────────────────────────────────────────────────
  const resendOtp = async () => {
    try {
      const res = await api.post('/auth/resend-otp', { userId });
      if (res.data.devOtp) {
        setOtp(res.data.devOtp.split(''));
        toast.success(`Dev mode: OTP auto-filled → ${res.data.devOtp}`);
      } else {
        toast.success('OTP resent!');
      }
    } catch {
      toast.error('Failed to resend OTP');
    }
  };

  return (
    <div className="auth-page">
      {/* ─── Left Panel ─────────────────────────────────────────────────── */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-logo">🎓 ScholarPath</div>
          <h2>Start Your Scholarship Journey</h2>
          <p>Create a free account and get personalized scholarship recommendations in minutes.</p>
          <div className="auth-features">
            <div className="auth-feature">✅ Free Registration</div>
            <div className="auth-feature">✅ Instant Eligibility Check</div>
            <div className="auth-feature">✅ Email Reminders</div>
            <div className="auth-feature">✅ AI Recommendations</div>
          </div>
        </div>
      </div>

      {/* ─── Right Panel ────────────────────────────────────────────────── */}
      <div className="auth-right">
        <div className="auth-form-container">

          {/* Step Indicator — only for steps 1 & 2 */}
          {step < 3 && (
            <div className="step-indicator">
              <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>
                <div className="step-num">{step > 1 ? '✓' : '1'}</div>
                <div className="step-label">Register</div>
              </div>
              <div className="step-line" />
              <div className={`step ${step >= 2 ? 'active' : ''}`}>
                <div className="step-num">2</div>
                <div className="step-label">Verify Email</div>
              </div>
            </div>
          )}

          {/* ══════ STEP 1: Register Form ══════ */}
          {step === 1 && (
            <>
              <div className="auth-form-header">
                <h1>Create Account</h1>
                <p>Fill in your details to get started</p>
              </div>
              <form onSubmit={handleRegister} noValidate>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className={`form-control ${errors.name ? 'error' : ''}`}
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  {errors.name && <div className="form-error">{errors.name}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'error' : ''}`}
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    autoComplete="email"
                  />
                  {errors.email && <div className="form-error">{errors.email}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className={`form-control ${errors.password ? 'error' : ''}`}
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  {errors.password && <div className="form-error">{errors.password}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="Repeat your password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  />
                  {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
                </div>

                <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner spinner-sm" />
                      {slowWarning ? 'Server waking up... please wait (30s)' : 'Creating account...'}
                    </>
                  ) : 'Create Account'}
                </button>
                {slowWarning && (
                  <div className="slow-warning">
                    ⏳ Server is starting up on free hosting — this takes up to 30 seconds on first use. Please wait...
                  </div>
                )}
              </form>
              <p className="auth-switch mt-2">
                Already have an account? <Link to="/login">Sign in</Link>
              </p>
            </>
          )}

          {/* ══════ STEP 2: OTP Verification ══════ */}
          {step === 2 && (
            <>
              <div className="auth-form-header">
                <h1>Verify Your Email</h1>
                <p>Enter the 6-digit OTP sent to <strong>{form.email}</strong></p>
              </div>
              <form onSubmit={handleVerify}>
                <div className="otp-inputs">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      maxLength={1}
                      className="otp-input"
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      autoFocus={i === 0}
                    />
                  ))}
                </div>
                <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
                  {loading ? <><span className="spinner spinner-sm" /> Verifying...</> : 'Verify & Continue'}
                </button>
              </form>
              <p className="auth-switch mt-2">
                Didn't receive OTP?{' '}
                <button className="btn btn-ghost btn-sm" onClick={resendOtp}>Resend</button>
              </p>
            </>
          )}

          {/* ══════ STEP 3: Save Email Prompt ══════ */}
          {step === 3 && (
            <div className="save-email-prompt fade-in">
              {/* Success icon */}
              <div className="save-email-success-icon">✅</div>

              <div className="auth-form-header" style={{ textAlign: 'center' }}>
                <h1>Account Ready!</h1>
                <p>Would you like to save your email for faster sign-in next time?</p>
              </div>

              {/* Email display */}
              <div className="save-email-display">
                <span className="save-email-icon">📧</span>
                <span className="save-email-address">{form.email}</span>
              </div>

              {/* What saving does */}
              <div className="save-email-info">
                <div className="save-email-info-item">
                  <span>💡</span>
                  <span>Your email will appear as a suggestion on the login page</span>
                </div>
                <div className="save-email-info-item">
                  <span>🔒</span>
                  <span>Only stored on this device — never shared</span>
                </div>
                <div className="save-email-info-item">
                  <span>🗑️</span>
                  <span>You can remove it anytime from the login page</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="save-email-actions">
                <button className="btn btn-primary btn-lg w-full" onClick={handleSaveEmail}>
                  💾 Save Email & Continue
                </button>
                <button className="btn btn-ghost btn-lg w-full" onClick={handleDontSave}>
                  Don't Save — Continue
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
