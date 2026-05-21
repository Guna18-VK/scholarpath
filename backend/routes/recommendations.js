const express = require('express');
const router = express.Router();
const Scholarship = require('../models/Scholarship');
const { protect } = require('../middleware/auth');
const { checkEligibility, scoreScholarship } = require('../utils/recommendationEngine');

// ─── GET /api/recommendations ─────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const student = req.user;

    // Get all active scholarships not past deadline
    const scholarships = await Scholarship.find({
      isActive: true,
      deadline: { $gte: new Date() },
    });

    // Score and annotate each scholarship
    const results = scholarships.map((s) => {
      const { eligible, reasons } = checkEligibility(student, s);
      const score = scoreScholarship(student, s);
      return { scholarship: s, eligible, reasons, score };
    });

    // Sort: eligible first (by score desc), then ineligible
    results.sort((a, b) => {
      if (a.eligible && !b.eligible) return -1;
      if (!a.eligible && b.eligible) return 1;
      return b.score - a.score;
    });

    res.json({ success: true, recommendations: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/recommendations/check/:id ──────────────────────────────────────
router.get('/check/:id', protect, async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);
    if (!scholarship) return res.status(404).json({ success: false, message: 'Scholarship not found' });

    const { eligible, reasons } = checkEligibility(req.user, scholarship);
    res.json({ success: true, eligible, reasons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
