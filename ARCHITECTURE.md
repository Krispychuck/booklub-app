# BooKlub Architecture Diagram

**Last Updated:** February 5, 2026

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER'S BROWSER                                  │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    REACT FRONTEND APPLICATION                          │ │
│  │                   (Hosted on Cloudflare Pages)                         │ │
│  │                   https://booklub.pages.dev                            │ │
│  │                                                                        │ │
│  │  Components:                                                           │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐      │ │
│  │  │   Home.js   │  │ MyClubs.js   │  │    ClubChat.js          │      │ │
│  │  │             │  │              │  │                         │      │ │
│  │  │ • Browse    │  │ • List user's│  │ • Display messages      │      │ │
│  │  │   books     │  │   clubs      │  │ • Send user messages    │      │ │
│  │  │ • Select    │  │ • Create new │  │ • "Ask Author" button   │      │ │
│  │  │   book for  │  │   club       │  │ • "Group Comment" button│      │ │
│  │  │   club      │  │ • Join club  │  │ • "Map Discussion" btn  │      │ │
│  │  └─────────────┘  └──────────────┘  └─────────────────────────┘      │ │
│  │                                                                        │ │
│  │  Modals:                                                               │ │
│  │  ┌──────────────┐ ┌───────────────┐ ┌────────────────────────┐       │ │
│  │  │CreateClubModal│ │JoinClubModal │ │MindMapVisualization.js │       │ │
│  │  │              │ │               │ │                        │       │ │
│  │  │• Club name   │ │• Invite code  │ │• D3.js radial tree     │       │ │
│  │  │• Book select │ │• Validate code│ │• Interactive zoom/pan  │       │ │
│  │  └──────────────┘ └───────────────┘ └────────────────────────┘       │ │
│  │                                                                        │ │
│  │  Configuration:                                                        │ │
│  │  ┌──────────────────────────────────────────────────────────┐         │ │
│  │  │  config.js                                                │         │ │
│  │  │  • API_URL = https://booklub-app.onrender.com            │         │ │
│  │  │  • Centralized API endpoint configuration                │         │ │
│  │  └──────────────────────────────────────────────────────────┘         │ │
│  │                                                                        │ │
│  │  Dependencies:                                                         │ │
│  │  • React 18                                                            │ │
│  │  • React Router DOM (navigation)                                      │ │
│  │  • D3.js (mind map visualization)                                     │ │
│  │  • @clerk/clerk-react (authentication UI)                             │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTPS Requests
                                      │ (REST API calls)
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION LAYER                                  │
│                              (Clerk)                                         │
│                    https://accounts.clerk.dev                                │
│                                                                              │
│  Responsibilities:                                                           │
│  • User sign-up / sign-in (email, social auth)                              │
│  • Session management (JWT tokens)                                           │
│  • User authentication state                                                 │
│  • Provides Clerk User ID (e.g., "user_37xf2hsa6gyK5ugr7ZTh3nNlQGn")       │
│                                                                              │
│  Configuration:                                                              │
│  • Development Key: pk_test_... (no custom domain needed)                   │
│  • Default Clerk domain for auth flows                                      │
│                                                                              │
│  Note: Frontend uses Clerk ID, but MUST convert to database ID              │
│        before making backend API calls                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ User authenticated
                                      │ Frontend gets Clerk User object
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     NODE.JS BACKEND API SERVER                               │
│                          (Express.js)                                        │
│                    Hosted on Render.com                                      │
│                https://booklub-app.onrender.com                              │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  server.js (Main Express App)                                          │ │
│  │                                                                        │ │
│  │  Middleware:                                                           │ │
│  │  • CORS (allow Cloudflare Pages origin)                               │ │
│  │  • Body parser (JSON)                                                  │ │
│  │  • Error handling                                                      │ │
│  │                                                                        │ │
│  │  Health Check:                                                         │ │
│  │  • GET /api/health → Returns server status                            │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  API Routes (routes/)                                                  │ │
│  │                                                                        │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │  │ users.js                                                         │  │ │
│  │  │ • GET /api/users/clerk/:clerkId → Get DB user by Clerk ID       │  │ │
│  │  │ • POST /api/users → Create new user with display name           │  │ │
│  │  │ • PUT /api/users/:id → Update user display name                 │  │ │
│  │  │                                                                  │  │ │
│  │  │ CRITICAL: Converts Clerk ID → Database integer ID               │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                        │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │  │ books.js                                                         │  │ │
│  │  │ • GET /api/books → List all books in catalog                    │  │ │
│  │  │ • GET /api/books/:id → Get specific book details                │  │ │
│  │  │                                                                  │  │ │
│  │  │ Returns: title, author, genre, publication_year,                │  │ │
│  │  │          ai_author_prompt (for AI persona)                      │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                        │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │  │ clubs.js                                                         │  │ │
│  │  │ • GET /api/clubs?userId=:id → Get user's clubs                  │  │ │
│  │  │ • POST /api/clubs → Create new club (generates invite code)     │  │ │
│  │  │ • POST /api/clubs/join → Join club by invite code               │  │ │
│  │  │ • GET /api/clubs/:clubId/members → List club members            │  │ │
│  │  │ • DELETE /api/clubs/:clubId/members/:userId → Leave club        │  │ │
│  │  │ • DELETE /api/clubs/:clubId → Delete club (creator only)        │  │ │
│  │  │                                                                  │  │ │
│  │  │ Requires: Database integer user ID (NOT Clerk ID)               │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                        │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │  │ messages.js                                                      │  │ │
│  │  │ • GET /api/messages/club/:clubId → Get all club messages        │  │ │
│  │  │ • POST /api/messages → Post user message ("user" type)          │  │ │
│  │  │ • POST /api/messages/ai → Send to AI, save response ("ai" type) │  │ │
│  │  │ • DELETE /api/messages/:messageId → Delete message              │  │ │
│  │  │ • GET /api/messages/club/:clubId/mind-map → Generate mind map   │  │ │
│  │  │                                                                  │  │ │
│  │  │ AI Flow: User message → Claude API → AI response → Save to DB  │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  db.js (Database Connection)                                           │ │
│  │                                                                        │ │
│  │  • PostgreSQL connection pool                                          │ │
│  │  • Connects to Neon database                                           │ │
│  │  • Used by all routes for queries                                      │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  Dependencies:                                                               │
│  • Express.js (web framework)                                                │
│  • pg (PostgreSQL client)                                                    │
│  • @anthropic-ai/sdk (Claude API client)                                    │
│  • cors (cross-origin requests)                                              │
│  • dotenv (environment variables)                                            │
└─────────────────────────────────────────────────────────────────────────────┘
                    │                                 │
                    │                                 │
                    ▼                                 ▼
