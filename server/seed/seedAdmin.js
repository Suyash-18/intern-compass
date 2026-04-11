/**
 * Seed Script - Creates initial admin user and 23 sample interns
 *
 * Can be run standalone: cd server && node seed/seedAdmin.js
 * Also auto-runs on server start (skips if data exists)
 *
 * Make sure MONGODB_URI is set in .env before running
 */

const User = require('../models/User');
const Profile = require('../models/Profile');

// Mock data arrays for generation
const domains = [
  'Frontend Development', 'Backend Development', 'Full Stack Development',
  'Mobile Development', 'Data Science', 'Machine Learning',
  'DevOps', 'UI/UX Design', 'Quality Assurance', 'Cloud Computing'
];

const firstNames = ['Aarav', 'Vihaan', 'Aditya', 'Neha', 'Priya', 'Arjun', 'Siddharth', 'Rahul', 'Anjali', 'Kavya', 'Rohan', 'Amit', 'Sneha', 'Pooja', 'Riya', 'Kriti', 'Ishaan', 'Kabir', 'Aryan', 'Dhruv', 'Rishi', 'Karan', 'Meera'];
const lastNames = ['Sharma', 'Verma', 'Gupta', 'Patel', 'Singh', 'Kumar', 'Jain', 'Das', 'Reddy', 'Rao', 'Desai', 'Joshi'];
const colleges = ['NIT Trichy', 'BITS Pilani', 'VIT Vellore', 'Manipal Institute of Technology', 'Delhi Technological University', 'SRM University', 'Pune Institute of Computer Technology', 'VJTI Mumbai'];
const branches = ['Computer Science', 'Information Technology', 'Electronics and Communication', 'Data Engineering'];
const degrees = ['B.Tech', 'B.E.', 'MCA', 'M.Tech'];
const years = ['2024', '2025', '2026'];
const skillPool = ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'AWS', 'Docker', 'Figma', 'SQL', 'MongoDB', 'Git', 'Kubernetes', 'TypeScript', 'Flutter'];

// Helper functions for random data
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomSkills = () => {
  const shuffled = [...skillPool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * 3) + 2); // 2 to 4 skills
};
const generateMobile = () => '9' + Math.floor(Math.random() * 900000000 + 100000000).toString();

async function autoSeed() {
  try {
    // --- 1. SEED ADMIN ---
    const existingAdmin = await User.findOne({ email: 'admin@prima.com' });
    if (existingAdmin) {
      console.log('✅ Seed: Admin already exists, skipping.');
    } else {
      const admin = await User.create({
        email: 'admin@prima.com',
        password: 'admin123',
        role: 'admin',
        registrationStep: 'complete',
      });

      await Profile.create({
        userId: admin._id,
        name: 'Prima Admin',
        email: 'admin@prima.com',
      });
      console.log('✅ Seed: Admin user created (admin@prima.com / admin123)');
    }

    // --- 2. SEED 23 INTERNS ---
    const existingIntern = await User.findOne({ email: 'intern1@prima.com' });
    if (existingIntern) {
      console.log('✅ Seed: Interns already exist, skipping.');
      return;
    }

    console.log('⏳ Seeding 23 interns...');
    
    for (let i = 1; i <= 23; i++) {
      const firstName = firstNames[i - 1] || getRandom(firstNames); // Ensures unique first names for the 23
      const lastName = getRandom(lastNames);
      const fullName = `${firstName} ${lastName}`;
      const email = `intern${i}@prima.com`;

      // Create User account
      const intern = await User.create({
        email: email,
        password: 'intern123',
        role: 'intern',
        registrationStep: 'complete',
      });

      // Create Profile
      await Profile.create({
        userId: intern._id,
        name: fullName,
        email: email,
        mobile: generateMobile(),
        domain: getRandom(domains),
        collegeName: getRandom(colleges),
        degree: getRandom(degrees),
        branch: getRandom(branches),
        yearOfPassing: getRandom(years),
        skills: getRandomSkills(),
      });
    }

    console.log('✅ Seed: Successfully created 23 intern users (intern1@prima.com to intern23@prima.com / intern123)');
  } catch (error) {
    console.error('⚠️ Seed error (non-fatal):', error.message);
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