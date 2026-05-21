import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import './AdminDashboard.css';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const EMPTY_SCHOLARSHIP = {
  name: '', provider: '', description: '', amount: '', category: 'merit',
  eligibilityCriteria: '', minPercentage: 0, minCGPA: 0, maxAnnualIncome: '',
  eligibleCommunities: '', eligibleGenders: '', eligibleCourses: '', eligibleStates: '',
  deadline: '', applicationLink: '', requiredDocuments: '', isFeatured: false, isActive: true,
};

const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const [stats, setStats] = useState(null);
  const [scholarships, setScholarships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_SCHOLARSHIP);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchData(); }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await api.get('/admin/stats');
        setStats(res.data.stats);
      } else if (activeTab === 'scholarships') {
        const res = await api.get('/scholarships?limit=100');
        setScholarships(res.data.scholarships);
      } else if (activeTab === 'applications') {
        const res = await api.get('/applications');
        setApplications(res.data.applications);
      } else if (activeTab === 'users') {
        const res = await api.get('/admin/users');
        setUsers(res.data.users);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const handleSaveScholarship = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        minPercentage: Number(form.minPercentage),
        minCGPA: Number(form.minCGPA),
        maxAnnualIncome: form.maxAnnualIncome ? Number(form.maxAnnualIncome) : undefined,
        eligibleCommunities: form.eligibleCommunities ? form.eligibleCommunities.split(',').map((s) => s.trim()) : [],
        eligibleGenders: form.eligibleGenders ? form.eligibleGenders.split(',').map((s) => s.trim()) : [],
        eligibleCourses: form.eligibleCourses ? form.eligibleCourses.split(',').map((s) => s.trim()) : [],
        eligibleStates: form.eligibleStates ? form.eligibleStates.split(',').map((s) => s.trim()) : [],
        requiredDocuments: form.requiredDocuments ? form.requiredDocuments.split(',').map((s) => s.trim()) : [],
      };

      if (editingId) {
        await api.put(`/scholarships/${editingId}`, payload);
        toast.success('Scholarship updated!');
      } else {
        await api.post('/scholarships', payload);
        toast.success('Scholarship created!');
      }
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_SCHOLARSHIP);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving scholarship');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (s) => {
    setForm({
      ...s,
      eligibleCommunities: s.eligibleCommunities?.join(', ') || '',
      eligibleGenders: s.eligibleGenders?.join(', ') || '',
      eligibleCourses: s.eligibleCourses?.join(', ') || '',
      eligibleStates: s.eligibleStates?.join(', ') || '',
      requiredDocuments: s.requiredDocuments?.join(', ') || '',
      deadline: s.deadline ? s.deadline.split('T')[0] : '',
      maxAnnualIncome: s.maxAnnualIncome === Infinity ? '' : s.maxAnnualIncome || '',
    });
    setEditingId(s._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this scholarship?')) return;
    try {
      await api.delete(`/scholarships/${id}`);
      toast.success('Deleted');
      fetchData();
    } catch { toast.error('Error deleting'); }
  };

  const handleStatusUpdate = async (appId, status) => {
    try {
      await api.put(`/applications/${appId}/status`, { status });
      toast.success('Status updated');
      fetchData();
    } catch { toast.error('Error updating status'); }
  };

  const setTab = (tab) => setSearchParams(tab === 'overview' ? {} : { tab });

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'scholarships', label: '🎓 Scholarships' },
    { id: 'applications', label: '📝 Applications' },
    { id: 'users', label: '👥 Students' },
  ];

  return (
    <div className="page-with-sidebar">
      <Sidebar />
      <main className="main-content">
        <div className="dashboard-header">
          <div>
            <h1>Admin Dashboard 🛡️</h1>
            <p className="text-muted">Manage scholarships, applications, and students</p>
          </div>
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
            {/* ─── Overview ─────────────────────────────────────────────── */}
            {activeTab === 'overview' && stats && (
              <div className="fade-in">
                <div className="admin-stats-grid">
                  {[
                    { icon: '👥', label: 'Total Students', value: stats.totalStudents, color: '#4f46e5' },
                    { icon: '🎓', label: 'Total Scholarships', value: stats.totalScholarships, color: '#10b981' },
                    { icon: '📝', label: 'Total Applications', value: stats.totalApplications, color: '#f59e0b' },
                    { icon: '✅', label: 'Active Scholarships', value: stats.activeScholarships, color: '#ef4444' },
                  ].map((s, i) => (
                    <div key={i} className="admin-stat-card card">
                      <div className="admin-stat-icon" style={{ background: `${s.color}20`, color: s.color }}>{s.icon}</div>
                      <div>
                        <div className="admin-stat-value">{s.value}</div>
                        <div className="admin-stat-label">{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="charts-grid">
                  {/* Applications by Status */}
                  <div className="card card-body">
                    <h3 className="chart-title">Applications by Status</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={stats.applicationsByStatus.map((s) => ({ name: s._id, value: s.count }))}
                          cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                          {stats.applicationsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Scholarships by Category */}
                  <div className="card card-body">
                    <h3 className="chart-title">Scholarships by Category</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={stats.scholarshipsByCategory.map((s) => ({ name: s._id, count: s.count }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Monthly Registrations */}
                  <div className="card card-body" style={{ gridColumn: '1/-1' }}>
                    <h3 className="chart-title">Monthly Student Registrations</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={stats.monthlyRegistrations.map((r) => ({
                        name: `${r._id.year}-${String(r._id.month).padStart(2, '0')}`,
                        students: r.count,
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="students" fill="var(--secondary)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Scholarships ─────────────────────────────────────────── */}
            {activeTab === 'scholarships' && (
              <div className="fade-in">
                <div className="section-header-row mb-3">
                  <h2>Manage Scholarships ({scholarships.length})</h2>
                  <button className="btn btn-primary" onClick={() => { setForm(EMPTY_SCHOLARSHIP); setEditingId(null); setShowForm(true); }}>
                    + Add Scholarship
                  </button>
                </div>

                {/* Scholarship Form Modal */}
                {showForm && (
                  <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
                    <div className="modal-content">
                      <div className="modal-header">
                        <h3>{editingId ? 'Edit Scholarship' : 'Add New Scholarship'}</h3>
                        <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}>✕</button>
                      </div>
                      <form onSubmit={handleSaveScholarship} className="scholarship-form">
                        <div className="form-grid-2">
                          <div className="form-group">
                            <label className="form-label">Scholarship Name *</label>
                            <input className="form-control" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Provider *</label>
                            <input className="form-control" required value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Amount (₹) *</label>
                            <input type="number" className="form-control" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Category *</label>
                            <select className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                              {['merit','need-based','minority','sports','disability','research','government','private','other'].map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Deadline *</label>
                            <input type="date" className="form-control" required value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Min. Percentage</label>
                            <input type="number" className="form-control" min="0" max="100" value={form.minPercentage} onChange={(e) => setForm({ ...form, minPercentage: e.target.value })} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Max. Annual Income (₹)</label>
                            <input type="number" className="form-control" value={form.maxAnnualIncome} onChange={(e) => setForm({ ...form, maxAnnualIncome: e.target.value })} placeholder="Leave blank for no limit" />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Application Link</label>
                            <input type="url" className="form-control" value={form.applicationLink} onChange={(e) => setForm({ ...form, applicationLink: e.target.value })} />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Description</label>
                          <textarea className="form-control" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Eligibility Criteria</label>
                          <textarea className="form-control" rows={2} value={form.eligibilityCriteria} onChange={(e) => setForm({ ...form, eligibilityCriteria: e.target.value })} />
                        </div>
                        <div className="form-grid-2">
                          <div className="form-group">
                            <label className="form-label">Eligible Communities (comma-separated)</label>
                            <input className="form-control" placeholder="SC, ST, OBC" value={form.eligibleCommunities} onChange={(e) => setForm({ ...form, eligibleCommunities: e.target.value })} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Eligible Genders (comma-separated)</label>
                            <input className="form-control" placeholder="female, male" value={form.eligibleGenders} onChange={(e) => setForm({ ...form, eligibleGenders: e.target.value })} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Eligible Courses (comma-separated)</label>
                            <input className="form-control" placeholder="B.Tech, BSc" value={form.eligibleCourses} onChange={(e) => setForm({ ...form, eligibleCourses: e.target.value })} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Eligible States (comma-separated)</label>
                            <input className="form-control" placeholder="Tamil Nadu, Kerala" value={form.eligibleStates} onChange={(e) => setForm({ ...form, eligibleStates: e.target.value })} />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Required Documents (comma-separated)</label>
                          <input className="form-control" placeholder="Income Certificate, Marksheet" value={form.requiredDocuments} onChange={(e) => setForm({ ...form, requiredDocuments: e.target.value })} />
                        </div>
                        <div className="form-checkboxes">
                          <label className="checkbox-label">
                            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
                            Featured Scholarship
                          </label>
                          <label className="checkbox-label">
                            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                            Active
                          </label>
                        </div>
                        <div className="modal-footer">
                          <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                          <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? <><span className="spinner spinner-sm" /> Saving...</> : editingId ? 'Update' : 'Create'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                <div className="admin-table-wrapper card">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th><th>Provider</th><th>Amount</th><th>Category</th><th>Deadline</th><th>Status</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scholarships.map((s) => (
                        <tr key={s._id}>
                          <td><div className="font-semibold">{s.name}</div></td>
                          <td>{s.provider}</td>
                          <td>₹{s.amount.toLocaleString()}</td>
                          <td><span className="badge badge-primary">{s.category}</span></td>
                          <td>{format(new Date(s.deadline), 'dd MMM yyyy')}</td>
                          <td><span className={`badge ${s.isActive ? 'badge-success' : 'badge-gray'}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
                          <td>
                            <div className="table-actions">
                              <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(s)}>✏️ Edit</button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s._id)}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ─── Applications ─────────────────────────────────────────── */}
            {activeTab === 'applications' && (
              <div className="fade-in">
                <h2 className="mb-3">All Applications ({applications.length})</h2>
                <div className="admin-table-wrapper card">
                  <table className="admin-table">
                    <thead>
                      <tr><th>Student</th><th>Scholarship</th><th>Amount</th><th>Applied</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app._id}>
                          <td>
                            <div className="font-semibold">{app.student?.name}</div>
                            <div className="text-muted" style={{ fontSize: 12 }}>{app.student?.email}</div>
                          </td>
                          <td>{app.scholarship?.name}</td>
                          <td>₹{app.scholarship?.amount?.toLocaleString()}</td>
                          <td>{format(new Date(app.appliedAt), 'dd MMM yyyy')}</td>
                          <td>
                            <select className="form-control" style={{ padding: '4px 8px', fontSize: 13 }}
                              value={app.status} onChange={(e) => handleStatusUpdate(app._id, e.target.value)}>
                              {['applied','under_review','approved','rejected'].map((s) => (
                                <option key={s} value={s}>{s.replace('_', ' ')}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <span className={`badge ${app.status === 'approved' ? 'badge-success' : app.status === 'rejected' ? 'badge-danger' : 'badge-info'}`}>
                              {app.status.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ─── Users ────────────────────────────────────────────────── */}
            {activeTab === 'users' && (
              <div className="fade-in">
                <h2 className="mb-3">Registered Students ({users.length})</h2>
                <div className="admin-table-wrapper card">
                  <table className="admin-table">
                    <thead>
                      <tr><th>Name</th><th>Email</th><th>Course</th><th>State</th><th>Verified</th><th>Joined</th></tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id}>
                          <td className="font-semibold">{u.name}</td>
                          <td>{u.email}</td>
                          <td>{u.course || '—'}</td>
                          <td>{u.state || '—'}</td>
                          <td><span className={`badge ${u.isVerified ? 'badge-success' : 'badge-warning'}`}>{u.isVerified ? 'Yes' : 'No'}</span></td>
                          <td>{format(new Date(u.createdAt), 'dd MMM yyyy')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
