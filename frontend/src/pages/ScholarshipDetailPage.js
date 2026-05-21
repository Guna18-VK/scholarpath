import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format, differenceInDays } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './ScholarshipDetailPage.css';

const ScholarshipDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scholarship, setScholarship] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/scholarships/${id}`);
        setScholarship(res.data.scholarship);

        if (user) {
          // Check eligibility
          const eligRes = await api.get(`/recommendations/check/${id}`);
          setEligibility(eligRes.data);

          // Check if saved
          const savedRes = await api.get('/users/saved');
          setIsSaved(savedRes.data.savedScholarships.some((s) => s._id === id));

          // Check if applied
          const appRes = await api.get('/applications');
          setHasApplied(appRes.data.applications.some((a) => a.scholarship._id === id));
        }
      } catch (err) {
        toast.error('Scholarship not found');
        navigate('/scholarships');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user, navigate]);

  const handleSave = async () => {
    if (!user) { toast.error('Please login to save'); return; }
    try {
      if (isSaved) {
        await api.delete(`/users/save/${id}`);
        setIsSaved(false);
        toast.success('Removed from saved');
      } else {
        await api.post(`/users/save/${id}`);
        setIsSaved(true);
        toast.success('Scholarship saved!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const handleApply = async () => {
    if (!user) { toast.error('Please login to apply'); navigate('/login'); return; }
    setApplying(true);
    try {
      await api.post(`/applications/${id}`);
      setHasApplied(true);
      toast.success('Application submitted successfully! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error applying');
    } finally {
      setApplying(false);
    }
  };

  const downloadPDF = () => {
    if (!scholarship) return;
    const doc = new jsPDF();

    // Header
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('ScholarPath', 14, 20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Scholarship Details', 14, 30);

    // Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(scholarship.name, 14, 55);

    // Details table
    doc.autoTable({
      startY: 65,
      head: [['Field', 'Details']],
      body: [
        ['Provider', scholarship.provider],
        ['Amount', `Rs. ${scholarship.amount.toLocaleString()}`],
        ['Category', scholarship.category],
        ['Deadline', format(new Date(scholarship.deadline), 'dd MMMM yyyy')],
        ['Min. Percentage', scholarship.minPercentage > 0 ? `${scholarship.minPercentage}%` : 'No minimum'],
        ['Min. CGPA', scholarship.minCGPA > 0 ? `${scholarship.minCGPA}` : 'No minimum'],
        ['Max. Income', scholarship.maxAnnualIncome && scholarship.maxAnnualIncome < 1e15
          ? `Rs. ${Number(scholarship.maxAnnualIncome).toLocaleString()}` : 'No limit'],
        ['Eligible Communities', scholarship.eligibleCommunities?.join(', ') || 'All'],
        ['Eligible States', scholarship.eligibleStates?.join(', ') || 'All India'],
        ['Application Link', scholarship.applicationLink || 'N/A'],
      ],
      styles: { fontSize: 11 },
      headStyles: { fillColor: [79, 70, 229] },
    });

    // Documents
    if (scholarship.requiredDocuments?.length) {
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Required Documents:', 14, finalY);
      scholarship.requiredDocuments.forEach((docItem, i) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.text(`• ${docItem}`, 18, finalY + 10 + i * 8);
      });
    }

    doc.save(`${scholarship.name.replace(/\s+/g, '_')}.pdf`);
    toast.success('PDF downloaded!');
  };

  if (loading) return (
    <div><Navbar /><div className="loading-overlay" style={{ minHeight: '80vh' }}><div className="spinner" /></div></div>
  );

  if (!scholarship) return null;

  const daysLeft = differenceInDays(new Date(scholarship.deadline), new Date());
  const isExpired = daysLeft < 0;

  return (
    <div className="scholarship-detail-page">
      <Navbar />
      <div className="detail-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/scholarships">Scholarships</Link> / <span>{scholarship.name}</span>
        </div>

        <div className="detail-layout">
          {/* ─── Main Content ──────────────────────────────────────────── */}
          <div className="detail-main">
            <div className="card card-body">
              {/* Header */}
              <div className="detail-header">
                <div className="detail-badges">
                  <span className="badge badge-primary">{scholarship.category}</span>
                  {scholarship.isFeatured && <span className="badge badge-warning">⭐ Featured</span>}
                  {isExpired && <span className="badge badge-danger">Expired</span>}
                </div>
                <h1 className="detail-title">{scholarship.name}</h1>
                <p className="detail-provider">🏛️ {scholarship.provider}</p>
              </div>

              {/* Amount Banner */}
              <div className="amount-banner">
                <div>
                  <div className="amount-label">Scholarship Amount</div>
                  <div className="amount-value">₹{scholarship.amount.toLocaleString()}</div>
                </div>
                <div className={`deadline-info ${isExpired ? 'expired' : daysLeft <= 7 ? 'urgent' : ''}`}>
                  <div className="deadline-label">Deadline</div>
                  <div className="deadline-value">{format(new Date(scholarship.deadline), 'dd MMM yyyy')}</div>
                  <div className="deadline-days">
                    {isExpired ? 'Expired' : `${daysLeft} days left`}
                  </div>
                </div>
              </div>

              {/* Eligibility Check */}
              {eligibility && (
                <div className={`eligibility-banner ${eligibility.eligible ? 'eligible' : 'not-eligible'}`}>
                  <div className="eligibility-icon">{eligibility.eligible ? '✅' : '❌'}</div>
                  <div>
                    <div className="eligibility-status">{eligibility.eligible ? 'You are Eligible!' : 'Not Eligible'}</div>
                    {!eligibility.eligible && eligibility.reasons?.length > 0 && (
                      <ul className="eligibility-reasons">
                        {eligibility.reasons.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              {scholarship.description && (
                <div className="detail-section">
                  <h3>About This Scholarship</h3>
                  <p>{scholarship.description}</p>
                </div>
              )}

              {/* Eligibility Criteria */}
              {scholarship.eligibilityCriteria && (
                <div className="detail-section">
                  <h3>Eligibility Criteria</h3>
                  <p>{scholarship.eligibilityCriteria}</p>
                </div>
              )}

              {/* Required Documents */}
              {scholarship.requiredDocuments?.length > 0 && (
                <div className="detail-section">
                  <h3>Required Documents</h3>
                  <ul className="documents-list">
                    {scholarship.requiredDocuments.map((doc, i) => (
                      <li key={i}>📄 {doc}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* ─── Sidebar ───────────────────────────────────────────────── */}
          <div className="detail-sidebar">
            {/* Actions */}
            <div className="card card-body detail-actions">
              {!isExpired && (
                <>
                  {hasApplied ? (
                    <div className="applied-badge">✅ Already Applied</div>
                  ) : (
                    <button className="btn btn-primary w-full btn-lg" onClick={handleApply} disabled={applying}>
                      {applying ? <><span className="spinner spinner-sm" /> Applying...</> : '📝 Apply Now'}
                    </button>
                  )}
                  {scholarship.applicationLink && (
                    <a href={scholarship.applicationLink} target="_blank" rel="noopener noreferrer"
                      className="btn btn-outline w-full">🔗 Official Portal ↗</a>
                  )}
                </>
              )}
              <button className={`btn w-full ${isSaved ? 'btn-secondary' : 'btn-ghost'}`} onClick={handleSave}>
                {isSaved ? '🔖 Saved' : '🏷️ Save Scholarship'}
              </button>
              <button className="btn btn-ghost w-full" onClick={downloadPDF}>
                📄 Download PDF
              </button>
            </div>

            {/* Quick Info */}
            <div className="card card-body quick-info">
              <h3>Quick Info</h3>
              <div className="info-grid">
                {scholarship.minPercentage > 0 && (
                  <div className="info-item">
                    <span className="info-label">Min. Percentage</span>
                    <span className="info-value">{scholarship.minPercentage}%</span>
                  </div>
                )}
                {scholarship.minCGPA > 0 && (
                  <div className="info-item">
                    <span className="info-label">Min. CGPA</span>
                    <span className="info-value">{scholarship.minCGPA}</span>
                  </div>
                )}
                {scholarship.maxAnnualIncome < Infinity && (
                  <div className="info-item">
                    <span className="info-label">Max. Income</span>
                    <span className="info-value">₹{scholarship.maxAnnualIncome.toLocaleString()}</span>
                  </div>
                )}
                {scholarship.eligibleCommunities?.length > 0 && (
                  <div className="info-item">
                    <span className="info-label">Communities</span>
                    <span className="info-value">{scholarship.eligibleCommunities.join(', ')}</span>
                  </div>
                )}
                {scholarship.eligibleGenders?.length > 0 && (
                  <div className="info-item">
                    <span className="info-label">Gender</span>
                    <span className="info-value">{scholarship.eligibleGenders.join(', ')}</span>
                  </div>
                )}
                {scholarship.eligibleStates?.length > 0 && (
                  <div className="info-item">
                    <span className="info-label">States</span>
                    <span className="info-value">{scholarship.eligibleStates.join(', ')}</span>
                  </div>
                )}
                <div className="info-item">
                  <span className="info-label">Applications</span>
                  <span className="info-value">{scholarship.applicationsCount}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Views</span>
                  <span className="info-value">{scholarship.views}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipDetailPage;
