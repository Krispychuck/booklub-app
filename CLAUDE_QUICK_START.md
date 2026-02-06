# Quick Start Guide for Claude

When starting a new session about BooKlub, read this first!

---

## Current Status

**App Name:** BooKlub - Social Book Club Platform
**Owner:** Non-technical user (handle everything via Claude)
**Location:** `/Users/mrl/.claude-worktrees/booklub-app/charming-moore/`
**Branch:** `charming-moore` (worktree — merge to `main` to deploy)
**Last Updated:** February 6, 2026
**Status:** Production — All core features + Mind Map live

---

## Quick Facts

### URLs
- **Production:** https://booklub.pages.dev
- **Backend:** https://booklub-app.onrender.com
- **Health Check:** https://booklub-app.onrender.com/api/health

### Stack
- **Frontend:** React → Cloudflare Pages
- **Backend:** Node.js/Express → Render (Node runtime, root dir: `backend`)
- **Database:** PostgreSQL → Neon
- **Auth:** Clerk (development mode)
- **AI:** Anthropic Claude API

### Key Documentation Files
- `CLAUDE_QUICK_START.md` — **You are here.** Critical context, known bugs, patterns
- `CHANGELOG.md` — Session-by-session history of all changes (newest first)
- `KNOWN_BUGS.md` — All bugs with root cause, fix instructions, and open/fixed status
- `CURRENT_STATUS.md` — Full configuration, database schema, deployment process
- `NEXT_SESSION_START.md` — Copy/paste prompt for starting a new Claude session
- `ARCHITECTURE.md` — System architecture, data flows
- `DESIGN_SYSTEM.md` — Button styles, colors, typography (vintage gold `#c8aa6e` primary)

### Key Code Files
- `frontend/src/config.js` — API URL configuration
- `frontend/src/App.js` — Routing, `booklubUser` state (resolves Clerk ID → DB ID)
- `backend/server.js` — Express app, route registration
- `backend/routes/mindmaps.js` — Mind map generation (auto-creates table)
- `backend/seeds/schema.sql` — Production database column types

---

## Critical Things to Remember

### 1. Clerk ID vs Database ID (MOST COMMON BUG)
- Clerk user ID: `user_37xf2hsa6...` (string)
- Database user ID: `1`, `2`, `3` (integer)
- **Backend APIs require database ID, not Clerk ID!**

**App.js already resolves this:** `booklubUser` state contains the DB user with `.id` (integer) and `.clerk_id` (string). Components that receive `booklubUser` or `booklubUser.id` already have the correct DB ID — they should NOT re-lookup via `/api/users/clerk/`.

**KNOWN BUG (unfixed):** `JoinClubModal.js` and `MyClubs.js` still do the unnecessary Clerk lookup. `JoinClubModal` receives `userId={booklubUser?.id}` (DB integer) but calls `/api/users/clerk/${userId}` on line 22, causing "User not found". Fix: remove the Clerk lookup, use `userId` directly. `MyClubs.js` should receive `booklubUser` as a prop instead of using `useUser()` + Clerk lookup.

### 2. Database ID Types (Gotcha!)
Production Neon DB uses **mixed types**:
- `users.id` = **integer** (SERIAL)
- `book_clubs.id` = **UUID**
- `messages.id` = **UUID**
- `mind_maps.created_by` = **VARCHAR(255)** (stores integer as string)

Always check `backend/seeds/schema.sql` for actual production column types.

### 3. Two MyClubs Files Exist
- `MyClubs.js` ← **This one is used**
- `MyClubs.jsx` ← NOT used (ignore)

### 4. Render Configuration
- **Runtime:** Node (NOT Docker)
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- If Render shows "Dockerfile not found" → service was misconfigured as Docker

### 5. Worktree Git Workflow
Can't use `git checkout main`. Use PR workflow:
1. Commit and push to `charming-moore`
2. Create PR: https://github.com/Krispychuck/booklub-app/compare/main...charming-moore
3. Merge PR → auto-deploys to Cloudflare Pages + Render

### 7. Documentation Lives on `charming-moore` Only
All Claude documentation files (`CLAUDE_QUICK_START.md`, `CHANGELOG.md`, `KNOWN_BUGS.md`, `CURRENT_STATUS.md`, `NEXT_SESSION_START.md`, `DESIGN_SYSTEM.md`, etc.) live on the `charming-moore` branch. They will get merged to `main` via PRs but **`charming-moore` is the source of truth** for docs. Do NOT worry about syncing docs back from `main` or resolving doc conflicts on `main`. The `main` branch is for deployment only — docs there may be stale and that's fine.

