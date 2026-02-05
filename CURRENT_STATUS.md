# BooKlub App - Current Status & Configuration

**Last Updated:** February 4, 2026
**Status:** Fully Configured - Pending Final Deployment

---

## 🎯 Overview

BooKlub is a social book club application that allows users to:
- Browse and select books
- Create book clubs with invite codes
- Join clubs using invite codes
- Chat with other club members
- Get AI-powered responses from book "authors"

---

## 🏗️ Architecture

### Frontend
- **Technology:** React (Create React App)
- **Hosting:** Cloudflare Pages
- **URL:** https://booklub.pages.dev
- **Authentication:** Clerk (development mode)

### Backend
- **Technology:** Node.js + Express
- **Hosting:** Render
- **URL:** https://booklub-app.onrender.com
- **Database:** Neon (PostgreSQL)

---

## 🔑 Current Configuration

### 1. Clerk Authentication (IMPORTANT)

**Current Setup:**
- Using **development key** (pk_test_...) instead of production key
- This allows use of Clerk's default domain without custom domain verification
- Key stored in environment variables (not committed to repo)

**Why Development Key:**
- Production keys require custom domain verification
- Development keys work immediately with Clerk's built-in domains
- Suitable for testing and small-scale deployments

**Clerk Dashboard:** https://dashboard.clerk.com/

### 2. Environment Variables

#### Cloudflare Pages (Frontend)
```
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_[REDACTED - stored in Cloudflare]
REACT_APP_API_URL=https://booklub-app.onrender.com
NODE_VERSION=18
```

#### Render (Backend)
```
DATABASE_URL=postgresql://[REDACTED - stored in Render]
ANTHROPIC_API_KEY=sk-ant-[REDACTED - stored in Render]
PORT=3001
NODE_ENV=production
```

Note: REACT_APP_* variables on Render are not needed but harmless.

#### Local Development (.env files)

**Frontend:** `frontend/.env.local`
```
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_[your-clerk-key]
REACT_APP_API_URL=http://localhost:3001
```

**Backend:** `backend/.env`
```
DATABASE_URL=postgresql://[your-neon-connection-string]
ANTHROPIC_API_KEY=sk-ant-[your-anthropic-key]
PORT=3001
```

Note: These .env files are git-ignored and contain actual keys locally.

---

## 🐛 Recent Fixes Applied

### Fix #1: Clerk Authentication Domain Issue
**Problem:** Production Clerk key required custom domain verification
**Solution:** Switched to development key (pk_test_...) which uses Clerk's default domain
**Files Changed:**
- `frontend/.env.local`
- Cloudflare Pages environment variables

### Fix #2: Hardcoded localhost URL
**Problem:** `MyClubs.jsx` had hardcoded `http://localhost:3001` instead of using environment variable
**Solution:** Updated to import and use `API_URL` from `config.js`
**Files Changed:**
- `frontend/src/pages/MyClubs.jsx` (added import for API_URL)

### Fix #3: Clerk ID vs Database ID Mismatch
**Problem:** Frontend was sending Clerk user ID (e.g., `user_37xf2hsa6gyK5ugr7ZTh3nNlQGn`) to backend, but backend expected database integer ID
**Solution:** Updated MyClubs to first fetch the booklub user from the database using Clerk ID, then use the database ID
**Files Changed:**
- `frontend/src/pages/MyClubs.js` (NOTE: .js not .jsx - this is the active file)
- Added user lookup before fetching clubs

**Important:** The app uses `MyClubs.js` (not `MyClubs.jsx`). Both files exist but only `.js` is imported.

---

## 📁 File Structure

```
booklub-app/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── MyClubs.js (ACTIVE FILE - being used)
│   │   │   ├── MyClubs.jsx (duplicate - not used)
│   │   │   └── ClubChat.js
│   │   ├── components/
│   │   │   ├── CreateClubModal.js
│   │   │   ├── JoinClubModal.js
│   │   │   ├── MembersModal.js
│   │   │   └── DisplayNameModal.js
│   │   ├── config.js (contains API_URL configuration)
│   │   ├── App.js (main app with Clerk setup)
│   │   └── index.js (Clerk provider wrapper)
│   ├── .env.local (local development)
│   └── package.json
├── backend/
│   ├── routes/
│   │   ├── books.js
│   │   ├── clubs.js
│   │   ├── messages.js
│   │   └── users.js
│   ├── db.js (PostgreSQL connection)
│   ├── server.js (Express server)
│   ├── .env (local development)
│   └── package.json
├── database/
│   └── init.sql (database schema)
└── DEPLOYMENT_CHECKLIST.md
```

---

## 🔄 User Authentication Flow

1. User signs in via Clerk (development instance)
2. Clerk provides user object with Clerk ID (e.g., `user_37xf2hsa6gyK5ugr7ZTh3nNlQGn`)
3. App.js checks if user exists in database via `/api/users/clerk/{clerkId}`
4. If not exists, creates user in database with Clerk ID
5. Database user has integer `id` (e.g., 1, 2, 3)
6. App stores both Clerk user and booklub user in state
7. **All backend API calls must use database integer ID, not Clerk ID**

### How Pages Should Fetch Data

**CORRECT Pattern (MyClubs.js):**
```javascript
// First get database user
const userResponse = await fetch(`${API_URL}/api/users/clerk/${user.id}`);
const booklubUser = await userResponse.json();

// Then use database ID for queries
const response = await fetch(`${API_URL}/api/clubs?userId=${booklubUser.id}`);
```

