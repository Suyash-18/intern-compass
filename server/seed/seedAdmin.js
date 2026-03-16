/**
 * Seed Script - Creates initial admin user
 *
 * Can be run standalone: cd server && node seed/seedAdmin.js
 * Also auto-runs on server start (skips if data exists)
 *
 * Make sure MONGODB_URI is set in .env before running
 */

const User = require('../models/User');
const Profile = require('../models/Profile');

async function autoSeed() {
  try {
    // Check if admin exists - skip if already seeded
    const existingAdmin = await User.findOne({ email: 'admin@prima.com' });
    if (existingAdmin) {
      console.log('✅ Seed: Admin already exists, skipping.');
      return;
    }

    // Create admin user
    const admin = await User.create({
      email: 'admin@prima.com',
      password: 'admin123',
      role: 'admin',
      registrationStep: 'complete',
    });

    await Profile.create({
      userId: admin._id,
      name: 'Admin',
      email: 'admin@prima.com',
    });

    console.log('✅ Seed: Admin user created (admin@prima.com / admin123)');

    // Create a sample intern
    const intern = await User.create({
      email: 'intern@prima.com',
      password: 'intern123',
      role: 'intern',
      registrationStep: 'complete',
    });

    await Profile.create({
      userId: intern._id,
      name: 'Sample Intern',
      email: 'intern@prima.com',
      mobile: '9876543210',
      domain: 'Web Development',
      collegeName: 'Engineering College',
      degree: 'B.Tech',
      branch: 'Computer Science',
      yearOfPassing: '2025',
      skills: ['JavaScript', 'React', 'Node.js'],
    });

    console.log('✅ Seed: Sample intern created (intern@prima.com / intern123)');
  } catch (error) {
    console.error('⚠️  Seed error (non-fatal):', error.message);
  }
}

// Standalone execution
if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
  const mongoose = require('mongoose');

  mongoose.connect(process.env.MONGODB_URI || require('../config/db').getURI?.() || 'mongodb://localhost:27017/Prima_Intern')
    .then(() => {
      console.log('✅ Connected to MongoDB');
      return autoSeed();
    })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Error:', err.message);
      process.exit(1);
    });
}

module.exports = { autoSeed };
