const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send a generic email
 */
const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"Scholarship System" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };
  return transporter.sendMail(mailOptions);
};

/**
 * Send OTP verification email
 */
exports.sendOTPEmail = async (email, otp) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:30px;border:1px solid #e0e0e0;border-radius:10px;">
      <h2 style="color:#4f46e5;">Scholarship System – Email Verification</h2>
      <p>Your OTP for email verification is:</p>
      <div style="font-size:36px;font-weight:bold;color:#4f46e5;letter-spacing:8px;text-align:center;padding:20px;background:#f3f4f6;border-radius:8px;">${otp}</div>
      <p style="color:#6b7280;margin-top:20px;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
    </div>`;
  return sendEmail({ to: email, subject: 'Verify Your Email – Scholarship System', html });
};

/**
 * Send password reset OTP
 */
exports.sendPasswordResetEmail = async (email, otp) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:30px;border:1px solid #e0e0e0;border-radius:10px;">
      <h2 style="color:#ef4444;">Password Reset Request</h2>
      <p>Your OTP to reset your password is:</p>
      <div style="font-size:36px;font-weight:bold;color:#ef4444;letter-spacing:8px;text-align:center;padding:20px;background:#fef2f2;border-radius:8px;">${otp}</div>
      <p style="color:#6b7280;margin-top:20px;">This OTP expires in <strong>10 minutes</strong>. If you did not request this, ignore this email.</p>
    </div>`;
  return sendEmail({ to: email, subject: 'Password Reset OTP – Scholarship System', html });
};

/**
 * Send deadline reminder email
 */
exports.sendDeadlineReminderEmail = async (email, scholarshipName, deadline, daysLeft) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:30px;border:1px solid #e0e0e0;border-radius:10px;">
      <h2 style="color:#f59e0b;">⏰ Scholarship Deadline Reminder</h2>
      <p>The deadline for <strong>${scholarshipName}</strong> is approaching!</p>
      <div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:15px;border-radius:4px;margin:20px 0;">
        <p style="margin:0;"><strong>Deadline:</strong> ${new Date(deadline).toDateString()}</p>
        <p style="margin:5px 0 0;color:#d97706;"><strong>${daysLeft} day(s) remaining</strong></p>
      </div>
      <p>Don't miss this opportunity! Apply now.</p>
      <a href="${process.env.CLIENT_URL}/scholarships" style="display:inline-block;background:#4f46e5;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;margin-top:10px;">View Scholarships</a>
    </div>`;
  return sendEmail({ to: email, subject: `⏰ ${daysLeft} days left – ${scholarshipName}`, html });
};

/**
 * Send new scholarship notification
 */
exports.sendNewScholarshipEmail = async (email, scholarship) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:30px;border:1px solid #e0e0e0;border-radius:10px;">
      <h2 style="color:#10b981;">🎓 New Scholarship Available!</h2>
      <h3>${scholarship.name}</h3>
      <p><strong>Provider:</strong> ${scholarship.provider}</p>
      <p><strong>Amount:</strong> ₹${scholarship.amount.toLocaleString()}</p>
      <p><strong>Deadline:</strong> ${new Date(scholarship.deadline).toDateString()}</p>
      <a href="${process.env.CLIENT_URL}/scholarships/${scholarship._id}" style="display:inline-block;background:#10b981;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;margin-top:10px;">View Details</a>
    </div>`;
  return sendEmail({ to: email, subject: `🎓 New Scholarship: ${scholarship.name}`, html });
};
