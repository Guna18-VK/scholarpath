const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// State name normalizer — handles "tamilnadu" → "Tamil Nadu" etc.
const STATE_ALIASES = {
  'tamilnadu':'Tamil Nadu','tamilnad':'Tamil Nadu','tn':'Tamil Nadu',
  'andhrapradesh':'Andhra Pradesh','andhra':'Andhra Pradesh','ap':'Andhra Pradesh',
  'arunachalpradesh':'Arunachal Pradesh','arunachal':'Arunachal Pradesh',
  'karnatak':'Karnataka','ka':'Karnataka',
  'kl':'Kerala','keralam':'Kerala',
  'mh':'Maharashtra','maharastra':'Maharashtra',
  'madhyapradesh':'Madhya Pradesh','mp':'Madhya Pradesh',
  'uttarpradesh':'Uttar Pradesh','up':'Uttar Pradesh',
  'uttarakhand':'Uttarakhand','uttaranchal':'Uttarakhand','uk':'Uttarakhand',
  'westbengal':'West Bengal','wb':'West Bengal','bengal':'West Bengal',
  'rj':'Rajasthan','rajputana':'Rajasthan',
  'gj':'Gujarat','pb':'Punjab','hr':'Haryana',
  'himachalpradesh':'Himachal Pradesh','himachal':'Himachal Pradesh','hp':'Himachal Pradesh',
  'br':'Bihar','jh':'Jharkhand',
  'odisha':'Odisha','orissa':'Odisha','od':'Odisha',
  'as':'Assam','chhattisgarh':'Chhattisgarh','chattisgarh':'Chhattisgarh','cg':'Chhattisgarh',
  'telangana':'Telangana','ts':'Telangana','tg':'Telangana',
  'ga':'Goa','mn':'Manipur','ml':'Meghalaya','mz':'Mizoram',
  'nl':'Nagaland','sk':'Sikkim','tr':'Tripura',
  'dl':'Delhi','new delhi':'Delhi','ncr':'Delhi',
  'jammuandkashmir':'Jammu & Kashmir','jammu kashmir':'Jammu & Kashmir','jk':'Jammu & Kashmir','j&k':'Jammu & Kashmir','kashmir':'Jammu & Kashmir',
  'la':'Ladakh','puducherry':'Puducherry','pondicherry':'Puducherry','pondy':'Puducherry','py':'Puducherry',
};

const OFFICIAL_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh','Puducherry','Chandigarh',
];

const normalizeStateName = (input) => {
  if (!input) return input;
  const key = input.toLowerCase().trim().replace(/\s+/g, ' ');
  if (STATE_ALIASES[key.replace(/\s/g, '')]) return STATE_ALIASES[key.replace(/\s/g, '')];
  if (STATE_ALIASES[key]) return STATE_ALIASES[key];
  const direct = OFFICIAL_STATES.find((s) => s.toLowerCase() === key);
  if (direct) return direct;
  const fuzzy = OFFICIAL_STATES.find((s) =>
    s.toLowerCase().replace(/\s/g, '').includes(key.replace(/\s/g, ''))
  );
  return fuzzy || input;
};

// ─── GET /api/users/profile ───────────────────────────────────────────────────
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedScholarships', 'name provider amount deadline');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/users/profile ───────────────────────────────────────────────────
router.put('/profile', protect, async (req, res) => {
  try {
    const allowedFields = ['name', 'age', 'gender', 'phone', 'course', 'college', 'state',
      'community', 'annualIncome', 'academicPercentage', 'cgpa', 'avatar', 'preferredLanguage', 'notificationsEnabled'];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Normalize state name — "tamilnadu" → "Tamil Nadu"
    if (updates.state) {
      updates.state = normalizeStateName(updates.state);
    }

    // Auto-set income category
    if (updates.annualIncome !== undefined) {
      const income = updates.annualIncome;
      if (income < 100000) updates.incomeCategory = 'below_1L';
      else if (income < 250000) updates.incomeCategory = '1L_2.5L';
      else if (income < 500000) updates.incomeCategory = '2.5L_5L';
      else if (income < 800000) updates.incomeCategory = '5L_8L';
      else updates.incomeCategory = 'above_8L';
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/users/saved ─────────────────────────────────────────────────────
router.get('/saved', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedScholarships',
      match: { isActive: true },
    });
    res.json({ success: true, savedScholarships: user.savedScholarships });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/users/save/:id ─────────────────────────────────────────────────
router.post('/save/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.savedScholarships.includes(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Already saved' });
    }
    user.savedScholarships.push(req.params.id);
    await user.save();
    res.json({ success: true, message: 'Scholarship saved' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE /api/users/save/:id ───────────────────────────────────────────────
router.delete('/save/:id', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $pull: { savedScholarships: req.params.id } });
    res.json({ success: true, message: 'Scholarship removed from saved' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/users/change-password ──────────────────────────────────────────
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
