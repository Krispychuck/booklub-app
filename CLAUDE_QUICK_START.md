# Quick Start Guide for Claude

When starting a new session about BooKlub, read this first!

---

## 📍 Current Status

**App Name:** BooKlub - Social Book Club Platform
**Owner:** Non-technical user (handle everything via Claude)
**Location:** `/Users/mrl/.claude-worktrees/booklub-app/charming-moore/`
**Branch:** `charming-moore` (worktree - merge to `main` to deploy)

---

## 🚀 Quick Facts

### URLs
- **Production:** https://booklub.pages.dev
- **Backend:** https://booklub-app.onrender.com
- **Health Check:** https://booklub-app.onrender.com/api/health

### Stack
- **Frontend:** React → Cloudflare Pages
- **Backend:** Node.js/Express → Render
- **Database:** PostgreSQL → Neon
- **Auth:** Clerk (development mode)
- **AI:** Anthropic Claude API

### Key Files to Check
- `ARCHITECTURE.md` - **READ THIS FIRST** - System architecture, data flows, component responsibilities
- `DESIGN_SYSTEM.md` - Button styles, colors, typography (vintage gold as primary!)
- `CURRENT_STATUS.md` - Full configuration details
- `TROUBLESHOOTING.md` - Debugging guide
- `frontend/src/pages/MyClubs.js` - Most recently fixed (NOT .jsx!)
- `frontend/src/config.js` - API URL configuration

**NOTE:** When making architectural changes (new components, API endpoints, services), update `ARCHITECTURE.md` to keep it current!

---

## ⚠️ Critical Things to Remember

### 1. **Two MyClubs Files Exist**
- `MyClubs.js` ← **This one is used**
- `MyClubs.jsx` ← This is NOT used (ignore it!)

Always edit `MyClubs.js`, not `.jsx`!

### 2. **Clerk ID vs Database ID** (CRITICAL - MOST COMMON BUG)
- Clerk user ID: `user_37xf2hsa6gyK5ugr7ZTh3nNlQGn` (string)
- Database user ID: `1`, `2`, `3` (integer)
- **Backend APIs require database ID, not Clerk ID!**

**All components now properly convert Clerk ID to Database ID:**
- ✅ MyClubs.js
- ✅ CreateClubModal.js
- ✅ JoinClubModal.js
- ✅ ClubChat.js

Correct pattern (used in all components):
```javascript
// Always fetch database user first
const userResponse = await fetch(`${API_URL}/api/users/clerk/${user.id}`);
const booklubUser = await userResponse.json();

// Then use database ID
const response = await fetch(`${API_URL}/api/clubs?userId=${booklubUser.id}`);
```

**When adding new features:** Always use this pattern if the backend needs user ID!

### 3. **Using Development Clerk Key**
- Current key: `pk_test_...` (development)
- Works with Clerk's default domain (no verification needed)
- Don't switch to `pk_live_` unless custom domain is verified

### 4. **Worktree Git Workflow**
Can't use `git checkout main` (it's in a worktree). Use PR workflow:
1. Commit to `charming-moore` branch
2. Push to GitHub
3. Create PR from `charming-moore` to `main`
4. Merge PR
5. Cloudflare auto-deploys from `main`

### 5. **Worktree Setup (Cleaned Up Feb 5, 2026)**
The repository uses Git worktrees for parallel development:
- **Main repo:** `/Users/mrl/booklub-app` (main branch)
- **Active development:** `/Users/mrl/.claude-worktrees/booklub-app/charming-moore/` ⭐
- **Archive:** `/Users/mrl/.claude-worktrees/booklub-app/compassionate-haibt/` (Mind Map history)

**Note:** Old worktrees (eager-maxwell, nostalgic-khorana, silly-faraday, youthful-tu) were cleaned up.

**Feature Recovery Pattern:**
If features seem missing, check the compassionate-haibt archive:
  ```bash
  cp /Users/mrl/.claude-worktrees/booklub-app/compassionate-haibt/frontend/src/components/SomeFeature.* \
     /Users/mrl/.claude-worktrees/booklub-app/charming-moore/frontend/src/components/
  ```

---

## 🔧 Common Tasks

### Start Local Development
```bash
# Terminal 1 - Backend
cd /Users/mrl/.claude-worktrees/booklub-app/charming-moore/backend
node server.js

# Terminal 2 - Frontend
cd /Users/mrl/.claude-worktrees/booklub-app/charming-moore/frontend
npm start
```

### Deploy Changes
```bash
# 1. Commit changes
git add .
git commit -m "Your message

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# 2. Push to branch
git push origin charming-moore

# 3. Create PR manually (can't use gh CLI)
# Go to: https://github.com/Krispychuck/booklub-app/compare/main...charming-moore
# Click "Create pull request" → "Merge pull request"
```

### Check Logs
**Render Backend Logs:**
1. Go to Render dashboard
2. Click booklub-app service
3. Click "Logs" tab (NOT Events!)
4. Watch for runtime errors

**Browser Console:**
1. Open site: https://booklub.pages.dev
2. Press F12
3. Check Console tab for frontend errors
4. Check Network tab for API call failures

---

## 🐛 Quick Diagnostics

