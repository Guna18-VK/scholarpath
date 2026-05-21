import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import ScholarshipCard from '../components/scholarships/ScholarshipCard';
import Chatbot from '../components/chatbot/Chatbot';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';
import './StudentDashboard.css';

const STATUS_COLORS = {
  applied: 'badge-info',
  under_review: 'badge-warning',
  approved: 'badge-success',
  rejected: 'badge-danger',
  withdrawn: 'badge-gray',
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const [stats, setStats] = useState({ recommended: 0, applied: 0, saved: 0, upcoming: 0 });
  const [recommendations, setRecommendations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [savedScholarships, setSavedScholarships] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [recRes, appRes, savedRes, notifRes] = await Promise.all([
        api.get('/recommendations'),
        api.get('/applications'),
        api.get('/users/saved'),
        api.get('/notifications'),
      ]);

      const recs = recRes.data.recommendations;
      const apps = appRes.data.applications;
      const saved = savedRes.data.savedScholarships;
      const notifs = notifRes.data.notifications;

      setRecommendations(recs);
      setApplications(apps);
      setSavedScholarships(saved);
      setNotifications(notifs);

      const upcoming = saved.filter((s) => {
        const days = differenceInDays(new Date(s.deadline), new Date());
        return days >= 0 && days <= 30;
      }).length;

      setStats({
        recommended: recs.filter((r) => r.eligible).length,
        applied: apps.length,
        saved: saved.length,
        upcoming,
      });
    } catch {}
    finally { setLoading(false); }
  };

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Withdraw this application?')) return;
    try {
      await api.delete(`/applications/${appId}`);
      setApplications((prev) => prev.filter((a) => a._id !== appId));
      toast.success('Application withdrawn');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const markNotifRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const setTab = (tab) => setSearchParams(tab === 'overview' ? {} : { tab });

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'recommendations', label: '⭐ Recommendations' },
    { id: 'applications', label: '📝 Applications' },
    { id: 'saved', label: '🔖 Saved' },
    { id: 'notifications', label: '🔔 Notifications' },
  ];

  return (
    <div className="page-with-sidebar">
      <Sidebar />
      <main className="main-content">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-muted">Here's your scholarship overview</p>
          </div>
          <Link to="/scholarships" className="btn btn-primary">Browse Scholarships</Link>
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs">
          {tabs.map((t) => (
            <button key={t.id} className={`tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-overlay"><div className="spinner" /></div>
        ) : (
          <>
            {/* ─── Overview Tab ──────────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <div className="fade-in">
                {/* Stats */}
                <div className="stats-row">
                  {[
                    { icon: '⭐', label: 'Eligible Scholarships', value: stats.recommended, color: '#4f46e5' },
                    { icon: '📝', label: 'Applications', value: stats.applied, color: '#10b981' },
                    { icon: '🔖', label: 'Saved', value: stats.saved, color: '#f59e0b' },
                    { icon: '⏰', label: 'Upcoming Deadlines', value: stats.upcoming, color: '#ef4444' },
                  ].map((s, i) => (
                    <div key={i} className="stat-widget card">
                      <div className="stat-widget-icon" style={{ background: `${s.color}20`, color: s.color }}>{s.icon}</div>
                      <div className="stat-widget-value">{s.value}</div>
                      <div className="stat-widget-label">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Profile Completion */}
                {(!user?.course || !user?.academicPercentage || !user?.annualIncome) && (
                  <div className="profile-alert card">
                    <div className="profile-alert-icon">⚠️</div>
                    <div>
                      <div className="font-semibold">Complete your profile for better recommendations</div>
                      <div className="text-muted" style={{ fontSize: 13 }}>Add your course, academic percentage, and income details.</div>
                    </div>
                    <Link to="/profile" className="btn btn-primary btn-sm">Complete Profile</Link>
                  </div>
                )}

                {/* Top Recommendations */}
                <div className="dashboard-section">
                  <div className="section-header-row">
                    <h2>Top Recommendations</h2>
                    <button className="btn btn-ghost btn-sm" onClick={() => setTab('recommendations')}>View All →</button>
                  </div>
                  <div className="grid-3">
                    {recommendations.filter((r) => r.eligible).slice(0, 3).map((r) => (
                      <ScholarshipCard key={r.scholarship._id} scholarship={r.scholarship} eligibility={r.eligible} />
                    ))}
                    {recommendations.filter((r) => r.eligible).length === 0 && (
                      <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                        <div className="empty-state-icon">🎓</div>
                        <h3>No eligible scholarships yet</h3>
                        <p>Complete your profile to get personalized recommendations</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upcoming Deadlines */}
                <div className="dashboard-section">
                  <h2>Upcoming Deadlines</h2>
                  <div className="deadlines-list">
                    {savedScholarships
                      .filter((s) => differenceInDays(new Date(s.deadline), new Date()) >= 0)
                      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                      .slice(0, 5)
                      .map((s) => {
                        const days = differenceInDays(new Date(s.deadline), new Date());
                        return (
                          <div key={s._id} className="deadline-item card">
                            <div className="deadline-item-info">
                              <div className="font-semibold">{s.name}</div>
                              <div className="text-muted" style={{ fontSize: 13 }}>{s.provider}</div>
                            </div>
                            <div className={`deadline-badge ${days <= 7 ? 'urgent' : ''}`}>
                              {days === 0 ? 'Today!' : `${days}d left`}
                            </div>
                          </div>
                        );
                      })}
                    {savedScholarships.filter((s) => differenceInDays(new Date(s.deadline), new Date()) >= 0).length === 0 && (
                      <p className="text-muted">No upcoming deadlines. Save scholarships to track them.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ─── Recommendations Tab ───────────────────────────────────── */}
            {activeTab === 'recommendations' && (
              <div className="fade-in">
                <div className="section-header-row">
                  <h2>Personalized Recommendations</h2>
                  <span className="badge badge-primary">{recommendations.filter((r) => r.eligible).length} eligible</span>
                </div>
                <div className="grid-3">
                  {recommendations.map((r) => (
                    <ScholarshipCard key={r.scholarship._id} scholarship={r.scholarship} eligibility={r.eligible} />
                  ))}
                </div>
              </div>
            )}

            {/* ─── Applications Tab ──────────────────────────────────────── */}
            {activeTab === 'applications' && (
              <div className="fade-in">
                <h2 className="mb-3">My Applications</h2>
                {applications.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">📝</div>
                    <h3>No applications yet</h3>
                    <p>Browse scholarships and apply to get started</p>
                    <Link to="/scholarships" className="btn btn-primary mt-2">Browse Scholarships</Link>
                  </div>
                ) : (
                  <div className="applications-list">
                    {applications.map((app) => (
                      <div key={app._id} className="application-item card">
                        <div className="app-info">
                          <h3>{app.scholarship?.name}</h3>
                          <p className="text-muted">{app.scholarship?.provider}</p>
                          <p className="text-muted" style={{ fontSize: 13 }}>
                            Applied: {format(new Date(app.appliedAt), 'dd MMM yyyy')}
                          </p>
                          {app.adminRemarks && (
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                              Remarks: {app.adminRemarks}
                            </p>
                          )}
                        </div>
                        <div className="app-actions">
                          <span className={`badge ${STATUS_COLORS[app.status]}`}>
                            {app.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <div className="font-semibold" style={{ color: 'var(--primary)' }}>
                            ₹{app.scholarship?.amount?.toLocaleString()}
                          </div>
                          {app.status === 'applied' && (
                            <button className="btn btn-danger btn-sm" onClick={() => handleWithdraw(app._id)}>
                              Withdraw
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── Saved Tab ─────────────────────────────────────────────── */}
            {activeTab === 'saved' && (
              <div className="fade-in">
                <h2 className="mb-3">Saved Scholarships</h2>
                {savedScholarships.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">🔖</div>
                    <h3>No saved scholarships</h3>
                    <p>Save scholarships to track them and get deadline reminders</p>
                  </div>
                ) : (
                  <div className="grid-3">
                    {savedScholarships.map((s) => (
                      <ScholarshipCard key={s._id} scholarship={s} isSaved={true} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── Notifications Tab ─────────────────────────────────────── */}
            {activeTab === 'notifications' && (
              <div className="fade-in">
                <div className="section-header-row mb-3">
                  <h2>Notifications</h2>
                  <button className="btn btn-ghost btn-sm" onClick={async () => {
                    await api.put('/notifications/read-all');
                    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
                  }}>Mark all read</button>
                </div>
                {notifications.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">🔔</div>
                    <h3>No notifications</h3>
                  </div>
                ) : (
                  <div className="notifications-list">
                    {notifications.map((n) => (
                      <div key={n._id} className={`notification-item card ${!n.isRead ? 'unread' : ''}`}
                        onClick={() => markNotifRead(n._id)}>
                        <div className="notif-type-icon">
                          {n.type === 'deadline_reminder' ? '⏰' : n.type === 'new_scholarship' ? '🎓' : n.type === 'application_update' ? '📝' : '🔔'}
                        </div>
                        <div className="notif-content">
                          <div className="font-semibold">{n.title}</div>
                          <div className="text-muted" style={{ fontSize: 13 }}>{n.message}</div>
                          <div className="text-muted" style={{ fontSize: 12 }}>{format(new Date(n.createdAt), 'dd MMM yyyy, hh:mm a')}</div>
                        </div>
                        {!n.isRead && <div className="unread-dot" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* AI Chatbot */}
      <Chatbot />
    </div>
  );
};

export default StudentDashboard;
