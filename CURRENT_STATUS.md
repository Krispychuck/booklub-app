# BooKlub App - Current Status & Configuration

**Last Updated:** February 14, 2026
**Status:** Production — Core features + Mind Map + Mobile responsive + PostHog analytics + UI polish (transitions, typography, rounded corners, logo sophistication)

---

## Overview

BooKlub is a social book club application that allows users to:
- Browse and select books
- Create book clubs with invite codes
- Join clubs using invite codes
- Chat with other club members
- Get AI-powered responses from book "authors"
- Generate Mind Map visualizations of club discussions

---

## Architecture

### Frontend
- **Technology:** React (Create React App)
- **Hosting:** Cloudflare Pages
- **URL:** https://booklub.krispychuck.com
- **Authentication:** Clerk (development mode)

### Backend
- **Technology:** Node.js + Express
- **Hosting:** Render (Node runtime, root directory: `backend`)
- **URL:** https://booklub-app.onrender.com
- **Database:** Neon (PostgreSQL)

---

## Environment Variables

### Cloudflare Pages (Frontend)
```
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_[REDACTED]
REACT_APP_API_URL=https://booklub-app.onrender.com
NODE_VERSION=18
```

### Render (Backend)
```
DATABASE_URL=postgresql://[REDACTED - Neon connection string]
ANTHROPIC_API_KEY=sk-ant-[REDACTED]
PORT=3001
NODE_ENV=production
```

Note: REACT_APP_* variables are NOT needed on Render (frontend only).

### Local Development (.env files — git-ignored)

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

---

## Working Features (All Verified in Production)

- ✅ User authentication (Clerk development mode)
- ✅ Browse books
- ✅ Create book clubs with invite codes
- ✅ Join clubs via invite codes
- ✅ Club chat messaging
- ✅ AI author responses (Anthropic Claude)
- ✅ Mind Map discussion visualization (D3.js radial tree)
  - Click-to-expand truncated messages in detail panel
  - Interactive zoom/pan
  - Node detail panel with related messages
- ✅ Delete messages in chat
- ✅ Leave/delete club functionality
- ✅ Members modal
- ✅ Display name setup

---

## Design System

**Primary buttons (gold):** `#c8aa6e` border, transparent background, fills gold on hover.
Applied to: Ask Author, Map Discussion, Start a Club, Create Club, Join Club, Browse Books, Display Name Save.

**Secondary buttons (black/white):** Black border on white background.
Applied to: Group Comment, Back, Members, Cancel.

See `DESIGN_SYSTEM.md` for full details.

---

## File Structure

```
booklub-app/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── MyClubs.js (ACTIVE - not .jsx)
│   │   │   ├── ClubChat.js
│   │   │   └── ClubChat.css
│   │   ├── components/
│   │   │   ├── CreateClubModal.js / .css
│   │   │   ├── JoinClubModal.js
│   │   │   ├── MembersModal.js
│   │   │   ├── DisplayNameModal.js
│   │   │   ├── LoadingSpinner.js / .css    ← Book-riffling animation
│   │   │   ├── MindMapVisualization.js
│   │   │   └── MindMapVisualization.css
│   │   ├── config.js
│   │   ├── App.js / App.css
│   │   └── index.js
│   └── package.json (includes d3)
├── backend/
│   ├── routes/
│   │   ├── books.js
│   │   ├── clubs.js
│   │   ├── messages.js
│   │   ├── users.js
│   │   └── mindmaps.js
│   ├── db.js
│   ├── server.js
│   └── package.json
├── database/
│   └── init.sql
├── ARCHITECTURE.md              ← System architecture
├── CHANGELOG.md                 ← Session-by-session history
├── CLAUDE_QUICK_START.md        ← Start here (critical context)
├── CURRENT_STATUS.md            ← This file
├── DESIGN_SYSTEM.md             ← Button styles, colors, typography
├── KNOWN_BUGS.md                ← All bugs with root cause/fix
├── NEXT_SESSION_START.md        ← Copy/paste for new sessions
└── PRODUCT_VISION.md            ← North star press release
```

---

## Deployment Process

