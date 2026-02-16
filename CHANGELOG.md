# BooKlub Changelog

Session-by-session history of what was built, fixed, and changed. Newest sessions first.

---

## Session: February 15, 2026 (API Cost Tracking)

**Branch:** `preview`

### Feature — API Cost Tracking Dashboard
- **Pricing module** — `backend/config/pricing.js` with Claude Sonnet 4 pricing ($3/MTok input, $15/MTok output). Single file to update when model or pricing changes.
- **Usage logger** — `backend/utils/logApiUsage.js` logs every API call with token counts and pre-calculated costs. Fire-and-forget (errors never break user-facing requests). Auto-creates `api_usage` table on first call.
- **Instrumented both API call sites** — Author responses (`messages.js`) and mind map generation (`mindmaps.js`) now log input/output tokens and costs. Also updated messages metadata to include `input_tokens`.
- **Admin API endpoint** — `GET /api/admin/usage` returns totals, per-feature breakdown, daily costs (30 days), and recent 20 calls.
- **Dashboard page** — `/admin/usage` with total cost headline, feature cards, daily bar chart (CSS-only), and recent calls table. Design system styling (gold accents, Georgia serif, Courier New for data).
- **Nav link** — Subtle "Usage" link in header nav (signed-in users only).
- **Database schema** — `api_usage` table added to `database/init.sql` for future deploys.
- **Note:** Anthropic Admin API integration was built and then removed — Anthropic Console already provides Usage/Cost dashboards at `platform.claude.com`. The local per-feature/per-club tracking adds value beyond what Anthropic offers natively.

### Bug Fix — Back Button Invisible
- **Root cause** — `.admin-usage .back-button` had no `color` property, inherited white from parent context.
- **Fix** — Added `color: #000` to the back button CSS rule.

### Files Added
- `backend/config/pricing.js` — Model pricing constants
- `backend/utils/logApiUsage.js` — Usage logger with auto-table-creation
- `backend/routes/admin.js` — Admin usage API endpoint
- `frontend/src/pages/AdminUsage.js` — Dashboard page component
- `frontend/src/pages/AdminUsage.css` — Dashboard styles

### Files Modified
- `backend/routes/messages.js` — Added logApiUsage call, updated metadata
- `backend/routes/mindmaps.js` — Added logApiUsage call
- `backend/server.js` — Registered admin route
- `frontend/src/App.js` — Added AdminUsage route + nav link
- `frontend/src/App.css` — Added .nav-link-subtle style
- `database/init.sql` — Added api_usage table schema

---

## Session: February 14, 2026 (UI Polish — Transitions, Typography, Rounded Corners, Logo, Members Bug Fix)

**Branch:** `preview`

### UI/UX — Logo Sophistication (MVP Feedback)
- **Rounded corners** — `border-radius: 6px` on logo image, gentle enough to preserve Art Nouveau corner flourishes.
- **Edge blending** — CSS `mask-image` radial gradient creates a soft vignette, feathering logo edges into the black header instead of hard cutoff.
- **Gold glow** — Subtle warm `box-shadow` halo on the logo link, intensifies on hover with smooth 0.3s transition.
- **Loading screen** — Matching treatment applied to the loading screen logo for consistency.

### Bug Fix — "Could not load members" (MVP Feedback)
- **Root cause** — Members query joined `club_members.user_id` (integer) to `users.clerk_id` (string) — always returned zero rows.
- **Fix** — Changed JOIN to `users.id` (integer), added `clerk_id` to SELECT for frontend current-user detection.
- **Leave club fix** — Endpoint passed Clerk ID directly as `user_id`. Now looks up internal ID first.
- **Delete club fix** — Same Clerk ID → internal ID lookup added.
- **Cleanup** — Removed debug `console.log` statements from MembersModal.

### UI/UX — CSS Transitions & Animations
- **Standardized transitions** — Every button, link, and input now uses `transition: all 0.3s ease`. Consistent timing throughout.
- **Page fade-in** — All three pages animate in with `fadeInUp` (12px translate + opacity, 0.4s) on route navigation.
- **Modal open animations** — All modals animate with overlay fade (0.2s) and content slide-up + scale (0.3s).
- **Card hover lift** — Book cards (-5px) and club cards (-3px) lift on hover with soft box shadows.
- **Input focus gold** — All text inputs highlight with gold (`#c8aa6e`) border on focus.

