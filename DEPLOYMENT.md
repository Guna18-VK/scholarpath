# Deployment Guide — ScholarPath

## Overview
- **Frontend** → Vercel (free)
- **Backend** → Render (free)
- **Database** → MongoDB Atlas (free)

---

## STEP 1 — Set Up MongoDB Atlas (Database)

1. Go to https://www.mongodb.com/atlas
2. Click **"Try Free"** → Sign up
3. Create a **Free Cluster** (M0 Sandbox)
   - Provider: AWS, Region: closest to you
4. Click **"Connect"** → **"Connect your application"**
5. Copy the connection string — looks like:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/scholarship_db
   ```
6. Go to **Network Access** → Add IP Address → **"Allow Access from Anywhere"** (0.0.0.0/0)
7. Go to **Database Access** → Add user with username + password

---

## STEP 2 — Push Code to GitHub

1. Go to https://github.com → Sign in → **New Repository**
2. Name it: `scholarpath` → Create (keep it Public or Private)
3. Open terminal in your project root folder and run:

```bash
git init
git add .
git commit -m "Initial commit - ScholarPath"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/scholarpath.git
git push -u origin main
```

---

## STEP 3 — Deploy Backend on Render

1. Go to https://render.com → Sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo → Select it
4. Fill in settings:
   - **Name:** `scholarpath-backend`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free
5. Click **"Advanced"** → Add these Environment Variables:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/scholarship_db` |
   | `JWT_SECRET` | `any_long_random_string_here_min_32_chars` |
   | `JWT_EXPIRE` | `7d` |
   | `EMAIL_HOST` | `smtp.gmail.com` |
   | `EMAIL_PORT` | `587` |
   | `EMAIL_USER` | `your_gmail@gmail.com` |
   | `EMAIL_PASS` | `your_gmail_app_password` |
   | `CLIENT_URL` | `https://scholarpath.vercel.app` *(update after Vercel deploy)* |

6. Click **"Create Web Service"**
7. Wait 3–5 minutes for deployment
8. Copy your backend URL: `https://scholarpath-backend.onrender.com`

---

## STEP 4 — Deploy Frontend on Vercel

1. Go to https://vercel.com → Sign up with GitHub
2. Click **"New Project"** → Import your GitHub repo
3. Fill in settings:
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
4. Click **"Environment Variables"** → Add:

   | Key | Value |
   |-----|-------|
   | `REACT_APP_API_URL` | `https://scholarpath-backend.onrender.com/api` |

5. Click **"Deploy"**
6. Wait 2–3 minutes
7. Your app is live at: `https://scholarpath.vercel.app`

---

## STEP 5 — Update Backend CLIENT_URL

1. Go back to Render dashboard
2. Open your backend service → **Environment**
3. Update `CLIENT_URL` to your actual Vercel URL:
   ```
   https://scholarpath.vercel.app
   ```
4. Click **Save** — Render will auto-redeploy

---

## STEP 6 — Seed the Production Database

After backend is deployed, open terminal and run:

```bash
cd backend
set MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/scholarship_db
node database/seed.js
```

This creates:
- Admin: `admin@scholarship.com` / `Admin@123`
- Student: `student@scholarship.com` / `Student@123`
- 8 sample scholarships

---

## Final Checklist

- [ ] MongoDB Atlas cluster created and connection string copied
- [ ] GitHub repo created and code pushed
- [ ] Backend deployed on Render with all env variables set
- [ ] Frontend deployed on Vercel with `REACT_APP_API_URL` set
- [ ] `CLIENT_URL` on Render updated to Vercel URL
- [ ] Database seeded with admin account
- [ ] Test login at your Vercel URL

---

## Troubleshooting

**Frontend shows blank page / API errors**
- Check `REACT_APP_API_URL` in Vercel env variables
- Make sure it ends with `/api` (no trailing slash)
- Redeploy frontend after changing env vars

**Backend returns CORS error**
- Update `CLIENT_URL` on Render to match your exact Vercel URL
- Redeploy backend

**Login fails**
- Make sure you ran the seed script against the Atlas database
- Check `MONGO_URI` is correct in Render env vars

**Render backend sleeps after 15 minutes (free tier)**
- Free Render services spin down after inactivity
- First request after sleep takes ~30 seconds
- Upgrade to paid plan to avoid this
