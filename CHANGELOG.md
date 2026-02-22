# BooKlub Changelog

Session-by-session history of what was built, fixed, and changed. Newest sessions first.

---

## Session: February 21, 2026 (Mega-Sprint — Sprints 5, 6, 8)

**Branch:** `charming-moore`
**Commit:** `7fccdad`

### Nav Menu Reorder
- **Reordered top nav:** My Clubs → Join Club → Browse Books (was Browse Books → My Clubs → Join Club). Puts the most-used actions first.
- **File:** `frontend/src/App.js`

### Sprint 5: Onboarding & Concept Clarity (MVF-5)
- **New component:** `WelcomeBanner.js` — 3-step explainer banner on Home page: "Pick a book → Invite friends → Ask the author". Appears for signed-out users (always) and signed-in users (first visit only, dismissible via localStorage `booklub_welcome_dismissed`). Black background, gold accents, numbered steps.
- **New component:** `ChatExplainer.js` — First-visit tooltip above chat messages area explaining the difference between "Group Comment" and "Ask Author" buttons. Dismissible via localStorage `booklub_chat_explainer_dismissed`. Parchment background with gold left accent bar.
- **Files:** `WelcomeBanner.js`, `WelcomeBanner.css`, `ChatExplainer.js`, `ChatExplainer.css`, `Home.js`, `ClubChat.js`

### Sprint 6: Reading Progress & Spoiler Guard (BKL-4)
- **New backend route:** `readingProgress.js` — Auto-creates `reading_progress` table with `UNIQUE(user_id, club_id)`. Three endpoints: GET all members' progress, GET specific user's progress, POST upsert progress (0-100%).
- **New frontend component:** `ReadingProgressBar.js` — Compact progress bar between chat header and messages. Expandable panel with slider (0-100%, 5% increments) to set your reading progress, plus visual display of all club members' progress. Gold design system.
- **AI Spoiler Guard:** Updated `messages.js` AI author system prompt to query `reading_progress` table and inject a `SPOILER GUARD (CRITICAL)` section telling the AI to never discuss content beyond where members have read.
- **Files:** `backend/routes/readingProgress.js` (new), `backend/server.js` (route registration), `backend/routes/messages.js` (spoiler guard), `frontend/src/components/ReadingProgressBar.js` (new), `frontend/src/components/ReadingProgressBar.css` (new), `frontend/src/pages/ClubChat.js` (wired component)

### Sprint 8: Book Recommendations in Topic Explorer
- **Backend enhancement:** Updated `mindmaps.js` AI prompt to also return 3-5 book recommendations based on the themes and topics the club has been discussing. Each recommendation includes title, author, and a personalized reason connecting to the conversation.
- **Frontend enhancement:** Added "Based on Your Discussion" recommendations section at the bottom of the Topic Explorer modal. Numbered cards with parchment background, gold accent numbers, and italic reasons.
- **Files:** `backend/routes/mindmaps.js` (prompt update), `frontend/src/components/TopicExplorer.js` (recommendations section), `frontend/src/components/TopicExplorer.css` (recommendations styles)

### Business Case & Author Studio Documents
- **New document:** `BUSINESS_CASE.md` — Full financial model with market sizing, 3-tier revenue model ($29/$79/$199 author subscriptions), AI cost breakdown ($0.012/interaction), 3-scenario sensitivity analysis (conservative/base/optimistic), 20-row breakeven table, key risks & assumptions, growth strategy, and metrics to track.
- **New document:** `AUTHOR_IDENTITY_STUDIO.md` — System architecture for the Author Identity Studio product with database schema, embed snippet architecture (like Stripe), ASCII wireframes for 7 pages, API endpoint reference, 4-phase implementation plan, integration strategy with existing Booklub, and design system notes.

### Files Changed
- `frontend/src/App.js` — Nav reorder
- `frontend/src/pages/Home.js` — WelcomeBanner import
- `frontend/src/pages/ClubChat.js` — ChatExplainer + ReadingProgressBar imports
- `frontend/src/components/WelcomeBanner.js` + `.css` — New
- `frontend/src/components/ChatExplainer.js` + `.css` — New
- `frontend/src/components/ReadingProgressBar.js` + `.css` — New
- `frontend/src/components/TopicExplorer.js` + `.css` — Recommendations section
- `backend/routes/readingProgress.js` — New
- `backend/routes/messages.js` — Spoiler guard
- `backend/routes/mindmaps.js` — Book recommendations prompt
- `backend/server.js` — readingProgress route registration
- `BUSINESS_CASE.md` — New
- `AUTHOR_IDENTITY_STUDIO.md` — New

---

## Session: February 19, 2026 (Sprint 4 — Topic Explorer)

**Branch:** `charming-moore`
**Commit:** `a1e7568`

### Topic Explorer — Replaces Mind Map (MVF-2)
- **New component:** `TopicExplorer.js` — Replaces the confusing D3.js radial mind map with a simple, mobile-first topic list. AI analyzes the club conversation and extracts discussion topics displayed as an expandable list.
- **Topic cards:** Each topic shows name, type badge (theme/character/plot/symbolism/personal/question), participants, and a chevron to expand. Tapping a topic reveals a summary, key quotes with gold accent bars, and message count.
- **Backend refactored:** `mindmaps.js` AI prompt completely rewritten to return flat topic list format instead of nested mind map tree. Now includes book context (title/author) for richer analysis. Reuses existing `mind_maps` database table (JSONB is flexible).
- **Button renamed:** "Map Discussion" → "Topics" in ClubChat header.
- **Bundle size reduced:** ~19KB smaller (D3.js is no longer imported). Old `MindMapVisualization.js` still on disk but not imported — dead code.
- **Mobile-first CSS:** 4 breakpoints (768/480/375px), 44px touch targets, full-screen modal on mobile, clean white-on-parchment aesthetic matching the design system.
- **Cost tracking:** API usage logged as `topic_explorer` feature (was `mind_map`).