### UI/UX — Typography Hierarchy
- **Type scale** — Display (2rem), Heading (1.5rem), Subhead (1.15rem), Body (1rem), Caption (0.85rem), Micro (0.75rem).
- **Metadata** — Year, genre, invite codes, member roles now use Courier New monospace.
- **Responsive type scaling** — All headings scale proportionally across 3 breakpoints.

### UI/UX — Rounded Corners (MVP Feedback)
- **Cards:** `border-radius: 12px`, **Buttons:** `8px`, **Inputs:** `8px`, **Modals:** `16px`.
- **Softened shadows** — Hard offset (`5px 5px 0px`) → soft blur (`0 8px 20px rgba(0,0,0,0.15)`).

### Files Changed
- `frontend/src/App.css` — Transitions, animations, typography, rounded corners
- `frontend/src/pages/ClubChat.css` — Transitions, rounded corners on messages/buttons/modals/inputs
- `frontend/src/components/CreateClubModal.css` — Modal animation, rounded corners
- `frontend/src/components/MindMapVisualization.css` — Rounded corners on modal, detail panel, buttons
- `frontend/src/components/ClubCreatedModal.css` — Rounded corners
- `frontend/src/pages/Home.js` — Added `page-transition` wrapper
- `frontend/src/pages/MyClubs.js` — Added `page-transition` class
- `frontend/src/pages/ClubChat.js` — Added `page-transition` class

---

## Session: February 6, 2026 (PostHog Analytics)

**Branch:** `charming-moore`
**Commit:** `0b643c4`

### Features
- **PostHog analytics integration** — Lightweight MVP tester tracking. Tracks page views per route change and identifies signed-in users by their BooKlub display name + email. Autocapture disabled (no click tracking) to keep it minimal. Dashboard at https://us.posthog.com.

### Files Changed
- `frontend/src/App.js` — Added PostHog init, `PageViewTracker` component (fires on route change), user identification via `posthog.identify()` when `booklubUser` is set, `posthog.reset()` on sign out
- `frontend/package.json` — Added `posthog-js` dependency

---

## Session: February 6, 2026 (Mobile Responsiveness + Doc Cleanup)

**Branch:** `charming-moore`
**Commits:** `fac7d04` (doc cleanup), `9bfd16b` (mobile CSS)

### Housekeeping
- **Removed dead worktree** — `compassionate-haibt` worktree deleted via `git worktree remove --force`
- **Deleted 9 redundant docs** — DEPLOYMENT.md, DEPLOYMENT_CHANGES.md, DEPLOYMENT_CHECKLIST.md, DEPLOYMENT_NOTES.md, QUICK_DEPLOY.md, README_DEPLOYMENT.md, DEVELOPMENT_ROADMAP.md, TROUBLESHOOTING.md, README.md — all superseded by the 7 active docs
- **Created symlink** — `~/Desktop/booklub-dev` → charming-moore worktree for easy access

### Mobile Responsiveness (Priority 1 — COMPLETE)
All 10 mobile issues identified in the previous session analysis have been addressed:

1. **ClubChat.css** — Added 3 breakpoints (768px, 480px, 375px). Chat header wraps on mobile (back + buttons on first row, title/book on second). Send buttons stack vertically on small phones. Input goes full-width. Delete button always visible (opacity: 0.4 instead of hover-only). All buttons meet 44px minimum touch target. iOS zoom prevented with 16px font on input.

2. **App.css** — Header wraps nav to second row on mobile. Nav buttons flex to fill available width. Welcome text truncates with ellipsis. Reduced padding on all containers (40px→15px on small phones). Modals get stacked buttons. Members/Leave/Delete buttons get 44px touch targets.

3. **CreateClubModal.css** — Full-screen modal on phones (100vh, no border-radius). Stacked buttons. 44px minimum touch targets. Close button enlarged to 44x44. iOS zoom prevention.

4. **MindMapVisualization.css** — Uses `100dvh` instead of `90vh` (fixes mobile address bar overlap). Full-width modal on mobile. Detail panel becomes bottom sheet (centered, stretches full width). Subtitle hidden on small phones to save space.

