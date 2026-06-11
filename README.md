# TruckFixr AI Operating System

Internal agent dashboard for TruckFixr Fleet AI Inc.

## What This Is

An internal operating system that helps TruckFixr Fleet AI execute faster across sales, marketing, funding, R&D evidence, engineering, pilot tracking, and partnerships.

This is NOT the customer-facing TruckFixr product.

## Modules

- Command Center
- Sales Agent
- Marketing Agent
- Funding, Grants, R&D & Investor Relations
- Software Engineering Agent
- Pilot Customer Evidence
- Partnership & Ecosystem
- Roadmap Tracker
- Settings

## Local Development

Prerequisites: Node.js 18+, npm 9+

```bash
git clone https://github.com/dkwesiga/TruckFixr_OS
cd TruckFixr_OS/truckfixr-os
npm install
cp .env.example .env.local
# Edit .env.local and set your password
npm run dev
```

Open http://localhost:3000

For a clean local restart after production builds rewrite `.next`:

```bash
npm run dev:clean
```

Open http://localhost:3006

Focused Sales Agent verification:

```bash
npm run verify:sales
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NEXT_PUBLIC_INTERNAL_DASHBOARD_PASSWORD | Dashboard password | truckfixr-dev |

⚠️ NEXT_PUBLIC_ variables are visible in the browser bundle.
This gate provides basic access control only.
Upgrade to Supabase Auth before storing sensitive data.

## Data & Backups

Version 1 uses browser local storage.
⚠️ Clearing browser cache deletes all data permanently.
Export JSON backups regularly via Settings > Export All Data.

## Vercel Deployment

1. Push repo to GitHub
2. Connect to Vercel at vercel.com
3. Add environment variable: NEXT_PUBLIC_INTERNAL_DASHBOARD_PASSWORD
4. Deploy - auto-deploys on every push to main

## Demo Mode

Settings > Load Demo Data to load sample data across all modules.
Settings > Clear Demo Data to remove it.
Demo data is labeled and does not represent real customers or investors.

## Current Limitations

- No live AI API calls - all templates are deterministic
- Browser local storage only - no database
- No email sending, no LinkedIn posting, no GitHub API integration
- No grant auto-submission
- Password gate is not production-grade security

## Safety Rules

This system never:

- Auto-sends emails
- Auto-posts to social media
- Auto-submits grant applications
- Auto-commits code
- Guarantees downtime reduction or savings

All generated content requires human review before use.

## Planned Future Integrations

- Supabase database + auth
- HubSpot CRM
- Gmail
- GitHub API
- Make.com webhooks
- Live AI generation (OpenRouter / Claude / OpenAI)

## Final Acceptance Checklist

Verify all of the following before marking complete:

- [ ] Password gate works (login, session persistence, logout)
- [ ] All 9 modules load without errors
- [ ] Demo data loads and clears across all modules
- [ ] Demo mode banner appears when active
- [ ] Local storage persists after page refresh
- [ ] CSV exports produce valid files from all modules
- [ ] JSON exports produce valid files from all modules
- [ ] Markdown exports produce readable output from all modules
- [ ] Copy buttons work throughout
- [ ] Sales Agent fully functional without API keys
- [ ] Marketing Agent fully functional without API keys
- [ ] Funding/R&D Agent fully functional without API keys
- [ ] Engineering Agent fully functional without API keys
- [ ] Pilot Evidence module works
- [ ] Partnership module works
- [ ] Command Center shows live counts from all modules
- [ ] Roadmap tracker works with all filters
- [ ] Settings persist after page refresh
- [ ] Mobile layout usable at 375px width
- [ ] No auto-send, auto-post, auto-commit, or auto-submit behavior
- [ ] No real customer data in demo data
- [ ] README is complete and accurate
- [ ] npm run lint passes with zero errors
- [ ] npm run build passes with zero errors
