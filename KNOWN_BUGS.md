# BooKlub Known Bugs

Tracked bugs with root cause analysis, fix instructions, and status. This prevents re-diagnosing issues across sessions.

---

## OPEN Bugs

### BUG-001: Join Club "User not found" error
- **Status:** OPEN
- **Severity:** High (core feature broken)
- **Reported:** February 6, 2026
- **Symptom:** Clicking "Join Club" and entering a valid invite code shows "User not found" error.
- **Root Cause:** `JoinClubModal.js` receives `userId={booklubUser?.id}` from App.js — this is already the database integer ID (e.g. `1`). But line 22 calls `/api/users/clerk/${userId}`, treating it as a Clerk ID. Looking up `/api/users/clerk/1` returns 404 because `1` is not a Clerk ID string.
- **Fix:**
  1. In `frontend/src/components/JoinClubModal.js`: Remove lines 21-26 (the Clerk lookup). Use `userId` directly in the join request body since it's already the database ID. Reference `CreateClubModal.js` for the correct pattern.
  2. In `frontend/src/pages/MyClubs.js`: Same pattern — remove lines 16-20 (Clerk lookup via `useUser()` + fetch). Instead, receive `booklubUser` as a prop from App.js and use `booklubUser.id` directly. Update the route in `App.js` to pass the prop.
  3. In `ARCHITECTURE.md`: Update section "3. User Joins a Club" which documents the wrong flow (says it converts Clerk ID → DB ID, but the ID is already converted by App.js).
- **Files to change:** `JoinClubModal.js`, `MyClubs.js`, `App.js` (routing), `ARCHITECTURE.md`
- **Pattern:** This is the #1 recurring bug pattern in BooKlub — Clerk ID vs Database ID confusion. See `CLAUDE_QUICK_START.md` section "1. Clerk ID vs Database ID".

---

## FIXED Bugs

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
