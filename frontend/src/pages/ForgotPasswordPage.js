import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import './AuthPages.css';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Enter your email'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setUserId(res.data.userId);
      setStep(2);
      toast.success('OTP sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) { toast.error('Enter complete OTP'); return; }
    setStep(3);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passwords.newPassword.length < 6) { toast.error('Minimum 6 characters'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { userId, otp: otp.join(''), newPassword: passwords.newPassword });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-logo">🎓 ScholarPath</div>
          <h2>Reset Your Password</h2>
          <p>We'll send a verification code to your email to help you reset your password securely.</p>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-container">
          <div className="step-indicator">
            {['Email', 'OTP', 'New Password'].map((label, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div className="step-line" />}
                <div className={`step ${step > i ? 'active' : ''} ${step > i + 1 ? 'done' : ''}`}>
                  <div className="step-num">{step > i + 1 ? '✓' : i + 1}</div>
                  <div className="step-label">{label}</div>
                </div>
              </React.Fragment>
            ))}
          </div>

          {step === 1 && (
            <>
              <div className="auth-form-header"><h1>Forgot Password</h1><p>Enter your registered email</p></div>
              <form onSubmit={handleSendOtp}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-control" placeholder="you@example.com"
                    value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
                  {loading ? <><span className="spinner spinner-sm" /> Sending...</> : 'Send OTP'}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className="auth-form-header"><h1>Enter OTP</h1><p>Check your email for the 6-digit code</p></div>
              <form onSubmit={handleVerifyOtp}>
                <div className="otp-inputs">
                  {otp.map((digit, i) => (
                    <input key={i} id={`otp-${i}`} type="text" maxLength={1} className="otp-input"
                      value={digit} onChange={(e) => handleOtpChange(i, e.target.value)} autoFocus={i === 0} />
                  ))}
                </div>
                <button type="submit" className="btn btn-primary w-full btn-lg">Verify OTP</button>
              </form>
            </>
          )}

          {step === 3 && (
            <>
              <div className="auth-form-header"><h1>New Password</h1><p>Choose a strong new password</p></div>
              <form onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input type="password" className="form-control" placeholder="Min. 6 characters"
                    value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input type="password" className="form-control" placeholder="Repeat new password"
                    value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
                  {loading ? <><span className="spinner spinner-sm" /> Resetting...</> : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          <p className="auth-switch mt-2"><Link to="/login">← Back to Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
