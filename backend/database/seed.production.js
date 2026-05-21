/**
 * Production Seed Script
 * Run ONCE after deploying backend to Render:
 *   node database/seed.production.js
 *
 * Set MONGO_URI env variable to your MongoDB Atlas connection string before running.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Scholarship = require('../models/Scholarship');

async function seedProduction() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Only create admin if it doesn't exist
    const existingAdmin = await User.findOne({ email: 'admin@scholarship.com' });
    if (!existingAdmin) {
      await User.create({
        name: 'Admin User',
        email: 'admin@scholarship.com',
        password: 'Admin@123',
        role: 'admin',
        isVerified: true,
      });
      console.log('👤 Admin created');
    } else {
      console.log('👤 Admin already exists, skipping');
    }

    const count = await Scholarship.countDocuments();
    console.log(`🎓 ${count} scholarships already in database`);

    console.log('\n✅ Production seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seedProduction();