### 6. Design System
- **Primary (gold):** `border: 2px solid #c8aa6e`, transparent bg, fills gold on hover
- **Secondary (black/white):** `border: 2px solid #000`, white bg
- Applied across: ClubChat.css, App.css, CreateClubModal.css, JoinClubModal.js (inline), MyClubs.js (inline)

---

## Backend API Routes

```
GET  /api/health
GET  /api/books
GET  /api/clubs?userId=<dbId>
POST /api/clubs              { name, bookId, userId }
POST /api/clubs/join         { inviteCode, userId }
GET  /api/messages/club/:clubId
POST /api/messages/club/:clubId    { content, senderUserId }
POST /api/messages/club/:clubId/ai-response
GET  /api/users/clerk/:clerkId
POST /api/users              { clerkId, email, name }
PUT  /api/users/:userId/name { name }
POST /api/mindmaps/:clubId/generate { userId }
GET  /api/mindmaps/:clubId
```

---

## Common Tasks

### Deploy Changes
```bash
git add <files>
git commit -m "Message

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
git push origin charming-moore
# Then merge PR at GitHub
```

### Check Logs
- **Render:** Dashboard → booklub-app → Logs tab (NOT Events)
- **Browser:** F12 → Console/Network tabs

---

## Next Steps (Upcoming)

1. 🐛 Fix "Join Club" bug — **Root cause identified:** `JoinClubModal.js` receives `userId` as DB integer ID from App.js but calls `/api/users/clerk/${userId}` treating it as Clerk ID → 404. **Fix:** Remove Clerk lookup (lines 21-26), use `userId` directly. Also fix same pattern in `MyClubs.js` (lines 16-20). Also update `ARCHITECTURE.md` section "3. User Joins a Club".
2. 🌐 Custom domain: booklub.krispychuck.com (DNS on Cloudflare)
3. 🎨 Logo/wordmark for header + favicon
4. ✨ CSS transitions and fade-in animations
5. ⏳ Loading states (skeleton screens, spinners)
6. 📝 Better typography hierarchy

---

## Service Dashboards

- **GitHub:** https://github.com/Krispychuck/booklub-app
- **Cloudflare:** https://dash.cloudflare.com/
- **Render:** https://dashboard.render.com/
- **Clerk:** https://dashboard.clerk.com/
- **Neon:** https://console.neon.tech/
- **Anthropic:** https://console.anthropic.com/

---

## User Context

- **Non-technical** — handle all git, CLI, deployment, debugging
- **Explain clearly** — step-by-step with URLs to click
- **Handle PRs** — user creates/merges PRs via GitHub web UI
- **No gh CLI** — not installed, use GitHub web links instead

---

## MANDATORY: Documentation Update Protocol

**This is critical.** The project owner relies on these docs to maintain continuity between Claude sessions. Without up-to-date docs, every new session wastes time re-discovering what was already known.

### After EVERY push to git, update these 5 files:

1. **`CLAUDE_QUICK_START.md`** (this file)
   - Update "Last Updated" date
   - Update "Status" line if features changed
   - Add/remove known bugs in "Critical Things to Remember"
   - Update "Next Steps" list

2. **`CHANGELOG.md`**
   - Add a new session entry at the TOP (newest first)
   - List every bug fix, feature, and UI change made
   - Include commit hashes and files changed

3. **`KNOWN_BUGS.md`**
   - Add any NEW bugs discovered (with root cause and fix instructions)
   - Move FIXED bugs from "OPEN" to "FIXED" section
   - Never delete fixed bugs — they're valuable history

4. **`CURRENT_STATUS.md`**
   - Update session history section
   - Update next steps list
   - Update file tree if new files were added

5. **`NEXT_SESSION_START.md`**
   - Rewrite the copy/paste prompt with current priorities
   - Include root cause + fix for any open bugs
   - Update "What's Working" and "What's Broken" sections

### When discovering or fixing a bug:
- Immediately add it to `KNOWN_BUGS.md` with full root cause
- Cross-reference in `CLAUDE_QUICK_START.md` if it's a pattern/gotcha
- Include exact file names, line numbers, and fix instructions
- A future Claude session should be able to implement the fix without re-investigating

### Why this matters:
The project owner is non-technical and works with Claude across multiple sessions. Session memory does NOT persist. These docs are the ONLY way to transfer knowledge between sessions. Outdated docs = wasted time re-doing work that was already completed or re-diagnosing bugs that were already understood.