5. **MyClubs.js** — Replaced all inline styles with CSS classes (`my-clubs-heading`, `my-clubs-empty`, `my-clubs-browse-btn`, `club-card-title`, etc.) so media queries can control sizing. Heading shrinks from 2.5rem → 1.5rem on small phones. Empty state padding reduced from 60px → 30px.

6. **JoinClubModal.js** — Replaced inline styles with shared `CreateClubModal.css` classes (`button-primary`, `button-secondary`, `form-group`, `modal-buttons`). Now gets all the same responsive behavior as CreateClubModal.

### Files Changed
- `DEPLOYMENT.md` — **DELETED**
- `DEPLOYMENT_CHANGES.md` — **DELETED**
- `DEPLOYMENT_CHECKLIST.md` — **DELETED**
- `DEPLOYMENT_NOTES.md` — **DELETED**
- `QUICK_DEPLOY.md` — **DELETED**
- `README_DEPLOYMENT.md` — **DELETED**
- `DEVELOPMENT_ROADMAP.md` — **DELETED**
- `TROUBLESHOOTING.md` — **DELETED**
- `README.md` — **DELETED**
- `frontend/src/pages/ClubChat.css` — +204 lines (3 media query blocks)
- `frontend/src/App.css` — +344 lines (MyClubs classes + 3 media query blocks)
- `frontend/src/components/CreateClubModal.css` — +65 lines (2 media query blocks)
- `frontend/src/components/MindMapVisualization.css` — +91 lines (2 media query blocks)
- `frontend/src/pages/MyClubs.js` — Inline styles → CSS classes
- `frontend/src/components/JoinClubModal.js` — Inline styles → shared CSS classes

---

## Session: February 6, 2026 (Loading States + Logo Update)

**Branch:** `charming-moore`
**Commits:** `f8e4127` through `0502b3c`

### Features
- **Book-riffling loading animation** — Created reusable `LoadingSpinner` component with a CSS-only animated open book whose pages flip/riffle in gold (`#c8aa6e`). Supports `size` (small/medium/large), `message` (text below animation), and `fullPage` (centers vertically) props.
- **App startup loading screen** — When Clerk is initializing (and during Render cold starts), users see the marquee logo + book animation + "Warming up..." on a dark background instead of a blank white page. Critical for MVP testers hitting cold starts.
- **Page-level loading states** — Home (books), My Clubs, and Club Chat now show the gold book-riffling animation while data loads, replacing plain "Loading..." text.
- **Modal loading state** — Members modal shows a small book animation instead of plain text.
- **Button inline spinners** — Create Club and Join Club buttons now show a tiny gold spinning circle next to "Creating..."/"Joining..." text (book animation too small at button size).

### Branding
- **New logo: Booklub-marquee2.png** — Replaced `booklub-marquee.png` with `Booklub-marquee2.png` (vintage parchment/scroll with Art Nouveau ornamental corners). Updated all references in `App.js`, `index.html`, and `manifest.json`. Used for header, app loading screen, favicon, and apple-touch-icon.

### Files Changed
- `frontend/src/components/LoadingSpinner.js` — **NEW** — Reusable book-riffling loader component
- `frontend/src/components/LoadingSpinner.css` — **NEW** — Book animation CSS + button-spinner CSS
- `frontend/public/Booklub-marquee2.png` — **NEW** — Art Nouveau parchment-style logo
- `frontend/src/pages/Home.js` — Import + use `<LoadingSpinner>` for loading state
- `frontend/src/pages/MyClubs.js` — Import + use `<LoadingSpinner>` for loading state
- `frontend/src/pages/ClubChat.js` — Import + use `<LoadingSpinner>` for loading state
- `frontend/src/components/MembersModal.js` — Import + use `<LoadingSpinner size="small">` in modal
- `frontend/src/components/CreateClubModal.js` — Import CSS + add `button-spinner` to Creating button
- `frontend/src/components/JoinClubModal.js` — Import CSS + add `button-spinner` to Joining button
- `frontend/src/App.js` — Import `LoadingSpinner`, add branded loading screen, swap to `Booklub-marquee2.png`
- `frontend/src/App.css` — `.app-loading` styles (full-screen dark, centered logo + spinner)
- `frontend/public/index.html` — Favicon + apple-touch-icon → `Booklub-marquee2.png`
- `frontend/public/manifest.json` — Icon → `Booklub-marquee2.png`

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
