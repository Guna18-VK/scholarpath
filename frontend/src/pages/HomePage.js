import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/layout/Navbar';
import ScholarshipCard from '../components/scholarships/ScholarshipCard';
import api from '../services/api';
import './HomePage.css';

const stats = [
  { icon: '🎓', value: '500+', label: 'Scholarships Listed' },
  { icon: '👥', value: '10,000+', label: 'Students Helped' },
  { icon: '💰', value: '₹50Cr+', label: 'Scholarships Awarded' },
  { icon: '🏛️', value: '200+', label: 'Providers' },
];

const features = [
  { icon: '🎯', title: 'Smart Recommendations', desc: 'AI-powered matching based on your profile, academics, and eligibility.' },
  { icon: '🔔', title: 'Deadline Reminders', desc: 'Never miss a deadline with email and dashboard alerts.' },
  { icon: '📊', title: 'Eligibility Check', desc: 'Instantly know if you qualify before applying.' },
  { icon: '📄', title: 'PDF Downloads', desc: 'Download scholarship details for offline reference.' },
  { icon: '🌐', title: 'Multi-language', desc: 'Available in English, Hindi, and Tamil.' },
  { icon: '♿', title: 'Voice Assistant', desc: 'Accessible voice support for visually challenged students.' },
];

const HomePage = () => {
  const { t } = useTranslation();
  const [featuredScholarships, setFeaturedScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    api.get('/scholarships/featured')
      .then((res) => setFeaturedScholarships(res.data.scholarships))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    window.location.href = `/scholarships?search=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <div className="home-page">
      <Navbar />

      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
          <div className="shape shape-3" />
        </div>
        <div className="container hero-content">
          <div className="hero-badge">🚀 Discover Your Future</div>
          <h1 className="hero-title">{t('findScholarships')}</h1>
          <p className="hero-subtitle">{t('heroSubtitle')}</p>

          {/* Search Bar */}
          <form className="hero-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search scholarships by name, provider, course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="hero-search-input"
              aria-label="Search scholarships"
            />
            <button type="submit" className="btn btn-primary hero-search-btn">
              🔍 Search
            </button>
          </form>

          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">{t('getStarted')}</Link>
            <Link to="/scholarships" className="btn btn-outline btn-lg">{t('browseScholarships')}</Link>
          </div>
        </div>
      </section>

      {/* ─── Stats ────────────────────────────────────────────────────────── */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <div key={i} className="stat-card card fade-in">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Scholarships ────────────────────────────────────────── */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Featured Scholarships</h2>
              <p className="section-subtitle">Top opportunities available right now</p>
            </div>
            <Link to="/scholarships" className="btn btn-outline">View All →</Link>
          </div>

          {loading ? (
            <div className="grid-3">
              {[1,2,3].map((i) => (
                <div key={i} className="card" style={{ height: 280 }}>
                  <div className="skeleton" style={{ height: '100%', borderRadius: 12 }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid-3">
              {featuredScholarships.map((s) => (
                <ScholarshipCard key={s._id} scholarship={s} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────────────────── */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title text-center">Why Choose ScholarPath?</h2>
          <p className="section-subtitle text-center">Everything you need to find and apply for scholarships</p>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card card fade-in">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>Ready to Find Your Scholarship?</h2>
            <p>Join thousands of students who have already found their perfect scholarship match.</p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
              <Link to="/scholarships" className="btn btn-outline btn-lg" style={{ color: 'white', borderColor: 'white' }}>Browse Scholarships</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────────── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-logo">🎓 ScholarPath</div>
              <p className="footer-desc">Helping students discover and apply for scholarships easily.</p>
            </div>
            <div>
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/scholarships">Scholarships</Link></li>
                <li><Link to="/register">Register</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4>Categories</h4>
              <ul>
                <li><Link to="/scholarships?category=merit">Merit Based</Link></li>
                <li><Link to="/scholarships?category=need-based">Need Based</Link></li>
                <li><Link to="/scholarships?category=government">Government</Link></li>
                <li><Link to="/scholarships?category=minority">Minority</Link></li>
              </ul>
            </div>
            <div>
              <h4>Contact</h4>
              <p>📧 support@scholarpath.com</p>
              <p>📞 1800-XXX-XXXX</p>
              <p>🕐 Mon–Fri, 9AM–6PM</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 ScholarPath. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
