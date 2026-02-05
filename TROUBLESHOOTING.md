# BooKlub Troubleshooting Guide

Quick reference for common issues and their solutions.

---

## 🔐 Authentication Issues

### Clerk Domain Verification Errors

**Symptoms:**
- Error: "Domain verification required"
- Can't sign in on production site
- Works locally but not on Cloudflare

**Diagnosis:**
```bash
# Check which Clerk key is being used
grep CLERK_PUBLISHABLE_KEY frontend/.env.local
# Should start with pk_test_ (development) not pk_live_ (production)
```

**Solution:**
1. Use development key: `pk_test_ZGFyaW5nLWZlcnJldC01Mi5jbGVyay5hY2NvdW50cy5kZXYk`
2. Update in Cloudflare Pages environment variables
3. Redeploy

**Why it happens:**
- Production keys (pk_live_) require custom domain verification
- Development keys (pk_test_) work immediately with Clerk's default domains

---

## 🔌 API Connection Issues

### "Failed to fetch clubs" / "Failed to create club" / Similar Errors

**Symptoms:**
- Error message: "Error loading clubs: Failed to fetch clubs"
- Error message: "Failed to create club. Please try again."
- 500 error in browser Network tab
- Render logs show: "invalid input syntax for type integer"

**Diagnosis:**
```bash
# Check Render logs for the actual error
# Look for: "Error fetching clubs: error: invalid input syntax for type integer: 'user_...'"
```

**Root Cause:**
Frontend is sending Clerk user ID (string like `user_37xf2hsa6gyK5ugr7ZTh3nNlQGn`) instead of database user ID (integer like `1`).

**Solution:**
Update the component to fetch the database user first:

```javascript
const handleSubmit = async () => {
  try {
    // First get the booklub user ID from Clerk ID
    const userResponse = await fetch(`${API_URL}/api/users/clerk/${userId}`);
    if (!userResponse.ok) {
      throw new Error('User not found');
    }
    const booklubUser = await userResponse.json();

    // Then use database ID for API calls
    const response = await fetch(`${API_URL}/api/clubs`, {
      method: 'POST',
      body: JSON.stringify({
        userId: booklubUser.id  // Use database ID, not Clerk ID
      })
    });
    // ... rest of code
  }
}
```

**Prevention:**
Always use database user ID for backend API calls, never Clerk ID.

**Components Fixed:**
- ✅ MyClubs.js
- ✅ CreateClubModal.js
- ✅ JoinClubModal.js
- ✅ ClubChat.js

**When Adding New Features:**
Always follow this pattern when any component needs to send user ID to the backend.

---

### Hardcoded localhost URLs

**Symptoms:**
- Works locally but fails on production
- Network tab shows requests to `localhost:3001`
- "Failed to fetch" errors on Cloudflare deployment

**Diagnosis:**
```bash
# Search for hardcoded localhost URLs
grep -r "localhost:3001" frontend/src/
```

**Solution:**
1. Import API_URL from config:
```javascript
import { API_URL } from '../config';
```

2. Use it in fetch calls:
```javascript
const response = await fetch(`${API_URL}/api/clubs?userId=${userId}`);
```

**Files to check:**
- `frontend/src/config.js` - Should define API_URL from env var
- All page and component files making API calls

---

## 🚀 Deployment Issues

### Cloudflare Not Picking Up Changes

**Symptoms:**
- Code merged to main but old version still deployed
- Changes work locally but not on production
- Cloudflare shows old deployment as latest

**Diagnosis:**
```bash
# Check what's on main branch
git log origin/main --oneline -5

# Check Cloudflare deployment status
# Go to: https://dash.cloudflare.com/ → Pages → booklub → Deployments
```

**Solution 1: Trigger Manual Deployment**
1. Go to Cloudflare Pages dashboard
2. Click "Retry deployment" on latest deployment

**Solution 2: Push Empty Commit**
```bash
git commit --allow-empty -m "Trigger deployment"
git push origin main
```

**Solution 3: Check Build Settings**
Verify Cloudflare is watching the correct branch (should be `main`).

---

### Render Backend Not Starting

**Symptoms:**
- Backend returns 503 errors
- Render dashboard shows service as "deploying" or "failed"
- Health check endpoint doesn't respond

**Diagnosis:**
Check Render logs for startup errors:
1. Go to Render dashboard
2. Select booklub-app service
3. Click "Logs" tab
4. Look for errors in startup sequence

**Common Causes:**
1. Missing environment variables
2. Database connection failure
3. Invalid DATABASE_URL format

**Solution:**
Verify environment variables in Render:
```
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
NODE_ENV=production
```

Test health endpoint:
```bash
curl https://booklub-app.onrender.com/api/health
# Should return: {"status":"ok","message":"BooKlub API is running"}
```

---

## 🗄️ Database Issues

### Connection Errors

**Symptoms:**
- "Failed to connect to database" errors
- Timeout errors in Render logs
- 500 errors on all API calls

