import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format, differenceInDays } from 'date-fns';
import './ScholarshipCard.css';

const categoryColors = {
  merit: '#4f46e5',
  'need-based': '#10b981',
  minority: '#f59e0b',
  sports: '#3b82f6',
  disability: '#8b5cf6',
  research: '#06b6d4',
  government: '#ef4444',
  private: '#ec4899',
  other: '#6b7280',
};

const ScholarshipCard = ({ scholarship, eligibility, onSave, isSaved }) => {
  const { user } = useAuth();
  const daysLeft = differenceInDays(new Date(scholarship.deadline), new Date());
  const isExpired = daysLeft < 0;
  const isUrgent = daysLeft >= 0 && daysLeft <= 7;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to save scholarships'); return; }
    try {
      if (isSaved) {
        await api.delete(`/users/save/${scholarship._id}`);
        toast.success('Removed from saved');
      } else {
        await api.post(`/users/save/${scholarship._id}`);
        toast.success('Scholarship saved!');
      }
      if (onSave) onSave(scholarship._id, !isSaved);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving scholarship');
    }
  };

  return (
    <div className="scholarship-card card card-hover fade-in">
      {/* Header */}
      <div className="sc-header">
        <div className="sc-category-badge" style={{ background: `${categoryColors[scholarship.category]}20`, color: categoryColors[scholarship.category] }}>
          {scholarship.category}
        </div>
        {scholarship.isFeatured && <span className="sc-featured">⭐ Featured</span>}
        <button
          className={`sc-save-btn ${isSaved ? 'saved' : ''}`}
          onClick={handleSave}
          aria-label={isSaved ? 'Remove from saved' : 'Save scholarship'}
        >
          {isSaved ? '🔖' : '🏷️'}
        </button>
      </div>

      {/* Body */}
      <div className="sc-body">
        <h3 className="sc-name">{scholarship.name}</h3>
        <p className="sc-provider">🏛️ {scholarship.provider}</p>

        <div className="sc-amount">
          <span className="sc-amount-label">Amount</span>
          <span className="sc-amount-value">₹{scholarship.amount.toLocaleString()}</span>
        </div>

        {/* Eligibility Badge */}
        {eligibility !== undefined && (
          <div className={`sc-eligibility ${eligibility ? 'eligible' : 'not-eligible'}`}>
            {eligibility ? '✅ Eligible' : '❌ Not Eligible'}
          </div>
        )}

        {/* Deadline */}
        <div className={`sc-deadline ${isExpired ? 'expired' : isUrgent ? 'urgent' : ''}`}>
          <span>📅</span>
          <span>
            {isExpired
              ? 'Deadline passed'
              : isUrgent
              ? `⚠️ ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left!`
              : `${format(new Date(scholarship.deadline), 'dd MMM yyyy')} (${daysLeft}d left)`}
          </span>
        </div>

        {/* Required % */}
        {scholarship.minPercentage > 0 && (
          <div className="sc-meta-item">
            <span>📊 Min. {scholarship.minPercentage}%</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sc-footer">
        <Link to={`/scholarships/${scholarship._id}`} className="btn btn-primary btn-sm sc-view-btn">
          View Details →
        </Link>
        {scholarship.applicationLink && (
          <a href={scholarship.applicationLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
            Apply ↗
          </a>
        )}
      </div>
    </div>
  );
};

export default ScholarshipCard;
