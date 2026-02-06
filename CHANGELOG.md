# BooKlub Changelog

Session-by-session history of what was built, fixed, and changed. Newest sessions first.

---

## Session: February 6, 2026 (Loading States — Book-Riffling Animation)

**Branch:** `charming-moore`

### Features
- **Book-riffling loading animation** — Created reusable `LoadingSpinner` component with a CSS-only animated open book whose pages flip/riffle in gold (`#c8aa6e`). Supports `size` (small/medium/large), `message` (text below animation), and `fullPage` (centers vertically) props.
- **App startup loading screen** — When Clerk is initializing (and during Render cold starts), users see the marquee logo + book animation + "Warming up..." on a dark background instead of a blank white page. Critical for MVP testers hitting cold starts.
- **Page-level loading states** — Home (books), My Clubs, and Club Chat now show the gold book-riffling animation while data loads, replacing plain "Loading..." text.
- **Modal loading state** — Members modal shows a small book animation instead of plain text.
- **Button inline spinners** — Create Club and Join Club buttons now show a tiny gold spinning circle next to "Creating..."/"Joining..." text (book animation too small at button size).

### Files Changed
- `frontend/src/components/LoadingSpinner.js` — **NEW** — Reusable book-riffling loader component
- `frontend/src/components/LoadingSpinner.css` — **NEW** — Book animation CSS + button-spinner CSS
- `frontend/src/pages/Home.js` — Import + use `<LoadingSpinner>` for loading state
- `frontend/src/pages/MyClubs.js` — Import + use `<LoadingSpinner>` for loading state
- `frontend/src/pages/ClubChat.js` — Import + use `<LoadingSpinner>` for loading state
- `frontend/src/components/MembersModal.js` — Import + use `<LoadingSpinner size="small">` in modal
- `frontend/src/components/CreateClubModal.js` — Import CSS + add `button-spinner` to Creating button
- `frontend/src/components/JoinClubModal.js` — Import CSS + add `button-spinner` to Joining button
- `frontend/src/App.js` — Import `LoadingSpinner`, add branded loading screen for `!isLoaded` state
- `frontend/src/App.css` — `.app-loading` styles (full-screen dark, centered logo + spinner)

---

## Session: February 6, 2026 (Join Club Bug Fix + Gold Nav + Documentation System)

**Branch:** `charming-moore`
**Commits:** `373c466` through `0bbc925`

### Bug Fixes
- **BUG-001: Join Club "User not found"** — `JoinClubModal.js` received `userId` (already DB integer ID from App.js) but called `/api/users/clerk/${userId}` treating it as a Clerk ID. Removed unnecessary Clerk lookup, used `userId` directly. Also fixed same pattern in `MyClubs.js` (removed Clerk `useUser()` + lookup, now receives `booklubUser` as prop from App.js).

### UI/UX
- **Gold header nav buttons** — Browse Books, My Clubs, and Join Club buttons in the header now use gold (`#c8aa6e`) borders with gold fill on hover, matching the primary button design system. (`App.css`: `.nav-link`, `.join-club-button`)

### Branding
- **Marquee logo** — Vintage cinema marquee sign image (`booklub-marquee.png`) as sole header logo. Removed SVG silhouettes icon — marquee only, sized at 60px. (`App.js`, `App.css`)
- **Favicon fixed** — Removed old React `favicon.ico`, `logo192.png`, `logo512.png`. Updated `index.html`, `manifest.json`, and apple-touch-icon to all use `booklub-marquee.png`. (`index.html`, `manifest.json`)
- **Page title** — Changed from "React App" to "BooKlub by Krispychuck". Updated meta description. (`index.html`)
- **Manifest** — Updated short_name to "BooKlub", name to "BooKlub by Krispychuck". (`manifest.json`)

### Infrastructure
- **Custom domain** — Set up `booklub.krispychuck.com` on Cloudflare Pages. Updated all documentation references from `booklub.pages.dev` to the new domain.

### Documentation
- **Created `CHANGELOG.md`** — Session-by-session history (this file)
- **Created `KNOWN_BUGS.md`** — All bugs with root cause, fix instructions, and status
- **Documentation Update Protocol** — Added mandatory instructions to all 5 docs requiring updates after every git push
- **Updated `ARCHITECTURE.md`** — Fixed "User Joins a Club" flow diagram (no longer shows Clerk lookup)

