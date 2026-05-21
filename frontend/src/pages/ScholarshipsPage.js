import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import ScholarshipCard from '../components/scholarships/ScholarshipCard';
import { SkeletonGrid } from '../components/common/SkeletonCard';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ScholarshipsPage.css';

const CATEGORIES = ['merit', 'need-based', 'minority', 'sports', 'disability', 'research', 'government', 'private', 'other'];
const SORT_OPTIONS = [
  { value: 'deadline', label: 'Deadline (Soonest)' },
  { value: 'amount', label: 'Amount (Highest)' },
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Applied' },
];

const ScholarshipsPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [scholarships, setScholarships] = useState([]);
  const [recommendations, setRecommendations] = useState({});
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    state: '',
    course: '',
    provider: '',
    sortBy: 'deadline',
  });

  const fetchScholarships = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ ...filters, page, limit: 12 });
      Object.keys(filters).forEach((k) => { if (!filters[k]) params.delete(k); });
      const res = await api.get(`/scholarships?${params}`);
      setScholarships(res.data.scholarships);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {}
    finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { fetchScholarships(); }, [fetchScholarships]);

  // Load recommendations and saved scholarships for logged-in students
  useEffect(() => {
    if (user?.role === 'student') {
      api.get('/recommendations').then((res) => {
        const map = {};
        res.data.recommendations.forEach((r) => { map[r.scholarship._id] = r.eligible; });
        setRecommendations(map);
      }).catch(() => {});

      api.get('/users/saved').then((res) => {
        setSavedIds(new Set(res.data.savedScholarships.map((s) => s._id)));
      }).catch(() => {});
    }
  }, [user]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSave = (id, saved) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      saved ? next.add(id) : next.delete(id);
      return next;
    });
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', state: '', course: '', provider: '', sortBy: 'deadline' });
    setPage(1);
  };

  return (
    <div className="scholarships-page">
      <Navbar />

      <div className="scholarships-layout">
        {/* ─── Sidebar Filters ──────────────────────────────────────────── */}
        <aside className="filters-sidebar">
          <div className="filters-header">
            <h3>Filters</h3>
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear All</button>
          </div>

          {/* Search */}
          <div className="filter-group">
            <label className="filter-label">Search</label>
            <input type="text" className="form-control" placeholder="Scholarship name..."
              value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} />
          </div>

          {/* Category */}
          <div className="filter-group">
            <label className="filter-label">Category</label>
            <div className="filter-chips">
              {CATEGORIES.map((cat) => (
                <button key={cat} className={`filter-chip ${filters.category === cat ? 'active' : ''}`}
                  onClick={() => handleFilterChange('category', filters.category === cat ? '' : cat)}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* State */}
          <div className="filter-group">
            <label className="filter-label">State</label>
            <input type="text" className="form-control" placeholder="e.g. Tamil Nadu"
              value={filters.state} onChange={(e) => handleFilterChange('state', e.target.value)} />
          </div>

          {/* Course */}
          <div className="filter-group">
            <label className="filter-label">Course</label>
            <input type="text" className="form-control" placeholder="e.g. B.Tech"
              value={filters.course} onChange={(e) => handleFilterChange('course', e.target.value)} />
          </div>

          {/* Provider */}
          <div className="filter-group">
            <label className="filter-label">Provider</label>
            <input type="text" className="form-control" placeholder="e.g. AICTE"
              value={filters.provider} onChange={(e) => handleFilterChange('provider', e.target.value)} />
          </div>

          {/* Sort */}
          <div className="filter-group">
            <label className="filter-label">Sort By</label>
            <select className="form-control" value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}>
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </aside>

        {/* ─── Main Content ─────────────────────────────────────────────── */}
        <main className="scholarships-main">
          <div className="scholarships-header">
            <div>
              <h1 className="section-title">Scholarships</h1>
              <p className="section-subtitle">{total} scholarships found</p>
            </div>
          </div>

          {loading ? (
            <SkeletonGrid count={6} />
          ) : scholarships.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No scholarships found</h3>
              <p>Try adjusting your filters</p>
              <button className="btn btn-primary mt-2" onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="scholarships-grid">
                {scholarships.map((s) => (
                  <ScholarshipCard
                    key={s._id}
                    scholarship={s}
                    eligibility={recommendations[s._id]}
                    isSaved={savedIds.has(s._id)}
                    onSave={handleSave}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="pagination">
                  <button className="btn btn-outline btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>← Prev</button>
                  {[...Array(pages)].map((_, i) => (
                    <button key={i} className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setPage(i + 1)}>{i + 1}</button>
                  ))}
                  <button className="btn btn-outline btn-sm" disabled={page === pages} onClick={() => setPage(page + 1)}>Next →</button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ScholarshipsPage;
