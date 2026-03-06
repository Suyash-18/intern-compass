/**
 * Seed Script - Creates initial admin user
 *
 * Usage: cd server && node seed/seedAdmin.js
 *
 * Make sure MONGODB_URI is set in .env before running
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Profile = require('../models/Profile');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@prima.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists. Skipping.');
      process.exit(0);
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

    console.log('✅ Admin user created:');
    console.log('   Email: admin@prima.com');
    console.log('   Password: admin123');

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

    console.log('✅ Sample intern created:');
    console.log('   Email: intern@prima.com');
    console.log('   Password: intern123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
}

seed();
