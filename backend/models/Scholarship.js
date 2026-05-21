const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Scholarship name is required'], trim: true },
  provider: { type: String, required: [true, 'Provider is required'], trim: true },
  description: { type: String, trim: true },
  amount: { type: Number, required: [true, 'Amount is required'], min: 0 },
  category: {
    type: String,
    enum: ['merit', 'need-based', 'minority', 'sports', 'disability', 'research', 'government', 'private', 'other'],
    required: true,
  },

  // ─── Eligibility ─────────────────────────────────────────────────────────────
  eligibilityCriteria: { type: String, trim: true },
  minPercentage: { type: Number, min: 0, max: 100, default: 0 },
  minCGPA: { type: Number, min: 0, max: 10, default: 0 },
  maxAnnualIncome: { type: Number, default: Infinity },
  eligibleCommunities: [{ type: String }],   // ['SC', 'ST', 'OBC', 'General', ...]
  eligibleGenders: [{ type: String }],        // ['male', 'female', 'other'] or empty = all
  eligibleCourses: [{ type: String }],        // empty = all courses
  eligibleStates: [{ type: String }],         // empty = all states
  minAge: { type: Number, default: 0 },
  maxAge: { type: Number, default: 100 },

  // ─── Application Info ─────────────────────────────────────────────────────────
  deadline: { type: Date, required: [true, 'Deadline is required'] },
  applicationLink: { type: String, trim: true },
  requiredDocuments: [{ type: String }],

  // ─── Status ───────────────────────────────────────────────────────────────────
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },

  // ─── Meta ─────────────────────────────────────────────────────────────────────
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  views: { type: Number, default: 0 },
  applicationsCount: { type: Number, default: 0 },
  tags: [{ type: String }],
  image: { type: String, default: '' },
}, { timestamps: true });

// Text index for search
scholarshipSchema.index({ name: 'text', provider: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Scholarship', scholarshipSchema);
