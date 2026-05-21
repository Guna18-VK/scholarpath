/**
 * Recommendation Engine
 * Matches scholarships to a student profile and returns eligibility status
 */

/**
 * Check if a student is eligible for a scholarship
 * @param {Object} student - User document
 * @param {Object} scholarship - Scholarship document
 * @returns {{ eligible: boolean, reasons: string[] }}
 */
exports.checkEligibility = (student, scholarship) => {
  const reasons = [];
  let eligible = true;

  // ─── Academic Percentage ──────────────────────────────────────────────────
  if (scholarship.minPercentage > 0) {
    const studentScore = student.academicPercentage || 0;
    if (studentScore < scholarship.minPercentage) {
      eligible = false;
      reasons.push(`Requires ${scholarship.minPercentage}% (you have ${studentScore}%)`);
    }
  }

  // ─── CGPA ─────────────────────────────────────────────────────────────────
  if (scholarship.minCGPA > 0) {
    const studentCGPA = student.cgpa || 0;
    if (studentCGPA < scholarship.minCGPA) {
      eligible = false;
      reasons.push(`Requires CGPA ${scholarship.minCGPA} (you have ${studentCGPA})`);
    }
  }

  // ─── Income ───────────────────────────────────────────────────────────────
  if (scholarship.maxAnnualIncome && scholarship.maxAnnualIncome < Infinity) {
    const studentIncome = student.annualIncome || 0;
    if (studentIncome > scholarship.maxAnnualIncome) {
      eligible = false;
      reasons.push(`Income limit ₹${scholarship.maxAnnualIncome.toLocaleString()} (yours: ₹${studentIncome.toLocaleString()})`);
    }
  }

  // ─── Community ────────────────────────────────────────────────────────────
  if (scholarship.eligibleCommunities && scholarship.eligibleCommunities.length > 0) {
    if (!student.community || !scholarship.eligibleCommunities.includes(student.community)) {
      eligible = false;
      reasons.push(`Only for: ${scholarship.eligibleCommunities.join(', ')}`);
    }
  }

  // ─── Gender ───────────────────────────────────────────────────────────────
  if (scholarship.eligibleGenders && scholarship.eligibleGenders.length > 0) {
    if (!student.gender || !scholarship.eligibleGenders.includes(student.gender)) {
      eligible = false;
      reasons.push(`Only for: ${scholarship.eligibleGenders.join(', ')}`);
    }
  }

  // ─── Course ───────────────────────────────────────────────────────────────
  if (scholarship.eligibleCourses && scholarship.eligibleCourses.length > 0) {
    const match = scholarship.eligibleCourses.some(
      (c) => c.toLowerCase() === (student.course || '').toLowerCase()
    );
    if (!match) {
      eligible = false;
      reasons.push(`Only for courses: ${scholarship.eligibleCourses.join(', ')}`);
    }
  }

  // ─── State ────────────────────────────────────────────────────────────────
  if (scholarship.eligibleStates && scholarship.eligibleStates.length > 0) {
    const match = scholarship.eligibleStates.some(
      (s) => s.toLowerCase() === (student.state || '').toLowerCase()
    );
    if (!match) {
      eligible = false;
      reasons.push(`Only for states: ${scholarship.eligibleStates.join(', ')}`);
    }
  }

  // ─── Age ──────────────────────────────────────────────────────────────────
  if (student.age) {
    if (student.age < scholarship.minAge || student.age > scholarship.maxAge) {
      eligible = false;
      reasons.push(`Age must be between ${scholarship.minAge} and ${scholarship.maxAge}`);
    }
  }

  return { eligible, reasons };
};

/**
 * Score a scholarship for a student (higher = better match)
 */
exports.scoreScholarship = (student, scholarship) => {
  let score = 0;

  // Eligible = base score
  const { eligible } = exports.checkEligibility(student, scholarship);
  if (!eligible) return -1;

  // Higher amount = higher score
  score += Math.min(scholarship.amount / 10000, 50);

  // Closer deadline = higher urgency score
  const daysLeft = Math.ceil((new Date(scholarship.deadline) - new Date()) / (1000 * 60 * 60 * 24));
  if (daysLeft > 0 && daysLeft <= 30) score += 20;
  else if (daysLeft > 30 && daysLeft <= 90) score += 10;

  // Featured scholarship
  if (scholarship.isFeatured) score += 15;

  // Community match
  if (scholarship.eligibleCommunities?.includes(student.community)) score += 10;

  // State match
  if (scholarship.eligibleStates?.includes(student.state)) score += 10;

  return score;
};
