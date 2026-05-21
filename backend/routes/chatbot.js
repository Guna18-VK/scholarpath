const express = require('express');
const router = express.Router();
const Scholarship = require('../models/Scholarship');

/**
 * Simple rule-based chatbot for scholarship guidance
 * POST /api/chatbot/message
 */
router.post('/message', async (req, res) => {
  try {
    const { message } = req.body;
    const msg = (message || '').toLowerCase().trim();

    let reply = '';

    // ─── Intent Detection ──────────────────────────────────────────────────
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
      reply = "Hello! 👋 I'm your Scholarship Assistant. I can help you find scholarships, check eligibility, and guide you through the application process. What would you like to know?";
    }
    else if (msg.includes('eligib')) {
      reply = "To check your eligibility for a scholarship, go to the Scholarship Details page and click 'Check Eligibility'. The system will automatically compare your profile with the scholarship requirements. Make sure your profile is complete for accurate results!";
    }
    else if (msg.includes('apply') || msg.includes('application')) {
      reply = "To apply for a scholarship:\n1. Go to the Scholarship Listing page\n2. Click on a scholarship to view details\n3. Check your eligibility\n4. Click 'Apply Now' and follow the instructions\n5. Track your application status in your Dashboard.";
    }
    else if (msg.includes('document') || msg.includes('required')) {
      reply = "Common documents required for scholarships:\n• Income certificate\n• Caste/Community certificate\n• Academic marksheets\n• Bonafide certificate from college\n• Bank account details\n• Aadhaar card\n• Passport-size photograph\n\nCheck each scholarship's details page for specific requirements.";
    }
    else if (msg.includes('deadline') || msg.includes('last date')) {
      reply = "You can view upcoming deadlines in your Dashboard under 'Upcoming Deadlines'. You'll also receive email reminders 7, 3, and 1 day(s) before each deadline for scholarships you've saved or applied to.";
    }
    else if (msg.includes('government') || msg.includes('central') || msg.includes('state')) {
      const govScholarships = await Scholarship.find({ category: 'government', isActive: true }).limit(3).select('name provider amount deadline');
      if (govScholarships.length) {
        reply = `Here are some government scholarships:\n${govScholarships.map(s => `• ${s.name} by ${s.provider} – ₹${s.amount.toLocaleString()}`).join('\n')}\n\nVisit the Scholarships page to see all government scholarships.`;
      } else {
        reply = "You can filter scholarships by 'Government' category on the Scholarships page to find all government-funded scholarships.";
      }
    }
    else if (msg.includes('merit') || msg.includes('marks') || msg.includes('percentage')) {
      reply = "Merit-based scholarships are awarded based on academic performance. Typically you need 60%+ or 7+ CGPA. Make sure your academic percentage is updated in your profile for accurate recommendations!";
    }
    else if (msg.includes('income') || msg.includes('poor') || msg.includes('financial')) {
      reply = "Need-based scholarships are available for students from economically weaker sections. Update your annual family income in your profile to get matched with income-based scholarships. Many scholarships are available for families with income below ₹2.5 lakhs per year.";
    }
    else if (msg.includes('sc') || msg.includes('st') || msg.includes('obc') || msg.includes('minority') || msg.includes('community')) {
      reply = "There are many scholarships specifically for SC/ST/OBC and minority communities. Update your community/caste in your profile, and the system will automatically recommend relevant scholarships. Check the 'Minority' category in the scholarship filters.";
    }
    else if (msg.includes('save') || msg.includes('bookmark') || msg.includes('wishlist')) {
      reply = "You can save scholarships by clicking the bookmark icon on any scholarship card. Saved scholarships appear in your Dashboard under 'Saved Scholarships', and you'll receive deadline reminders for them.";
    }
    else if (msg.includes('pdf') || msg.includes('download')) {
      reply = "You can download scholarship details as a PDF by clicking the 'Download PDF' button on the Scholarship Details page. This is useful for offline reference or sharing with family.";
    }
    else if (msg.includes('profile') || msg.includes('update')) {
      reply = "A complete profile helps get better recommendations! Go to Profile page and fill in:\n• Academic percentage/CGPA\n• Annual family income\n• Community/Caste\n• State\n• Course and College\n\nThe more complete your profile, the more accurate your scholarship matches will be.";
    }
    else if (msg.includes('notification') || msg.includes('alert') || msg.includes('remind')) {
      reply = "You'll receive notifications for:\n• New scholarships matching your profile\n• Deadline reminders (7, 3, 1 days before)\n• Application status updates\n\nCheck the bell icon in the top navigation for all notifications. You can manage notification preferences in your Profile settings.";
    }
    else if (msg.includes('contact') || msg.includes('help') || msg.includes('support')) {
      reply = "For additional help:\n• Visit our Contact page\n• Email: support@scholarshipsystem.com\n• Check the FAQ section\n\nOur team is available Monday–Friday, 9 AM – 6 PM.";
    }
    else if (msg.includes('how many') || msg.includes('total scholarship')) {
      const count = await Scholarship.countDocuments({ isActive: true });
      reply = `Currently, there are ${count} active scholarships available on our platform. New scholarships are added regularly!`;
    }
    else {
      reply = "I'm not sure I understood that. Here are some things I can help with:\n• How to apply for scholarships\n• Eligibility requirements\n• Required documents\n• Deadline reminders\n• Government/merit/need-based scholarships\n• Profile setup tips\n\nTry asking about any of these topics!";
    }

    res.json({ success: true, reply });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
