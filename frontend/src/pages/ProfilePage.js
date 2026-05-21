import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import StateInput from '../components/common/StateInput';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './ProfilePage.css';

const COMMUNITIES = ['General','OBC','SC','ST','EWS','Muslim','Christian','Sikh','Buddhist','Parsi','Jain'];

// ─── Helper: display label for a value ────────────────────────────────────────
const display = (val) => (val !== undefined && val !== null && val !== '') ? val : '—';

// ─── Single field row in view mode ────────────────────────────────────────────
const InfoRow = ({ label, value, icon }) => (
  <div className="info-row">
    <span className="info-row-icon">{icon}</span>
    <div className="info-row-content">
      <span className="info-row-label">{label}</span>
      <span className="info-row-value">{display(value)}</span>
    </div>
  </div>
);

const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  // ─── Local profile state — loaded fresh from DB ──────────────────────────
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // ─── Edit mode per section ────────────────────────────────────────────────
  const [editSection, setEditSection] = useState(null); // null | 'personal' | 'academic' | 'preferences'

  // ─── Form state (only active while editing) ───────────────────────────────
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  // ─── Password section ─────────────────────────────────────────────────────
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [editPassword, setEditPassword] = useState(false);

  const [activeSection, setActiveSection] = useState('personal');

  // ─── Load fresh profile from DB on mount ─────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/profile');
        setProfile(res.data.user);
        updateUser(res.data.user); // keep AuthContext in sync
      } catch {
        // fallback to AuthContext user
        setProfile(user);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  // ─── Start editing a section ──────────────────────────────────────────────
  const startEdit = (section) => {
    setForm({
      name: profile?.name || '',
      phone: profile?.phone || '',
      age: profile?.age || '',
      gender: profile?.gender || '',
      course: profile?.course || '',
      college: profile?.college || '',
      state: profile?.state || '',
      community: profile?.community || '',
      annualIncome: profile?.annualIncome || '',
      academicPercentage: profile?.academicPercentage || '',
      cgpa: profile?.cgpa || '',
      preferredLanguage: profile?.preferredLanguage || 'en',
      notificationsEnabled: profile?.notificationsEnabled !== false,
    });
    setEditSection(section);
  };

  // ─── Cancel editing ───────────────────────────────────────────────────────
  const cancelEdit = () => {
    setEditSection(null);
    setForm({});
  };

  // ─── Save profile ─────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/users/profile', form);
      setProfile(res.data.user);       // update local display
      updateUser(res.data.user);        // update AuthContext (navbar avatar etc.)
      setEditSection(null);
      setForm({});
      toast.success('Profile saved successfully! ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  // ─── Change password ──────────────────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setChangingPassword(true);
    try {
      await api.put('/users/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully! 🔒');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setEditPassword(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error changing password');
    } finally {
      setChangingPassword(false);
    }
  };

  // ─── Profile completion ───────────────────────────────────────────────────
  const completionFields = ['name', 'phone', 'age', 'gender', 'course', 'college', 'state', 'community', 'annualIncome', 'academicPercentage'];
  const filled = completionFields.filter((f) => profile?.[f]).length;
  const completion = Math.round((filled / completionFields.length) * 100);

  const completionColor = completion === 100 ? '#10b981' : completion >= 60 ? '#f59e0b' : '#ef4444';

  if (loadingProfile) {
    return (
      <div className="page-with-sidebar">
        <Sidebar />
        <main className="main-content">
          <div className="loading-overlay" style={{ minHeight: '60vh' }}>
            <div className="spinner" />
          </div>
        </main>
      </div>
    );
  }

  const navSections = [
    { id: 'personal', label: '👤 Personal Info' },
    { id: 'academic', label: '📚 Academic Info' },
    { id: 'preferences', label: '⚙️ Preferences' },
    { id: 'security', label: '🔒 Security' },
  ];

  return (
    <div className="page-with-sidebar">
      <Sidebar />
      <main className="main-content">

        {/* ─── Page Header ──────────────────────────────────────────────── */}
        <div className="profile-page-header">
          <div>
            <h1>My Profile</h1>
            <p className="text-muted">Your information is saved permanently and used for scholarship matching</p>
          </div>
        </div>

        <div className="profile-layout">

          {/* ─── Left Sidebar ─────────────────────────────────────────────── */}
          <div className="profile-sidebar-card">

            {/* Avatar */}
            <div className="profile-avatar-section">
              <div className="profile-avatar-large">
                {profile?.avatar
                  ? <img src={profile.avatar} alt={profile.name} />
                  : <span>{profile?.name?.charAt(0)?.toUpperCase() || '?'}</span>}
              </div>
              <h2>{profile?.name}</h2>
              <p className="text-muted" style={{ fontSize: 13 }}>{profile?.email}</p>
              <span className={`badge ${profile?.role === 'admin' ? 'badge-danger' : 'badge-primary'}`}>
                {profile?.role === 'admin' ? '🛡️ Admin' : '🎓 Student'}
              </span>
            </div>

            {/* Completion Bar */}
            <div className="completion-section">
              <div className="completion-header">
                <span className="font-semibold" style={{ fontSize: 13 }}>Profile Completion</span>
                <span className="completion-pct" style={{ color: completionColor }}>{completion}%</span>
              </div>
              <div className="completion-bar">
                <div className="completion-fill" style={{ width: `${completion}%`, background: completionColor }} />
              </div>
              {completion === 100
                ? <p className="completion-hint" style={{ color: '#10b981' }}>✅ Profile complete! You get the best recommendations.</p>
                : <p className="completion-hint">Fill all fields to get better scholarship matches</p>}
            </div>

            {/* Section Nav */}
            <nav className="profile-nav">
              {navSections.map((s) => (
                <button
                  key={s.id}
                  className={`profile-nav-btn ${activeSection === s.id ? 'active' : ''}`}
                  onClick={() => { setActiveSection(s.id); cancelEdit(); }}
                >
                  {s.label}
                </button>
              ))}
            </nav>
          </div>

          {/* ─── Right Content ─────────────────────────────────────────────── */}
          <div className="profile-form-area">

            {/* ══════════════ PERSONAL INFO ══════════════ */}
            {activeSection === 'personal' && (
              <div className="card card-body fade-in">
                <div className="section-edit-header">
                  <h3 className="form-section-title">Personal Information</h3>
                  {editSection !== 'personal'
                    ? <button className="btn btn-outline btn-sm" onClick={() => startEdit('personal')}>✏️ Edit</button>
                    : <button className="btn btn-ghost btn-sm" onClick={cancelEdit}>✕ Cancel</button>}
                </div>

                {editSection !== 'personal' ? (
                  /* ── VIEW MODE ── */
                  <div className="info-rows fade-in">
                    <InfoRow icon="👤" label="Full Name" value={profile?.name} />
                    <InfoRow icon="📞" label="Phone Number" value={profile?.phone} />
                    <InfoRow icon="🎂" label="Age" value={profile?.age} />
                    <InfoRow icon="⚧" label="Gender" value={profile?.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : null} />
                    <InfoRow icon="📍" label="State" value={profile?.state} />
                    <InfoRow icon="🏘️" label="Community / Caste" value={profile?.community} />
                    <InfoRow icon="💰" label="Annual Family Income" value={profile?.annualIncome ? `₹${Number(profile.annualIncome).toLocaleString()}` : null} />
                    <InfoRow icon="📊" label="Income Category" value={profile?.incomeCategory?.replace(/_/g, ' ')} />
                  </div>
                ) : (
                  /* ── EDIT MODE ── */
                  <form onSubmit={handleSave} className="fade-in">
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input className="form-control" required value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input className="form-control" type="tel" value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="+91 XXXXX XXXXX" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Age</label>
                        <input className="form-control" type="number" min="10" max="60" value={form.age}
                          onChange={(e) => setForm({ ...form, age: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Gender</label>
                        <select className="form-control" value={form.gender}
                          onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">State</label>
                        <StateInput value={form.state}
                          onChange={(val) => setForm({ ...form, state: val })}
                          placeholder="e.g. Tamil Nadu" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Community / Caste</label>
                        <select className="form-control" value={form.community}
                          onChange={(e) => setForm({ ...form, community: e.target.value })}>
                          <option value="">Select community</option>
                          {COMMUNITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Annual Family Income (₹)</label>
                        <input className="form-control" type="number" min="0" value={form.annualIncome}
                          onChange={(e) => setForm({ ...form, annualIncome: e.target.value })}
                          placeholder="e.g. 250000" />
                      </div>
                    </div>
                    <div className="edit-form-actions">
                      <button type="button" className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>
                      <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? <><span className="spinner spinner-sm" /> Saving...</> : '💾 Save Changes'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ══════════════ ACADEMIC INFO ══════════════ */}
            {activeSection === 'academic' && (
              <div className="card card-body fade-in">
                <div className="section-edit-header">
                  <h3 className="form-section-title">Academic Information</h3>
                  {editSection !== 'academic'
                    ? <button className="btn btn-outline btn-sm" onClick={() => startEdit('academic')}>✏️ Edit</button>
                    : <button className="btn btn-ghost btn-sm" onClick={cancelEdit}>✕ Cancel</button>}
                </div>

                {editSection !== 'academic' ? (
                  <div className="info-rows fade-in">
                    <InfoRow icon="📖" label="Course / Degree" value={profile?.course} />
                    <InfoRow icon="🏫" label="College / University" value={profile?.college} />
                    <InfoRow icon="📊" label="Academic Percentage" value={profile?.academicPercentage ? `${profile.academicPercentage}%` : null} />
                    <InfoRow icon="🎯" label="CGPA" value={profile?.cgpa ? `${profile.cgpa} / 10` : null} />
                  </div>
                ) : (
                  <form onSubmit={handleSave} className="fade-in">
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label className="form-label">Course / Degree</label>
                        <input className="form-control" value={form.course}
                          onChange={(e) => setForm({ ...form, course: e.target.value })}
                          placeholder="e.g. B.Tech, BSc, MBA" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">College / University</label>
                        <input className="form-control" value={form.college}
                          onChange={(e) => setForm({ ...form, college: e.target.value })}
                          placeholder="e.g. Anna University" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Academic Percentage (%)</label>
                        <input className="form-control" type="number" min="0" max="100" step="0.01"
                          value={form.academicPercentage}
                          onChange={(e) => setForm({ ...form, academicPercentage: e.target.value })}
                          placeholder="e.g. 85.5" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CGPA (out of 10)</label>
                        <input className="form-control" type="number" min="0" max="10" step="0.01"
                          value={form.cgpa}
                          onChange={(e) => setForm({ ...form, cgpa: e.target.value })}
                          placeholder="e.g. 8.5" />
                      </div>
                    </div>
                    <div className="edit-form-actions">
                      <button type="button" className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>
                      <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? <><span className="spinner spinner-sm" /> Saving...</> : '💾 Save Changes'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ══════════════ PREFERENCES ══════════════ */}
            {activeSection === 'preferences' && (
              <div className="card card-body fade-in">
                <div className="section-edit-header">
                  <h3 className="form-section-title">Preferences</h3>
                  {editSection !== 'preferences'
                    ? <button className="btn btn-outline btn-sm" onClick={() => startEdit('preferences')}>✏️ Edit</button>
                    : <button className="btn btn-ghost btn-sm" onClick={cancelEdit}>✕ Cancel</button>}
                </div>

                {editSection !== 'preferences' ? (
                  <div className="info-rows fade-in">
                    <InfoRow icon="🌐" label="Preferred Language"
                      value={{ en: 'English', hi: 'Hindi (हिंदी)', ta: 'Tamil (தமிழ்)' }[profile?.preferredLanguage] || 'English'} />
                    <InfoRow icon="🔔" label="Email Notifications"
                      value={profile?.notificationsEnabled !== false ? '✅ Enabled' : '❌ Disabled'} />
                  </div>
                ) : (
                  <form onSubmit={handleSave} className="fade-in">
                    <div className="form-group">
                      <label className="form-label">Preferred Language</label>
                      <select className="form-control" value={form.preferredLanguage}
                        onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value })}>
                        <option value="en">English</option>
                        <option value="hi">Hindi (हिंदी)</option>
                        <option value="ta">Tamil (தமிழ்)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="pref-toggle-label">
                        <div className="pref-toggle-info">
                          <span className="font-semibold">Email Notifications</span>
                          <span className="text-muted" style={{ fontSize: 13 }}>
                            Receive deadline reminders and new scholarship alerts
                          </span>
                        </div>
                        <div className={`toggle-switch ${form.notificationsEnabled ? 'on' : ''}`}
                          onClick={() => setForm({ ...form, notificationsEnabled: !form.notificationsEnabled })}
                          role="switch" aria-checked={form.notificationsEnabled} tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && setForm({ ...form, notificationsEnabled: !form.notificationsEnabled })}>
                          <div className="toggle-thumb" />
                        </div>
                      </label>
                    </div>
                    <div className="edit-form-actions">
                      <button type="button" className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>
                      <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? <><span className="spinner spinner-sm" /> Saving...</> : '💾 Save Preferences'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ══════════════ SECURITY ══════════════ */}
            {activeSection === 'security' && (
              <div className="card card-body fade-in">
                <div className="section-edit-header">
                  <h3 className="form-section-title">Security</h3>
                  {!editPassword
                    ? <button className="btn btn-outline btn-sm" onClick={() => setEditPassword(true)}>✏️ Change Password</button>
                    : <button className="btn btn-ghost btn-sm" onClick={() => { setEditPassword(false); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}>✕ Cancel</button>}
                </div>

                {!editPassword ? (
                  <div className="info-rows fade-in">
                    <InfoRow icon="📧" label="Email" value={profile?.email} />
                    <InfoRow icon="🔒" label="Password" value="••••••••••" />
                    <InfoRow icon="✅" label="Email Verified" value={profile?.isVerified ? 'Yes' : 'No'} />
                    <InfoRow icon="📅" label="Account Created" value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : null} />
                  </div>
                ) : (
                  <form onSubmit={handleChangePassword} className="fade-in">
                    <div className="form-group">
                      <label className="form-label">Current Password</label>
                      <input type="password" className="form-control" required
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        placeholder="Enter current password" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">New Password</label>
                      <input type="password" className="form-control" required
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="Min. 6 characters" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Confirm New Password</label>
                      <input type="password" className="form-control" required
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        placeholder="Repeat new password" />
                    </div>
                    <div className="edit-form-actions">
                      <button type="button" className="btn btn-ghost" onClick={() => { setEditPassword(false); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}>Cancel</button>
                      <button type="submit" className="btn btn-primary" disabled={changingPassword}>
                        {changingPassword ? <><span className="spinner spinner-sm" /> Changing...</> : '🔒 Update Password'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
