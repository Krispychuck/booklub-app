# Next Session Start Message

Copy/paste this to start your next Claude session:

---

```
Continue BooKlub development from previous session.

## First Steps
1. Read CLAUDE_QUICK_START.md - Critical context, known bugs, patterns, AND the mandatory documentation protocol at the bottom
2. Read DEVELOPMENT_ROADMAP.md - Sprint plan with MVP feedback items (THIS IS THE NEW PRIORITY DOC)
3. Read PRODUCT_VISION.md - North star press release describing full product vision + what's built vs. roadmap
4. Read KNOWN_BUGS.md - All open bugs with root cause and fix instructions
5. Read CHANGELOG.md - Session-by-session history of what changed
6. Read CURRENT_STATUS.md - Full configuration, database schema, deployment
7. Read ARCHITECTURE.md - System architecture and data flows
8. Read DESIGN_SYSTEM.md - Button styles and vintage gold aesthetic

## Current Sprint Status
Sprint 1 (Critical Fixes) is COMPLETE on charming-moore. Needs merge to main to deploy.

Completed in Sprint 1 (commit e75977a):
- MVF-6: Browser tab title → "Booklub"
- MVF-4: AI Author system prompt upgrade (Booklub world context, multi-user awareness, member names)
- Development roadmap created with 7 sprints

## Priority 1: Deploy Everything
Merge PR from charming-moore → main to deploy Sprint 1 + PostHog analytics:
1. Go to: https://github.com/Krispychuck/booklub-app/compare/main...charming-moore
2. Create PR with title: "Sprint 1: AI author context, tab title fix, PostHog analytics"
3. Merge the PR to deploy
4. Test the AI author in a club chat — it should now address members by name

## Priority 2: Sprint 2 — Chat Readability Overhaul (BIGGEST MVP COMPLAINT)
See DEVELOPMENT_ROADMAP.md MVF-1 for full details. Key changes:
- Increase font size (especially mobile)
- Widen chat to use more screen width (edge-to-edge like iMessage/WhatsApp)
- Break up long AI responses into readable chunks
- Improve spacing and contrast between human/AI messages
- Typography hierarchy improvements (BKL-3) folded in
- CSS transitions (BKL-2) folded in

## Priority 3: Sprint 3 — Real-Time Chat
See DEVELOPMENT_ROADMAP.md MVF-3. Add polling (5-10 second interval) so members see each other's messages in real time without leaving and re-entering the chat.

## Key Context
- **Project:** Booklub - Social book club app with AI author chat
- **Working Directory:** /Users/mrl/.claude-worktrees/booklub-app/charming-moore/
- **Desktop shortcut:** ~/Desktop/booklub-dev (symlink to working directory)
- **Branch:** charming-moore (use PR workflow to deploy to main)
- **User:** Non-technical, handle all git operations
- **No gh CLI** — use GitHub web links for PRs
- **Analytics:** PostHog (https://us.posthog.com) — page views + user identification

## Production URLs
- Frontend: https://booklub.krispychuck.com
- Backend: https://booklub-app.onrender.com

## What's Working
- User authentication (Clerk)
- Club creation + Join Club
- Chat messaging (group + AI author with Booklub context awareness)
- Mind Map visualization (D3.js radial tree) — to be replaced by Topic Explorer in Sprint 4
- Gold design system on all primary buttons + header nav
- Custom domain: booklub.krispychuck.com
- Logo: Booklub-marquee2.png (Art Nouveau parchment style)
- Loading states: Book-riffling animation on all views + branded startup screen
- Mobile responsive (3 breakpoints: 768px, 480px, 375px)
- PostHog analytics (on charming-moore, pending deploy)

## What's Broken
- No known functional bugs (see KNOWN_BUGS.md)
- MVP testers report chat readability issues (Sprint 2 will address)
- No real-time message refresh (Sprint 3 will address)
- Mind map confuses users (Sprint 4 will replace with Topic Explorer)

## IMPORTANT: Documentation Protocol
After every git push, you MUST update these 5 docs:
1. CLAUDE_QUICK_START.md - Quick reference, known bugs, next steps
2. CHANGELOG.md - Add session entry at top with all changes
3. KNOWN_BUGS.md - Add new bugs, move fixed bugs to FIXED section
4. CURRENT_STATUS.md - Session history, next steps, file tree
5. NEXT_SESSION_START.md - Rewrite with current priorities

This is mandatory. Read CLAUDE_QUICK_START.md for full protocol details.
The project owner relies on these docs for continuity between sessions.
```

---

**Last Updated:** February 19, 2026
