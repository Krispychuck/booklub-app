# Quick Deploy Guide

Get BooKlub online in ~20 minutes using Cloudflare + Railway + Neon.

## Prerequisites

Create free accounts at:
- [Neon](https://neon.tech/) - Database
- [Railway](https://railway.app/) - Backend hosting
- [Cloudflare](https://dash.cloudflare.com/) - Frontend hosting
- [Clerk](https://clerk.com/) - Authentication
- [Anthropic](https://console.anthropic.com/) - AI API

## Deployment Steps

### 1. Database (Neon) - 5 mins

1. Create project in Neon
2. Copy connection string
3. In Neon SQL Editor, paste contents of `database/init.sql` and run
4. Verify: `SELECT COUNT(*) FROM books;` should return 5

### 2. Backend (Railway) - 5 mins

1. New Project → Deploy from GitHub
2. Select your repo
3. Add environment variables:
   ```
   DATABASE_URL=<from Neon>
   ANTHROPIC_API_KEY=sk-ant-xxxxx
   PORT=3001
   ```
4. Generate domain and save URL

### 3. Auth (Clerk) - 3 mins

1. Create application
2. Copy publishable key (starts with `pk_test_`)
3. After frontend deploys, add your Pages domain to Clerk

### 4. Frontend (Cloudflare Pages) - 5 mins

1. Workers & Pages → Create → Connect to Git
2. Build settings:
   - Command: `npm run build:pages`
   - Output: `frontend/build`
3. Environment variables:
   ```
   NODE_VERSION=18
   REACT_APP_CLERK_PUBLISHABLE_KEY=<from Clerk>
   REACT_APP_API_URL=<Railway URL>
   ```
4. Deploy and save your Pages URL

### 5. Final Config - 2 mins

**Update Railway:**
- Add env var: `CORS_ORIGIN=<your Pages URL>`

**Update Clerk:**
- Add your Pages domain to allowed domains

## Test It

Visit your Cloudflare Pages URL:
- Sign in
- Create a club
- Chat with an AI author

## Costs

~$2-5/month (Anthropic API only - everything else is free tier)

## Need Help?

See `DEPLOYMENT.md` for detailed instructions.
