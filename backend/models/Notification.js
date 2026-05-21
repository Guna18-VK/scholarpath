const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['deadline_reminder', 'new_scholarship', 'application_update', 'system', 'recommendation'],
    default: 'system',
  },
  isRead: { type: Boolean, default: false },
  link: { type: String },   // optional deep-link
  scholarship: { type: mongoose.Schema.Types.ObjectId, ref: 'Scholarship' },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
