# BooKlub Development Roadmap

**Last Updated:** February 19, 2026
**Source:** MVP tester feedback + existing backlog

---

## MVP Feedback Items (Collected Feb 2026)

These are real-world issues reported by MVP testers. They are numbered for reference but NOT yet prioritized — sprint ordering is below.

### MVF-1: Chat Readability Overhaul (Critical)

**Problem:** Testers consistently report the chat is hard to read, especially on mobile. Specific complaints:
- Font size too small across the whole app
- Chat messages don't use full screen width (too much wasted side margins)
- Messages in boxes with padding create dense, hard-to-scan walls of text
- Long AI author responses require excessive scrolling
- Overall information density is too high

**Direction to explore:**
- Increase base font size (especially on mobile)
- Widen chat messages to use more horizontal screen space — consider edge-to-edge like iMessage/WhatsApp instead of narrow centered boxes
- Break up long AI responses into shorter visual chunks (paragraphs with spacing, or collapsible sections)
- Rethink message bubble/box styling for scannability
- Improve contrast and spacing between different message types (human vs AI)

**Impacts:** ClubChat.js, ClubChat.css, App.css, all mobile breakpoints

---

### MVF-2: Replace Mind Map with Topic Explorer (Major)

**Problem:** The D3.js radial mind map visualization confuses testers. They don't use it, and when they try, they drop off quickly. The interactive zoom/pan/node-click pattern doesn't translate well to mobile.

**What to keep:** The core idea — surfacing conversation topics and themes from club discussions using AI analysis.

**New direction:** Replace the mind map with a **Topic Explorer** — a simple, readable list of discussion topics with drill-in capability:
- Show a clean list of topics/themes extracted from the conversation
- Each topic is tappable/clickable to expand and show relevant quotes and messages
- Mobile-first design (simple list, no complex visualization)
- Future: Use topic data to power book recommendations ("You discussed themes of isolation — you might enjoy...")

**Impacts:** MindMapVisualization.js/.css (replace entirely), mindmaps.js backend route (refactor API response), ClubChat.js (new UI for triggering/displaying topics)

---

### MVF-3: Real-Time Chat (Major)

**Problem:** When multiple club members are chatting simultaneously, they don't see each other's messages until they leave and re-enter the chat. There is no live refresh.

**Solution options:**
- **Polling (simplest):** Frontend polls for new messages every few seconds
- **Server-Sent Events (medium):** Backend pushes new messages to connected clients
- **WebSockets (full):** Bi-directional real-time connection

**Recommendation:** Start with polling (5-10 second interval) for MVP. It's the simplest to implement on the current Express + Render stack and solves the core problem. Can upgrade to WebSockets later.

**Impacts:** ClubChat.js (add polling/refresh logic), messages.js (possibly add "messages since" endpoint for efficiency)

---

### MVF-4: AI Author Context & Awareness (Major)

**Problem:** The AI author gets confused when a new club member joins the conversation and asks a question. The AI doesn't understand the multi-user context of BooKlub — it doesn't know it's part of a book club app, what its role is, or that multiple humans are participating.

**Solution:** Enhance the AI author system prompt to include:
- What BooKlub is (a social book club app)
- The AI's role (representing the author's perspective for book club discussion)
- That multiple club members may be chatting (not just one person)
- Each member's display name so the AI can address them appropriately
- That Group Comments are human-to-human (AI should be aware but not confused by them)
- Clear boundaries on what the AI should/shouldn't do

**Impacts:** messages.js (AI response endpoint — update system prompt construction), possibly books table (review ai_author_prompt column)

---

### MVF-5: Onboarding & Core Concept Clarity (Medium)

**Problem:** Testers are confused about what BooKlub is. Is it a book club? An author Q&A? A group discussion platform? People treat those experiences differently and the app doesn't explain itself.

