const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
require('dotenv').config();

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Sanitize CLIENT_URL — strip any whitespace/newlines that Render env vars may add
const clientUrl = (process.env.CLIENT_URL || '').trim().replace(/[\r\n]/g, '');

const allowedOrigins = [
  'http://localhost:3000',
  'https://scholarpath-rho.vercel.app',
  'https://scholarpath.vercel.app',
  clientUrl,
].filter(Boolean).map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, mobile, server-to-server)
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.trim();
    if (
      allowedOrigins.includes(cleanOrigin) ||
      cleanOrigin.endsWith('.vercel.app') ||
      cleanOrigin.endsWith('.onrender.com')
    ) {
      return callback(null, true);
    }
    // In production allow all — remove this line after testing
    return callback(null, true);
  },
  credentials: true,
}));

// ─── Health Check — MUST be before rate limiter and 404 handler ───────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date(), env: process.env.NODE_ENV, version: '2.0' });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'ScholarPath API is running', status: 'OK', version: '2.0' });
});

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ─── General Middleware ────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ─── Database Connection ───────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => { console.error('❌ MongoDB connection error:', err.message); process.exit(1); });

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',            require('./routes/auth'));
app.use('/api/users',           require('./routes/users'));
app.use('/api/scholarships',    require('./routes/scholarships'));
app.use('/api/applications',    require('./routes/applications'));
app.use('/api/notifications',   require('./routes/notifications'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/admin',           require('./routes/admin'));
app.use('/api/chatbot',         require('./routes/chatbot'));
app.use('/api/pdf',             require('./routes/pdf'));
app.use('/api/setup',           require('./routes/setup'));

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ─── Cron Job: Deadline Reminders (runs daily at 8 AM) ────────────────────────
cron.schedule('0 8 * * *', async () => {
  try {
    const { sendDeadlineReminders } = require('./utils/reminderService');
    await sendDeadlineReminders();
    console.log('✅ Deadline reminders sent');
  } catch (err) {
    console.error('❌ Cron job error:', err);
  }
});

// ─── Keep-alive ping every 14 minutes (prevents Render free tier cold start) ──
cron.schedule('*/14 * * * *', () => {
  const http = require('https');
  const url = process.env.RENDER_EXTERNAL_URL || `https://scholarpath-backend-umli.onrender.com`;
  http.get(`${url}/api/health`, (res) => {
    console.log(`🏓 Keep-alive ping: ${res.statusCode}`);
  }).on('error', () => {});
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});
