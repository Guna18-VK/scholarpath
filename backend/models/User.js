const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // ─── Basic Info ─────────────────────────────────────────────────────────────
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: {
    type: String, required: [true, 'Email is required'],
    unique: true, lowercase: true, trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },

  // ─── Profile ────────────────────────────────────────────────────────────────
  age: { type: Number, min: 10, max: 60 },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  phone: { type: String, trim: true },
  course: { type: String, trim: true },
  college: { type: String, trim: true },
  state: { type: String, trim: true },
  community: { type: String, trim: true },   // SC / ST / OBC / General etc.
  incomeCategory: {
    type: String,
    enum: ['below_1L', '1L_2.5L', '2.5L_5L', '5L_8L', 'above_8L'],
  },
  annualIncome: { type: Number, default: 0 },
  academicPercentage: { type: Number, min: 0, max: 100 },
  cgpa: { type: Number, min: 0, max: 10 },

  // ─── Auth ────────────────────────────────────────────────────────────────────
  isVerified: { type: Boolean, default: false },
  otp: { type: String, select: false },
  otpExpiry: { type: Date, select: false },
  resetPasswordOtp: { type: String, select: false },
  resetPasswordOtpExpiry: { type: Date, select: false },

  // ─── Preferences ─────────────────────────────────────────────────────────────
  savedScholarships: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Scholarship' }],
  preferredLanguage: { type: String, default: 'en' },
  notificationsEnabled: { type: Boolean, default: true },

  // ─── Avatar ──────────────────────────────────────────────────────────────────
  avatar: { type: String, default: '' },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Determine income category from annual income
userSchema.methods.setIncomeCategory = function () {
  const income = this.annualIncome;
  if (income < 100000) this.incomeCategory = 'below_1L';
  else if (income < 250000) this.incomeCategory = '1L_2.5L';
  else if (income < 500000) this.incomeCategory = '2.5L_5L';
  else if (income < 800000) this.incomeCategory = '5L_8L';
  else this.incomeCategory = 'above_8L';
};

module.exports = mongoose.model('User', userSchema);
