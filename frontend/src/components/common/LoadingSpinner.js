import React from 'react';

/**
 * Full-page loading spinner with optional message
 */
const LoadingSpinner = ({ message = 'Loading...', fullPage = false }) => {
  const style = fullPage
    ? { position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 9999 }
    : { minHeight: 200 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, ...style }}>
      <div className="spinner" />
      {message && <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
