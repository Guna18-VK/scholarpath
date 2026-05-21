const Scholarship = require('../models/Scholarship');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendDeadlineReminderEmail } = require('./emailService');

/**
 * Send deadline reminders for scholarships due in 1, 3, or 7 days
 */
exports.sendDeadlineReminders = async () => {
  const today = new Date();
  const reminderDays = [1, 3, 7];

  for (const days of reminderDays) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + days);

    // Find scholarships with deadline on targetDate
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const scholarships = await Scholarship.find({
      deadline: { $gte: startOfDay, $lte: endOfDay },
      isActive: true,
    });

    for (const scholarship of scholarships) {
      // Find students who saved or applied for this scholarship
      const users = await User.find({
        $or: [
          { savedScholarships: scholarship._id },
        ],
        notificationsEnabled: true,
      });

      for (const user of users) {
        // Create in-app notification
        await Notification.create({
          recipient: user._id,
          title: 'Scholarship Deadline Reminder',
          message: `${scholarship.name} deadline is in ${days} day(s)!`,
          type: 'deadline_reminder',
          scholarship: scholarship._id,
          link: `/scholarships/${scholarship._id}`,
        });

        // Send email
        try {
          await sendDeadlineReminderEmail(user.email, scholarship.name, scholarship.deadline, days);
        } catch (err) {
          console.error(`Failed to send reminder email to ${user.email}:`, err.message);
        }
      }
    }
  }
};
