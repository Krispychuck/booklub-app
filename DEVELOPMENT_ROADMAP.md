# BooKlub Development Roadmap

**Last Updated:** February 4, 2026
**Project Status:** MVP Nearly Complete - Mind Map Feature Restored

---

## Completed Features ✅

### Phase 1: Foundation (Completed)
- [x] Development environment setup (VS Code, Node.js, Git, GitHub)
- [x] PostgreSQL database with schema design
- [x] Express backend with RESTful API structure
- [x] React frontend with component architecture
- [x] Classic black-and-white cinema aesthetic design

### Phase 2: Core Infrastructure (Completed)
- [x] Book catalog with 5 classic public domain titles
- [x] Clerk authentication integration
- [x] Conditional UI rendering for signed-in users
- [x] Book browsing interface (grid display)

### Phase 3: Club Management (Completed)
- [x] Book club creation with database persistence
- [x] Auto-generated invite codes
- [x] "My Clubs" page displaying user's clubs
- [x] Club creation modal with form handling

### Phase 4: Chat Interface & AI Integration (Completed Jan 12, 2026)
- [x] **Chat interface page** - Core discussion UI for book clubs
- [x] **Message persistence** - Store and retrieve conversation history
- [x] **Claude API integration** - AI author personas in discussions
- [x] **Delete message functionality** - Custom modal for removing messages
- [ ] **Real-time updates** - Messages appear without page refresh (deferred to future)

### Phase 4.5: User Identity & Chat Improvements (Completed Jan 14, 2026)
- [x] **User display names** - Independent user identity system separate from Clerk
- [x] **Display name modal** - Prompt for new users to choose their handle
- [x] **Change display name** - Users can update name anytime via header
- [x] **Names in chat** - Messages show actual user names instead of "User"
- [x] **Two-button chat system** - "Group Comment" vs "Ask Author" for conversation control
- [x] **Sign In button styling** - Matches black-and-white cinema aesthetic
- [x] **Clickable sign-in prompt** - Auth prompt text triggers sign-in modal

### Phase 5: Club Membership (Completed Jan 15, 2026)
- [x] **Join club via invite code** - Modal to enter code and join existing clubs
- [x] **Member list display** - Show who's in each club
- [x] **Leave club functionality** - Allow members to exit clubs
- [x] **Delete club functionality** - Allow creators to delete clubs

### Phase 6: Mind Map Visualization (Completed Feb 4, 2026)
- [x] **Mind Map Synthesis** - Visual mind maps showing discussion connections
  - Recovered from compassionate-haibt worktree
  - D3.js radial tree visualization implemented
  - "Map Discussion" button integrated in ClubChat header
  - Full-screen overlay with cinema aesthetic
  - Interactive zoom/pan capabilities
  - Shows themes, branches, and participant attribution
  - Makes API call to `/api/messages/club/:clubId/mind-map`
  - Components: MindMapVisualization.js and MindMapVisualization.css
  - Status: Code integrated, pending deployment testing

---

## Current Sprint 🚧
- [ ] **Authors & Books** *[Added: Jan 15, 2026]*
  - Adding 15-25 books
  - Adding commensurate 15-25 author AI personas
---

## Upcoming Features 📋

### Phase 7: Enhanced Discussion Experience
- [ ] **Generative Typography Book Covers**
  - Unique literary covers generated with CSS
  - Reflects the content/themes of each book

- [ ] **Branching Constellation Discussion View** *(optional - evaluate after MVP)*
  - Visual representation of how conversation threads branch
  - Alternative to traditional linear chat

### Phase 8: AI Enhancements
- [ ] **Multiple AI personas per discussion** - Add historical figures, experts
- [ ] **Author personality refinement** - Improve AI prompts for authenticity
- [ ] **Context-aware responses** - AI references specific passages from books

### Phase 9: User Experience Polish
- [ ] **Reading progress tracking** - Track which chapter/page users are on
- [ ] **Book annotations** - Highlight and comment on specific passages
- [ ] **Discussion topics/prompts** - Suggested conversation starters
- [ ] **Notification system** - Alert users to new messages

---

## Future Considerations (Post-MVP) 🔮

### Business Features
- [ ] Author licensing agreements system
- [ ] Royalty tracking for living authors
- [ ] Premium subscription tiers

### Scale & Performance
- [ ] Message pagination (load older messages on scroll)
- [ ] Caching layer for book catalog
- [ ] Database indexing optimization

### Platform Expansion
- [ ] Mobile app (React Native)
- [ ] Integration with book platforms (Kindle, Audible)
- [ ] Social sharing features

### Content Expansion
- [ ] Expand to 100 public domain books
- [ ] Living author partnerships
- [ ] Discussion guides and reading lists

---

## Decision Log 📝

| Date | Decision | Rationale | Trade-offs |
|------|----------|-----------|------------|
| Sep 2025 | Mind Map Synthesis for AI summaries | Users familiar with concept, intuitive | More complex to build than simple text summaries |
| Sep 2025 | Generative Typography for book covers | Uniquely literary, achievable with CSS | Less visual variety than photo-based covers |
| Sep 2025 | Branching Constellation discussion view | Innovative, shows idea connections | Evaluate complexity vs. traditional chat |
| Jan 2026 | Skip "Join Club" feature temporarily | Routing issues; focus on chat interface first | Manual club sharing for now |
| Jan 2026 | Separate user identity from Clerk | Avoid vendor lock-in, control over display names | Extra sync logic needed |
| Jan 2026 | Two-button chat (Group/Ask Author) | Users control when AI responds, enables human-to-human chat | Slightly more complex UI |
| Feb 2026 | Recover Mind Map from other worktree | Feature already built, avoid rebuilding from scratch | Need to check multiple worktrees for lost work |
---

## Technical Debt & Known Issues 🔧

- [x] ~~Express routing issue with POST /clubs/join endpoint~~ - RESOLVED (Feb 2026)
- [x] ~~Clerk ID vs Database ID conversion~~ - RESOLVED (Feb 2026, all components updated)
- [ ] Duplicate MyClubs.jsx file (not used, can be removed)
- [ ] Need to add error handling for API failures
- [ ] Add loading states for async operations
- [ ] Mind Map backend endpoint may need verification after deployment

---

## Notes

- **MVP Definition:** Basic book club with AI speaking from author's POV + ability to add one other human member
- **Design Aesthetic:** Black & white, classic early cinema feel
- **Book Sources:** Project Gutenberg (public domain)
- **AI Integration:** Anthropic Claude API

---

*This document should be updated as features are completed or new items are added to the roadmap.*
