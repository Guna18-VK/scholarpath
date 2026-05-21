const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Scholarship = require('../models/Scholarship');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

// ─── POST /api/applications/:scholarshipId ────────────────────────────────────
router.post('/:scholarshipId', protect, async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.scholarshipId);
    if (!scholarship) return res.status(404).json({ success: false, message: 'Scholarship not found' });
    if (!scholarship.isActive) return res.status(400).json({ success: false, message: 'Scholarship is no longer active' });
    if (new Date(scholarship.deadline) < new Date()) {
      return res.status(400).json({ success: false, message: 'Application deadline has passed' });
    }

    const existing = await Application.findOne({ student: req.user._id, scholarship: req.params.scholarshipId });
    if (existing) return res.status(400).json({ success: false, message: 'Already applied for this scholarship' });

    const application = await Application.create({
      student: req.user._id,
      scholarship: req.params.scholarshipId,
      notes: req.body.notes,
    });

    // Increment application count
    await Scholarship.findByIdAndUpdate(req.params.scholarshipId, { $inc: { applicationsCount: 1 } });

    // Notify student
    await Notification.create({
      recipient: req.user._id,
      title: 'Application Submitted',
      message: `Your application for "${scholarship.name}" has been submitted successfully.`,
      type: 'application_update',
      scholarship: scholarship._id,
    });

    res.status(201).json({ success: true, application });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Already applied' });
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/applications ────────────────────────────────────────────────────
// Student: own applications | Admin: all applications
router.get('/', protect, async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { student: req.user._id };
    const applications = await Application.find(query)
      .populate('scholarship', 'name provider amount deadline category')
      .populate('student', 'name email')
      .sort({ appliedAt: -1 });
    res.json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/applications/:id/status ────────────────────────────────────────
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status, adminRemarks, reviewedAt: new Date(), reviewedBy: req.user._id },
      { new: true }
    ).populate('scholarship', 'name').populate('student', 'name email');

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    // Notify student of status change
    await Notification.create({
      recipient: application.student._id,
      title: 'Application Status Updated',
      message: `Your application for "${application.scholarship.name}" is now: ${status.replace('_', ' ').toUpperCase()}`,
      type: 'application_update',
      scholarship: application.scholarship._id,
    });

    res.json({ success: true, application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE /api/applications/:id ────────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, student: req.user._id });
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    if (application.status !== 'applied') {
      return res.status(400).json({ success: false, message: 'Cannot withdraw application at this stage' });
    }
    await application.deleteOne();
    await Scholarship.findByIdAndUpdate(application.scholarship, { $inc: { applicationsCount: -1 } });
    res.json({ success: true, message: 'Application withdrawn' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