### Files Changed
- `frontend/src/App.css` — Gold styles for `.nav-link` and `.join-club-button`
- `frontend/src/components/JoinClubModal.js` — Removed Clerk lookup (lines 21-26), use userId directly
- `frontend/src/pages/MyClubs.js` — Removed Clerk import/lookup, accepts `booklubUser` prop
- `frontend/src/App.js` — Passes `booklubUser` prop to MyClubs route
- `ARCHITECTURE.md` — Updated Join Club flow diagram
- `CHANGELOG.md` — New file
- `KNOWN_BUGS.md` — New file
- `CLAUDE_QUICK_START.md` — Added doc protocol, key files list, branch note
- `CURRENT_STATUS.md` — Updated file tree, added protocol reminder
- `NEXT_SESSION_START.md` — Updated with current priorities and protocol

---

## Session: February 5-6, 2026 (Mind Map + Design System)

**Branch:** `charming-moore`
**Commits:** `440c354` through `1936c91`

### Bug Fixes
- **Mind Map route not registered** — `mindmaps.js` existed in `backend/routes/` but was never wired into `server.js`. Added `require` and `app.use('/api/mindmaps', ...)`.
- **Frontend calling wrong API URL** — Was hitting `/api/messages/club/:id/mind-map` (404, returns HTML). Fixed to `/api/mindmaps/:id/generate`.
- **Missing request body on mind map POST** — Frontend wasn't sending `userId` or `Content-Type: application/json` header. Added both.
- **Response shape mismatch** — Frontend used `data` directly but backend wraps in `{ mapData }`. Fixed to use `data.mapData`.
- **Render misconfigured as Docker** — Service was set to Docker runtime instead of Node. User recreated service with: Node runtime, `backend` root dir, `npm install` build, `npm start` start.
- **`mind_maps` table missing in production** — Table was never created in Neon. Added `ensureMindMapsTable()` auto-creation in route handler.
- **Race condition on table creation** — `ensureMindMapsTable()` was called at module load (async), racing with requests. Moved to `await` inside route handler.
- **Foreign key type mismatch** — `created_by UUID REFERENCES users(id)` failed because `users.id` is integer. Changed to `VARCHAR(255) NOT NULL` without FK constraint.

### Features
- **Click-to-expand messages** — Truncated messages in mind map detail panel now expand/collapse on click. Added `expandedMessages` state, toggle function, gold highlight on expanded messages. (`MindMapVisualization.js`, `MindMapVisualization.css`)

### UI/UX
- **Gold design system** — Updated all primary action buttons to vintage gold (`#c8aa6e`) border style with gold-fill hover. Files: `ClubChat.css`, `App.css`, `CreateClubModal.css`, `JoinClubModal.js` (inline), `MyClubs.js` (inline).
- **Join Club button** — Updated to gold primary style to match design system.
- **Header layout fix** — Map Discussion and Members buttons were overlapping book title in chat header. Fixed with proper flexbox: `gap: 15px`, `chat-header-info` with `flex: 1; min-width: 0; overflow: hidden`, text ellipsis on h1 and book-info, `flex-shrink: 0` on buttons. (`ClubChat.css`)

### Documentation
- Rewrote `CURRENT_STATUS.md` and `CLAUDE_QUICK_START.md` with session accomplishments
- Updated `NEXT_SESSION_START.md` with current priorities
- Added Join Club bug root cause to all docs

### Files Changed
- `backend/server.js` — Registered mindmaps router
- `backend/routes/mindmaps.js` — Copied from main, added auto-table creation, fixed FK type
- `frontend/src/components/MindMapVisualization.js` — Fixed API URL, added userId, response extraction, expandable messages
- `frontend/src/components/MindMapVisualization.css` — Scrollable detail panel, expandable message styles
- `frontend/src/pages/ClubChat.js` — Added userId prop to MindMapVisualization
- `frontend/src/pages/ClubChat.css` — Gold buttons, header flex layout fix
- `frontend/src/App.css` — Gold styles for start-club-button, modal-button-primary
- `frontend/src/components/CreateClubModal.css` — Gold button-primary style
- `frontend/src/components/JoinClubModal.js` — Gold inline button style
- `frontend/src/pages/MyClubs.js` — Gold Browse Books inline button style

---

## Prior Sessions (Pre-Feb 5, 2026)

### Core App Built
- User authentication via Clerk
- Book catalog with 5 starter books
- Club creation with auto-generated invite codes
- Club chat with group messaging
- AI author responses via Anthropic Claude API
- Display name system (separate from Clerk identity)
- Mind Map visualization (D3.js radial tree) — initially built in `compassionate-haibt` worktree, recovered to `charming-moore`

### Infrastructure
- Frontend deployed to Cloudflare Pages
- Backend deployed to Render (Node.js)
- Database on Neon (PostgreSQL)
- Clerk for authentication (development mode)

---

*This file is updated after every push. See `CLAUDE_QUICK_START.md` for the documentation protocol.*