┌──────────────────────────────┐    ┌──────────────────────────────────────┐
│      DATABASE LAYER          │    │        AI LAYER                      │
│    (PostgreSQL on Neon)      │    │   (Anthropic Claude API)             │
│  console.neon.tech           │    │   console.anthropic.com              │
│                              │    │                                      │
│  Tables:                     │    │  Responsibilities:                   │
│  ┌────────────────────────┐  │    │  • Generate AI author responses     │
│  │ users                  │  │    │  • Use book's ai_author_prompt      │
│  │ • id (serial PK)       │  │    │  • Maintain author persona          │
│  │ • clerk_id (text)      │  │    │  • Context-aware replies            │
│  │ • email (text)         │  │    │  • Generate mind map analysis       │
│  │ • name (display name)  │  │    │                                      │
│  │ • created_at           │  │    │  Model: Claude 3.5 Sonnet            │
│  └────────────────────────┘  │    │                                      │
│                              │    │  API Calls:                          │
│  ┌────────────────────────┐  │    │  1. POST /api/messages/ai            │
│  │ books                  │  │    │     → Backend sends message history  │
│  │ • id (serial PK)       │  │    │     → Claude generates response      │
│  │ • title (text)         │  │    │     → Backend saves to messages      │
│  │ • author (text)        │  │    │                                      │
│  │ • genre (text)         │  │    │  2. GET /api/messages/.../mind-map   │
│  │ • publication_year     │  │    │     → Backend sends all messages     │
│  │ • ai_author_prompt     │  │    │     → Claude analyzes themes         │
│  │ • created_at           │  │    │     → Returns mind map data          │
│  └────────────────────────┘  │    └──────────────────────────────────────┘
│                              │
│  ┌────────────────────────┐  │
│  │ book_clubs             │  │
│  │ • id (serial PK)       │  │
│  │ • name (text)          │  │
│  │ • book_id (FK)         │  │
│  │ • creator_user_id (FK) │  │
│  │ • invite_code (text)   │  │
│  │ • status (text)        │  │
│  │ • created_at           │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ club_members           │  │
│  │ • club_id (FK)         │  │
│  │ • user_id (FK)         │  │
│  │ • role (text)          │  │
│  │ • joined_at            │  │
│  │ PRIMARY KEY: (club_id, │  │
│  │              user_id)  │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ messages               │  │
│  │ • id (serial PK)       │  │
│  │ • club_id (FK)         │  │
│  │ • user_id (FK)         │  │
│  │ • message_type (text)  │  │
│  │   → "user" or "ai"     │  │
│  │ • content (text)       │  │
│  │ • ai_author_name (text)│  │
│  │ • created_at           │  │
│  └────────────────────────┘  │
│                              │
│  Connection:                 │
│  • SSL/TLS encrypted         │
│  • Connection pooling        │
│  • Serverless Postgres       │
└──────────────────────────────┘
```

---

## Data Flow Examples

### 1. User Signs In
```
User clicks "Sign In"
  → Clerk modal opens (Clerk handles auth)
  → User authenticates
  → Clerk returns JWT + User object with Clerk ID
  → Frontend receives Clerk User
  → App.js checks if user exists in DB:
      GET /api/users/clerk/{clerkId}
  → If not exists, create user:
      POST /api/users (with clerk_id, email)
  → User can now access app
