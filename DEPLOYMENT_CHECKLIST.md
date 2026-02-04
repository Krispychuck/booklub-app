# Deployment Checklist

Use this checklist to track your deployment progress.

## Pre-Deployment Setup

### Accounts Created
- [ ] Neon account (database)
- [ ] Railway account (backend hosting)
- [ ] Cloudflare account (frontend hosting)
- [ ] Clerk account (authentication)
- [ ] Anthropic API key (AI responses)

### Credentials Collected
- [ ] Neon DATABASE_URL
- [ ] Anthropic API key
- [ ] Clerk publishable key

---

## Database Setup (Neon)

- [ ] Created Neon project
- [ ] Copied connection string
- [ ] Ran `database/init.sql` in SQL Editor
- [ ] Verified 5 books exist: `SELECT COUNT(*) FROM books;`
- [ ] Saved DATABASE_URL for Railway

---

## Authentication Setup (Clerk)

- [ ] Created Clerk application
- [ ] Enabled email sign-in
- [ ] Copied publishable key
- [ ] Saved for frontend deployment

---

## Backend Deployment (Railway)

### Initial Setup
- [ ] Created Railway project from GitHub
- [ ] Connected to your repository
- [ ] Railway detected `railway.toml`

### Environment Variables
- [ ] Added `DATABASE_URL` (from Neon)
- [ ] Added `ANTHROPIC_API_KEY`
- [ ] Added `PORT=3001`

### Verification
- [ ] Deployment completed successfully
- [ ] Generated Railway domain
- [ ] Saved Railway URL (e.g., `https://booklub-production.railway.app`)
- [ ] Tested health endpoint: `curl <Railway-URL>/api/health`
- [ ] Response is `{"status":"ok"}`

---

## Frontend Deployment (Cloudflare Pages)

### Initial Setup
- [ ] Connected GitHub to Cloudflare Pages
- [ ] Selected repository
- [ ] Configured build settings:
  - Build command: `npm run build:pages`
  - Output directory: `frontend/build`

### Environment Variables
- [ ] Added `NODE_VERSION=18`
- [ ] Added `REACT_APP_CLERK_PUBLISHABLE_KEY` (from Clerk)
- [ ] Added `REACT_APP_API_URL` (Railway URL)

### Verification
- [ ] Build completed successfully
- [ ] Saved Cloudflare Pages URL (e.g., `https://booklub.pages.dev`)
- [ ] Site loads in browser

---

## CORS Configuration

### Backend (Railway)
- [ ] Added `CORS_ORIGIN` environment variable with Pages URL
- [ ] Railway redeployed automatically

---

## Clerk Configuration

### Domain Setup
- [ ] Added Cloudflare Pages URL to Clerk allowed domains
- [ ] Added custom domain (if using)

---

## Final Testing

### Authentication Flow
- [ ] Can visit homepage
- [ ] Sign in button works
- [ ] Sign in with email works
- [ ] Display name modal appears for new users
- [ ] Can save display name
- [ ] User button shows in header

### Book Club Features
- [ ] Browse books page shows 5 books
- [ ] "START A CLUB" button works
- [ ] Can create a club with a name
- [ ] Gets invite code after creation
- [ ] Can view club in "My Clubs"

### Join Club Flow
- [ ] "Join Club" button works
- [ ] Can enter invite code
- [ ] Successfully joins club
- [ ] Club appears in "My Clubs"

### Chat Features
- [ ] Can open club chat
- [ ] Chat interface loads
- [ ] Can type messages
- [ ] "Group Comment" sends message
- [ ] "Ask Author" sends message + AI responds
- [ ] AI response appears in chat
- [ ] Messages show correct sender names
- [ ] Can delete own messages

### Members & Club Management
- [ ] "Members" button shows member list
- [ ] Creator sees "Delete Club" button
- [ ] All members see "Leave Club" button
- [ ] Leave club works (redirects to My Clubs)
- [ ] Delete club works (creator only)

### Browser Console
- [ ] No CORS errors
- [ ] API calls go to Railway (not localhost)
- [ ] No authentication errors
- [ ] No 404s or 500s

### Railway Logs
- [ ] No database connection errors
- [ ] API requests being logged
- [ ] No unhandled errors

---

## Post-Deployment

### Documentation
- [ ] Update README with production URLs
- [ ] Document any custom configuration
- [ ] Share invite codes with beta users

### Monitoring
- [ ] Bookmark Railway dashboard
- [ ] Bookmark Cloudflare analytics
- [ ] Bookmark Neon console
- [ ] Set up billing alerts (if needed)

### Optional Enhancements
- [ ] Custom domain configured
- [ ] Analytics tracking added
- [ ] Error monitoring (Sentry) configured
- [ ] Uptime monitoring enabled

---

## Rollback Plan (If Needed)

If something goes wrong:

### Railway
- [ ] Know how to access "Deployments" tab
- [ ] Know how to redeploy previous version

### Cloudflare Pages
- [ ] Know how to access deployment history
- [ ] Know how to rollback to previous deployment

---

## Success Criteria

Your deployment is successful when:

- ✅ Users can sign in with Clerk
- ✅ Users can browse books
- ✅ Users can create book clubs
- ✅ Users can join clubs with invite codes
- ✅ Users can chat in clubs
- ✅ AI author responses work
- ✅ No errors in browser console
- ✅ No errors in Railway logs
- ✅ All CRUD operations work (Create, Read, Update, Delete)

---

## Cost Monitoring

### Free Tier Limits
- **Railway:** $5 credit/month (~500 hours)
- **Neon:** 3 GB storage
- **Cloudflare Pages:** Unlimited
- **Clerk:** 10,000 MAU

### Set Alerts
- [ ] Railway: Set up usage alerts at 80% ($4)
- [ ] Anthropic: Monitor API usage weekly
- [ ] Neon: Check storage usage monthly

---

## Next Steps After Deployment

1. [ ] Add more books (see roadmap Phase 6)
2. [ ] Customize AI author prompts
3. [ ] Gather user feedback
4. [ ] Share with friends for testing
5. [ ] Plan next features

---

**Deployment Date:** _________________

**Deployed By:** _________________

**Production URLs:**
- Frontend: _________________________________
- Backend: __________________________________

**Notes:**
_______________________________________________________
_______________________________________________________
_______________________________________________________
