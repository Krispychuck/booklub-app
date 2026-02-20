# Quick Start Guide for Claude

When starting a new session about BooKlub, read this first!

---

## Current Status

**App Name:** BooKlub - Social Book Club Platform
**Owner:** Non-technical user (handle everything via Claude)
**Location:** `/Users/mrl/.claude-worktrees/booklub-app/charming-moore/`
**Branch:** `charming-moore` (worktree — merge to `main` to deploy)
**Last Updated:** February 19, 2026
**Status:** Production — All core features + Mind Map + Mobile responsive + PostHog analytics + AI Author context + Chat readability overhaul

---

## Quick Facts

### URLs
- **Production:** https://booklub.krispychuck.com
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
- `PRODUCT_VISION.md` — **North star.** Amazon-style press release describing full product vision, what's built vs. roadmap
- `CHANGELOG.md` — Session-by-session history of all changes (newest first)
- `KNOWN_BUGS.md` — All bugs with root cause, fix instructions, and open/fixed status
- `CURRENT_STATUS.md` — Full configuration, database schema, deployment process
- `NEXT_SESSION_START.md` — Copy/paste prompt for starting a new Claude session
- `ARCHITECTURE.md` — System architecture, data flows
- `DESIGN_SYSTEM.md` — Button styles, colors, typography (vintage gold `#c8aa6e` primary)

### Key Code Files
- `frontend/src/config.js` — API URL configuration
- `frontend/src/App.js` — Routing, `booklubUser` state (resolves Clerk ID → DB ID), app loading screen
- `frontend/src/components/LoadingSpinner.js` — Reusable book-riffling loader (gold animated book)
- `frontend/src/components/LoadingSpinner.css` — Book animation + button-spinner CSS
- `backend/server.js` — Express app, route registration
- `backend/routes/messages.js` — Chat + AI author responses (system prompt with Booklub context)
- `backend/routes/mindmaps.js` — Mind map generation (auto-creates table)
- `backend/seeds/schema.sql` — Production database column types
- `DEVELOPMENT_ROADMAP.md` — Sprint plan with MVP feedback items

---

## Critical Things to Remember

### 1. Clerk ID vs Database ID (MOST COMMON BUG)
- Clerk user ID: `user_37xf2hsa6...` (string)
- Database user ID: `1`, `2`, `3` (integer)
- **Backend APIs require database ID, not Clerk ID!**

**App.js already resolves this:** `booklubUser` state contains the DB user with `.id` (integer) and `.clerk_id` (string). Components that receive `booklubUser` or `booklubUser.id` already have the correct DB ID — they should NOT re-lookup via `/api/users/clerk/`.

**Previously fixed (BUG-F006):** `JoinClubModal.js` and `MyClubs.js` used to do unnecessary Clerk lookups. Fixed in commit `eeec1c1` — both now use the DB ID directly. If you see any other component doing a Clerk lookup when it already has `booklubUser` or `userId` as a prop, that's the same bug pattern — fix it the same way.

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

### 6. DO NOT CREATE NEW WORKTREES (CRITICAL)
**Claude Code has a default setting that creates new git worktrees for each session.** This setting MUST be disabled. The owner has disabled it, but if it gets re-enabled or a new session ignores this:

**At the start of every session, run:**
```bash
git worktree list
```
If you see ANY worktree besides `main` and `charming-moore`, **remove it immediately:**
```bash
git worktree remove --force /path/to/rogue/worktree
```

**Why this matters:** A rogue worktree (`vigorous-lalande`) once committed changes directly to `main`, bypassing our PR workflow. This caused merge conflicts that took significant time to resolve. ALL work must happen on `charming-moore` only.

**Never:**
- Create a new branch or worktree
- Commit directly to `main`
- Use Claude Code's "use a worktree" option

### 7. Documentation Lives on `charming-moore` Only
All Claude documentation files (`CLAUDE_QUICK_START.md`, `CHANGELOG.md`, `KNOWN_BUGS.md`, `CURRENT_STATUS.md`, `NEXT_SESSION_START.md`, `DESIGN_SYSTEM.md`, etc.) live on the `charming-moore` branch. They will get merged to `main` via PRs but **`charming-moore` is the source of truth** for docs. Do NOT worry about syncing docs back from `main` or resolving doc conflicts on `main`. The `main` branch is for deployment only — docs there may be stale and that's fine.

### 6. Design System
- **Primary (gold):** `border: 2px solid #c8aa6e`, transparent bg, fills gold on hover
- **Secondary (black/white):** `border: 2px solid #000`, white bg
- Applied across: App.css (nav-link, join-club-button, start-club-button, modal-button-primary, my-clubs-browse-btn), ClubChat.css, CreateClubModal.css (shared by JoinClubModal)

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

See `DEVELOPMENT_ROADMAP.md` for full sprint plan with 7 sprints based on MVP tester feedback.

**Sprint 1 (Critical Fixes):** DEPLOYED
- ~~MVF-6: Browser tab title fix~~ — **DONE**
- ~~MVF-4: AI Author context upgrade~~ — **DONE**

**Sprint 2 (Chat Readability):** DEPLOYED
- ~~MVF-1: Chat readability overhaul~~ — **DONE**

**Next up:**
- Sprint 3: Real-time chat (polling-based refresh)
- Sprint 4: Topic Explorer (replace mind map)
- Sprint 5: Onboarding & concept clarity
- Sprint 6: Reading progress & spoiler guard
- Sprint 7: AI-generated book covers

---

## Service Dashboards

- **GitHub:** https://github.com/Krispychuck/booklub-app
- **Cloudflare:** https://dash.cloudflare.com/
- **Render:** https://dashboard.render.com/
- **Clerk:** https://dashboard.clerk.com/
- **Neon:** https://console.neon.tech/
- **Anthropic:** https://console.anthropic.com/
- **PostHog:** https://us.posthog.com (MVP tester analytics)

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
