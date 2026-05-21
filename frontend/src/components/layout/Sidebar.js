import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const studentLinks = [
  { path: '/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/scholarships', icon: '🎓', label: 'Scholarships' },
  { path: '/dashboard?tab=recommendations', icon: '⭐', label: 'Recommendations' },
  { path: '/dashboard?tab=applications', icon: '📝', label: 'My Applications' },
  { path: '/dashboard?tab=saved', icon: '🔖', label: 'Saved' },
  { path: '/dashboard?tab=notifications', icon: '🔔', label: 'Notifications' },
  { path: '/profile', icon: '👤', label: 'Profile' },
];

const adminLinks = [
  { path: '/admin', icon: '📊', label: 'Dashboard' },
  { path: '/admin?tab=scholarships', icon: '🎓', label: 'Scholarships' },
  { path: '/admin?tab=applications', icon: '📝', label: 'Applications' },
  { path: '/admin?tab=users', icon: '👥', label: 'Students' },
  { path: '/admin?tab=notifications', icon: '🔔', label: 'Notifications' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  const isActive = (path) => {
    const [basePath, query] = path.split('?');
    if (query) {
      return location.pathname === basePath && location.search.includes(query.split('=')[1]);
    }
    return location.pathname === path && !location.search;
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <Link to="/" className="sidebar-logo-link">
          <span className="sidebar-logo-icon">🎓</span>
          {!collapsed && <span className="sidebar-logo-text">ScholarPath</span>}
        </Link>
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* User Info */}
      {!collapsed && (
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.avatar ? <img src={user.avatar} alt={user.name} /> : user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">{user?.role === 'admin' ? '🛡️ Admin' : '🎓 Student'}</div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar-nav">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`sidebar-link ${isActive(link.path) ? 'active' : ''}`}
            title={collapsed ? link.label : ''}
          >
            <span className="sidebar-link-icon">{link.icon}</span>
            {!collapsed && <span className="sidebar-link-label">{link.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="sidebar-bottom">
        <Link to="/" className="sidebar-link" title={collapsed ? 'Home' : ''}>
          <span className="sidebar-link-icon">🏠</span>
          {!collapsed && <span className="sidebar-link-label">Home</span>}
        </Link>
        <button
          className="sidebar-link sidebar-logout"
          onClick={() => { logout(); navigate('/'); }}
          title={collapsed ? 'Logout' : ''}
        >
          <span className="sidebar-link-icon">🚪</span>
          {!collapsed && <span className="sidebar-link-label">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
