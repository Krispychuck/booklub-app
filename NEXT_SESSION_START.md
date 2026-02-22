# Next Session Start Message

Copy/paste this to start your next Claude session:

---

```
Continue BooKlub development from previous session.

## CRITICAL: Worktree Safety Check (DO THIS FIRST)
Claude Code has a default setting that creates new git worktrees per session.
This MUST be disabled. A rogue worktree once caused major merge conflicts.

Run this immediately:
  git worktree list

You should see ONLY these two:
  /Users/mrl/booklub-app                                   [main]
  /Users/mrl/.claude-worktrees/booklub-app/charming-moore  [charming-moore]

If you see ANY other worktree, remove it immediately:
  git worktree remove --force /path/to/rogue/worktree

NEVER create a new branch or worktree. ALL work happens on charming-moore.

## Read These Docs
1. Read CLAUDE_QUICK_START.md - Critical context, known bugs, patterns, AND the mandatory documentation protocol
2. Read DEVELOPMENT_ROADMAP.md - Sprint plan with MVP feedback items (PRIORITY DOC)
3. Read PRODUCT_VISION.md - North star press release
4. Read KNOWN_BUGS.md - All open bugs with root cause and fix instructions
5. Read CHANGELOG.md - Session-by-session history
6. Read CURRENT_STATUS.md - Full configuration, database schema, deployment
7. Read ARCHITECTURE.md - System architecture and data flows
8. Read DESIGN_SYSTEM.md - Button styles and vintage gold aesthetic

## Current Sprint Status
Sprints 1-4 are COMPLETE. Sprints 1+2 deployed. Sprints 3+4 on charming-moore pending deploy.

Sprint 1 (deployed): Tab title fix + AI Author context upgrade
Sprint 2 (deployed): Chat readability overhaul (full-width, parchment AI, paragraph splitting)
Sprint 3 (pending deploy): Real-time chat polling (5-second interval, smart scroll, delta fetch)
Sprint 4 (pending deploy): Topic Explorer (replaced D3.js mind map with mobile-first topic list)

## Priority 1: Deploy Sprints 3+4
Merge PR from charming-moore → main:
1. Go to: https://github.com/Krispychuck/booklub-app/compare/main...charming-moore
2. Create PR with title: "Sprint 3+4: Real-time chat polling + Topic Explorer"
3. Merge to deploy
4. Test real-time chat: two browsers/accounts — messages should appear within 5 seconds
5. Test Topic Explorer: open a club chat, click "Topics" button, verify topic analysis loads

## Priority 2: Sprint 5 — Onboarding & Concept Clarity
See DEVELOPMENT_ROADMAP.md MVF-5. Welcome/explainer experience for new users.

## Priority 3: Sprint 6 — Reading Progress & Spoiler Guard
See DEVELOPMENT_ROADMAP.md BKL-4. Track reading progress, AI respects spoiler boundaries.

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
- Chat readability: full-width layout, parchment AI messages, paragraph splitting
- Topic Explorer (AI-powered topic analysis with expandable cards, key quotes, type badges)
- Gold design system on all primary buttons + header nav
- Custom domain: booklub.krispychuck.com
- Logo: Booklub-marquee2.png (Art Nouveau parchment style)
- Loading states: Book-riffling animation on all views + branded startup screen
- Mobile responsive (3 breakpoints: 768px, 480px, 375px)
- PostHog analytics (deployed)
- CSS transitions, rounded corners, typography hierarchy

## What's Not Working / Known Issues
- No known functional bugs (see KNOWN_BUGS.md)
- Real-time chat + Topic Explorer built but not yet deployed (on charming-moore)
- New users confused about what Booklub is (Sprint 5 onboarding)
- Old MindMapVisualization.js/css still on disk but no longer imported (dead code, can clean up)

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
