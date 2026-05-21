import React from 'react';

/**
 * Skeleton placeholder for scholarship cards while loading
 */
const SkeletonCard = () => (
  <div className="card" style={{ overflow: 'hidden' }}>
    <div style={{ padding: '16px 16px 0', display: 'flex', gap: 8 }}>
      <div className="skeleton" style={{ width: 70, height: 22, borderRadius: 20 }} />
      <div className="skeleton" style={{ width: 50, height: 22, borderRadius: 20, marginLeft: 'auto' }} />
    </div>
    <div style={{ padding: 16 }}>
      <div className="skeleton" style={{ height: 20, marginBottom: 8, borderRadius: 4 }} />
      <div className="skeleton" style={{ height: 20, width: '70%', marginBottom: 16, borderRadius: 4 }} />
      <div className="skeleton" style={{ height: 14, width: '50%', marginBottom: 12, borderRadius: 4 }} />
      <div className="skeleton" style={{ height: 52, borderRadius: 8, marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 14, width: '60%', borderRadius: 4 }} />
    </div>
    <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
      <div className="skeleton" style={{ flex: 1, height: 34, borderRadius: 6 }} />
      <div className="skeleton" style={{ width: 70, height: 34, borderRadius: 6 }} />
    </div>
  </div>
);

/**
 * Grid of skeleton cards
 */
export const SkeletonGrid = ({ count = 6 }) => (
  <div className="scholarships-grid">
    {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
  </div>
);

export default SkeletonCard;
