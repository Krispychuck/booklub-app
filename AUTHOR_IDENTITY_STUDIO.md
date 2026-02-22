# Author Identity Studio

## Architecture Specification & Wireframes

**Version:** 1.0
**Date:** February 22, 2026
**Status:** Architecture Design

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [System Architecture](#2-system-architecture)
3. [Embed Snippet Architecture](#3-embed-snippet-architecture)
4. [Page-by-Page Wireframes](#4-page-by-page-wireframes)
5. [API Design](#5-api-design)
6. [Implementation Phases](#6-implementation-phases)
7. [Integration with Existing BooKlub](#7-integration-with-existing-booklub)
8. [Design Notes](#8-design-notes)

---

## 1. Product Overview

### What Is the Author Identity Studio?

The Author Identity Studio is a self-service portal where authors create, manage, test, and deploy their AI persona. Think of it as **Stripe for AI author personas**: just as Stripe lets developers embed payments anywhere with a code snippet, the Author Identity Studio (BookIMO) lets authors embed their AI persona on any website with a single `<script>` tag.

Authors build their persona once in the Studio -- defining personality, voice, knowledge, and boundaries -- then deploy it everywhere: inside BooKlub book clubs, on their personal website, on their publisher's catalog page, or anywhere else on the web.

### Who Is It For?

| Audience | Use Case |
|----------|----------|
| **Indie Authors** | Create an AI persona for their self-published book, embed it on their author website to engage readers |
| **Traditionally Published Authors** | Work with their publisher to create an official persona that lives across multiple platforms |
| **Publishers** | Manage a catalog of author personas, deploy them across their website, monitor analytics at scale |

### How Does It Connect to the Reader-Side BooKlub?

The Studio and BooKlub are **one platform with two doorways**:

- **Readers** enter through BooKlub (book clubs, discussions, AI author chats)
- **Authors** enter through the Studio (persona builder, sandbox, analytics, embed)
- **Same backend, same database, same AI infrastructure**

When a reader in a BooKlub club asks the AI author a question, the system uses the author's persona from the Studio. When an author corrects a response in the Studio, it immediately improves the experience for readers in BooKlub clubs.

### The Stripe Analogy

```
Stripe: Dashboard → Create payment config → Get <script> snippet → Embed on any site
BookIMO: Studio  → Create AI persona     → Get <script> snippet → Embed on any site
```

- **Dashboard** = Author Identity Studio (persona management, analytics, billing)
- **API Keys** = Embed keys (`pk_live_abc123def456`)
- **Checkout Widget** = Chat widget (lightweight, customizable, embeddable)
- **Webhook events** = Analytics pipeline (conversations, topics, sentiment)

---

## 2. System Architecture

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BOOKLUB PLATFORM                             │
│                                                                     │
│  ┌─────────────────────┐         ┌─────────────────────────────┐   │
│  │   AUTHOR PORTAL      │         │   READER PORTAL              │   │
│  │   (New React Routes) │         │   (Existing BooKlub)         │   │
│  │                      │         │                              │   │
│  │  /studio/dashboard   │         │  /clubs                     │   │
│  │  /studio/personas    │         │  /clubs/:id/chat            │   │
│  │  /studio/sandbox     │         │  /books                     │   │
│  │  /studio/analytics   │         │                              │   │
│  │  /studio/embed       │         │                              │   │
│  │  /studio/corrections │         │                              │   │
│  │  /studio/billing     │         │                              │   │
│  └──────────┬──────────┘         └──────────────┬───────────────┘   │
│             │                                    │                   │
│             └──────────────┬─────────────────────┘                   │
│                            │                                         │
│                 ┌──────────▼──────────┐                              │
│                 │  SHARED BACKEND API  │                              │
│                 │  (Express/Node.js)   │                              │
│                 │                      │                              │
│                 │  /api/author/*       │◄─── Clerk Auth (Author)     │
│                 │  /api/books/*        │◄─── Clerk Auth (Reader)     │
│                 │  /api/clubs/*        │◄─── Clerk Auth (Reader)     │
│                 │  /api/messages/*     │◄─── Clerk Auth (Reader)     │
│                 │  /api/embed/*        │◄─── Embed Key + Domain      │
│                 └──────────┬──────────┘                              │
│                            │                                         │
│              ┌─────────────┼─────────────┐                           │
│              │             │             │                            │
│    ┌─────────▼───┐  ┌─────▼─────┐  ┌───▼──────────┐                │
│    │  AI ENGINE   │  │ DATABASE  │  │  ANALYTICS    │                │
│    │  (Claude API)│  │ (Neon PG) │  │  PIPELINE     │                │
│    │              │  │           │  │               │                │
│    │ Prompt       │  │ users     │  │ Conversation  │                │
│    │ Construction │  │ books     │  │ tracking      │                │
│    │ + Persona    │  │ clubs     │  │ Topic         │                │
│    │ Assembly     │  │ messages  │  │ extraction    │                │
│    │              │  │ personas  │  │ Sentiment     │                │
│    │              │  │ embeds    │  │ analysis      │                │
│    └─────────────┘  └───────────┘  └───────────────┘                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

                    ┌──────────────────────────┐
                    │  EMBED WIDGET SERVICE     │
                    │  (CDN-hosted JS bundle)   │
                    │                           │
                    │  embed.bookimo.ai/v1/     │
                    │    widget.js              │
                    │    widget.css             │
                    └────────────┬─────────────┘
                                 │
                    Embedded on author websites,
                    publisher pages, blogs, etc.
```

### Request Flow: Reader Asks Author in BooKlub

```
Reader types question in club chat
        │
        ▼
POST /api/messages/club/:clubId/ai-response
        │
        ▼
Backend looks up book → finds author_persona_id
        │
        ▼
buildPersonaPrompt(persona) → system prompt
        │
        ▼
Claude API call with system prompt + conversation history
        │
        ▼
Response saved to messages table → returned to reader
```

### Request Flow: Visitor Uses Embed Widget

```
Visitor loads author's website
        │
        ▼
<script> tag loads widget.js from CDN
        │
        ▼
Widget calls GET /api/embed/:embedKey/config
        │
        ▼
Backend validates domain (allowed_domains whitelist)
        │
        ▼
Widget renders chat bubble with greeting message
        │
        ▼
Visitor sends message → POST /api/embed/:embedKey/chat
        │
        ▼
Backend: rate limit check → build persona prompt → Claude API
        │
        ▼
Response returned to widget → analytics logged
```

### Database Schema

All new tables integrate with the existing BooKlub database (Neon PostgreSQL).

```sql
-- ============================================================
-- AUTHOR ACCOUNTS
-- Links a user to their author profile and subscription
-- ============================================================
CREATE TABLE author_accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  subscription_tier VARCHAR(20) DEFAULT 'indie',
    -- 'indie', 'professional', 'publisher'
  company_name VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================
-- AUTHOR PERSONAS
-- The core personality definition for an AI author
-- ============================================================
CREATE TABLE author_personas (
  id SERIAL PRIMARY KEY,
  author_account_id INTEGER REFERENCES author_accounts(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id),
    -- NULL = career-wide persona (not tied to a specific book)
  persona_name VARCHAR(255) NOT NULL,
  personality_prompt TEXT,
    -- Core personality instructions (tone, temperament, worldview)
  voice_guidelines TEXT,
    -- How the AI should speak (vocabulary, sentence structure, quirks)
  knowledge_base TEXT,
    -- Background info: biography, creative process, inspirations, anecdotes
  boundaries TEXT,
    -- Topics to avoid, guardrails, personal life limits
  greeting_message TEXT DEFAULT 'Hello! I''d love to discuss my work with you.',
    -- First message when a chat starts
  status VARCHAR(20) DEFAULT 'draft',
    -- 'draft', 'active', 'paused'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_author_personas_account ON author_personas(author_account_id);
CREATE INDEX idx_author_personas_book ON author_personas(book_id);
CREATE INDEX idx_author_personas_status ON author_personas(status);

-- ============================================================
-- EMBED CONFIGS
-- Configuration for the embeddable chat widget
-- ============================================================
CREATE TABLE embed_configs (
  id SERIAL PRIMARY KEY,
  persona_id INTEGER REFERENCES author_personas(id) ON DELETE CASCADE,
  embed_key VARCHAR(64) UNIQUE NOT NULL,
    -- Public key used in the <script> snippet, e.g. pk_live_abc123def456
  allowed_domains TEXT[] DEFAULT '{}',
    -- Domain whitelist, e.g. {'myauthorsite.com', 'publisher.com'}
  theme_config JSONB DEFAULT '{"theme": "light", "position": "bottom-right", "accentColor": "#c8aa6e"}',
    -- Visual customization for the widget
  rate_limit INTEGER DEFAULT 20,
    -- Max messages per minute per session
  max_messages_per_session INTEGER DEFAULT 50,
  show_branding BOOLEAN DEFAULT true,
    -- Show/hide "Powered by BookIMO"
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_embed_configs_persona ON embed_configs(persona_id);
CREATE INDEX idx_embed_configs_key ON embed_configs(embed_key);

-- ============================================================
-- EMBED SESSIONS
-- Track individual chat sessions from embed widgets
-- ============================================================
CREATE TABLE embed_sessions (
  id SERIAL PRIMARY KEY,
  embed_config_id INTEGER REFERENCES embed_configs(id) ON DELETE CASCADE,
  session_token VARCHAR(128) UNIQUE NOT NULL,
  domain VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  message_count INTEGER DEFAULT 0,
  started_at TIMESTAMP DEFAULT NOW(),
  last_active_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_embed_sessions_config ON embed_sessions(embed_config_id);
CREATE INDEX idx_embed_sessions_domain ON embed_sessions(domain);

-- ============================================================
-- EMBED USAGE
-- Aggregated usage statistics for billing and analytics
-- ============================================================
CREATE TABLE embed_usage (
  id SERIAL PRIMARY KEY,
  embed_config_id INTEGER REFERENCES embed_configs(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  domain VARCHAR(255),
  session_count INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  token_usage JSONB DEFAULT '{"input_tokens": 0, "output_tokens": 0}',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(embed_config_id, date, domain)
);

CREATE INDEX idx_embed_usage_config_date ON embed_usage(embed_config_id, date);

-- ============================================================
-- PERSONA CORRECTIONS
-- Author-submitted corrections to AI responses
-- ============================================================
CREATE TABLE persona_corrections (
  id SERIAL PRIMARY KEY,
  persona_id INTEGER REFERENCES author_personas(id) ON DELETE CASCADE,
  original_response TEXT NOT NULL,
  corrected_response TEXT NOT NULL,
  correction_note TEXT,
    -- Author's explanation of why this was wrong
  source VARCHAR(20) DEFAULT 'sandbox',
    -- 'sandbox', 'booklub', 'embed'
  applied_to_prompt BOOLEAN DEFAULT false,
    -- Has this correction been incorporated into the persona prompt?
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_persona_corrections_persona ON persona_corrections(persona_id);
CREATE INDEX idx_persona_corrections_applied ON persona_corrections(applied_to_prompt);

-- ============================================================
-- PERSONA ANALYTICS
-- Per-persona aggregate analytics
-- ============================================================
CREATE TABLE persona_analytics (
  id SERIAL PRIMARY KEY,
  persona_id INTEGER REFERENCES author_personas(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  source VARCHAR(20) NOT NULL,
    -- 'booklub', 'embed'
  conversation_count INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  top_topics JSONB DEFAULT '[]',
  avg_sentiment DECIMAL(3,2),
    -- -1.00 to 1.00
  token_usage JSONB DEFAULT '{"input_tokens": 0, "output_tokens": 0}',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(persona_id, date, source)
);

CREATE INDEX idx_persona_analytics_persona_date ON persona_analytics(persona_id, date);
```

---

## 3. Embed Snippet Architecture

### How It Works

1. Author creates and activates a persona in the Studio
2. Author generates an embed configuration (domain whitelist, theme)
3. Author copies a `<script>` snippet
4. Author pastes the snippet into their website HTML
5. Widget loads and renders a chat bubble
6. Visitors click to chat; widget communicates with BookIMO API
7. API validates domain, applies rate limits, serves persona-powered responses
8. All interactions are logged for the author's analytics dashboard

### Basic Embed Snippet

```html
<!-- BookIMO Author Chat Widget -->
<script
  src="https://embed.bookimo.ai/v1/widget.js"
  data-persona="pk_live_abc123def456"
  data-theme="light"
  data-position="bottom-right"
  data-greeting="Ask me about my latest novel!"
></script>
```

### Advanced Embed Snippet

```html
<!-- BookIMO Author Chat Widget (Advanced) -->
<script
  src="https://embed.bookimo.ai/v1/widget.js"
  data-persona="pk_live_abc123def456"
  data-theme="custom"
  data-position="bottom-right"
  data-greeting="Hello, dear reader! What would you like to discuss?"
  data-accent-color="#c8aa6e"
  data-bg-color="#1a1a1a"
  data-text-color="#f5f5f5"
  data-max-messages="30"
  data-branding="false"
  data-css-class="my-custom-widget"
></script>
```

### Programmatic API (for SPAs)

```javascript
// For React, Vue, Next.js, etc.
import BookIMO from '@bookimo/embed';

const chat = BookIMO.init({
  personaKey: 'pk_live_abc123def456',
  theme: 'dark',
  position: 'bottom-left',
  greeting: 'Welcome to my world of fiction!',
  onMessage: (msg) => console.log('New message:', msg),
  onOpen: () => analytics.track('chat_opened'),
  onClose: () => analytics.track('chat_closed'),
});

// Programmatic control
chat.open();
chat.close();
chat.destroy();
```

### Widget Customization Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `data-persona` | string | (required) | Public persona key |
| `data-theme` | string | `"light"` | `"light"`, `"dark"`, or `"custom"` |
| `data-position` | string | `"bottom-right"` | `"bottom-right"`, `"bottom-left"`, or `"inline"` |
| `data-greeting` | string | Persona default | Override the greeting message |
| `data-accent-color` | string | `"#c8aa6e"` | Primary accent color |
| `data-bg-color` | string | Theme default | Background color (custom theme) |
| `data-text-color` | string | Theme default | Text color (custom theme) |
| `data-max-messages` | number | `50` | Max messages per session |
| `data-branding` | boolean | `true` | Show/hide "Powered by BookIMO" |
| `data-css-class` | string | `""` | Custom CSS class for the widget container |

### Widget Technical Architecture

```
┌─────────────────────────────────────────────┐
│  Author's Website                            │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  Shadow DOM Container                   │  │
│  │  (Isolated styles, no CSS conflicts)    │  │
│  │                                         │  │
│  │  ┌──────────────────────────────────┐  │  │
│  │  │  Chat Bubble (collapsed)          │  │  │
│  │  │  ┌──┐                             │  │  │
│  │  │  │💬│ "Ask the Author"            │  │  │
│  │  │  └──┘                             │  │  │
│  │  └──────────────────────────────────┘  │  │
│  │                                         │  │
│  │  ┌──────────────────────────────────┐  │  │
│  │  │  Chat Panel (expanded)            │  │  │
│  │  │  ┌──────────────────────────┐    │  │  │
│  │  │  │  Header: Author Name      │    │  │  │
│  │  │  ├──────────────────────────┤    │  │  │
│  │  │  │  Messages Area            │    │  │  │
│  │  │  │  (scrollable)             │    │  │  │
│  │  │  ├──────────────────────────┤    │  │  │
│  │  │  │  Input + Send Button      │    │  │  │
│  │  │  ├──────────────────────────┤    │  │  │
│  │  │  │  Powered by BookIMO       │    │  │  │
│  │  │  └──────────────────────────┘    │  │  │
│  │  └──────────────────────────────────┘  │  │
│  └────────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

**Key technical decisions:**

- **Shadow DOM** isolates widget styles from the host page
- **Session tokens** stored in sessionStorage (no cookies, no PII)
- **Lazy loading**: widget.js is small (~15KB gzip); loads chat UI on demand
- **WebSocket optional**: starts with HTTP polling, upgrades to WS if available

### Security Considerations

| Concern | Mitigation |
|---------|------------|
| **Unauthorized embedding** | Domain whitelist validation on every API call; `Referer` and `Origin` header checks |
| **Rate limiting** | Per-embed-key rate limits (configurable, default 20 msg/min); per-session caps |
| **Content moderation** | Input sanitization; Claude's built-in safety; optional custom word filters |
| **No PII collection** | No cookies, no user accounts in embed mode; session tokens are anonymous |
| **CORS** | Strict CORS headers matching allowed_domains whitelist |
| **XSS prevention** | Shadow DOM isolation; all user content rendered as text nodes, never innerHTML |
| **Token abuse** | Embed keys are public but domain-locked; separate from author Clerk credentials |

---

## 4. Page-by-Page Wireframes

### 4.1 Author Dashboard

```
┌─────────────────────────────────────────────────────────────────────┐
│  BookIMO                                    [Account ▾]  [Sign Out] │
│  AUTHOR IDENTITY STUDIO                                             │
├──────────┬──────────────────────────────────────────────────────────┤
│          │                                                          │
│ Dashboard│  Welcome back, Margaret                                  │
│ ─────────│  ────────────────────────────────────────────────        │
│ Personas │                                                          │
│ Analytics│  ┌─────────────────────────┐  ┌────────────────────────┐ │
│ Embed    │  │  CONVERSATIONS           │  │  ACTIVE READERS        │ │
│ Training │  │                          │  │                        │ │
│ Billing  │  │      247                 │  │      89                │ │
│          │  │  this month (+12%)       │  │  this month (+5%)      │ │
│          │  └─────────────────────────┘  └────────────────────────┘ │
│          │                                                          │
│          │  ┌─────────────────────────┐  ┌────────────────────────┐ │
│          │  │  TOKEN USAGE             │  │  CORRECTIONS PENDING   │ │
│          │  │                          │  │                        │ │
│          │  │   52,340 / 100,000      │  │      3                 │ │
│          │  │  ████████░░ 52%         │  │  [Review →]            │ │
│          │  └─────────────────────────┘  └────────────────────────┘ │
│          │                                                          │
│          │  YOUR PERSONAS                                           │
│          │  ──────────────                                          │
│          │                                                          │
│          │  ┌─────────────────────────┐  ┌────────────────────────┐ │
│          │  │  The Great Gatsby        │  │  Career-Wide Persona   │ │
│          │  │  ● ACTIVE                │  │  ◐ DRAFT               │ │
│          │  │                          │  │                        │ │
│          │  │  142 conversations       │  │  Not yet activated     │ │
│          │  │  Last active: 2 hrs ago  │  │                        │ │
│          │  │                          │  │                        │ │
│          │  │  [Edit]  [Sandbox]       │  │  [Edit]  [Activate]   │ │
│          │  └─────────────────────────┘  └────────────────────────┘ │
│          │                                                          │
│          │  ┌──────────────────────────────────────────────────────┐│
│          │  │           + CREATE NEW PERSONA                       ││
│          │  └──────────────────────────────────────────────────────┘│
│          │                                                          │
│          │  RECENT ACTIVITY                                         │
│          │  ──────────────                                          │
│          │  • Reader asked about symbolism in Gatsby (2 hrs ago)    │
│          │  • Correction applied: tone adjustment (yesterday)       │
│          │  • New embed session from mysite.com (yesterday)         │
│          │  • 12 new conversations this week (weekly digest)        │
│          │                                                          │
│          │  SUBSCRIPTION: INDIE PLAN                                │
│          │  100,000 tokens/month  |  1 persona  |  [Upgrade]       │
│          │                                                          │
└──────────┴──────────────────────────────────────────────────────────┘
```

### 4.2 Create/Edit Persona

#### Step 1: Basic Info

```
┌─────────────────────────────────────────────────────────────────────┐
│  BookIMO                                    [Account ▾]  [Sign Out] │
│  CREATE PERSONA                                                     │
├──────────┬──────────────────────────────────────────────────────────┤
│          │                                                          │
│ Dashboard│  Step 1 of 5: BASIC INFORMATION                         │
│ ─────────│  ━━━━━━━━━━━━━░░░░░░░░░░░░░░░░░░░░░░░░░░░░  20%       │
│ Personas │                                                          │
│ Analytics│  ┌──────────────────────────────────────────────────────┐│
│ Embed    │  │                                                      ││
│ Training │  │  Persona Name                                        ││
│ Billing  │  │  ┌────────────────────────────────────────────────┐  ││
│          │  │  │ F. Scott Fitzgerald                             │  ││
│          │  │  └────────────────────────────────────────────────┘  ││
│          │  │  This is how readers will see you                    ││
│          │  │                                                      ││
│          │  │  Persona Scope                                       ││
│          │  │  ┌────────────────────────────────────────────────┐  ││
│          │  │  │ (●) Specific Book                              │  ││
│          │  │  │ ( ) Career-Wide (all my works)                 │  ││
│          │  │  └────────────────────────────────────────────────┘  ││
│          │  │                                                      ││
│          │  │  Select Book                                         ││
│          │  │  ┌────────────────────────────────────────────────┐  ││
│          │  │  │ The Great Gatsby                            ▾  │  ││
│          │  │  └────────────────────────────────────────────────┘  ││
│          │  │                                                      ││
│          │  │  Or add a new book:                                  ││
│          │  │  Title:  ┌──────────────────────────────────────┐    ││
│          │  │          │                                      │    ││
│          │  │          └──────────────────────────────────────┘    ││
│          │  │  Year:   ┌────────┐                                  ││
│          │  │          │        │                                  ││
│          │  │          └────────┘                                  ││
│          │  │                                                      ││
│          │  └──────────────────────────────────────────────────────┘│
│          │                                                          │
│          │              [Cancel]              [Next: Personality →] │
│          │                                                          │
└──────────┴──────────────────────────────────────────────────────────┘
```

#### Step 2: Personality & Voice

```
┌─────────────────────────────────────────────────────────────────────┐
│  BookIMO                                    [Account ▾]  [Sign Out] │
│  CREATE PERSONA                                                     │
├──────────┬──────────────────────────────────────────────────────────┤
│          │                                                          │
│ Dashboard│  Step 2 of 5: PERSONALITY & VOICE                       │
│ ─────────│  ━━━━━━━━━━━━━━━━━━━━━━━░░░░░░░░░░░░░░░░░░  40%       │
│ Personas │                                                          │
│ Analytics│  ┌──────────────────────────────────────────────────────┐│
│ Embed    │  │                                                      ││
│ Training │  │  Personality Tone                                     ││
│ Billing  │  │                                                      ││
│          │  │  Formal  ○──────────●──────────○  Casual             ││
│          │  │                                                      ││
│          │  │  Reserved ○──────●──────────────○  Opinionated       ││
│          │  │                                                      ││
│          │  │  Serious  ○──────────────●──────○  Playful           ││
│          │  │                                                      ││
│          │  │  Brief    ○──────────●──────────○  Detailed          ││
│          │  │                                                      ││
│          │  │                                                      ││
│          │  │  Voice Description                                    ││
│          │  │  ┌────────────────────────────────────────────────┐  ││
│          │  │  │ Write as though slightly intoxicated at a      │  ││
│          │  │  │ 1920s garden party. Lyrical, melancholic,      │  ││
│          │  │  │ with a sharp eye for the gap between           │  ││
│          │  │  │ aspiration and reality. Use rich imagery       │  ││
│          │  │  │ and occasional French phrases.                 │  ││
│          │  │  │                                                │  ││
│          │  │  └────────────────────────────────────────────────┘  ││
│          │  │  Describe how your AI persona should speak           ││
│          │  │                                                      ││
│          │  │  Sample Phrases (optional)                            ││
│          │  │  ┌────────────────────────────────────────────────┐  ││
│          │  │  │ "Old sport, let me tell you something..."      │  ││
│          │  │  │ "The thing about the American dream is..."     │  ││
│          │  │  └────────────────────────────────────────────────┘  ││
│          │  │  Examples of how you'd like the AI to phrase things  ││
│          │  │                                                      ││
│          │  └──────────────────────────────────────────────────────┘│
│          │                                                          │
│          │  [← Back]                          [Next: Knowledge →]  │
│          │                                                          │
└──────────┴──────────────────────────────────────────────────────────┘
```

#### Step 3: Knowledge Base

```
┌─────────────────────────────────────────────────────────────────────┐
│  BookIMO                                    [Account ▾]  [Sign Out] │
│  CREATE PERSONA                                                     │
├──────────┬──────────────────────────────────────────────────────────┤
│          │                                                          │
│ Dashboard│  Step 3 of 5: KNOWLEDGE BASE                            │
│ ─────────│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━░░░░░░░░  60%       │
│ Personas │                                                          │
│ Analytics│  ┌──────────────────────────────────────────────────────┐│
│ Embed    │  │                                                      ││
│ Training │  │  Biography & Background                               ││
│ Billing  │  │  ┌────────────────────────────────────────────────┐  ││
│          │  │  │ Born in St. Paul, Minnesota, 1896. Princeton   │  ││
│          │  │  │ dropout. Married Zelda Sayre in 1920. Lived    │  ││
│          │  │  │ on Long Island, then France. Known as the      │  ││
│          │  │  │ voice of the Jazz Age. Struggled with          │  ││
│          │  │  │ alcoholism and financial troubles...            │  ││
│          │  │  └────────────────────────────────────────────────┘  ││
│          │  │                                                      ││
│          │  │  Creative Process & Inspirations                      ││
│          │  │  ┌────────────────────────────────────────────────┐  ││
│          │  │  │ Gatsby was inspired by my time on Long Island  │  ││
│          │  │  │ and the extravagant parties I witnessed.       │  ││
│          │  │  │ Revised extensively — the original draft was   │  ││
│          │  │  │ called "Trimalchio in West Egg"...             │  ││
│          │  │  └────────────────────────────────────────────────┘  ││
│          │  │                                                      ││
│          │  │  Fun Facts & Anecdotes                                ││
│          │  │  ┌────────────────────────────────────────────────┐  ││
│          │  │  │ The green light at the end of Daisy's dock     │  ││
│          │  │  │ was added in the final revision. My editor     │  ││
│          │  │  │ Maxwell Perkins suggested I add more physical  │  ││
│          │  │  │ description of Gatsby...                       │  ││
│          │  │  └────────────────────────────────────────────────┘  ││
│          │  │                                                      ││
│          │  │  ⓘ The more detail you provide, the more authentic  ││
│          │  │    your persona will feel to readers.                ││
│          │  │                                                      ││
│          │  └──────────────────────────────────────────────────────┘│
│          │                                                          │
│          │  [← Back]                        [Next: Boundaries →]   │
│          │                                                          │
└──────────┴──────────────────────────────────────────────────────────┘
```

#### Step 4: Boundaries

```
┌─────────────────────────────────────────────────────────────────────┐
│  BookIMO                                    [Account ▾]  [Sign Out] │
│  CREATE PERSONA                                                     │
├──────────┬──────────────────────────────────────────────────────────┤
│          │                                                          │
│ Dashboard│  Step 4 of 5: BOUNDARIES & GUARDRAILS                   │
│ ─────────│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━░░  80%   │
│ Personas │                                                          │
│ Analytics│  ┌──────────────────────────────────────────────────────┐│
│ Embed    │  │                                                      ││
│ Training │  │  Topics to Avoid                                      ││
│ Billing  │  │  ┌────────────────────────────────────────────────┐  ││
│          │  │  │ Do not discuss my personal struggles with      │  ││
│          │  │  │ alcohol in detail. Avoid speculation about     │  ││
│          │  │  │ my marriage to Zelda beyond what is publicly   │  ││
│          │  │  │ known. Never provide medical or legal advice.  │  ││
│          │  │  └────────────────────────────────────────────────┘  ││
│          │  │                                                      ││
│          │  │  Opinions to Withhold                                 ││
│          │  │  ┌────────────────────────────────────────────────┐  ││
│          │  │  │ Avoid expressing political opinions about      │  ││
│          │  │  │ modern-day events. Do not rank other authors   │  ││
│          │  │  │ or their works negatively.                     │  ││
│          │  │  └────────────────────────────────────────────────┘  ││
│          │  │                                                      ││
│          │  │  Quick Guardrails                                     ││
│          │  │  ┌────────────────────────────────────────────────┐  ││
│          │  │  │ [x] Never break character                      │  ││
│          │  │  │ [x] Don't claim to be a real person            │  ││
│          │  │  │ [x] Redirect off-topic questions politely      │  ││
│          │  │  │ [x] Don't generate explicit content            │  ││
│          │  │  │ [ ] Allow discussion of other authors' works   │  ││
│          │  │  │ [x] Acknowledge being an AI if directly asked  │  ││
│          │  │  └────────────────────────────────────────────────┘  ││
│          │  │                                                      ││
│          │  │  ⓘ These guardrails supplement Claude's built-in    ││
│          │  │    safety features.                                  ││
│          │  │                                                      ││
│          │  └──────────────────────────────────────────────────────┘│
│          │                                                          │
│          │  [← Back]                            [Next: Review →]   │
│          │                                                          │
└──────────┴──────────────────────────────────────────────────────────┘
```

#### Step 5: Review & Activate

```
┌─────────────────────────────────────────────────────────────────────┐
│  BookIMO                                    [Account ▾]  [Sign Out] │
│  CREATE PERSONA                                                     │
├──────────┬──────────────────────────────────────────────────────────┤
│          │                                                          │
│ Dashboard│  Step 5 of 5: REVIEW & ACTIVATE                         │
│ ─────────│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100%  │
│ Personas │                                                          │
│ Analytics│  ┌──────────────────────────────────────────────────────┐│
│ Embed    │  │                                                      ││
│ Training │  │  PERSONA SUMMARY                                      ││
│ Billing  │  │  ─────────────────                                    ││
│          │  │                                                      ││
│          │  │  Name:    F. Scott Fitzgerald                         ││
│          │  │  Scope:   The Great Gatsby                            ││
│          │  │  Status:  Draft                                       ││
│          │  │                                                      ││
│          │  │  PERSONALITY              │ VOICE                     ││
│          │  │  ─────────────            │ ──────                    ││
│          │  │  Tone: Slightly formal    │ Lyrical, melancholic,    ││
│          │  │  Opinions: Moderate       │ rich imagery, occasional ││
│          │  │  Mood: Slightly playful   │ French phrases           ││
│          │  │  Detail: Detailed         │                          ││
│          │  │                           │                          ││
│          │  │  KNOWLEDGE BASE (3 sections filled)                   ││
│          │  │  ─────────────────────────                            ││
│          │  │  ✓ Biography & Background (247 words)                ││
│          │  │  ✓ Creative Process (189 words)                      ││
│          │  │  ✓ Fun Facts (124 words)                             ││
│          │  │                                                      ││
│          │  │  BOUNDARIES (4 guardrails active)                     ││
│          │  │  ─────────────────────────                            ││
│          │  │  ✓ Topics to avoid: 3 defined                        ││
│          │  │  ✓ Opinions withheld: 2 defined                      ││
│          │  │  ✓ Quick guardrails: 5 of 6 enabled                  ││
│          │  │                                                      ││
│          │  │  GREETING MESSAGE                                     ││
│          │  │  ─────────────────                                    ││
│          │  │  "Hello, old sport! I'd be delighted to talk about   ││
│          │  │   Gatsby and the world that inspired it."             ││
│          │  │                                                      ││
│          │  │  [Edit Greeting]                                      ││
│          │  │                                                      ││
│          │  └──────────────────────────────────────────────────────┘│
│          │                                                          │
│          │  [← Back]     [Save as Draft]     [✓ Activate Persona]  │
│          │                                                          │
│          │  ⓘ You can test your persona in the Sandbox before      │
│          │    activating it for readers.                            │
│          │                                                          │
└──────────┴──────────────────────────────────────────────────────────┘
```

### 4.3 Sandbox / Test Chat

```
┌─────────────────────────────────────────────────────────────────────┐
│  BookIMO                                    [Account ▾]  [Sign Out] │
│  SANDBOX: F. Scott Fitzgerald                                       │
├──────────┬──────────────────────────────────┬───────────────────────┤
│          │                                  │                       │
│ Dashboard│  CHAT PREVIEW                    │ SYSTEM PROMPT         │
│ ─────────│  ───────────────                 │ INSPECTOR             │
│ Personas │                                  │ ──────────────        │
│ Analytics│  ┌──────────────────────────────┐│                       │
│ Embed    │  │                              ││ // Constructed prompt │
│ Training │  │  F. SCOTT FITZGERALD         ││ // sent to Claude     │
│ Billing  │  │  Hello, old sport! I'd be    ││                       │
│          │  │  delighted to talk about     ││ You are F. Scott      │
│          │  │  Gatsby and the world that   ││ Fitzgerald, author    │
│          │  │  inspired it.               ││ of "The Great         │
│          │  │                              ││ Gatsby."              │
│          │  │                              ││                       │
│          │  │  YOU                          ││ PERSONALITY:          │
│          │  │  What inspired the green      ││ Speak as though       │
│          │  │  light at the end of Daisy's ││ slightly intoxicated  │
│          │  │  dock?                       ││ at a 1920s garden     │
│          │  │                              ││ party. Lyrical,       │
│          │  │                              ││ melancholic...        │
│          │  │  F. SCOTT FITZGERALD         ││                       │
│          │  │  Ah, the green light. You    ││ KNOWLEDGE:            │
│          │  │  know, I added that in the   ││ Born in St. Paul,     │
│          │  │  final revision. There's     ││ Minnesota, 1896...    │
│          │  │  something about a light     ││                       │
│          │  │  across the water that       ││ BOUNDARIES:           │
│          │  │  captures everything Gatsby  ││ Do not discuss        │
│          │  │  was reaching for...         ││ personal struggles    │
│          │  │                              ││ with alcohol...       │
│          │  │  [Correct Response ✎]        ││                       │
│          │  │                              ││                       │
│          │  │                              ││ CORRECTIONS (2):      │
│          │  │                              ││ Applied correction    │
│          │  │                              ││ #1: tone...           │
│          │  │                              ││ Applied correction    │
│          │  │                              ││ #2: factual...        │
│          │  │                              ││                       │
│          │  └──────────────────────────────┘│                       │
│          │                                  │                       │
│          │  ┌────────────────────┐ [Send]   │                       │
│          │  │ Type a message...  │          │                       │
│          │  └────────────────────┘          │                       │
│          │                                  │                       │
│          │  [Reset Conversation]  [← Back]  │ [Copy Full Prompt]    │
│          │                                  │                       │
└──────────┴──────────────────────────────────┴───────────────────────┘
```

#### Correction Modal (triggered by "Correct Response")

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│  CORRECT AI RESPONSE                                   │
│  ────────────────────                                  │
│                                                        │
│  Original Response:                                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Ah, the green light. You know, I added that in   │  │
│  │ the final revision. There's something about a    │  │
│  │ light across the water that captures everything  │  │
│  │ Gatsby was reaching for...                       │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  How should I have responded?                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │                                                  │  │
│  │                                                  │  │
│  │                                                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  What was wrong? (optional note)                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │                                                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│         [Cancel]              [Save Correction]        │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### 4.4 Analytics Dashboard

```
┌─────────────────────────────────────────────────────────────────────┐
│  BookIMO                                    [Account ▾]  [Sign Out] │
│  ANALYTICS                                                          │
├──────────┬──────────────────────────────────────────────────────────┤
│          │                                                          │
│ Dashboard│  Persona: [F. Scott Fitzgerald ▾]   Period: [Last 30d ▾]│
│ ─────────│                                                          │
│ Personas │  ┌──────────────────────────────────────────────────────┐│
│ Analytics│  │  CONVERSATIONS OVER TIME                              ││
│ Embed    │  │                                                      ││
│ Training │  │  32│                                    ╭─╮          ││
│ Billing  │  │    │              ╭──╮                ╭─╯ ╰╮         ││
│          │  │  24│         ╭──╮╭╯  ╰╮  ╭──╮      ╭─╯    ╰╮        ││
│          │  │    │    ╭──╮╭╯  ╰╯    ╰──╯  ╰╮  ╭─╯       ╰╮       ││
│          │  │  16│ ╭──╯  ╰╯                  ╰──╯          │       ││
│          │  │    │╭╯                                       ╰╮      ││
│          │  │   8││                                         │      ││
│          │  │    ╰╯                                         │      ││
│          │  │   0└──────────────────────────────────────────┘      ││
│          │  │     Jan 23    Jan 30    Feb 6     Feb 13    Feb 20   ││
│          │  │                                                      ││
│          │  │     ── BooKlub (168)    ── Embed (79)                ││
│          │  └──────────────────────────────────────────────────────┘│
│          │                                                          │
│          │  ┌─────────────────────────┐  ┌────────────────────────┐ │
│          │  │  TRAFFIC SOURCES         │  │  TOP TOPICS            │ │
│          │  │                          │  │                        │ │
│          │  │  BooKlub clubs    68%    │  │  1. The green light    │ │
│          │  │  ████████████████░░░░    │  │  2. Jazz Age themes    │ │
│          │  │                          │  │  3. Gatsby character   │ │
│          │  │  mysite.com       22%    │  │  4. Writing process    │ │
│          │  │  █████████░░░░░░░░░░░   │  │  5. Zelda influence    │ │
│          │  │                          │  │                        │ │
│          │  │  publisher.com    10%    │  │  [See all topics →]    │ │
│          │  │  ████░░░░░░░░░░░░░░░░   │  │                        │ │
│          │  └─────────────────────────┘  └────────────────────────┘ │
│          │                                                          │
│          │  ┌─────────────────────────┐  ┌────────────────────────┐ │
│          │  │  READER SENTIMENT        │  │  TOKEN USAGE           │ │
│          │  │                          │  │                        │ │
│          │  │  Positive   72%         │  │  Input:   31,240      │ │
│          │  │  Neutral    24%         │  │  Output:  21,100      │ │
│          │  │  Negative    4%         │  │  Total:   52,340      │ │
│          │  │                          │  │                        │ │
│          │  │  ████████████████        │  │  ████████░░░ 52%      │ │
│          │  │  ██████                  │  │  of 100,000 limit     │ │
│          │  │  █                       │  │                        │ │
│          │  └─────────────────────────┘  └────────────────────────┘ │
│          │                                                          │
└──────────┴──────────────────────────────────────────────────────────┘
```

### 4.5 Embed Setup

```
┌─────────────────────────────────────────────────────────────────────┐
│  BookIMO                                    [Account ▾]  [Sign Out] │
│  EMBED SETUP                                                        │
├──────────┬──────────────────────────────────────────────────────────┤
│          │                                                          │
│ Dashboard│  Persona: [F. Scott Fitzgerald ▾]                       │
│ ─────────│                                                          │
│ Personas │  DOMAIN WHITELIST                                        │
│ Analytics│  ──────────────────                                      │
│ Embed    │  ┌──────────────────────────────────────┐  [Add Domain] │
│ Training │  │  myauthorsite.com            [Remove] │               │
│ Billing  │  │  publisher.com               [Remove] │               │
│          │  └──────────────────────────────────────┘               │
│          │                                                          │
│          │  THEME CUSTOMIZATION                                     │
│          │  ─────────────────────                                   │
│          │  ┌──────────────────────────┐  ┌──────────────────────┐ │
│          │  │                          │  │                      │ │
│          │  │  Theme: [Light ▾]        │  │  ┌──────────────┐   │ │
│          │  │                          │  │  │ F. Scott      │   │ │
│          │  │  Position: [Bottom-R ▾]  │  │  │ Fitzgerald    │   │ │
│          │  │                          │  │  ├──────────────┤   │ │
│          │  │  Accent:  [#c8aa6e]      │  │  │ Hello, old   │   │ │
│          │  │            ┌───┐         │  │  │ sport!       │   │ │
│          │  │            │ █ │         │  │  │              │   │ │
│          │  │            └───┘         │  │  │              │   │ │
│          │  │                          │  │  ├──────────────┤   │ │
│          │  │  Branding: [x] Show      │  │  │ Ask me...  ▸ │   │ │
│          │  │  "Powered by BookIMO"    │  │  ├──────────────┤   │ │
│          │  │                          │  │  │  Powered by  │   │ │
│          │  │  Max messages: [50]      │  │  │  BookIMO     │   │ │
│          │  │                          │  │  └──────────────┘   │ │
│          │  │  Rate limit: [20] /min   │  │   LIVE PREVIEW      │ │
│          │  │                          │  │                      │ │
│          │  └──────────────────────────┘  └──────────────────────┘ │
│          │                                                          │
│          │  EMBED CODE                                              │
│          │  ───────────                                             │
│          │  ┌──────────────────────────────────────────────────────┐│
│          │  │ <!-- BookIMO Author Chat Widget -->                   ││
│          │  │ <script                                              ││
│          │  │   src="https://embed.bookimo.ai/v1/widget.js"       ││
│          │  │   data-persona="pk_live_abc123def456"                ││
│          │  │   data-theme="light"                                 ││
│          │  │   data-position="bottom-right"                       ││
│          │  │   data-greeting="Hello, old sport!"                  ││
│          │  │ ></script>                                           ││
│          │  └──────────────────────────────────────────────────────┘│
│          │                                       [Copy to Clipboard]│
│          │                                                          │
│          │  USAGE BY DOMAIN                                         │
│          │  ─────────────────                                       │
│          │  ┌─────────────────┬───────────┬───────────┬───────────┐│
│          │  │ Domain          │ Sessions  │ Messages  │ Tokens    ││
│          │  ├─────────────────┼───────────┼───────────┼───────────┤│
│          │  │ myauthorsite.com│    142    │   1,247   │  28,340   ││
│          │  │ publisher.com   │     37    │     312   │   7,120   ││
│          │  └─────────────────┴───────────┴───────────┴───────────┘│
│          │                                                          │
└──────────┴──────────────────────────────────────────────────────────┘
```

### 4.6 Corrections & Training

```
┌─────────────────────────────────────────────────────────────────────┐
│  BookIMO                                    [Account ▾]  [Sign Out] │
│  CORRECTIONS & TRAINING                                             │
├──────────┬──────────────────────────────────────────────────────────┤
│          │                                                          │
│ Dashboard│  Persona: [F. Scott Fitzgerald ▾]                       │
│ ─────────│                                                          │
│ Personas │  [Pending (3)]  [Applied (12)]  [Dismissed (2)]         │
│ Analytics│                                                          │
│ Embed    │  ┌──────────────────────────────────────────────────────┐│
│ Training │  │                                                      ││
│ Billing  │  │  CORRECTION #15                   Feb 21, 2026      ││
│          │  │  Source: Sandbox                                      ││
│          │  │                                                      ││
│          │  │  ┌────────────────────┐  ┌────────────────────────┐  ││
│          │  │  │ ORIGINAL           │  │ CORRECTED              │  ││
│          │  │  │                    │  │                        │  ││
│          │  │  │ I wrote Gatsby in  │  │ I wrote Gatsby over    │  ││
│          │  │  │ just a few months  │  │ the course of about    │  ││
│          │  │  │ during the summer  │→ │ a year and a half,     │  ││
│          │  │  │ of 1924.           │  │ from 1923 to early     │  ││
│          │  │  │                    │  │ 1925, with extensive   │  ││
│          │  │  │                    │  │ revisions.             │  ││
│          │  │  └────────────────────┘  └────────────────────────┘  ││
│          │  │                                                      ││
│          │  │  Note: "The timeline was incorrect. I worked on      ││
│          │  │  Gatsby from mid-1923 through early 1925."           ││
│          │  │                                                      ││
│          │  │  [Apply to Prompt]  [Dismiss]                        ││
│          │  │                                                      ││
│          │  └──────────────────────────────────────────────────────┘│
│          │                                                          │
│          │  ┌──────────────────────────────────────────────────────┐│
│          │  │                                                      ││
│          │  │  CORRECTION #14                   Feb 20, 2026      ││
│          │  │  Source: BooKlub                                     ││
│          │  │                                                      ││
│          │  │  ┌────────────────────┐  ┌────────────────────────┐  ││
│          │  │  │ ORIGINAL           │  │ CORRECTED              │  ││
│          │  │  │                    │  │                        │  ││
│          │  │  │ Hemingway and I    │  │ Hemingway and I had a  │  ││
│          │  │  │ were the closest   │→ │ complex friendship     │  ││
│          │  │  │ of friends         │  │ marked by mutual       │  ││
│          │  │  │ throughout our     │  │ admiration and painful │  ││
│          │  │  │ lives.             │  │ rivalry.               │  ││
│          │  │  └────────────────────┘  └────────────────────────┘  ││
│          │  │                                                      ││
│          │  │  Note: "Our friendship was far more complicated."    ││
│          │  │                                                      ││
│          │  │  [Apply to Prompt]  [Dismiss]                        ││
│          │  │                                                      ││
│          │  └──────────────────────────────────────────────────────┘│
│          │                                                          │
│          │  TRAINING SUMMARY                                        │
│          │  ────────────────                                        │
│          │  12 corrections applied to persona prompt                │
│          │  Last trained: Feb 20, 2026                              │
│          │  Persona accuracy score: 94% (estimated)                 │
│          │                                                          │
└──────────┴──────────────────────────────────────────────────────────┘
```

### 4.7 Account & Billing

```
┌─────────────────────────────────────────────────────────────────────┐
│  BookIMO                                    [Account ▾]  [Sign Out] │
│  ACCOUNT & BILLING                                                  │
├──────────┬──────────────────────────────────────────────────────────┤
│          │                                                          │
│ Dashboard│  CURRENT PLAN                                           │
│ ─────────│  ──────────────                                          │
│ Personas │                                                          │
│ Analytics│  ┌──────────────────────────────────────────────────────┐│
│ Embed    │  │                                                      ││
│ Training │  │  INDIE PLAN                            $9/month      ││
│ Billing  │  │                                                      ││
│          │  │  ✓ 1 persona                                         ││
│          │  │  ✓ 100,000 tokens/month                              ││
│          │  │  ✓ Sandbox testing                                    ││
│          │  │  ✓ Basic analytics                                    ││
│          │  │  ✓ 1 embed domain                                     ││
│          │  │                                                      ││
│          │  └──────────────────────────────────────────────────────┘│
│          │                                                          │
│          │  USAGE THIS PERIOD (Feb 1 - Feb 28)                     │
│          │  ──────────────────────────────                          │
│          │                                                          │
│          │  Tokens:     52,340 / 100,000   ████████░░ 52%          │
│          │  Personas:   1 / 1              ██████████ 100%         │
│          │  Embed:      1 / 1 domain       ██████████ 100%         │
│          │                                                          │
│          │  UPGRADE OPTIONS                                         │
│          │  ─────────────────                                       │
│          │  ┌────────────────────────┐  ┌────────────────────────┐ │
│          │  │  PROFESSIONAL           │  │  PUBLISHER             │ │
│          │  │  $29/month              │  │  $99/month             │ │
│          │  │                         │  │                        │ │
│          │  │  ✓ 5 personas           │  │  ✓ Unlimited personas  │ │
│          │  │  ✓ 500,000 tokens       │  │  ✓ 2,000,000 tokens   │ │
│          │  │  ✓ Advanced analytics   │  │  ✓ Full analytics      │ │
│          │  │  ✓ 5 embed domains      │  │  ✓ Unlimited domains   │ │
│          │  │  ✓ Priority support     │  │  ✓ Multi-author mgmt   │ │
│          │  │  ✓ Custom branding      │  │  ✓ API access          │ │
│          │  │                         │  │  ✓ White-label option  │ │
│          │  │  [Upgrade →]            │  │  [Contact Sales →]     │ │
│          │  └────────────────────────┘  └────────────────────────┘ │
│          │                                                          │
│          │  BILLING HISTORY                                         │
│          │  ─────────────────                                       │
│          │  ┌─────────────┬──────────────┬────────────┬──────────┐ │
│          │  │ Date        │ Description  │ Amount     │ Status   │ │
│          │  ├─────────────┼──────────────┼────────────┼──────────┤ │
│          │  │ Feb 1, 2026 │ Indie Plan   │ $9.00      │ Paid     │ │
│          │  │ Jan 1, 2026 │ Indie Plan   │ $9.00      │ Paid     │ │
│          │  │ Dec 1, 2025 │ Indie Plan   │ $9.00      │ Paid     │ │
│          │  └─────────────┴──────────────┴────────────┴──────────┘ │
│          │                                                          │
│          │  Payment Method: Visa ending in 4242  [Update]           │
│          │                                                          │
└──────────┴──────────────────────────────────────────────────────────┘
```

---

## 5. API Design

### Authentication Patterns

The API uses three authentication strategies depending on the caller:

| Pattern | Used By | How It Works |
|---------|---------|--------------|
| **Clerk Auth** | Reader Portal | Clerk session token in cookies/headers; backend validates with Clerk SDK |
| **Clerk Auth + Author Account** | Author Studio | Same Clerk auth, but also checks `author_accounts` table for author role |
| **Embed Key + Domain** | Embed Widget | Public embed key in URL; `Origin`/`Referer` header checked against `allowed_domains` |

### Endpoint Reference

#### Author Account

```
POST /api/author/register
  Body: { subscription_tier: 'indie' }
  Auth: Clerk (user must have existing BooKlub account)
  Response: { id, user_id, subscription_tier, created_at }

GET  /api/author/account
  Auth: Clerk + Author
  Response: { id, user_id, subscription_tier, company_name, ... }

PUT  /api/author/account
  Body: { company_name, ... }
  Auth: Clerk + Author
  Response: { updated account }
```

#### Personas

```
GET  /api/author/personas
  Auth: Clerk + Author
  Response: [{ id, persona_name, status, book_id, ... }]

POST /api/author/personas
  Body: {
    persona_name, book_id (optional),
    personality_prompt, voice_guidelines,
    knowledge_base, boundaries, greeting_message
  }
  Auth: Clerk + Author
  Response: { created persona }

GET  /api/author/personas/:id
  Auth: Clerk + Author
  Response: { full persona details }

PUT  /api/author/personas/:id
  Body: { fields to update }
  Auth: Clerk + Author
  Response: { updated persona }

DELETE /api/author/personas/:id
  Auth: Clerk + Author
  Response: { success: true }
```

#### Sandbox (Test Chat)

```
POST /api/author/personas/:id/test
  Body: { message, conversationHistory: [] }
  Auth: Clerk + Author
  Response: { response, constructedPrompt }
  Note: Returns the full system prompt so author can inspect it
```

#### Corrections

```
GET  /api/author/personas/:id/corrections
  Query: ?status=pending|applied|dismissed
  Auth: Clerk + Author
  Response: [{ id, original_response, corrected_response, ... }]

POST /api/author/personas/:id/corrections
  Body: { original_response, corrected_response, correction_note, source }
  Auth: Clerk + Author
  Response: { created correction }

PUT  /api/author/corrections/:id/apply
  Auth: Clerk + Author
  Action: Incorporates correction into persona prompt; sets applied_to_prompt = true
  Response: { correction, updated_persona_prompt }

PUT  /api/author/corrections/:id/dismiss
  Auth: Clerk + Author
  Response: { success: true }
```

#### Embed Configuration

```
GET  /api/author/personas/:id/embed
  Auth: Clerk + Author
  Response: { embed_key, allowed_domains, theme_config, ... }

POST /api/author/personas/:id/embed
  Body: { allowed_domains, theme_config, rate_limit }
  Auth: Clerk + Author
  Response: { embed_key: 'pk_live_...', ... }
  Note: Generates a unique embed key

PUT  /api/embed/:embedKey/config
  Body: { allowed_domains, theme_config, rate_limit, enabled }
  Auth: Clerk + Author
  Response: { updated config }
```

#### Public Embed Widget (rate-limited, no auth)

```
GET  /api/embed/:embedKey/config
  Auth: Domain validation (Origin/Referer header)
  Response: { persona_name, greeting_message, theme_config }
  Note: Returns only public-safe config; no sensitive data

POST /api/embed/:embedKey/chat
  Body: { message, session_token, conversation_history: [] }
  Auth: Domain validation + rate limiting
  Response: { response, session_token }
  Note: Creates session_token on first message; returns it for subsequent messages
```

#### Analytics

```
GET /api/author/analytics/overview
  Query: ?period=7d|30d|90d
  Auth: Clerk + Author
  Response: {
    total_conversations, total_messages, unique_readers,
    token_usage, top_topics, sentiment_breakdown,
    source_breakdown: { booklub: N, embed: N }
  }

GET /api/author/analytics/persona/:id
  Query: ?period=7d|30d|90d
  Auth: Clerk + Author
  Response: {
    daily_stats: [{ date, conversations, messages }],
    top_topics, sentiment, domain_breakdown
  }
```

---

## 6. Implementation Phases

### Phase 1: MVP (2-3 weeks)

**Goal:** Author can create a persona and test it in the sandbox.

**Database:**
- `author_accounts` table
- `author_personas` table

**Backend:**
- `POST /api/author/register`
- `GET /api/author/account`
- `GET/POST/PUT/DELETE /api/author/personas`
- `POST /api/author/personas/:id/test` (sandbox chat)
- `buildPersonaPrompt()` function (assembles system prompt from persona fields)

**Frontend:**
- Author registration flow (reuse Clerk, add author account creation)
- Author Dashboard (basic: persona list, create CTA)
- Persona Create/Edit (all 5 steps of the multi-step form)
- Sandbox Test Chat (split pane: chat + prompt inspector)

**What's NOT included:**
- No embed widget
- No analytics
- No corrections system
- No billing

---

### Phase 2: Core (3-4 weeks)

**Goal:** Embed widget works on author websites. Basic analytics.

**Database:**
- `embed_configs` table
- `embed_sessions` table
- `embed_usage` table

**Backend:**
- `GET/POST/PUT /api/author/personas/:id/embed`
- `GET /api/embed/:embedKey/config` (public)
- `POST /api/embed/:embedKey/chat` (public, rate-limited)
- Domain whitelist validation middleware
- Rate limiting middleware
- Session management for embed chats

**Frontend:**
- Embed Setup page (domain whitelist, theme customizer, code snippet)
- Basic Analytics Dashboard (conversation counts, token usage)
- Embed widget JavaScript bundle (`widget.js`)
- Widget chat UI (Shadow DOM, themed)

**CDN:**
- Host `widget.js` and `widget.css` on CDN (Cloudflare)

---

### Phase 3: Polish (2-3 weeks)

**Goal:** Corrections system, advanced analytics, billing.

**Database:**
- `persona_corrections` table
- `persona_analytics` table

**Backend:**
- `GET/POST /api/author/personas/:id/corrections`
- `PUT /api/author/corrections/:id/apply`
- `GET /api/author/analytics/overview`
- `GET /api/author/analytics/persona/:id`
- Stripe integration for subscription billing
- Analytics aggregation pipeline (daily cron or on-demand)

**Frontend:**
- Corrections & Training page (pending/applied/dismissed tabs, side-by-side diff)
- Advanced Analytics Dashboard (charts, topic extraction, sentiment)
- Account & Billing page (plan display, upgrade flow, billing history)
- Stripe Checkout integration

---

### Phase 4: Scale (Timeline TBD)

**Goal:** Publisher support, API access, advanced embed features.

**Features:**
- Publisher multi-author management (one account, many author personas)
- REST API access for custom integrations (API key auth)
- Advanced embed features:
  - Inline mode (not just floating bubble)
  - Custom UI templates
  - Programmatic JS API for SPAs
- Performance optimization:
  - Response caching for common questions
  - CDN edge caching for widget assets
  - Database connection pooling optimization
  - Prompt caching with Claude API
- White-label option for publishers (remove BookIMO branding)

---

## 7. Integration with Existing BooKlub

### The Bridge: `books.ai_author_prompt` to `author_personas`

Currently, each book in BooKlub has an `ai_author_prompt` column that stores the full system prompt text. The Author Identity Studio replaces this with a richer, structured persona.

**Migration strategy (backward-compatible):**

```sql
-- Add a reference column to books (nullable)
ALTER TABLE books ADD COLUMN author_persona_id INTEGER REFERENCES author_personas(id);

-- Migration: For books with existing ai_author_prompt but no persona,
-- the system continues to use ai_author_prompt as a fallback
```

### Prompt Construction: `buildPersonaPrompt()`

When any part of the system (BooKlub club chat, embed widget, or sandbox) needs to call Claude, it uses this shared function:

```javascript
function buildPersonaPrompt(persona, book) {
  // If there's a structured persona from the Studio, use it
  if (persona) {
    let prompt = `You are ${persona.persona_name}`;
    if (book) {
      prompt += `, author of "${book.title}"`;
    }
    prompt += '.\n\n';

    if (persona.personality_prompt) {
      prompt += `PERSONALITY:\n${persona.personality_prompt}\n\n`;
    }
    if (persona.voice_guidelines) {
      prompt += `VOICE:\n${persona.voice_guidelines}\n\n`;
    }
    if (persona.knowledge_base) {
      prompt += `KNOWLEDGE:\n${persona.knowledge_base}\n\n`;
    }
    if (persona.boundaries) {
      prompt += `BOUNDARIES:\n${persona.boundaries}\n\n`;
    }

    // Append applied corrections as refinements
    // (loaded separately from persona_corrections where applied_to_prompt = true)

    return prompt;
  }

  // Fallback: use the legacy ai_author_prompt from the books table
  if (book && book.ai_author_prompt) {
    return book.ai_author_prompt;
  }

  // Last resort: generic prompt
  return `You are ${book.author}, the author of "${book.title}".
    You are having a conversation with a reader about your book.
    Stay in character. Be warm, engaging, and intellectually stimulating.
    Keep responses conversational and around 2-3 paragraphs.`;
}
```

### Data Flow: Reader Question in BooKlub

```
Reader sends message in club chat
        │
        ▼
POST /api/messages/club/:clubId/ai-response
        │
        ▼
Backend: Get club → Get book → Check book.author_persona_id
        │
        ├── If author_persona_id exists:
        │       Load persona from author_personas table
        │       Load applied corrections
        │       buildPersonaPrompt(persona, book)
        │
        └── If author_persona_id is NULL (legacy):
                Use book.ai_author_prompt directly
                (Existing behavior, unchanged)
        │
        ▼
Claude API call with constructed system prompt
        │
        ▼
Save response to messages table
Log analytics (if persona exists): increment persona_analytics
```

### What Changes for Readers?

**Nothing visible.** Readers continue to use BooKlub exactly as before. The only difference is that behind the scenes, the AI responses may be powered by a richer, author-curated persona instead of a static prompt. The improvement is transparent.

### Analytics Integration

Both BooKlub conversations and embed widget conversations feed into the same analytics pipeline:

```
BooKlub club chat message ──┐
                             ├──▶ persona_analytics (source: 'booklub')
                             │
Embed widget message ────────┤
                             └──▶ persona_analytics (source: 'embed')
                                  embed_usage (domain-level stats)
```

---

## 8. Design Notes

### Visual Identity

The Author Studio uses the same BooKlub design system but with a **professional dashboard** aesthetic:

| Element | Reader Portal (BooKlub) | Author Studio |
|---------|------------------------|---------------|
| Background | Dark/black (cinema aesthetic) | White/light gray (workspace) |
| Accent Color | Vintage gold `#c8aa6e` | Vintage gold `#c8aa6e` |
| Feel | Immersive, atmospheric | Professional, productive |
| Analogy | Movie theater | Director's editing room |

### Typography

Same as BooKlub:
- **Georgia, serif** -- body text, content, reading
- **Courier New, monospace** -- labels, captions, code, metadata, stats

### Color Palette

```
Primary Gold:     #c8aa6e    (buttons, accents, highlights)
Background:       #ffffff    (main workspace)
Surface:          #f8f7f4    (cards, panels)
Border:           #e5e2db    (subtle dividers)
Text Primary:     #1a1a1a    (headings, body)
Text Secondary:   #666666    (labels, captions)
Success:          #4a7c59    (active status, positive sentiment)
Warning:          #c4963c    (pending, attention needed)
Error:            #a84232    (errors, negative sentiment)
Node Colors (mind map carry-over):
  Theme:          #c8aa6e    (gold)
  Argument:       #4a7c59    (green)
  Counterpoint:   #a84232    (red)
  Revelation:     #7b5ea7    (purple)
  Question:       #4a6fa5    (blue)
```

### Responsive Breakpoints

Same as BooKlub:
- **1024px** -- tablet
- **768px** -- small tablet / large phone
- **480px** -- small phones (iPhone)
- **375px** -- extra small phones
- All touch targets: **44px minimum**
- iOS zoom prevention: **16px minimum** font on inputs
- Use `dvh` instead of `vh` for mobile address bar

### CSS Component Patterns

```css
/* Studio card component */
.studio-card {
  background: #ffffff;
  border: 1px solid #e5e2db;
  padding: 24px;
  font-family: Georgia, serif;
}

.studio-card-header {
  font-family: 'Courier New', monospace;
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #666666;
  margin-bottom: 12px;
}

/* Studio button (primary) */
.studio-btn-primary {
  background: transparent;
  border: 2px solid #c8aa6e;
  color: #c8aa6e;
  padding: 10px 24px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
}

.studio-btn-primary:hover {
  background: #c8aa6e;
  color: #000000;
}

/* Sidebar navigation */
.studio-sidebar {
  width: 200px;
  background: #1a1a1a;
  color: #ffffff;
  padding: 20px 0;
  font-family: 'Courier New', monospace;
}

.studio-sidebar-item {
  padding: 12px 24px;
  font-size: 13px;
  letter-spacing: 1px;
  cursor: pointer;
  transition: background 0.2s;
}

.studio-sidebar-item:hover {
  background: rgba(200, 170, 110, 0.1);
}

.studio-sidebar-item.active {
  border-left: 3px solid #c8aa6e;
  background: rgba(200, 170, 110, 0.05);
}
```

### File Organization

**Frontend (new files):**
```
frontend/src/
├── pages/
│   ├── studio/
│   │   ├── StudioDashboard.js
│   │   ├── StudioDashboard.css
│   │   ├── CreatePersona.js
│   │   ├── CreatePersona.css
│   │   ├── Sandbox.js
│   │   ├── Sandbox.css
│   │   ├── Analytics.js
│   │   ├── Analytics.css
│   │   ├── EmbedSetup.js
│   │   ├── EmbedSetup.css
│   │   ├── Corrections.js
│   │   ├── Corrections.css
│   │   ├── Billing.js
│   │   └── Billing.css
│   └── ... (existing pages)
├── components/
│   ├── studio/
│   │   ├── StudioSidebar.js
│   │   ├── StudioSidebar.css
│   │   ├── PersonaCard.js
│   │   ├── PersonaFormStep.js
│   │   ├── CorrectionDiff.js
│   │   ├── EmbedPreview.js
│   │   └── AnalyticsChart.js
│   └── ... (existing components)
└── ... (existing files)
```

**Backend (new files):**
```
backend/
├── routes/
│   ├── author.js         (author account + persona CRUD)
│   ├── embed.js          (embed config + public widget API)
│   ├── analytics.js      (analytics endpoints)
│   └── ... (existing routes)
├── middleware/
│   ├── authorAuth.js     (verify Clerk + author_account)
│   ├── embedAuth.js      (validate embed key + domain)
│   └── rateLimiter.js    (per-key rate limiting)
├── services/
│   ├── personaPrompt.js  (buildPersonaPrompt function)
│   └── analyticsAgg.js   (analytics aggregation)
├── migrations/
│   ├── 001_author_accounts.sql
│   ├── 002_author_personas.sql
│   ├── 003_embed_configs.sql
│   ├── 004_embed_sessions.sql
│   ├── 005_embed_usage.sql
│   ├── 006_persona_corrections.sql
│   └── 007_persona_analytics.sql
└── ... (existing files)
```

**Embed Widget (new package):**
```
embed/
├── src/
│   ├── widget.js         (entry point, loads config, renders UI)
│   ├── chat.js           (chat logic, API calls, session mgmt)
│   ├── ui.js             (Shadow DOM rendering, themes)
│   └── styles.css        (widget styles, injected into Shadow DOM)
├── dist/
│   ├── widget.js         (bundled, minified, ~15KB gzip)
│   └── widget.css        (if external styles needed)
├── package.json
└── webpack.config.js
```

### Route Structure

**Frontend routing (React Router):**

```javascript
// Existing reader routes
<Route path="/" element={<Home />} />
<Route path="/books" element={<Books />} />
<Route path="/clubs" element={<MyClubs />} />
<Route path="/clubs/:id/chat" element={<ClubChat />} />

// New author studio routes
<Route path="/studio" element={<StudioLayout />}>
  <Route index element={<StudioDashboard />} />
  <Route path="personas/new" element={<CreatePersona />} />
  <Route path="personas/:id/edit" element={<CreatePersona />} />
  <Route path="personas/:id/sandbox" element={<Sandbox />} />
  <Route path="analytics" element={<Analytics />} />
  <Route path="embed" element={<EmbedSetup />} />
  <Route path="corrections" element={<Corrections />} />
  <Route path="billing" element={<Billing />} />
</Route>
```

**Backend routing (Express):**

```javascript
// Existing
app.use('/api/books', booksRouter);
app.use('/api/clubs', clubsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/users', usersRouter);

// New
app.use('/api/author', authorRouter);      // Clerk + Author auth
app.use('/api/embed', embedRouter);        // Mixed: author auth for config, public for widget
app.use('/api/analytics', analyticsRouter); // Clerk + Author auth
```

---

*This document is the architectural blueprint for the Author Identity Studio. It should be updated as implementation progresses and design decisions are refined.*