1. Make changes in worktree: `/Users/mrl/booklub-app/.claude/worktrees/vigorous-lalande`
2. Commit and push to `preview` branch
3. Create PR: https://github.com/Krispychuck/booklub-app/compare/main...preview
4. Merge PR → auto-deploys to Cloudflare Pages + Render

---

## Database Schema (Production Neon)

Note: Production DB uses **UUIDs** for most IDs, though `init.sql` shows SERIAL. Always check `schema.sql` for actual production types.

- **users:** `id` (integer), `clerk_id`, `email`, `name`
- **books:** `id` (integer/serial), `title`, `author`, `genre`, `ai_author_prompt`
- **book_clubs:** `id` (UUID), `name`, `book_id`, `creator_user_id`, `invite_code`
- **club_members:** `id`, `club_id` (UUID), `user_id`, `role`
- **messages:** `id`, `club_id` (UUID), `sender_type`, `sender_user_id`, `content`
- **mind_maps:** `id` (UUID), `club_id` (UUID), `map_data` (JSONB), `created_by`, `message_count`

---

## Session History (Feb 5-6, Feb 14, 2026)

### Mind Map Bugs Fixed
1. **Backend route not registered** — `mindmaps.js` existed but wasn't wired in `server.js`
2. **Frontend calling wrong URL** — `/api/messages/club/:id/mind-map` → `/api/mindmaps/:id/generate`
3. **Missing request body** — Frontend wasn't sending `userId` or `Content-Type` header
4. **Response shape mismatch** — Frontend expected flat data, backend wraps in `mapData`
5. **Render misconfigured** — Was Docker, recreated as Node service
6. **`mind_maps` table missing** — Added auto-creation on first request
7. **Foreign key type mismatch** — `created_by` defined as UUID but `users.id` is integer