```

### 2. User Creates a Book Club
```
User selects book → clicks "Create Club"
  → CreateClubModal opens
  → User enters club name
  → Modal has Clerk user.id (string)
  → CRITICAL: Modal converts Clerk ID → DB ID
      GET /api/users/clerk/{clerkId}
      Returns: { id: 123, clerk_id: "user_...", name: "..." }
  → Modal sends club creation:
      POST /api/clubs
      Body: { name: "...", bookId: X, userId: 123 }
  → Backend generates invite code
  → Backend creates club_clubs record
  → Backend adds creator to club_members
  → Returns club with invite code
  → Frontend refreshes club list
```

### 3. User Joins a Club
```
User clicks "Join Club" → enters invite code
  → JoinClubModal receives userId prop (already DB integer ID from App.js)
  → Sends join request directly:
      POST /api/clubs/join
      Body: { inviteCode: "ABC123", userId: 1 }
  → Backend validates invite code exists
  → Backend checks user not already member
  → Backend adds to club_members table
  → Returns success
  → Frontend shows success modal, navigates to club chat
```
Note: App.js resolves Clerk ID → DB ID at login. Components receive
the DB ID via props — no need to re-lookup via /api/users/clerk/.

### 4. User Chats with AI Author
```
User in club chat → types message → clicks "Ask Author"
  → Frontend converts Clerk ID → DB ID
  → Sends user message:
      POST /api/messages
      Body: { clubId: X, userId: 123, messageType: "user", content: "..." }
  → Backend saves user message
  → Frontend immediately sends AI request:
      POST /api/messages/ai
      Body: { clubId: X, bookId: Y, messageHistory: [...] }
  → Backend retrieves book's ai_author_prompt
  → Backend calls Anthropic Claude API:
      - System prompt: ai_author_prompt
      - Messages: conversation history
  → Claude generates response (as book author)
  → Backend saves AI message:
      INSERT INTO messages (club_id, message_type: "ai",
                           content: "...", ai_author_name: "...")
  → Backend returns AI message to frontend
  → Frontend displays AI response in chat
```

### 5. User Views Mind Map
```
User in club chat → clicks "Map Discussion"
  → MindMapVisualization component opens
  → Makes API request:
      GET /api/messages/club/{clubId}/mind-map
  → Backend retrieves ALL messages for club
  → Backend calls Anthropic Claude API:
      - Analyzes conversation themes
      - Identifies discussion branches
      - Attributes comments to participants
      - Returns structured mind map data
  → Frontend receives JSON structure
  → D3.js renders radial tree visualization
  → User can zoom, pan, explore themes
