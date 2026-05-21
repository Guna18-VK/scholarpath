# Database Schema – Scholarship Awareness and Recommendation System

## MongoDB Collections

---

### 1. Users Collection

```json
{
  "_id": "ObjectId",
  "name": "String (required)",
  "email": "String (required, unique)",
  "password": "String (hashed, required)",
  "role": "String (enum: student | admin, default: student)",
  
  // Profile
  "age": "Number",
  "gender": "String (enum: male | female | other)",
  "phone": "String",
  "course": "String",
  "college": "String",
  "state": "String",
  "community": "String (SC | ST | OBC | General | EWS | ...)",
  "incomeCategory": "String (enum: below_1L | 1L_2.5L | 2.5L_5L | 5L_8L | above_8L)",
  "annualIncome": "Number",
  "academicPercentage": "Number (0-100)",
  "cgpa": "Number (0-10)",
  
  // Auth
  "isVerified": "Boolean (default: false)",
  "otp": "String (select: false)",
  "otpExpiry": "Date (select: false)",
  "resetPasswordOtp": "String (select: false)",
  "resetPasswordOtpExpiry": "Date (select: false)",
  
  // Preferences
  "savedScholarships": ["ObjectId (ref: Scholarship)"],
  "preferredLanguage": "String (default: en)",
  "notificationsEnabled": "Boolean (default: true)",
  "avatar": "String",
  
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

### 2. Scholarships Collection

```json
{
  "_id": "ObjectId",
  "name": "String (required)",
  "provider": "String (required)",
  "description": "String",
  "amount": "Number (required)",
  "category": "String (enum: merit | need-based | minority | sports | disability | research | government | private | other)",
  
  // Eligibility
  "eligibilityCriteria": "String",
  "minPercentage": "Number (0-100, default: 0)",
  "minCGPA": "Number (0-10, default: 0)",
  "maxAnnualIncome": "Number (default: Infinity)",
  "eligibleCommunities": ["String"],
  "eligibleGenders": ["String"],
  "eligibleCourses": ["String"],
  "eligibleStates": ["String"],
  "minAge": "Number (default: 0)",
  "maxAge": "Number (default: 100)",
  
  // Application
  "deadline": "Date (required)",
  "applicationLink": "String",
  "requiredDocuments": ["String"],
  
  // Status
  "isActive": "Boolean (default: true)",
  "isFeatured": "Boolean (default: false)",
  
  // Meta
  "createdBy": "ObjectId (ref: User)",
  "views": "Number (default: 0)",
  "applicationsCount": "Number (default: 0)",
  "tags": ["String"],
  "image": "String",
  
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Indexes:**
- Text index on: `name`, `provider`, `description`, `tags`

---

### 3. Applications Collection

```json
{
  "_id": "ObjectId",
  "student": "ObjectId (ref: User, required)",
  "scholarship": "ObjectId (ref: Scholarship, required)",
  "status": "String (enum: applied | under_review | approved | rejected | withdrawn, default: applied)",
  "appliedAt": "Date (default: now)",
  "notes": "String",
  "documents": [{ "name": "String", "url": "String" }],
  "adminRemarks": "String",
  "reviewedAt": "Date",
  "reviewedBy": "ObjectId (ref: User)",
  
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Indexes:**
- Unique compound index: `{ student: 1, scholarship: 1 }` (prevents duplicate applications)

---

### 4. Notifications Collection

```json
{
  "_id": "ObjectId",
  "recipient": "ObjectId (ref: User, required)",
  "title": "String (required)",
  "message": "String (required)",
  "type": "String (enum: deadline_reminder | new_scholarship | application_update | system | recommendation)",
  "isRead": "Boolean (default: false)",
  "link": "String",
  "scholarship": "ObjectId (ref: Scholarship)",
  
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## Relationships

```
User ──────────────── Application ──────────────── Scholarship
  │                                                      │
  │ savedScholarships (array)                            │
  └──────────────────────────────────────────────────────┘
  
User ──────────────── Notification
Scholarship ──────── Notification
```

---

## Sample Queries

### Get eligible scholarships for a student
```javascript
// Backend recommendation engine handles this
// See: backend/utils/recommendationEngine.js
```

### Get student's applications with scholarship details
```javascript
Application.find({ student: userId })
  .populate('scholarship', 'name provider amount deadline')
  .sort({ appliedAt: -1 })
```

### Get scholarships by category with pagination
```javascript
Scholarship.find({ category: 'merit', isActive: true })
  .sort({ deadline: 1 })
  .skip((page - 1) * limit)
  .limit(limit)
```

### Admin stats aggregation
```javascript
Application.aggregate([
  { $group: { _id: '$status', count: { $sum: 1 } } }
])
```
