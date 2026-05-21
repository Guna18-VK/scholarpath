/**
 * Database Seed Script
 * Run: npm run seed
 */
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Scholarship = require('../models/Scholarship');
const Notification = require('../models/Notification');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/scholarship_db';

const scholarshipsData = [
  {
    name: 'National Merit Scholarship',
    provider: 'Ministry of Education, India',
    description: 'Awarded to meritorious students from economically weaker sections to support higher education.',
    amount: 12000,
    category: 'merit',
    eligibilityCriteria: 'Students with 80%+ in Class 10 board exams from EWS families.',
    minPercentage: 80,
    maxAnnualIncome: 150000,
    eligibleCommunities: [],
    eligibleGenders: [],
    eligibleCourses: [],
    eligibleStates: [],
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    applicationLink: 'https://scholarships.gov.in',
    requiredDocuments: ['Income Certificate', 'Class 10 Marksheet', 'Aadhaar Card', 'Bank Passbook'],
    isActive: true,
    isFeatured: true,
    tags: ['merit', 'central', 'EWS'],
  },
  {
    name: 'Post Matric Scholarship for SC Students',
    provider: 'Ministry of Social Justice and Empowerment',
    description: 'Financial assistance to SC students pursuing post-matriculation courses.',
    amount: 23000,
    category: 'government',
    eligibilityCriteria: 'SC students with family income below ₹2.5 lakhs.',
    minPercentage: 0,
    maxAnnualIncome: 250000,
    eligibleCommunities: ['SC'],
    eligibleGenders: [],
    eligibleCourses: [],
    eligibleStates: [],
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    applicationLink: 'https://scholarships.gov.in',
    requiredDocuments: ['Caste Certificate', 'Income Certificate', 'Marksheet', 'Aadhaar Card'],
    isActive: true,
    isFeatured: true,
    tags: ['SC', 'government', 'post-matric'],
  },
  {
    name: 'Begum Hazrat Mahal National Scholarship',
    provider: 'Maulana Azad Education Foundation',
    description: 'Scholarship for meritorious girls belonging to minorities for studies in Class 9 to 12.',
    amount: 10000,
    category: 'minority',
    eligibilityCriteria: 'Minority girl students with 50%+ marks and family income below ₹2 lakhs.',
    minPercentage: 50,
    maxAnnualIncome: 200000,
    eligibleCommunities: ['Muslim', 'Christian', 'Sikh', 'Buddhist', 'Parsi', 'Jain'],
    eligibleGenders: ['female'],
    eligibleCourses: [],
    eligibleStates: [],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    applicationLink: 'https://maef.net.in',
    requiredDocuments: ['Minority Certificate', 'Income Certificate', 'Marksheet', 'Aadhaar Card'],
    isActive: true,
    isFeatured: false,
    tags: ['minority', 'girls', 'central'],
  },
  {
    name: 'Inspire Scholarship for Higher Education',
    provider: 'Department of Science & Technology',
    description: 'For students pursuing Natural and Basic Sciences at undergraduate and postgraduate level.',
    amount: 80000,
    category: 'merit',
    eligibilityCriteria: 'Top 1% in Class 12 board exams, pursuing BSc/MSc in Natural Sciences.',
    minPercentage: 90,
    maxAnnualIncome: 0,
    eligibleCommunities: [],
    eligibleGenders: [],
    eligibleCourses: ['BSc', 'MSc', 'B.Sc', 'M.Sc'],
    eligibleStates: [],
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    applicationLink: 'https://online-inspire.gov.in',
    requiredDocuments: ['Class 12 Marksheet', 'College Admission Letter', 'Aadhaar Card'],
    isActive: true,
    isFeatured: true,
    tags: ['science', 'merit', 'DST'],
  },
  {
    name: 'Tata Capital Pankh Scholarship',
    provider: 'Tata Capital',
    description: 'Supporting underprivileged students pursuing professional courses.',
    amount: 50000,
    category: 'need-based',
    eligibilityCriteria: 'Students with 60%+ marks, family income below ₹4 lakhs, pursuing professional courses.',
    minPercentage: 60,
    maxAnnualIncome: 400000,
    eligibleCommunities: [],
    eligibleGenders: [],
    eligibleCourses: ['B.Tech', 'BTech', 'MBBS', 'BBA', 'B.Com', 'BA', 'BSc'],
    eligibleStates: [],
    deadline: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000),
    applicationLink: 'https://www.b4s.in/tatacapital/PKS',
    requiredDocuments: ['Income Certificate', 'Marksheet', 'Admission Letter', 'Bank Details'],
    isActive: true,
    isFeatured: true,
    tags: ['private', 'professional', 'need-based'],
  },
  {
    name: 'Vidyasaarathi Scholarship',
    provider: 'NSDL e-Governance Infrastructure',
    description: 'Scholarship for students from low-income families pursuing technical education.',
    amount: 30000,
    category: 'need-based',
    eligibilityCriteria: 'Students with 60%+ in Class 12, family income below ₹3 lakhs.',
    minPercentage: 60,
    maxAnnualIncome: 300000,
    eligibleCommunities: [],
    eligibleGenders: [],
    eligibleCourses: ['B.Tech', 'BTech', 'Diploma', 'ITI'],
    eligibleStates: [],
    deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
    applicationLink: 'https://www.vidyasaarathi.co.in',
    requiredDocuments: ['Income Certificate', 'Class 12 Marksheet', 'Aadhaar Card', 'Bank Passbook'],
    isActive: true,
    isFeatured: false,
    tags: ['technical', 'need-based', 'private'],
  },
  {
    name: 'Aicte Pragati Scholarship for Girls',
    provider: 'AICTE',
    description: 'Scholarship for girl students pursuing technical education.',
    amount: 50000,
    category: 'government',
    eligibilityCriteria: 'Girl students in AICTE-approved technical institutions, family income below ₹8 lakhs.',
    minPercentage: 0,
    maxAnnualIncome: 800000,
    eligibleCommunities: [],
    eligibleGenders: ['female'],
    eligibleCourses: ['B.Tech', 'BTech', 'B.Arch', 'B.Pharma', 'MBA', 'MCA'],
    eligibleStates: [],
    deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
    applicationLink: 'https://www.aicte-india.org/bureaus/pgov/pragati',
    requiredDocuments: ['Income Certificate', 'Admission Letter', 'Aadhaar Card', 'Bank Details'],
    isActive: true,
    isFeatured: true,
    tags: ['girls', 'technical', 'AICTE'],
  },
  {
    name: 'Sitaram Jindal Foundation Scholarship',
    provider: 'Sitaram Jindal Foundation',
    description: 'Merit-cum-means scholarship for students from poor families.',
    amount: 24000,
    category: 'need-based',
    eligibilityCriteria: 'Students with 55%+ marks, family income below ₹2.5 lakhs.',
    minPercentage: 55,
    maxAnnualIncome: 250000,
    eligibleCommunities: [],
    eligibleGenders: [],
    eligibleCourses: [],
    eligibleStates: [],
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    applicationLink: 'https://www.sitaramjindalfoundation.org',
    requiredDocuments: ['Income Certificate', 'Marksheet', 'Aadhaar Card', 'Photograph'],
    isActive: true,
    isFeatured: false,
    tags: ['private', 'need-based', 'merit'],
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Scholarship.deleteMany({});
    await Notification.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    // NOTE: Use plain password — the User model pre('save') hook will hash it automatically
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@scholarship.com',
      password: 'Admin@123',
      role: 'admin',
      isVerified: true,
    });
    console.log('👤 Admin created: admin@scholarship.com / Admin@123');

    // Create sample student
    const student = await User.create({
      name: 'Priya Sharma',
      email: 'student@scholarship.com',
      password: 'Student@123',
      role: 'student',
      isVerified: true,
      age: 20,
      gender: 'female',
      course: 'B.Tech',
      college: 'IIT Delhi',
      state: 'Delhi',
      community: 'OBC',
      annualIncome: 180000,
      incomeCategory: '1L_2.5L',
      academicPercentage: 85,
      cgpa: 8.5,
    });
    console.log('👤 Student created: student@scholarship.com / Student@123');

    // Create scholarships
    const scholarships = await Scholarship.insertMany(
      scholarshipsData.map((s) => ({ ...s, createdBy: admin._id }))
    );
    console.log(`🎓 ${scholarships.length} scholarships created`);

    // Create sample notifications for student
    await Notification.insertMany([
      {
        recipient: student._id,
        title: 'Welcome to Scholarship System!',
        message: 'Complete your profile to get personalized scholarship recommendations.',
        type: 'system',
      },
      {
        recipient: student._id,
        title: 'New Scholarship Available',
        message: 'National Merit Scholarship is now open for applications.',
        type: 'new_scholarship',
        scholarship: scholarships[0]._id,
      },
    ]);
    console.log('🔔 Sample notifications created');

    console.log('\n✅ Database seeded successfully!');
    console.log('─────────────────────────────────');
    console.log('Admin:   admin@scholarship.com / Admin@123');
    console.log('Student: student@scholarship.com / Student@123');
    console.log('─────────────────────────────────');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