### Files Changed
- `backend/routes/mindmaps.js` — Complete rewrite of AI prompt for topic extraction
- `frontend/src/components/TopicExplorer.js` — New component (replaces MindMapVisualization)
- `frontend/src/components/TopicExplorer.css` — New styles, mobile-first
- `frontend/src/pages/ClubChat.js` — Swapped MindMapVisualization import for TopicExplorer, renamed state

---

## Session: February 19, 2026 (Sprint 3 — Real-Time Chat)

**Branch:** `charming-moore`
**Commit:** `a53b7f0`

### Real-Time Chat Polling (MVF-3)
- **New API endpoint:** `GET /api/messages/club/:clubId/since/:lastMessageId` — returns only messages newer than the given ID. Efficient delta fetch instead of re-loading all messages.
- **Frontend polling:** ClubChat.js now polls every 5 seconds for new messages from other club members.
- **Smart scroll:** Auto-scrolls only if user is near the bottom (within 150px). Users reading earlier messages aren't disrupted.
- **Force scroll on send:** User's own messages and AI responses always scroll to bottom.
- **Polling pauses while sending:** Prevents duplicate messages during send operations.
- **Silent failure:** Polling errors don't disrupt the UI.

### Files Changed
- `backend/routes/messages.js` — Added `/since/:lastMessageId` endpoint
- `frontend/src/pages/ClubChat.js` — Added polling interval, smart scroll, messagesAreaRef

---

## Session: February 19, 2026 (Post-Deploy — Docs Update + Worktree Cleanup)

**Branch:** `charming-moore`

### Deployment
- **Sprints 1+2 merged to main and deployed** to production via PR merge

### Worktree Cleanup
- **Removed rogue `vigorous-lalande` worktree** — A previous Claude Code session had auto-created a new worktree (default setting) which committed changes directly to `main`, bypassing our PR workflow and causing merge conflicts.
- **Added worktree safety check to docs** — `CLAUDE_QUICK_START.md` now includes "DO NOT CREATE NEW WORKTREES" section with `git worktree list` check at session start.
- **`NEXT_SESSION_START.md` now starts with worktree safety check** as the first action for any new session.

---

## Session: February 19, 2026 (Sprint 2 — Chat Readability Overhaul)

**Branch:** `charming-moore`
**Commit:** `c8d4466`

### Chat Readability Redesign (MVF-1 — #1 MVP Complaint)
- **Full-width layout** — Removed 900px max-width container and 80% message width. Chat now uses the entire screen width. Messages are full-width rows (Slack/Discord style) instead of floating bubbles.
- **AI message styling** — Replaced full black background (hard to read) with warm parchment (#f8f5ef) and gold left accent bar (#c8aa6e). AI author names styled in italic gold.
- **User message styling** — Clean, borderless, transparent background with subtle hover highlight.
- **Paragraph splitting** — AI responses are now split on double-newlines into `<p>` tags with 12px spacing between paragraphs, creating visual breathing room in long responses.
- **Bigger text** — Message content bumped to 1.05rem with 1.7 line-height (was 1rem/1.6).
- **Input font** — Changed from Courier New monospace to Georgia serif to match body text.
- **Delete button** — Repositioned to absolute top-right corner, appears on hover.
- **Mobile** — All 3 breakpoints updated for new layout. Font sizes stay readable throughout.

### Files Changed
- `frontend/src/pages/ClubChat.css` — Complete rewrite of message styling, layout, and responsive breakpoints
- `frontend/src/pages/ClubChat.js` — AI message content now renders as paragraphs via `.split('\n\n')`

---

## Session: February 19, 2026 (Sprint 1 — MVP Feedback Roadmap + Critical Fixes)

**Branch:** `charming-moore`
**Commit:** `e75977a`

### Roadmap
- **Created `DEVELOPMENT_ROADMAP.md`** — Comprehensive sprint plan based on MVP tester feedback. 7 feedback items (MVF-1 through MVF-8) plus existing backlog items organized into 7 sprints. Includes Reading Progress & Spoiler Guard (BKL-4) and Admin Tool & Author Identity Studio (BKL-5, deferred).

### Bug Fixes / Quick Wins
- **MVF-6: Browser tab title** — Changed from "BooKlub by Krispychuck" to "Booklub". Updated `index.html` (title + meta description) and `manifest.json` (short_name + name).

### AI Author Upgrade (MVF-4)
- **Booklub world context** — AI author system prompt now includes a full context wrapper explaining what Booklub is, the AI's role in the book club, and how to interact with multiple members.
- **Multi-user awareness** — Club member names are fetched from the database and included in the system prompt. User messages are prefixed with `[MemberName]:` so the AI knows who's talking and can address them by name.
- **Group Comment awareness** — System prompt explains that some messages are human-to-human "Group Comments" not directed at the AI, preventing confusion.
- **Increased context** — Message history window increased from 10 to 20 recent messages for better conversation awareness.
- **Layered prompt architecture** — Per-book `ai_author_prompt` from the database is now wrapped inside a Booklub context layer, keeping book-specific persona details while adding app-wide awareness.

### Files Changed
- `frontend/public/index.html` — Title and meta description updated
- `frontend/public/manifest.json` — short_name and name updated
- `backend/routes/messages.js` — AI author endpoint completely rewritten: member lookup, named messages, layered system prompt
- `DEVELOPMENT_ROADMAP.md` — **NEW** — Full sprint plan with MVP feedback

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