```

---

## Key Architectural Decisions

### 1. **Clerk ID vs Database ID Pattern**
**Problem:** Clerk provides string IDs (e.g., "user_37xf..."), but our database uses integer IDs.

**Solution:**
- Frontend always fetches database user via `/api/users/clerk/{clerkId}` first
- All backend API calls use database integer ID
- This pattern is implemented in ALL components that make user-specific API calls

**Components that use this pattern:**
- MyClubs.js
- CreateClubModal.js
- JoinClubModal.js
- ClubChat.js

### 2. **Two-Button Chat System**
**Problem:** Users wanted human-to-human chat without AI interrupting every message.

**Solution:**
- "Group Comment" button → Posts message without triggering AI
- "Ask Author" button → Posts message AND requests AI response
- Gives users control over when AI participates

### 3. **Independent Display Names**
**Problem:** Don't want to be locked into Clerk's user management for display names.

**Solution:**
- Separate `name` field in users table
- DisplayNameModal prompts new users
- Users can change display name anytime
- Not tied to Clerk's user object

### 4. **Invite Code System**
**Problem:** Need simple way to share clubs without complex permissions.

**Solution:**
- Auto-generate random invite codes on club creation
- Anyone with code can join (simple, no approval needed)
- Stored in book_clubs table
- No expiration (can be enhanced later)

### 5. **Serverless Database**
**Why Neon?**
- PostgreSQL (familiar, reliable)
- Serverless (auto-scales, no maintenance)
- Free tier sufficient for MVP
- Connection pooling built-in

### 6. **Edge Hosting**
**Why Cloudflare Pages?**
- Fast global CDN
- Free tier with unlimited bandwidth
- Auto-deploys from GitHub
- Environment variable management

**Why Render for backend?**
- Free tier for Node.js apps
- Stays warm better than some alternatives
- Easy PostgreSQL connection
- Simple environment variable management

### 7. **Mind Map with D3.js**
**Why D3.js?**
- Powerful data visualization library
- Radial tree layout perfect for discussion themes
- Interactive (zoom, pan, explore)
- Cinema aesthetic achievable with CSS

**Why Claude API for mind map?**
- Understands conversation context
- Identifies themes and connections
- Attributes insights to participants
- Better than rule-based parsing

### 8. **Button Design System - Vintage Gold as Primary**
**Decision:** Use black/gold/white buttons as primary action style throughout app
**Rationale:**
- Gold (`#c8aa6e`) evokes vintage cinema, film reels, and Hollywood's golden age
- Creates distinctive, sophisticated brand identity
- Provides clear visual hierarchy: gold = primary action, black/white = secondary
- Discovered in compassionate-haibt worktree, user loved the aesthetic
**Implementation:**
- Primary actions (Ask Author, Create Club, Map Discussion) → Vintage gold accent
- Secondary actions (Group Comment, Back, Members) → Pure black/white
- Tertiary actions (Delete, Close) → Minimal border style
**Reference:** See `DESIGN_SYSTEM.md` for complete button specifications

---

## Environment Variables

### Frontend (Cloudflare Pages)
```
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_...
REACT_APP_API_URL=https://booklub-app.onrender.com
NODE_VERSION=18
```

### Backend (Render)
```
DATABASE_URL=postgresql://...@neon.tech/neondb...
ANTHROPIC_API_KEY=sk-ant-api03-...
PORT=3001
NODE_ENV=production
```

---

## Security Considerations

### 1. **Authentication**
- Clerk handles all auth (secure, industry-standard)
- JWT tokens in HTTP-only cookies
- No passwords stored in our database

### 2. **API Security**
- CORS restricted to Cloudflare Pages domain
- No authentication middleware yet (trust Clerk frontend)
- Future: Validate Clerk JWT on backend

### 3. **Database**
- SSL/TLS encrypted connections
- Credentials in environment variables (not committed)
- Connection pooling prevents exhaustion

### 4. **Secrets Management**
- Never commit .env files
- GitHub secret scanning enabled
- Render/Cloudflare manage production secrets