**Solution:** Better UX onboarding that communicates:
- What BooKlub is (a book club where you can discuss with friends AND ask the AI author)
- How it works (create/join a club, chat with members, ask the author questions)
- The two buttons explained ("Group Comment" = talk to your club, "Ask Author" = ask the AI)
- Consider: welcome screen for new users, tooltips, or a brief explainer on first visit

**Impacts:** New onboarding component(s), possibly Home.js, ClubChat.js (button labels/tooltips)

---

### MVF-6: Browser Tab Title Fix (Quick Fix)

**Problem:** Browser tab says "BooKlub by Krispychuck" — should be "Booklub" (lowercase k, no "by Krispychuck").

**Impacts:** frontend/public/index.html (title tag), frontend/public/manifest.json

---

### MVF-7: AI-Generated Book Covers (Enhancement)

**Problem:** Books in the catalog have no cover images, making the browsing experience feel bare.

**Solution:** Generate cover art for each book using AI image generation (DALL-E, Midjourney, or similar). Store images as static assets in the frontend.

**Approach:**
- Generate covers outside the app (using AI image tools)
- Save as optimized images in frontend/public/covers/
- Update books display to show cover images
- Design covers to match the vintage gold aesthetic

**Impacts:** Home.js, MyClubs.js, ClubChat.js (display covers), frontend/public/covers/ (new directory), possibly books table (add cover_url column)

---

### MVF-8: In-App Book Reading (Deferred)

**Feedback:** An MVP tester asked if they could read the book within BooKlub itself.

**Decision:** Deferred. This would require recreating Kindle-like functionality and introduces significant licensing/copyright complexity. Not necessary for MVP — BooKlub complements existing reading habits (per PRODUCT_VISION.md: "BooKlub doesn't ask me to change how I read").

**Future consideration:** Could explore integration with existing reading platforms (Kindle highlights API, etc.) rather than building a reader from scratch.

---

## Existing Backlog (Pre-Feedback)

### BKL-1: Deploy PostHog Analytics
PostHog integration is built on `charming-moore` but not yet merged to `main`. Need to create PR and merge to start collecting data.

### BKL-2: CSS Transitions & Animations
- Add `transition: all 0.3s ease` on all interactive elements
- Fade-in animations on page loads
- Hover lift effects on cards
- Modal open/close transitions

### BKL-3: Typography Hierarchy
- Improve heading/body/caption sizing and spacing
- Consistent type scale across all pages

### BKL-4: Reading Progress & Spoiler Guard
Reading progress is more than a tracker — it's a **spoiler prevention system** that makes BooKlub safe to use *while* reading, not just after finishing a book.

**Core concept:**
- Each member sets their reading progress (chapter, page, or percentage)
- The AI author sees each member's progress and **will not discuss content beyond where that reader has gotten**
- If a member asks about something later in the book, the AI gently deflects: "Keep reading — you'll get there!"
- Club members can see where everyone is in the book (social motivation to keep reading)

