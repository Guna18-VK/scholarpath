const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Scholarship = require('../models/Scholarship');
const Notification = require('../models/Notification');

const scholarshipsData = [
  { name: 'National Merit Scholarship', provider: 'Ministry of Education, India', description: 'Awarded to meritorious students from economically weaker sections.', amount: 12000, category: 'merit', eligibilityCriteria: 'Students with 80%+ in Class 10 board exams from EWS families.', minPercentage: 80, maxAnnualIncome: 150000, eligibleCommunities: [], eligibleGenders: [], eligibleCourses: [], eligibleStates: [], deadline: new Date(Date.now() + 60*24*60*60*1000), applicationLink: 'https://scholarships.gov.in', requiredDocuments: ['Income Certificate','Class 10 Marksheet','Aadhaar Card','Bank Passbook'], isActive: true, isFeatured: true, tags: ['merit','central','EWS'] },
  { name: 'Post Matric Scholarship for SC Students', provider: 'Ministry of Social Justice', description: 'Financial assistance to SC students.', amount: 23000, category: 'government', eligibilityCriteria: 'SC students with family income below 2.5 lakhs.', minPercentage: 0, maxAnnualIncome: 250000, eligibleCommunities: ['SC'], eligibleGenders: [], eligibleCourses: [], eligibleStates: [], deadline: new Date(Date.now() + 45*24*60*60*1000), applicationLink: 'https://scholarships.gov.in', requiredDocuments: ['Caste Certificate','Income Certificate','Marksheet','Aadhaar Card'], isActive: true, isFeatured: true, tags: ['SC','government'] },
  { name: 'Begum Hazrat Mahal National Scholarship', provider: 'Maulana Azad Education Foundation', description: 'Scholarship for meritorious minority girls.', amount: 10000, category: 'minority', eligibilityCriteria: 'Minority girl students with 50%+ marks.', minPercentage: 50, maxAnnualIncome: 200000, eligibleCommunities: ['Muslim','Christian','Sikh','Buddhist','Parsi','Jain'], eligibleGenders: ['female'], eligibleCourses: [], eligibleStates: [], deadline: new Date(Date.now() + 30*24*60*60*1000), applicationLink: 'https://maef.net.in', requiredDocuments: ['Minority Certificate','Income Certificate','Marksheet'], isActive: true, isFeatured: false, tags: ['minority','girls'] },
  { name: 'Inspire Scholarship for Higher Education', provider: 'Department of Science & Technology', description: 'For students pursuing Natural and Basic Sciences.', amount: 80000, category: 'merit', eligibilityCriteria: 'Top 1% in Class 12, pursuing BSc/MSc.', minPercentage: 90, maxAnnualIncome: 0, eligibleCommunities: [], eligibleGenders: [], eligibleCourses: ['BSc','MSc','B.Sc','M.Sc'], eligibleStates: [], deadline: new Date(Date.now() + 90*24*60*60*1000), applicationLink: 'https://online-inspire.gov.in', requiredDocuments: ['Class 12 Marksheet','Admission Letter','Aadhaar Card'], isActive: true, isFeatured: true, tags: ['science','merit','DST'] },
  { name: 'Tata Capital Pankh Scholarship', provider: 'Tata Capital', description: 'Supporting underprivileged students.', amount: 50000, category: 'need-based', eligibilityCriteria: 'Students with 60%+ marks, income below 4 lakhs.', minPercentage: 60, maxAnnualIncome: 400000, eligibleCommunities: [], eligibleGenders: [], eligibleCourses: ['B.Tech','BTech','MBBS','BBA','B.Com','BA','BSc'], eligibleStates: [], deadline: new Date(Date.now() + 75*24*60*60*1000), applicationLink: 'https://www.b4s.in/tatacapital/PKS', requiredDocuments: ['Income Certificate','Marksheet','Admission Letter'], isActive: true, isFeatured: true, tags: ['private','professional'] },
  { name: 'Vidyasaarathi Scholarship', provider: 'NSDL e-Governance', description: 'For low-income technical students.', amount: 30000, category: 'need-based', eligibilityCriteria: '60%+ in Class 12, income below 3 lakhs.', minPercentage: 60, maxAnnualIncome: 300000, eligibleCommunities: [], eligibleGenders: [], eligibleCourses: ['B.Tech','BTech','Diploma','ITI'], eligibleStates: [], deadline: new Date(Date.now() + 50*24*60*60*1000), applicationLink: 'https://www.vidyasaarathi.co.in', requiredDocuments: ['Income Certificate','Class 12 Marksheet','Aadhaar Card'], isActive: true, isFeatured: false, tags: ['technical','need-based'] },
  { name: 'AICTE Pragati Scholarship for Girls', provider: 'AICTE', description: 'For girl students in technical education.', amount: 50000, category: 'government', eligibilityCriteria: 'Girl students, income below 8 lakhs.', minPercentage: 0, maxAnnualIncome: 800000, eligibleCommunities: [], eligibleGenders: ['female'], eligibleCourses: ['B.Tech','BTech','B.Arch','B.Pharma','MBA','MCA'], eligibleStates: [], deadline: new Date(Date.now() + 40*24*60*60*1000), applicationLink: 'https://www.aicte-india.org', requiredDocuments: ['Income Certificate','Admission Letter','Aadhaar Card'], isActive: true, isFeatured: true, tags: ['girls','technical','AICTE'] },
  { name: 'Sitaram Jindal Foundation Scholarship', provider: 'Sitaram Jindal Foundation', description: 'Merit-cum-means scholarship.', amount: 24000, category: 'need-based', eligibilityCriteria: '55%+ marks, income below 2.5 lakhs.', minPercentage: 55, maxAnnualIncome: 250000, eligibleCommunities: [], eligibleGenders: [], eligibleCourses: [], eligibleStates: [], deadline: new Date(Date.now() + 20*24*60*60*1000), applicationLink: 'https://www.sitaramjindalfoundation.org', requiredDocuments: ['Income Certificate','Marksheet','Aadhaar Card'], isActive: true, isFeatured: false, tags: ['private','need-based'] },
];

router.post('/seed', async (req, res) => {
  try {
    const { key } = req.body;
    if (key !== (process.env.JWT_SECRET || '').substring(0, 16)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    await User.deleteMany({});
    await Scholarship.deleteMany({});
    await Notification.deleteMany({});

    const admin = await User.create({ name: 'Admin User', email: 'admin@scholarship.com', password: 'Admin@123', role: 'admin', isVerified: true });
    const student = await User.create({ name: 'Priya Sharma', email: 'student@scholarship.com', password: 'Student@123', role: 'student', isVerified: true, age: 20, gender: 'female', course: 'B.Tech', college: 'Anna University', state: 'Tamil Nadu', community: 'OBC', annualIncome: 180000, incomeCategory: '1L_2.5L', academicPercentage: 85, cgpa: 8.5 });
    const scholarships = await Scholarship.insertMany(scholarshipsData.map(s => ({ ...s, createdBy: admin._id })));
    await Notification.insertMany([
      { recipient: student._id, title: 'Welcome to ScholarPath!', message: 'Complete your profile to get personalized recommendations.', type: 'system' },
      { recipient: student._id, title: 'New Scholarship Available', message: 'National Merit Scholarship is now open.', type: 'new_scholarship', scholarship: scholarships[0]._id },
    ]);

    res.json({ success: true, message: 'Seeded!', admin: 'admin@scholarship.com / Admin@123', student: 'student@scholarship.com / Student@123', scholarships: scholarships.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
