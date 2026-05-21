import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications.slice(0, 5));
      setUnreadCount(res.data.unreadCount);
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🎓</span>
          <span className="logo-text">ScholarPath</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>{t('home')}</Link>
          <Link to="/scholarships" className={`nav-link ${isActive('/scholarships') ? 'active' : ''}`}>{t('scholarships')}</Link>
          {user && <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>{t('dashboard')}</Link>}
          {user?.role === 'admin' && <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>Admin</Link>}
          <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>Contact</Link>
        </div>

        {/* Right Actions */}
        <div className="navbar-actions">
          {/* Language Selector */}
          <select
            className="lang-select"
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            aria-label="Select language"
          >
            <option value="en">EN</option>
            <option value="hi">हि</option>
            <option value="ta">த</option>
          </select>

          {/* Theme Toggle */}
          <button className="btn btn-icon btn-ghost" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {user ? (
            <>
              {/* Notifications */}
              <div className="notif-wrapper" ref={notifRef}>
                <button
                  className="btn btn-icon btn-ghost notif-btn"
                  onClick={() => setShowNotifications(!showNotifications)}
                  aria-label="Notifications"
                >
                  🔔
                  {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                </button>

                {showNotifications && (
                  <div className="notif-dropdown">
                    <div className="notif-header">
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <button className="btn btn-ghost btn-sm" onClick={markAllRead}>Mark all read</button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="notif-empty">No notifications</div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n._id} className={`notif-item ${!n.isRead ? 'unread' : ''}`}>
                          <div className="notif-title">{n.title}</div>
                          <div className="notif-msg">{n.message}</div>
                        </div>
                      ))
                    )}
                    <Link to="/dashboard" className="notif-footer" onClick={() => setShowNotifications(false)}>
                      View all notifications →
                    </Link>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="user-menu-wrapper" ref={userRef}>
                <button className="user-avatar-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
                  <div className="user-avatar">
                    {user.avatar ? <img src={user.avatar} alt={user.name} /> : user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="user-name">{user.name?.split(' ')[0]}</span>
                  <span>▾</span>
                </button>

                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-header">
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-muted" style={{ fontSize: 12 }}>{user.email}</div>
                    </div>
                    <Link to="/profile" className="dropdown-item" onClick={() => setShowUserMenu(false)}>👤 Profile</Link>
                    <Link to="/dashboard" className="dropdown-item" onClick={() => setShowUserMenu(false)}>📊 Dashboard</Link>
                    <hr className="dropdown-divider" />
                    <button className="dropdown-item danger" onClick={handleLogout}>🚪 Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost btn-sm">{t('login')}</Link>
              <Link to="/register" className="btn btn-primary btn-sm">{t('register')}</Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button className="mobile-menu-btn btn btn-icon btn-ghost" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <Link to="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/scholarships" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Scholarships</Link>
          {user && <Link to="/dashboard" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>}
          {user?.role === 'admin' && <Link to="/admin" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Admin</Link>}
          <Link to="/contact" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          {!user && (
            <>
              <Link to="/login" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Register</Link>
            </>
          )}
          {user && <button className="mobile-nav-link danger" onClick={handleLogout}>Logout</button>}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