**Why this matters:**
- Unlocks a whole new use case: engaging with BooKlub *during* the reading journey, not just after
- Directly addresses the product vision's "post-purchase engagement" — this extends it to "during-purchase engagement"
- Makes the AI author dramatically more useful and trustworthy
- Natural social feature (seeing friends' progress encourages reading)

**Impacts:**
- New `reading_progress` table (user_id, club_id, progress_type, progress_value, updated_at)
- New API endpoints for setting/getting reading progress
- ClubChat.js — UI for setting your progress + seeing others'
- messages.js — Include reader's progress in AI author system prompt so it respects spoiler boundaries
- Connects to MVF-4 (AI Author context) — progress awareness becomes part of the author's world knowledge

**Future extensions:**
- Progress-aware book recommendations
- "Reading pace" insights (are you ahead/behind your club?)
- Milestone celebrations ("You're halfway through!")

---

## Proposed Sprint Plan

Sprints are ordered by impact on MVP tester experience. Each sprint is roughly one working session.

### Sprint 1: Critical Fixes & Quick Wins
- **MVF-6:** Browser tab title fix ("Booklub")
- **BKL-1:** Deploy PostHog (merge PR to main)
- **MVF-4:** AI Author context & awareness (system prompt upgrade)

*Rationale: Quick fixes that improve the experience immediately. PostHog lets us start tracking. AI author fix addresses a core product quality issue.*

### Sprint 2: Chat Readability Overhaul
- **MVF-1:** Full chat readability redesign
- **BKL-3:** Typography hierarchy (folded into readability work)
- **BKL-2:** CSS transitions (folded into redesign)

*Rationale: This is the #1 complaint from testers. Typography and transitions naturally fold into a readability overhaul rather than being separate efforts.*

### Sprint 3: Real-Time Chat
- **MVF-3:** Add polling-based real-time message refresh

*Rationale: Second most impactful issue — people chatting together can't see each other's messages. Polling is a single-session fix.*

### Sprint 4: Topic Explorer (Mind Map Replacement)
- **MVF-2:** Replace D3.js mind map with Topic Explorer list UI

*Rationale: Important but lower urgency — testers already ignore the mind map, so replacing it doesn't fix a blocker. But it turns a dead feature into a useful one.*

### Sprint 5: Onboarding & Concept Clarity
- **MVF-5:** Welcome/explainer experience for new users
- Review and improve button labels and UI copy throughout

*Rationale: Helps new testers understand the product. Less urgent than fixing the experience for existing testers who already "get it."*

### Sprint 6: Reading Progress & Spoiler Guard
- **BKL-4:** Reading progress tracking with AI spoiler prevention
- Progress UI in club chat (set your progress, see others')
- AI author system prompt updated to respect each reader's progress

*Rationale: Unlocks BooKlub for readers who are still mid-book — a much larger audience than "just finished" readers. The spoiler guard makes the AI author trustworthy and dramatically more useful. Builds on the AI context work from Sprint 1.*

### Sprint 7: Book Covers & Visual Polish
- **MVF-7:** AI-generated book covers
- Visual polish pass across all pages

*Rationale: Aesthetic improvement that makes the app feel more complete. Not blocking any core functionality.*

### Future (Post-MVP)

**BKL-5: Admin Tool & Author Identity Studio**
A utility for managing the BooKlub catalog and — critically — for authors to define their own AI identity. This is a key piece of the full product vision where real authors license their work and shape how their AI persona behaves.

Two layers:
1. **Admin catalog tool** — Easily add new books and AI author personas without touching code or the database directly. Today adding a book requires SQL inserts; this makes it a simple form.
2. **Author Identity Studio** (the bigger vision) — A self-service tool for authors to create and manage their AI persona for BooKlub. Authors would define:
   - How the AI should act and speak (tone, personality, boundaries)
   - What it can and cannot say (topics to avoid, opinions to express or withhold)
   - Background information to include (biography, creative process, inspirations)
   - Background information to exclude (personal life details, controversial opinions, etc.)
   - Guardrails and corrections (review AI responses, flag inaccuracies, refine behavior over time)

This connects directly to the PRODUCT_VISION.md pillars:
- "Direct author collaboration ensuring authentic voice and perspective representation"
- "Ongoing author oversight with correction capabilities"
- "Upfront licensing fees for persona development"

*Status: Early brainstorm. Significant design work needed before implementation. This is foundational infrastructure for BooKlub's business model — when authors can self-serve their AI identity, the platform can scale beyond a curated catalog.*

**Other deferred items:**
- **MVF-8:** In-app book reading (deferred — likely never for MVP)
- WebSocket upgrade (replace polling with real-time)
- Expert Panels (multiple AI perspectives)
- Multi-book club discussions

---

## How to Use This Document

- **Sprint plan is a proposal** — reorder based on what matters most right now
- **MVF = MVP Feedback item** — from real tester reactions
- **BKL = Backlog item** — from prior development planning
- Items can be combined, split, or reordered between sprints
- Each sprint should result in a deployable improvement

---

*This document is updated as priorities shift. See CHANGELOG.md for session history and KNOWN_BUGS.md for bug tracking.*
