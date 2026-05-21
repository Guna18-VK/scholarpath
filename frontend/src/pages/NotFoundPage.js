import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

const NotFoundPage = () => (
  <div>
    <Navbar />
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <div style={{ fontSize: 80, marginBottom: 24 }}>🎓</div>
      <h1 style={{ fontSize: 48, fontWeight: 800, color: 'var(--primary)', marginBottom: 16 }}>404</h1>
      <h2 style={{ fontSize: 24, marginBottom: 12 }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        <Link to="/" className="btn btn-primary btn-lg">Go Home</Link>
        <Link to="/scholarships" className="btn btn-outline btn-lg">Browse Scholarships</Link>
      </div>
    </div>
  </div>
);

export default NotFoundPage;