### "Failed to fetch clubs" / "Failed to create club" Errors
→ Check Render logs for "invalid input syntax for type integer"
→ Means frontend is sending Clerk ID instead of database ID
→ Fix: Update component to fetch booklub user first (pattern used in all components now)

### Changes Not Deploying
→ Verify changes merged to `main` branch
→ Check Cloudflare Pages deployments tab
→ Wait 2-3 minutes for build to complete

### Authentication Issues
→ Verify using `pk_test_` key, not `pk_live_`
→ Check REACT_APP_CLERK_PUBLISHABLE_KEY in Cloudflare

### API Calls Failing
→ Check REACT_APP_API_URL = https://booklub-app.onrender.com
→ Test backend health: `curl https://booklub-app.onrender.com/api/health`
→ Check Render logs for actual error messages

---

## 📋 Debugging Checklist

When user reports an issue:

1. **Ask user to check browser console** (F12 → Console tab)
2. **Check Render logs** for backend errors
3. **Verify latest deployment** is live on Cloudflare
4. **Test backend health** endpoint
5. **Check environment variables** in Cloudflare and Render

---

## 🎯 Recent Fixes Applied

1. ✅ Switched to Clerk development key (pk_test) - DEPLOYED & WORKING
2. ✅ Fixed hardcoded localhost URLs → use API_URL from config - DEPLOYED & WORKING
3. ✅ Fixed Clerk ID vs database ID in MyClubs.js - DEPLOYED & WORKING
4. ✅ Fixed Clerk ID vs database ID in ALL components:
   - CreateClubModal.js (create club feature)
   - JoinClubModal.js (join club feature)
   - ClubChat.js (club chat access)
5. ✅ User tested and confirmed working:
   - My Clubs page loading correctly
   - Club creation working
   - AI author responses working
6. ✅ Mind Map feature recovered from compassionate-haibt worktree:
   - Copied MindMapVisualization.js and .css files
   - Integrated into ClubChat.js with "Map Discussion" button
   - Installed D3.js dependency
   - Fixed API imports (API_BASE_URL → API_URL)
   - Ready for deployment

---

## 📚 Full Documentation

- **`ARCHITECTURE.md`** - **START HERE** - System architecture diagram, data flows, component responsibilities (keep this updated!)
- **`CURRENT_STATUS.md`** - Complete configuration, environment variables, all details
- **`TROUBLESHOOTING.md`** - Detailed debugging guide for every issue type
- **`DEPLOYMENT_CHECKLIST.md`** - Deployment process and verification steps
- **`DEVELOPMENT_ROADMAP.md`** - Feature tracking and project status

---

## 💬 User Context

- **Non-technical:** Don't assume Git/CLI knowledge
- **Handle everything:** Commit, push, create PRs, deploy, debug
- **Explain clearly:** Use step-by-step instructions with URLs
- **Show, don't tell:** Provide exact commands and URLs to click
- **Documentation:** User wants ARCHITECTURE.md kept up-to-date as system evolves

---

## 🎓 Key Learnings from This Session

1. Always check which file extension is actually being used (.js vs .jsx)
2. GitHub blocks commits with exposed secrets (redact in docs)
3. **CRITICAL:** Every component that sends user ID to backend needs Clerk ID → Database ID conversion
4. The Clerk ID bug appeared in multiple places - always check ALL components that make API calls
5. Render logs show runtime errors, not just build logs - check them for debugging
6. Cloudflare Pages needs time to deploy (2-3 minutes)
7. User is non-technical - handle everything (commits, PRs, deployments, debugging)
8. **IMPORTANT:** Features may exist in other worktrees - always check before rebuilding
9. Mind Map feature was previously developed but existed in different worktree (compassionate-haibt)
10. Branch cleanup is safe when working directory is clean and all work is committed

---

## ✅ Next Session Actions

1. ✅ ~~Ask user if "My Clubs" page works~~ - CONFIRMED WORKING
2. ✅ ~~Test club creation~~ - CONFIRMED WORKING
3. ✅ ~~Test joining clubs with invite codes~~ - CONFIRMED WORKING
4. ✅ ~~Test chat functionality~~ - CONFIRMED WORKING
5. ✅ ~~Test AI author responses in chat~~ - CONFIRMED WORKING (user tested)
6. ✅ ~~Recover Mind Map feature~~ - COMPLETED (from compassionate-haibt worktree)
7. ⏳ Merge and deploy Mind Map feature
8. 🧪 Test Mind Map visualization after deployment
9. 📝 Consider adding more books to database (15-25 books per roadmap)
10. 🧹 Clean up duplicate MyClubs.jsx file (after confirming everything works)
11. 📊 Consider adding error tracking/monitoring

---

**Pro Tip:** When in doubt, check Render logs first! They contain the actual error messages from the backend.

---

**Quick Links:**
- [GitHub Repo](https://github.com/Krispychuck/booklub-app)
- [Cloudflare Dashboard](https://dash.cloudflare.com/)
- [Render Dashboard](https://dashboard.render.com/)
- [Clerk Dashboard](https://dashboard.clerk.com/)

---

**Last Updated:** February 4, 2026
**Status:** All core features working ✅ | Mind Map feature recovered and ready for deployment ⏳