---

## Scalability Considerations

### Current Limitations (MVP)
- No message pagination (loads all messages)
- No real-time updates (manual refresh needed)
- Single region backend (Render default)
- No caching layer

### Future Enhancements
- WebSocket for real-time messages
- Redis for caching
- Message pagination (load on scroll)
- CDN for static assets
- Multiple backend regions

---

## Deployment Pipeline

```
Developer (Claude) makes changes
  ↓
Commit to charming-moore branch
  ↓
Push to GitHub
  ↓
Create Pull Request (charming-moore → main)
  ↓
Merge PR to main
  ↓
┌─────────────────────────┐
│  GitHub main branch     │
│  (single source of      │
│   truth)                │
└─────────────────────────┘
  ↓                    ↓
  ↓                    ↓
┌──────────────────┐  ┌──────────────────┐
│ Cloudflare Pages │  │  Render          │
│ (Frontend)       │  │  (Backend)       │
│                  │  │                  │
│ • Detects push   │  │ • Detects push   │
│ • Builds React   │  │ • Pulls code     │
│ • Deploys to CDN │  │ • Restarts       │
│ • 2-3 min deploy │  │ • 1-2 min deploy │
└──────────────────┘  └──────────────────┘
  ↓                    ↓
  ↓                    ↓
Production Live ✅
```

---

## Technology Stack Summary

| Layer | Technology | Provider | Cost |
|-------|-----------|----------|------|
| **Frontend** | React 18 | Cloudflare Pages | Free |
| **Authentication** | Clerk | Clerk.dev | Free (dev tier) |
| **Backend** | Node.js + Express | Render | Free tier |
| **Database** | PostgreSQL | Neon | Free tier |
| **AI** | Claude 3.5 Sonnet | Anthropic | Pay-per-use |
| **Visualization** | D3.js | Open source | Free |
| **Version Control** | Git | GitHub | Free |

---

## File Structure Reference

```
booklub-app/
├── frontend/
│   ├── src/
│   │   ├── pages/           # Main views
│   │   │   ├── Home.js      # Book browsing
│   │   │   ├── MyClubs.js   # User's clubs list
│   │   │   └── ClubChat.js  # Chat interface
│   │   ├── components/      # Reusable UI
│   │   │   ├── CreateClubModal.js
│   │   │   ├── JoinClubModal.js
│   │   │   ├── MembersModal.js
│   │   │   ├── DisplayNameModal.js
│   │   │   ├── MindMapVisualization.js
│   │   │   └── MindMapVisualization.css
│   │   ├── config.js        # API URL config
│   │   ├── App.js           # Main app + Clerk setup
│   │   └── index.js         # Entry point
│   ├── public/              # Static assets
│   └── package.json         # Dependencies
│
├── backend/
│   ├── routes/              # API endpoints
│   │   ├── users.js         # User management
│   │   ├── books.js         # Book catalog
│   │   ├── clubs.js         # Club CRUD
│   │   └── messages.js      # Chat + AI
│   ├── db.js                # Database connection
│   ├── server.js            # Express app
│   └── package.json         # Dependencies
│
├── database/
│   └── init.sql             # Schema definition
│
└── docs/                    # Documentation
    ├── ARCHITECTURE.md      # This file
    ├── CURRENT_STATUS.md    # Configuration details
    ├── CLAUDE_QUICK_START.md # Quick reference
    └── DEVELOPMENT_ROADMAP.md # Feature tracking
```

---

## 📝 Maintenance Instructions

**IMPORTANT:** This document should be updated whenever:
- New components are added to the frontend or backend
- New API endpoints are created or modified
- New external services are integrated (databases, APIs, providers)
- Major architectural decisions are made
- Data flow patterns change
- Security or scalability considerations are updated

**When making changes:**
1. Update the relevant diagram section with ASCII art changes
2. Add new data flow examples if user-facing behavior changes
3. Document architectural decisions in the "Key Architectural Decisions" section
4. Update the technology stack summary table if providers change
5. Keep the file structure reference current

This living document helps future sessions understand the system quickly and make informed decisions.

---

**End of Architecture Document**