### UI/UX Improvements
8. **Click-to-expand messages** — Truncated messages in mind map detail panel now expand on click
9. **Gold design system** — All primary buttons updated to gold (#c8aa6e) style
10. **Join Club button** — Updated to gold primary style
11. **Header layout fix** — Map Discussion button no longer overlaps book title

### Join Club Bug Fix (Feb 6, 2026)
12. **BUG-001 fixed** — "User not found" error when joining a club. Removed unnecessary Clerk lookup from `JoinClubModal.js` and `MyClubs.js`. Both now use database ID directly. Updated `App.js` to pass `booklubUser` prop to MyClubs.

### Gold Header Nav (Feb 6, 2026)
13. **Header nav buttons gold** — Browse Books, My Clubs, Join Club now use gold borders + gold fill hover (`App.css`)

### Branding (Feb 6, 2026)
14. **Marquee logo** — Vintage cinema marquee sign as sole header logo (60px), marquee as favicon. Removed React default icons.
15. **Page title** — "BooKlub by Krispychuck" (was "React App"), updated manifest + meta description
16. **Custom domain** — booklub.krispychuck.com on Cloudflare Pages

### Documentation System (Feb 6, 2026)
17. **Created `CHANGELOG.md`** — Session-by-session history
18. **Created `KNOWN_BUGS.md`** — All bugs with root cause, fix instructions, status
19. **Documentation Update Protocol** — Mandatory 5-doc update after every push

### Loading States (Feb 6, 2026)
20. **Book-riffling animation** — Created reusable `LoadingSpinner` component with CSS-only animated book (pages riffle in gold `#c8aa6e`). Added to Home, MyClubs, ClubChat (full page), MembersModal (small), and button spinners in CreateClubModal/JoinClubModal.
21. **App startup screen** — Branded loading screen (marquee logo + book animation + "Warming up...") shown during Clerk init / Render cold starts.

### Logo Update (Feb 6, 2026)
22. **New marquee logo** — Swapped `booklub-marquee.png` to `Booklub-marquee2.png` (Art Nouveau parchment/scroll style). Applied across header, loading screen, favicon, manifest.

### Housekeeping (Feb 6, 2026)
23. **Removed dead worktree** — `compassionate-haibt` deleted
24. **Deleted 9 redundant docs** — All superseded by active 7-doc system
25. **Created symlink** — `~/Desktop/booklub-dev` → charming-moore

### Mobile Responsiveness (Feb 6, 2026)
26. **ClubChat.css** — 3 breakpoints (768/480/375px): header wrap, stacked send buttons, full-width input, visible delete button, 44px touch targets
27. **App.css** — Header nav wraps to second row, flex-fill nav buttons, truncated welcome text, reduced padding
28. **CreateClubModal.css** — Full-screen on phones, stacked buttons, 44px targets, iOS zoom prevention
29. **MindMapVisualization.css** — 100dvh height, bottom-sheet detail panel on mobile
30. **MyClubs.js** — Inline styles → CSS classes for responsive control
31. **JoinClubModal.js** — Inline styles → shared CreateClubModal.css classes

### PostHog Analytics (Feb 6, 2026)
32. **PostHog integration** — Lightweight page view tracking + user identification. Dashboard: https://us.posthog.com. Autocapture off, manual pageview per route change, users identified by BooKlub name/email on sign-in.

### UI Polish (Feb 14, 2026)
33. **CSS transitions** — Standardized `all 0.3s ease` on every interactive element. Page fade-in, modal open animations, card hover lifts, gold input focus.
34. **Typography hierarchy** — Type scale (2rem → 0.75rem), Courier New for metadata, responsive scaling across 3 breakpoints.
35. **Rounded corners** — iOS/macOS-style border-radius: 16px modals, 12px cards, 10px containers, 8px buttons, 6px small. Softened shadows.
36. **Logo sophistication** — CSS mask vignette feathers edges into black header, gold glow hover effect, 6px border-radius.
37. **BUG-F007 fixed** — Members modal "Could not load members". Fixed JOIN on `users.clerk_id` → `users.id`. Added Clerk→DB ID lookup to leave/delete endpoints. Removed debug console.logs.

---

## Next Steps (Upcoming)

1. ~~🐛 **Fix "Join Club" bug**~~ — **DONE** (commit `eeec1c1`)
2. ~~🌐 **Custom domain**~~ — **DONE** (https://booklub.krispychuck.com)
3. ~~🎨 **Logo/wordmark**~~ — **DONE** (commit `b2d7550`)
4. ~~⏳ **Loading states**~~ — **DONE** (book-riffling animation)
5. ~~🎨 **Logo update**~~ — **DONE** (Booklub-marquee2.png — Art Nouveau parchment style)
6. ~~📱 **Mobile responsiveness**~~ — **DONE** (commit `9bfd16b`)
7. ~~📊 **PostHog analytics**~~ — **DONE** (commit `0b643c4`, deployed)
8. ~~🔧 **Deploy mobile**~~ — **DONE** (merged to main)
9. ~~✨ **CSS transitions**~~ — **DONE** (Feb 14)
10. ~~📝 **Typography hierarchy**~~ — **DONE** (Feb 14)
11. ~~🔧 **Deploy PostHog**~~ — **DONE** (merged to main)
12. ~~🔲 **Rounded corners**~~ — **DONE** (Feb 14, MVP feedback)
13. ~~🎬 **Logo sophistication**~~ — **DONE** (Feb 14, MVP feedback)
14. ~~🐛 **Members bug**~~ — **DONE** (Feb 14, BUG-F007)
15. 🧪 **Real-world testing** — Share with MVP testers, monitor PostHog, fix issues
16. 📖 **Reading progress** — Chapter/page tracking (key PRODUCT_VISION.md feature)
17. 🗺️ **Additional roadmap items** — Review PRODUCT_VISION.md for next features

---

## Service Dashboards

- **Clerk:** https://dashboard.clerk.com/
- **Render:** https://dashboard.render.com/
- **Cloudflare:** https://dash.cloudflare.com/
- **Neon:** https://console.neon.tech/
- **Anthropic:** https://console.anthropic.com/
- **PostHog:** https://us.posthog.com (MVP tester analytics)
- **GitHub:** https://github.com/Krispychuck/booklub-app

---

## Documentation Protocol

**After every git push, update these 5 docs:** `CLAUDE_QUICK_START.md`, `CHANGELOG.md`, `KNOWN_BUGS.md`, `CURRENT_STATUS.md` (this file), `NEXT_SESSION_START.md`. See `CLAUDE_QUICK_START.md` for full protocol details. This is mandatory — the project owner relies on these docs for continuity between Claude sessions.
