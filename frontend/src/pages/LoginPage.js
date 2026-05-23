import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { getSavedEmails, saveEmail, removeEmail, isEmailSaved } from '../utils/savedEmails';
import './AuthPages.css';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const emailRef = useRef(null);
  const dropdownRef = useRef(null);

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [justRegistered, setJustRegistered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [slowWarning, setSlowWarning] = useState(false);

  // ─── Saved emails state ───────────────────────────────────────────────────
  const [savedEmails, setSavedEmails] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // ─── Load saved emails on mount ───────────────────────────────────────────
  useEffect(() => {
    setSavedEmails(getSavedEmails());
  }, []);

  // ─── Pre-fill after registration ──────────────────────────────────────────
  useEffect(() => {
    const savedEmail = sessionStorage.getItem('registered_email');
    const savedPassword = sessionStorage.getItem('registered_password');
    if (savedEmail && savedPassword) {
      setForm({ email: savedEmail, password: savedPassword });
      setJustRegistered(true);
      sessionStorage.removeItem('registered_email');
      sessionStorage.removeItem('registered_password');
    }
  }, []);

  // ─── Close dropdown on outside click ─────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        emailRef.current && !emailRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ─── Filter emails as user types ─────────────────────────────────────────
  const handleEmailChange = (value) => {
    setForm({ ...form, email: value });
    setJustRegistered(false);
    setHighlightedIndex(-1);

    const all = getSavedEmails();
    setSavedEmails(all);

    if (value.trim()) {
      const filtered = all.filter((e) =>
        e.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredEmails(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      // Show all saved emails when field is empty
      setFilteredEmails(all);
      setShowSuggestions(all.length > 0);
    }
  };

  // ─── Show all suggestions on focus ───────────────────────────────────────
  const handleEmailFocus = () => {
    const all = getSavedEmails();
    setSavedEmails(all);
    if (all.length > 0) {
      const filtered = form.email.trim()
        ? all.filter((e) => e.toLowerCase().includes(form.email.toLowerCase()))
        : all;
      setFilteredEmails(filtered);
      setShowSuggestions(filtered.length > 0);
    }
  };

  // ─── Select a suggestion ─────────────────────────────────────────────────
  const handleSelectEmail = (email) => {
    setForm({ ...form, email });
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    // Focus password field after selecting email
    setTimeout(() => document.getElementById('password-input')?.focus(), 50);
  };

  // ─── Remove a saved email ─────────────────────────────────────────────────
  const handleRemoveEmail = (e, email) => {
    e.stopPropagation();
    removeEmail(email);
    const updated = getSavedEmails();
    setSavedEmails(updated);
    setFilteredEmails(updated.filter((em) =>
      form.email ? em.toLowerCase().includes(form.email.toLowerCase()) : true
    ));
    if (updated.length === 0) setShowSuggestions(false);
    toast.success('Email removed from suggestions');
  };

  // ─── Keyboard navigation in dropdown ─────────────────────────────────────
  const handleEmailKeyDown = (e) => {
    if (!showSuggestions || filteredEmails.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, filteredEmails.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelectEmail(filteredEmails[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // ─── Validation ───────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ─── Submit login ─────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSlowWarning(false);

    const slowTimer = setTimeout(() => setSlowWarning(true), 5000);

    try {
      const res = await api.post('/auth/login', form);
      clearTimeout(slowTimer);
      setSlowWarning(false);
      login(res.data.token, res.data.user);
      if (!isEmailSaved(form.email)) {
      } else {
        saveEmail(form.email);
      }
      toast.success(`Welcome back, ${res.data.user.name}! 👋`);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      clearTimeout(slowTimer);
      setSlowWarning(false);
      const msg = err.response?.data?.message || 'Login failed';
      if (err.response?.data?.userId) {
        toast.error('Please verify your email first');
        navigate(`/register?verify=${err.response.data.userId}`);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const hasSavedEmails = savedEmails.length > 0;

  return (
    <div className="auth-page">
      {/* ─── Left Panel ─────────────────────────────────────────────────── */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-logo">🎓 ScholarPath</div>
          <h2>Find Your Perfect Scholarship</h2>
          <p>Join thousands of students who have discovered life-changing scholarship opportunities.</p>
          <div className="auth-features">
            <div className="auth-feature">✅ 500+ Scholarships</div>
            <div className="auth-feature">✅ Personalized Recommendations</div>
            <div className="auth-feature">✅ Deadline Reminders</div>
            <div className="auth-feature">✅ Free to Use</div>
          </div>
        </div>
      </div>

      {/* ─── Right Panel ────────────────────────────────────────────────── */}
      <div className="auth-right">
        <div className="auth-form-container">

          {/* Just Registered Banner */}
          {justRegistered && (
            <div className="registered-banner">
              <span className="registered-banner-icon">🎉</span>
              <div>
                <div className="registered-banner-title">Account created successfully!</div>
                <div className="registered-banner-sub">Your email and password are filled in. Just click Sign In.</div>
              </div>
            </div>
          )}

          <div className="auth-form-header">
            <h1>{justRegistered ? "You're all set!" : 'Welcome Back'}</h1>
            <p>
              {justRegistered
                ? 'Your credentials are ready — sign in below'
                : hasSavedEmails
                ? 'Sign in or select a saved account below'
                : 'Sign in to your account to continue'}
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>

            {/* ─── Email Field with Suggestions ──────────────────────── */}
            <div className="form-group">
              <label className="form-label">
                Email Address
                {hasSavedEmails && (
                  <span className="saved-emails-count">{savedEmails.length} saved</span>
                )}
              </label>

              <div className="email-suggestions-wrapper">
                <div className="input-with-icon">
                  <span className="input-icon">📧</span>
                  <input
                    ref={emailRef}
                    type="email"
                    id="email-input"
                    className={`form-control input-has-icon input-has-right-icon
                      ${errors.email ? 'error' : ''}
                      ${justRegistered ? 'prefilled' : ''}`}
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    onFocus={handleEmailFocus}
                    onKeyDown={handleEmailKeyDown}
                    autoComplete="off"
                    aria-label="Email address"
                  />
                  {/* Dropdown arrow */}
                  {hasSavedEmails && (
                    <button
                      type="button"
                      className="email-dropdown-arrow"
                      onClick={() => {
                        setFilteredEmails(savedEmails);
                        setShowSuggestions(!showSuggestions);
                      }}
                      aria-label="Show saved emails"
                      tabIndex={-1}
                    >
                      {showSuggestions ? '▲' : '▼'}
                    </button>
                  )}
                  {justRegistered && <span className="prefill-check">✓</span>}
                </div>

                {/* ─── Suggestions Dropdown ──────────────────────────── */}
                {showSuggestions && filteredEmails.length > 0 && (
                  <ul className="email-suggestions-dropdown" ref={dropdownRef} role="listbox">
                    <li className="suggestions-header">
                      <span>📋 Saved Accounts</span>
                      <button
                        type="button"
                        className="suggestions-clear-all"
                        onClick={() => {
                          filteredEmails.forEach((e) => removeEmail(e));
                          setSavedEmails([]);
                          setFilteredEmails([]);
                          setShowSuggestions(false);
                          toast.success('All saved emails cleared');
                        }}
                      >
                        Clear all
                      </button>
                    </li>

                    {filteredEmails.map((email, i) => (
                      <li
                        key={email}
                        className={`suggestion-item ${i === highlightedIndex ? 'highlighted' : ''}`}
                        onMouseDown={() => handleSelectEmail(email)}
                        role="option"
                        aria-selected={i === highlightedIndex}
                      >
                        <div className="suggestion-avatar">
                          {email.charAt(0).toUpperCase()}
                        </div>
                        <div className="suggestion-info">
                          <span className="suggestion-email">{email}</span>
                          <span className="suggestion-sub">Tap to sign in</span>
                        </div>
                        <button
                          type="button"
                          className="suggestion-remove"
                          onMouseDown={(e) => handleRemoveEmail(e, email)}
                          aria-label={`Remove ${email}`}
                          title="Remove from suggestions"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            {/* ─── Password Field ─────────────────────────────────────── */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <span className="input-icon">🔒</span>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control input-has-icon input-has-right-icon
                    ${errors.password ? 'error' : ''}
                    ${justRegistered ? 'prefilled' : ''}`}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => { setForm({ ...form, password: e.target.value }); setJustRegistered(false); }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
                {justRegistered && <span className="prefill-check right-check">✓</span>}
              </div>
              {errors.password && <div className="form-error">{errors.password}</div>}
            </div>

            <div className="auth-forgot">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
              {loading
                ? <>
                    <span className="spinner spinner-sm" />
                    {slowWarning ? 'Server waking up... please wait' : 'Signing in...'}
                  </>
                : justRegistered ? '🚀 Sign In & Get Started' : 'Sign In'}
            </button>
            {slowWarning && (
              <div className="slow-warning">
                ⏳ Server is starting up — this takes up to 30 seconds on first use. Please wait...
              </div>
            )}
          </form>

          {/* Demo Accounts */}
          {!justRegistered && (
            <>
              <div className="auth-divider"><span>Demo Accounts</span></div>
              <div className="demo-accounts">
                <button className="demo-btn" onClick={() => {
                  setForm({ email: 'student@scholarship.com', password: 'Student@123' });
                  setJustRegistered(false);
                  setShowSuggestions(false);
                }}>
                  🎓 Student Demo
                </button>
                <button className="demo-btn" onClick={() => {
                  setForm({ email: 'admin@scholarship.com', password: 'Admin@123' });
                  setJustRegistered(false);
                  setShowSuggestions(false);
                }}>
                  🛡️ Admin Demo
                </button>
              </div>
            </>
          )}

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
