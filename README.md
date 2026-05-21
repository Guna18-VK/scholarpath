# Scholarship Awareness and Recommendation System

A modern full-stack web application that helps students discover and apply for scholarships easily.

## Project Structure

```
scholarship-system/
├── frontend/          # React.js frontend
├── backend/           # Node.js + Express backend
└── database/          # Database schemas and seed data
```

## Tech Stack

- **Frontend**: React.js, CSS3, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT + OTP/Email Verification
- **Email**: Nodemailer

## Quick Start

### Prerequisites
- Node.js >= 16.x
- MongoDB >= 5.x
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env   # Fill in your environment variables
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Database Seed
```bash
cd backend
npm run seed
```

## Environment Variables (backend/.env)

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/scholarship_db
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLIENT_URL=http://localhost:3000
```

## API Documentation

### Auth Routes
- `POST /api/auth/register` - Register student
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/reset-password` - Reset password

### Scholarship Routes
- `GET /api/scholarships` - Get all scholarships (with filters)
- `GET /api/scholarships/:id` - Get single scholarship
- `POST /api/scholarships` - Create scholarship (Admin)
- `PUT /api/scholarships/:id` - Update scholarship (Admin)
- `DELETE /api/scholarships/:id` - Delete scholarship (Admin)

### Recommendation Routes
- `GET /api/recommendations` - Get personalized recommendations

### User Routes
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/saved` - Get saved scholarships
- `POST /api/users/save/:id` - Save scholarship
- `DELETE /api/users/save/:id` - Unsave scholarship

### Application Routes
- `POST /api/applications/:scholarshipId` - Apply for scholarship
- `GET /api/applications` - Get user applications
- `GET /api/applications/admin` - Get all applications (Admin)

### Notification Routes
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read

### Admin Routes
- `GET /api/admin/stats` - Dashboard statistics

## Deployment

### Backend (Render/Railway)
1. Push code to GitHub
2. Connect repo to Render
3. Set environment variables
4. Deploy

### Frontend (Vercel/Netlify)
1. Push code to GitHub
2. Connect repo to Vercel
3. Set `REACT_APP_API_URL` to your backend URL
4. Deploy

### Database (MongoDB Atlas)
1. Create cluster on MongoDB Atlas
2. Get connection string
3. Update `MONGO_URI` in backend `.env`

## Features
- Student Authentication with JWT + OTP
- Personalized Scholarship Recommendations
- Admin Dashboard with Analytics
- Email Notifications & Reminders
- AI Chatbot for Guidance
- PDF Download of Scholarship Details
- Dark/Light Mode
- Multi-language Support
- Voice Assistant Support
- Responsive Mobile-Friendly Design
