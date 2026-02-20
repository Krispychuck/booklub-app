# BooKlub Known Bugs

Tracked bugs with root cause analysis, fix instructions, and status. This prevents re-diagnosing issues across sessions.

---

## OPEN Bugs

No open bugs at this time.

---

## FIXED Bugs

### BUG-F007: "Could not load members" — Members modal always empty
- **Status:** FIXED (Feb 14, 2026)
- **Severity:** High (core feature was broken)
- **Reported:** February 14, 2026 (MVP feedback)
- **Symptom:** Clicking "Members" button in club chat showed "Could not load members" error.
- **Root Cause:** In `backend/routes/clubs.js`, the members query joined `club_members.user_id` (INTEGER) to `users.clerk_id` (VARCHAR). An integer can never match a string, so the JOIN always returned zero rows and PostgreSQL threw a type mismatch error (500 response).
- **Additional bugs found:** The "Leave Club" and "Delete Club" endpoints had the same pattern — they received Clerk IDs from the frontend but passed them directly as `user_id` (integer) in SQL queries.
- **Fix:** (1) Changed members JOIN to `users.id`, added `clerk_id` to SELECT for frontend current-user detection. (2) Added Clerk ID → internal ID lookup to leave and delete endpoints. (3) Removed debug console.logs from MembersModal.
- **Pattern:** Same Clerk ID vs Database ID confusion as BUG-F006 — see `CLAUDE_QUICK_START.md` section "1. Clerk ID vs Database ID".
- **Files:** `backend/routes/clubs.js` (3 endpoints), `frontend/src/components/MembersModal.js` (cleanup)

### BUG-F006: Join Club "User not found" error
- **Status:** FIXED (Feb 6, 2026) — Commit `eeec1c1`
- **Severity:** High (core feature was broken)
- **Reported:** February 6, 2026
- **Symptom:** Clicking "Join Club" and entering a valid invite code showed "User not found" error.
- **Root Cause:** `JoinClubModal.js` received `userId={booklubUser?.id}` from App.js (already DB integer ID) but called `/api/users/clerk/${userId}`, treating it as a Clerk ID. `/api/users/clerk/1` returned 404. `MyClubs.js` had the same unnecessary Clerk lookup pattern.
- **Fix:** Removed Clerk lookup from `JoinClubModal.js` (used `userId` directly). Removed Clerk `useUser()` + lookup from `MyClubs.js` (now receives `booklubUser` as prop from App.js). Updated `App.js` routing to pass prop. Updated `ARCHITECTURE.md` flow diagram.
- **Pattern:** Clerk ID vs Database ID confusion — see `CLAUDE_QUICK_START.md` section "1. Clerk ID vs Database ID".

### BUG-F001: Mind Map "Unexpected token '<'" JSON parse error
- **Status:** FIXED (Feb 5, 2026)
- **Symptom:** Mind Map showed `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`
- **Root Cause:** `mindmaps.js` route file existed but was never registered in `server.js`. Frontend hit a 404 which returned HTML, and `response.json()` tried to parse HTML as JSON.
- **Fix:** Added `require('./routes/mindmaps')` and `app.use('/api/mindmaps', mindmapsRouter)` to `server.js`.
- **Also fixed:** Frontend was calling wrong URL (`/api/messages/club/:id/mind-map` instead of `/api/mindmaps/:id/generate`), wasn't sending `userId` or `Content-Type` header, and expected flat response instead of `{ mapData }` wrapper.

### BUG-F002: mind_maps table doesn't exist
- **Status:** FIXED (Feb 5, 2026)
- **Symptom:** `relation 'mind_maps' does not exist` error after deploying mind map fix
- **Root Cause:** Table was never created in the production Neon database.
- **Fix:** Added `ensureMindMapsTable()` function that runs `CREATE TABLE IF NOT EXISTS` before the first DB operation in the route handler (not at module load, to avoid race conditions).

### BUG-F003: mind_maps foreign key constraint failure
- **Status:** FIXED (Feb 5, 2026)
- **Symptom:** `foreign key constraint 'mind_maps_created_by_fkey' cannot be implemented`
- **Root Cause:** `created_by` was defined as `UUID REFERENCES users(id)` but `users.id` is an integer, not a UUID.
- **Fix:** Changed `created_by` to `VARCHAR(255) NOT NULL` without a foreign key constraint. Stores the integer user ID as a string.

### BUG-F004: Render "Dockerfile not found" error
- **Status:** FIXED (Feb 5, 2026)
- **Symptom:** Render deployment failed with "Dockerfile not found"
- **Root Cause:** Render service was misconfigured as Docker runtime instead of Node.
- **Fix:** User recreated the Render service with correct settings: Node runtime, `backend` root directory, `npm install` build command, `npm start` start command. Re-added environment variables (`DATABASE_URL`, `ANTHROPIC_API_KEY`, `NODE_ENV`, `PORT`).

### BUG-F005: Header button overlapping book title
- **Status:** FIXED (Feb 6, 2026)
- **Symptom:** Map Discussion button overlapped/covered the book author name in the chat header on smaller screens.
- **Root Cause:** `.chat-header` was `display: flex` but `.chat-header-info` had no flex properties, so it didn't shrink to make room for buttons.
- **Fix:** Added `gap: 15px` to `.chat-header`, `.chat-header-info` with `flex: 1; min-width: 0; overflow: hidden`, text ellipsis on h1 and `.book-info`, `flex-shrink: 0` on buttons.

---

*This file is updated after every push. When you find or fix a bug, update this file immediately. See `CLAUDE_QUICK_START.md` for the documentation protocol.*
