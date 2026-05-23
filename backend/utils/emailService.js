const nodemailer = require('nodemailer');

// ─── Create transporter lazily with connection timeout ────────────────────────
const getTransporter = () => nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,  // 10s connection timeout
  greetingTimeout: 10000,
  socketTimeout: 15000,
  tls: { rejectUnauthorized: false },
});

/**
 * Send a generic email — never throws, always resolves
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"ScholarPath" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    console.error(`❌ Email failed to ${to}:`, err.message);
    // Never throw — email failure should not break registration
  }
};

/** Send OTP verification email */
exports.sendOTPEmail = (email, otp) => sendEmail({
  to: email,
  subject: 'Verify Your Email – ScholarPath',
  html: `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:30px;border:1px solid #e0e0e0;border-radius:10px;">
      <h2 style="color:#4f46e5;">ScholarPath – Email Verification</h2>
      <p>Your OTP for email verification is:</p>
      <div style="font-size:36px;font-weight:bold;color:#4f46e5;letter-spacing:8px;text-align:center;padding:20px;background:#f3f4f6;border-radius:8px;">${otp}</div>
      <p style="color:#6b7280;margin-top:20px;">Valid for <strong>10 minutes</strong>. Do not share it.</p>
    </div>`,
});

/** Send password reset OTP */
exports.sendPasswordResetEmail = (email, otp) => sendEmail({
  to: email,
  subject: 'Password Reset OTP – ScholarPath',
  html: `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:30px;border:1px solid #e0e0e0;border-radius:10px;">
      <h2 style="color:#ef4444;">Password Reset Request</h2>
      <p>Your OTP to reset your password:</p>
      <div style="font-size:36px;font-weight:bold;color:#ef4444;letter-spacing:8px;text-align:center;padding:20px;background:#fef2f2;border-radius:8px;">${otp}</div>
      <p style="color:#6b7280;margin-top:20px;">Expires in <strong>10 minutes</strong>.</p>
    </div>`,
});

/** Send deadline reminder */
exports.sendDeadlineReminderEmail = (email, scholarshipName, deadline, daysLeft) => sendEmail({
  to: email,
  subject: `⏰ ${daysLeft} days left – ${scholarshipName}`,
  html: `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:30px;border:1px solid #e0e0e0;border-radius:10px;">
      <h2 style="color:#f59e0b;">⏰ Deadline Reminder</h2>
      <p>The deadline for <strong>${scholarshipName}</strong> is in <strong>${daysLeft} day(s)</strong>!</p>
      <p><strong>Deadline:</strong> ${new Date(deadline).toDateString()}</p>
      <a href="${process.env.CLIENT_URL}/scholarships" style="display:inline-block;background:#4f46e5;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">View Scholarships</a>
    </div>`,
});

/** Send new scholarship notification */
exports.sendNewScholarshipEmail = (email, scholarship) => sendEmail({
  to: email,
  subject: `🎓 New Scholarship: ${scholarship.name}`,
  html: `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:30px;border:1px solid #e0e0e0;border-radius:10px;">
      <h2 style="color:#10b981;">🎓 New Scholarship Available!</h2>
      <h3>${scholarship.name}</h3>
      <p><strong>Provider:</strong> ${scholarship.provider}</p>
      <p><strong>Amount:</strong> ₹${scholarship.amount.toLocaleString()}</p>
      <p><strong>Deadline:</strong> ${new Date(scholarship.deadline).toDateString()}</p>
      <a href="${process.env.CLIENT_URL}/scholarships/${scholarship._id}" style="display:inline-block;background:#10b981;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">View Details</a>
    </div>`,
});
