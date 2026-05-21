const express = require('express');
const router = express.Router();
const Scholarship = require('../models/Scholarship');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// ─── GET /api/scholarships ────────────────────────────────────────────────────
// Public – supports filters: course, state, category, provider, deadline, search
router.get('/', async (req, res) => {
  try {
    const { search, category, state, course, provider, minAmount, maxAmount, page = 1, limit = 12, sortBy = 'deadline' } = req.query;

    const query = { isActive: true };

    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (provider) query.provider = new RegExp(provider, 'i');
    if (minAmount) query.amount = { ...query.amount, $gte: Number(minAmount) };
    if (maxAmount) query.amount = { ...query.amount, $lte: Number(maxAmount) };

    // Use $and to combine state + course filters without $or conflict
    const andConditions = [];
    if (state) andConditions.push({ $or: [{ eligibleStates: { $size: 0 } }, { eligibleStates: state }] });
    if (course) andConditions.push({ $or: [{ eligibleCourses: { $size: 0 } }, { eligibleCourses: new RegExp(course, 'i') }] });
    if (andConditions.length) query.$and = andConditions;

    const sortOptions = {
      deadline: { deadline: 1 },
      amount: { amount: -1 },
      newest: { createdAt: -1 },
      popular: { applicationsCount: -1 },
    };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Scholarship.countDocuments(query);
    const scholarships = await Scholarship.find(query)
      .sort(sortOptions[sortBy] || { deadline: 1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      scholarships,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/scholarships/featured ──────────────────────────────────────────
router.get('/featured', async (req, res) => {
  try {
    const scholarships = await Scholarship.find({ isActive: true, isFeatured: true }).limit(6);
    res.json({ success: true, scholarships });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/scholarships/:id ────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id).populate('createdBy', 'name');
    if (!scholarship) return res.status(404).json({ success: false, message: 'Scholarship not found' });

    // Increment view count
    scholarship.views += 1;
    await scholarship.save();

    res.json({ success: true, scholarship });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/scholarships ───────────────────────────────────────────────────
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const scholarship = await Scholarship.create({ ...req.body, createdBy: req.user._id });

    // Notify all students about new scholarship
    const students = await User.find({ role: 'student', notificationsEnabled: true }).select('_id');
    const notifications = students.map((s) => ({
      recipient: s._id,
      title: 'New Scholarship Available!',
      message: `${scholarship.name} by ${scholarship.provider} – ₹${scholarship.amount.toLocaleString()}`,
      type: 'new_scholarship',
      scholarship: scholarship._id,
      link: `/scholarships/${scholarship._id}`,
    }));
    if (notifications.length) await Notification.insertMany(notifications);

    res.status(201).json({ success: true, scholarship });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/scholarships/:id ────────────────────────────────────────────────
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const scholarship = await Scholarship.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!scholarship) return res.status(404).json({ success: false, message: 'Scholarship not found' });
    res.json({ success: true, scholarship });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE /api/scholarships/:id ────────────────────────────────────────────
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const scholarship = await Scholarship.findByIdAndDelete(req.params.id);
    if (!scholarship) return res.status(404).json({ success: false, message: 'Scholarship not found' });
    res.json({ success: true, message: 'Scholarship deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
