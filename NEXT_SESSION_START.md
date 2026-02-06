# Next Session Start Message

Copy/paste this to start your next Claude session:

---

```
Continue BooKlub development from previous session.

## First Steps
1. Read CLAUDE_QUICK_START.md - Critical context, known bugs, patterns, AND the mandatory documentation protocol at the bottom
2. Read PRODUCT_VISION.md - North star press release describing full product vision + what's built vs. roadmap
3. Read KNOWN_BUGS.md - All open bugs with root cause and fix instructions
4. Read CHANGELOG.md - Session-by-session history of what changed
5. Read CURRENT_STATUS.md - Full configuration, database schema, deployment
6. Read ARCHITECTURE.md - System architecture and data flows
7. Read DESIGN_SYSTEM.md - Button styles and vintage gold aesthetic

## Priority 1: Mobile Responsiveness (CRITICAL)
The site currently breaks on mobile phones. This is the #1 priority — most MVP testers will open the link on their phone.

### What's broken on mobile (375px iPhone):
1. **Header overflows** — 40px padding + gap + logo + nav items don't fit
2. **Chat input area breaks** — "Group Comment" + "Ask Author" buttons + text input overflow horizontally
3. **Chat header overflows** — Back button + title + 2 action buttons don't fit
4. **Zero media queries in ClubChat.css** — the entire chat page has no mobile optimization
5. **Only 1 media query in App.css** — grossly insufficient
6. **Touch targets too small** — most buttons are 34-38px (need 44px minimum)
7. **Delete message button invisible** — opacity:0, only shows on hover (mobile has no hover)
8. **Mind map modal** — height:90vh breaks with mobile address bar, detail panel overlaps content
9. **Font sizes too large** — 2-2.5rem headings waste space on mobile
10. **Excessive padding** — 30-40px padding on modals, 60px on empty states

### Recommended approach:
- Add responsive breakpoints: 375px, 480px, 768px, 1024px
- **Header:** Stack logo above nav on mobile, hamburger menu or condensed nav
- **Chat:** Stack send buttons vertically, full-width input, increase touch targets
- **Modals:** Reduce padding, full-width on mobile, larger buttons
- **Mind map:** Use dvh instead of vh, reposition detail panel
- **Global:** Increase all button padding to 44px minimum touch target

### Files to modify (in priority order):
1. `frontend/src/pages/ClubChat.css` — Most critical, 0 media queries
2. `frontend/src/App.css` — Header, nav, buttons, book grid
3. `frontend/src/components/CreateClubModal.css` — Modal sizing
4. `frontend/src/components/MindMapVisualization.css` — Height, detail panel
5. `frontend/src/pages/MyClubs.js` — Inline styles need responsive adjustments
6. `frontend/src/components/JoinClubModal.js` — Inline styles

## Priority 2: CSS Transitions & Animations
- Add `transition: all 0.3s ease` on all interactive elements
- Fade-in animations on page loads

## Priority 3: Typography Hierarchy
- Improve heading/body/caption sizing and spacing

## Key Context
- **Project:** BooKlub - Social book club app with AI author chat
- **Working Directory:** /Users/mrl/.claude-worktrees/booklub-app/charming-moore/
- **Branch:** charming-moore (use PR workflow to deploy to main)
- **User:** Non-technical, handle all git operations
- **No gh CLI** — use GitHub web links for PRs

## Production URLs
- Frontend: https://booklub.krispychuck.com
- Backend: https://booklub-app.onrender.com

## What's Working
- User authentication (Clerk)
- Club creation + Join Club
- Chat messaging (group + AI author)
- Mind Map visualization (D3.js radial tree)
- Gold design system on all primary buttons + header nav
- Custom domain: booklub.krispychuck.com
- Logo: Booklub-marquee2.png (Art Nouveau parchment style)
- Loading states: Book-riffling animation on all views + branded startup screen

## What's Broken
- No known functional bugs (see KNOWN_BUGS.md)
- **Mobile responsiveness is severely broken** — see Priority 1 above

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

**Last Updated:** February 6, 2026