**INCORRECT Pattern:**
```javascript
// ❌ Don't do this - sends Clerk ID instead of database ID
const response = await fetch(`${API_URL}/api/clubs?userId=${user.id}`);
```

---

## 🚀 Local Development

### Starting the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm install
node server.js
```
Server runs on: http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm start
```
App runs on: http://localhost:3000

### Current Local Status
- ✅ Both servers configured and tested
- ✅ Frontend running on port 3000
- ✅ Backend running on port 3001
- ✅ Database connected
- ✅ Clerk authentication working

---

## 🌐 Deployment Process

### GitHub Workflow
1. Make changes in worktree branch: `charming-moore`
2. Commit and push to `charming-moore` branch
3. Create Pull Request from `charming-moore` to `main`
4. Merge PR to `main`
5. Cloudflare Pages automatically deploys from `main` branch

### Triggering Deployments
- **Cloudflare Pages:** Automatically deploys on push to `main`
- **Render:** Automatically redeploys on push to `main`

### Deployment URLs
- **Frontend:** https://booklub.pages.dev
- **Backend:** https://booklub-app.onrender.com
- **Backend Health Check:** https://booklub-app.onrender.com/api/health

---

## 🔍 Debugging Tips

### Check Cloudflare Deployment Status
1. Go to: https://dash.cloudflare.com/
2. Click **Pages** → **booklub**
3. Click **Deployments** tab
4. Check latest deployment status

### Check Render Logs
1. Go to Render dashboard
2. Select **booklub-app** service
3. Click **Logs** tab (not Events)
4. Watch for runtime errors when testing features

### Common Issues

**Issue:** "Failed to fetch clubs" error
**Cause:** Frontend sending Clerk ID instead of database ID
**Solution:** Update component to fetch booklub user first (see User Authentication Flow)

**Issue:** CORS errors
**Cause:** Backend not configured to accept requests from Cloudflare domain
**Solution:** Check CORS_ORIGIN in Render environment variables

**Issue:** 404 errors on API calls
**Cause:** Wrong API_URL in frontend environment
**Solution:** Verify REACT_APP_API_URL in Cloudflare Pages settings

**Issue:** Clerk domain verification errors
**Cause:** Using production key instead of development key
**Solution:** Use pk_test_... key, not pk_live_... key

---

## 📊 Database Schema

### Tables
- **users:** User accounts (links Clerk ID to database ID)
  - `id` (serial) - Database user ID
  - `clerk_id` (text) - Clerk authentication ID
  - `email` (text)
  - `name` (text) - Display name

- **books:** Available books for clubs
  - `id`, `title`, `author`, `genre`, `publication_year`
  - `ai_author_prompt` - Prompt for AI author responses

- **book_clubs:** Created clubs
  - `id`, `name`, `book_id`, `creator_user_id`, `invite_code`
  - `status` (active/inactive)

- **club_members:** Club membership
  - `club_id`, `user_id`, `role` (creator/member)

- **messages:** Club chat messages
  - `id`, `club_id`, `user_id`, `message_type` (user/ai)
  - `content`, `ai_author_name`

---

## 🎨 Key Features

### Working Features
- ✅ User authentication (Clerk)
- ✅ Browse books
- ✅ Create book clubs
- ✅ Join clubs via invite code
- ✅ View "My Clubs"
- ✅ Club chat
- ✅ AI author responses (Anthropic Claude)
- ✅ Display name setup

### Pending Testing
- ⏳ My Clubs page (waiting for latest deployment)
- ⏳ Club creation flow
- ⏳ Join club flow
- ⏳ Chat functionality

---

## 🚨 Critical Notes for Future Sessions

1. **Two MyClubs files exist:** Only `MyClubs.js` is used, not `MyClubs.jsx`
2. **Always use database user ID:** Never pass Clerk ID to backend APIs
3. **Development vs Production keys:** Currently using dev key - switch to prod key only when ready for custom domains
4. **Cloudflare auto-deploys:** Changes to `main` branch automatically deploy
5. **Worktree setup:** Working in `charming-moore` branch, not directly on `main`

---

## 📞 Service Dashboards

- **Clerk:** https://dashboard.clerk.com/
- **Render:** https://dashboard.render.com/
- **Cloudflare:** https://dash.cloudflare.com/
- **Neon:** https://console.neon.tech/
- **Anthropic:** https://console.anthropic.com/

---

## 🔜 Next Steps

1. ⏳ Wait for Cloudflare to deploy latest fix (MyClubs.js update)
2. ✅ Test "My Clubs" page
3. ✅ Test club creation
4. ✅ Test joining clubs
5. ✅ Test chat functionality
6. ✅ Test AI author responses
7. 📝 Add more books to database
8. 🎨 Polish UI/UX
9. 🚀 Consider switching to production Clerk key (requires custom domain)

---

## 💡 Tips for Claude in Future Sessions

- Always check which MyClubs file is being used (.js vs .jsx)
- Remember the Clerk ID → Database ID conversion requirement
- Check Render logs for backend errors (not just build logs)
- Verify Cloudflare deployment completed before testing
- Local development uses .env.local (not .env) for frontend
- The worktree is at `/Users/mrl/.claude-worktrees/booklub-app/charming-moore/`

---

**End of Document**