**Diagnosis:**
```bash
# Test DATABASE_URL format
echo $DATABASE_URL
# Should be: postgresql://user:pass@host:port/dbname?sslmode=require
```

**Solution:**
1. Verify DATABASE_URL in Render environment variables
2. Check Neon dashboard for connection string
3. Ensure `sslmode=require` is in connection string
4. Check if Neon database is paused (free tier pauses after inactivity)

**Format:**
```
postgresql://user:password@host:port/database?sslmode=require&channel_binding=require
```
(Check Render environment variables for actual connection string)

---

### User Not Found Errors

**Symptoms:**
- "User not found" error when accessing clubs
- 404 from `/api/users/clerk/{clerkId}`
- User can sign in but can't use features

**Diagnosis:**
Check if user was created in database:
```sql
SELECT * FROM users WHERE clerk_id = 'user_37xf2hsa6gyK5ugr7ZTh3nNlQGn';
```

**Solution:**
The App.js should auto-create users on first sign-in. If not working:
1. Check App.js syncUser function
2. Verify `/api/users` POST endpoint works
3. Check Render logs for database errors during user creation

---

## 🖥️ Local Development Issues

### Backend Won't Start

**Symptoms:**
- "Cannot find module" errors
- Port already in use
- Database connection errors

**Solutions:**

**Missing Dependencies:**
```bash
cd backend
npm install
```

**Port In Use:**
```bash
# Find process using port 3001
lsof -i :3001
# Kill it
kill -9 <PID>
```

**Database Connection:**
Check `backend/.env` exists and has valid DATABASE_URL.

---

### Frontend Won't Start

**Symptoms:**
- "react-scripts: command not found"
- Module not found errors
- Blank page on localhost:3000

**Solutions:**

**Missing Dependencies:**
```bash
cd frontend
npm install
```

**Missing .env.local:**
Create `frontend/.env.local`:
```
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_[your-clerk-key]
REACT_APP_API_URL=http://localhost:3001
```
(Copy actual Clerk key from Cloudflare Pages environment variables)

**Clear Cache:**
```bash
rm -rf node_modules
npm install
npm start
```

---

## 🔍 Debugging Checklist

When something doesn't work, check in this order:

### 1. Check Browser Console
- Open DevTools (F12)
- Look for red error messages
- Check Network tab for failed requests

### 2. Check Render Logs
- Go to Render dashboard → Logs
- Look for errors when you trigger the issue
- Check if requests are reaching backend

### 3. Check Environment Variables
- Cloudflare Pages: Settings → Environment variables
- Render: Service → Environment
- Verify all required vars are set

### 4. Check Latest Deployment
- Cloudflare: Deployments tab → Check latest is successful
- Render: Should show "Live" status
- Verify timestamps are recent

### 5. Test Endpoints Directly
```bash
# Health check
curl https://booklub-app.onrender.com/api/health

# Books
curl https://booklub-app.onrender.com/api/books

# User lookup (replace with actual clerk_id)
curl https://booklub-app.onrender.com/api/users/clerk/user_xxxxx
```

---

## 🆘 Emergency Commands

### Force Redeploy Everything
```bash
# Make an empty commit to trigger deployments
git commit --allow-empty -m "Force redeploy"
git push origin main
```

### Restart Render Service
1. Go to Render dashboard
2. Click service name
3. Click "Manual Deploy" → "Deploy latest commit"

### Clear Cloudflare Cache
1. Go to Cloudflare dashboard
2. Click your site
3. Go to Caching → Purge Everything

### Check What's Actually Deployed
```bash
# Check deployed code on Cloudflare
# View source of: https://booklub.pages.dev
# Search for API_URL references to verify correct version

# Check backend version
curl https://booklub-app.onrender.com/api/health
```

---

## 📝 Known Issues

### Duplicate MyClubs Files
- `MyClubs.js` and `MyClubs.jsx` both exist
- Only `MyClubs.js` is imported and used
- Editing `MyClubs.jsx` will have no effect!
- Always edit `MyClubs.js`

### Worktree Setup
- Working directory is a git worktree
- Can't easily switch branches with `git checkout`
- Use PR workflow: branch → PR → merge to main

---

## 🎯 Quick Fixes

### Can't sign in
→ Check REACT_APP_CLERK_PUBLISHABLE_KEY starts with `pk_test_`

### Clubs won't load
→ Check Render logs for "invalid input syntax for type integer"
→ Frontend needs to convert Clerk ID to database ID

### Changes not deploying
→ Verify changes are merged to `main` branch
→ Check Cloudflare deployment status

### 404 on API calls
→ Verify REACT_APP_API_URL is set correctly
→ Should be: https://booklub-app.onrender.com

### Database errors
→ Check DATABASE_URL in Render
→ Verify Neon database is not paused

---

**Pro Tip:** Always check Render logs first when debugging API issues. They show the exact error message from the backend.

---

**End of Troubleshooting Guide**
