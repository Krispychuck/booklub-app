# BooKlub Deployment Guide

Complete guide to deploying BooKlub to production using Cloudflare Pages (frontend), Railway (backend), and Neon (database).

## Architecture Overview

```
┌─────────────────────┐
│  Cloudflare Pages   │  ← React Frontend (Static)
│  (Global CDN)       │
└──────────┬──────────┘
           │ HTTPS
           ↓
┌─────────────────────┐
│  Railway            │  ← Express Backend (API)
│  (Serverless/VPS)   │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Neon Postgres      │  ← Database
│  (Serverless DB)    │
└─────────────────────┘
```

## Prerequisites

1. **Accounts needed:**
   - [Cloudflare account](https://dash.cloudflare.com/sign-up) (free)
   - [Railway account](https://railway.app/) (free tier: $5 credit/month)
   - [Neon account](https://neon.tech/) (free tier available)
   - [Clerk account](https://clerk.com/) (free tier available)
   - [Anthropic API key](https://console.anthropic.com/) (pay-as-you-go)

2. **Local tools:**
   - Git
   - Node.js 18+
   - PostgreSQL client (optional, for testing)

## Step 1: Set Up Neon Database

### 1.1 Create Database

1. Go to [Neon Console](https://console.neon.tech/)
2. Click "Create Project"
3. Choose a region (pick closest to your users)
4. Project name: `booklub-db` (or your preference)
5. Click "Create Project"

### 1.2 Get Connection String

1. In your Neon project dashboard, click "Connection Details"
2. Copy the connection string (it looks like):
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```
3. Save this for later - you'll need it for Railway

### 1.3 Initialize Database Schema

**Option A: Using Neon SQL Editor (Recommended)**

1. In Neon Console, go to "SQL Editor"
2. Copy the contents of `database/init.sql`
3. Paste into the SQL Editor
4. Click "Run" to execute

**Option B: Using psql CLI**

```bash
# From project root
psql "postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require" -f database/init.sql
```

### 1.4 Verify Setup

Run this query in Neon SQL Editor to verify:

```sql
SELECT 'Books' as table_name, COUNT(*) as count FROM books
UNION ALL SELECT 'Users', COUNT(*) FROM users;
```

You should see 5 books.

---

## Step 2: Set Up Clerk Authentication

### 2.1 Create Clerk Application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Click "Add application"
3. Application name: `BooKlub`
4. Sign-in options: Enable Email (required)
5. Click "Create application"

### 2.2 Get API Keys

1. In Clerk Dashboard → "API Keys"
2. Copy the **Publishable key** (starts with `pk_test_...` or `pk_live_...`)
3. Save for later - you'll use this in Cloudflare Pages

### 2.3 Configure Allowed Domains (After Deployment)

After deploying, you'll need to add your Cloudflare Pages URL:

1. Clerk Dashboard → "Domains"
2. Add your production domain (e.g., `booklub.pages.dev`)

---

## Step 3: Deploy Backend to Railway

### 3.1 Create Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Connect your GitHub account if needed
5. Select your `booklub-app` repository
6. Railway will detect the `railway.toml` configuration

### 3.2 Add PostgreSQL Service (Skip - Using Neon)

We're using Neon instead of Railway's built-in Postgres, so skip adding a database service.

### 3.3 Configure Environment Variables

1. In your Railway project, click on the service
2. Go to "Variables" tab
3. Add these environment variables:

```
DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
ANTHROPIC_API_KEY=sk-ant-xxxxx
PORT=3001
```

**Where to get these values:**
- `DATABASE_URL`: From Neon (Step 1.2)
- `ANTHROPIC_API_KEY`: From [Anthropic Console](https://console.anthropic.com/)
- `PORT`: Use `3001` (or Railway's default `$PORT`)

### 3.4 Deploy

1. Railway will automatically deploy when you push to GitHub
2. Wait for deployment to complete (check "Deployments" tab)
3. Once deployed, click "Settings" → "Generate Domain"
4. Save your backend URL (e.g., `https://booklub-backend-production.railway.app`)

### 3.5 Verify Backend

Test your backend is working:

```bash
# Replace with your Railway URL
curl https://your-app.railway.app/api/health

# Should return: {"status":"ok"}
```

---

## Step 4: Deploy Frontend to Cloudflare Pages

### 4.1 Connect Repository

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select "Workers & Pages" → "Pages"
3. Click "Create application" → "Connect to Git"
4. Connect your GitHub account
5. Select your `booklub-app` repository

### 4.2 Configure Build Settings

**Framework preset:** `Create React App`

**Build settings:**
- Build command: `npm run build:pages`
- Build output directory: `frontend/build`
- Root directory: `/` (leave as default)

**Environment variables** (click "Add environment variable"):

```
NODE_VERSION=18
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
REACT_APP_API_URL=https://your-app.railway.app
```

**Where to get these values:**
- `REACT_APP_CLERK_PUBLISHABLE_KEY`: From Clerk (Step 2.2)
- `REACT_APP_API_URL`: Your Railway backend URL (Step 3.4)

### 4.3 Deploy

1. Click "Save and Deploy"
2. Wait for build to complete (3-5 minutes)
3. Once deployed, you'll get a URL like `https://booklub.pages.dev`
4. Click the URL to test your app!

### 4.4 Custom Domain (Optional)

To use your own domain:

1. In Cloudflare Pages → Your project → "Custom domains"
2. Click "Set up a custom domain"
3. Enter your domain (e.g., `booklub.com`)
4. Follow DNS configuration instructions

---

## Step 5: Configure CORS (Backend)

After deploying the frontend, update your backend to allow requests from Cloudflare Pages.

### 5.1 Update Railway Environment

1. Go to Railway → Your service → "Variables"
2. Add or update:

```
CORS_ORIGIN=https://booklub.pages.dev
```

(Use your actual Cloudflare Pages URL)

### 5.2 Update backend/server.js (if needed)

If your backend doesn't already have CORS configured, check `backend/server.js`:

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
```

Railway will automatically redeploy when you push changes.

---

## Step 6: Update Clerk Configuration

Now that both frontend and backend are deployed:

1. Go to Clerk Dashboard → "Domains"
2. Add your Cloudflare Pages domain:
   - Production: `https://booklub.pages.dev`
   - Custom domain (if using): `https://yourdomain.com`

---

## Step 7: Test Production Deployment

### 7.1 Functionality Checklist

Visit your Cloudflare Pages URL and test:

- [ ] Homepage loads and displays 5 books
- [ ] Sign in with Clerk works
- [ ] Display name modal appears for new users
- [ ] Can create a book club
- [ ] Can join a club with invite code
- [ ] Chat interface loads
- [ ] Can post messages
- [ ] "Ask Author" button triggers AI response
- [ ] Members modal shows club members
- [ ] Can leave a club
- [ ] Creator can delete a club

### 7.2 Check Browser Console

Open DevTools (F12) and check:
- No CORS errors
- API calls go to Railway backend (not localhost)
- No authentication errors

### 7.3 Check Railway Logs

In Railway → Your service → "Deployments" → Click latest deployment → "View Logs"

Look for:
- Database connection successful
- API requests being received
- No errors

---

## Environment Variables Reference

### Backend (.env)

```bash
DATABASE_URL=postgresql://username:password@host/dbname?sslmode=require
ANTHROPIC_API_KEY=sk-ant-xxxxx
PORT=3001
CORS_ORIGIN=https://booklub.pages.dev
```

### Frontend (.env.local)

```bash
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
REACT_APP_API_URL=https://your-app.railway.app
```

---

## Costs Breakdown

### Free Tier Limits

- **Cloudflare Pages:** Unlimited (free forever)
- **Railway:** $5 credit/month (renews monthly, ~500 hours)
- **Neon:** 3 GB storage, 1 compute instance (free forever)
- **Clerk:** 10,000 monthly active users (free)
- **Anthropic API:** Pay-as-you-go (~$0.003 per 1K input tokens)

### Expected Monthly Costs

For a small book club app with ~50 users:
- Cloudflare Pages: **$0**
- Railway: **$0** (within free tier)
- Neon: **$0** (within free tier)
- Clerk: **$0** (within free tier)
- Anthropic API: **~$2-5** (depends on chat volume)

**Total: ~$2-5/month** (just Anthropic API usage)

---

## CI/CD & Updates

### Automatic Deployments

Both Railway and Cloudflare Pages support automatic deployments:

1. **Push to GitHub** → Triggers automatic deployment
2. **Railway** redeploys backend
3. **Cloudflare Pages** rebuilds and redeploys frontend

### Manual Deployment

**Railway:**
```bash
# Push to GitHub
git push origin main

# Railway automatically deploys
```

**Cloudflare Pages:**
- Same as Railway - push to GitHub triggers rebuild

---

## Troubleshooting

### Frontend can't connect to backend

**Check:**
1. `REACT_APP_API_URL` in Cloudflare Pages env vars is correct
2. Backend is running (visit `https://your-app.railway.app/api/health`)
3. CORS is configured correctly in backend

**Fix:**
- Rebuild Cloudflare Pages with correct `REACT_APP_API_URL`
- Add `CORS_ORIGIN` in Railway with your Pages URL

### Database connection errors

**Check:**
1. `DATABASE_URL` in Railway is correct
2. Neon database is active (not suspended)
3. SSL mode is enabled (`?sslmode=require`)

**Fix:**
- Verify connection string in Railway matches Neon
- Check Neon project status in console

### Clerk authentication fails

**Check:**
1. `REACT_APP_CLERK_PUBLISHABLE_KEY` is correct
2. Cloudflare Pages domain is added in Clerk Dashboard → "Domains"
3. Using correct Clerk key (test vs production)

**Fix:**
- Add your Pages domain to Clerk allowed domains
- Verify publishable key in Cloudflare env vars

### AI responses not working

**Check:**
1. `ANTHROPIC_API_KEY` is set in Railway
2. API key has credits/is valid
3. Check Railway logs for API errors

**Fix:**
- Verify API key at https://console.anthropic.com/
- Check Anthropic usage limits

### "Book not found" or database errors

**Cause:** Database schema not initialized

**Fix:**
- Run `database/init.sql` in Neon SQL Editor
- Verify 5 books exist: `SELECT COUNT(*) FROM books;`

---

## Rollback Strategy

If deployment fails:

### Railway Rollback

1. Railway → Your service → "Deployments"
2. Find previous working deployment
3. Click "⋮" → "Redeploy"

### Cloudflare Pages Rollback

1. Cloudflare Pages → Your project → "Deployments"
2. Find previous successful deployment
3. Click "⋮" → "Rollback to this deployment"

---

## Security Checklist

Before going live:

- [ ] All `.env` files are in `.gitignore`
- [ ] No API keys committed to Git
- [ ] CORS configured to specific domain (not `*`)
- [ ] Clerk production keys used (not test keys)
- [ ] Database has proper indexes (included in `init.sql`)
- [ ] Rate limiting configured (consider adding to backend)
- [ ] HTTPS enabled everywhere (automatic with Cloudflare/Railway)

---

## Production Optimizations (Future)

When you're ready to scale:

1. **Database:**
   - Upgrade Neon to paid tier for better performance
   - Add read replicas for high traffic

2. **Backend:**
   - Add Redis caching for frequent queries
   - Implement rate limiting (express-rate-limit)
   - Add request logging (morgan)

3. **Frontend:**
   - Enable Cloudflare Web Analytics
   - Add error tracking (Sentry)
   - Optimize bundle size (code splitting)

4. **Monitoring:**
   - Set up Uptime monitoring (UptimeRobot)
   - Configure Railway alerts for errors
   - Monitor Anthropic API usage

---

## Support & Resources

- **Railway Docs:** https://docs.railway.app/
- **Cloudflare Pages Docs:** https://developers.cloudflare.com/pages/
- **Neon Docs:** https://neon.tech/docs/
- **Clerk Docs:** https://clerk.com/docs
- **Anthropic API Docs:** https://docs.anthropic.com/

---

## Next Steps

After deployment:
1. Add 15-25 more books (Phase 6 of roadmap)
2. Customize AI author prompts for better responses
3. Monitor usage and optimize costs
4. Gather user feedback
5. Consider adding features from roadmap

**Congratulations! Your BooKlub app is now live! 🎉📚**
