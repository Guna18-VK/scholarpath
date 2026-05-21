const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scholarship: { type: mongoose.Schema.Types.ObjectId, ref: 'Scholarship', required: true },
  status: {
    type: String,
    enum: ['applied', 'under_review', 'approved', 'rejected', 'withdrawn'],
    default: 'applied',
  },
  appliedAt: { type: Date, default: Date.now },
  notes: { type: String, trim: true },
  documents: [{ name: String, url: String }],
  adminRemarks: { type: String, trim: true },
  reviewedAt: { type: Date },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Prevent duplicate applications
applicationSchema.index({ student: 1, scholarship: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
