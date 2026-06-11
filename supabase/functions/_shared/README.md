# _shared — Edge Function shared utilities

**Status: not implemented in Version 1.**

## Intended purpose
Shared TypeScript utilities for all TruckFixr OS Edge Functions:
CORS headers, Supabase admin client factory, workspace auth checks,
agent_runs logging helpers, and provider-agnostic LLM call wrappers.

## Expected future contents
- `cors.ts` — standard CORS headers
- `supabase-admin.ts` — service-role client (server-side only)
- `auth.ts` — verify caller JWT + workspace membership
- `agent-log.ts` — create/update `agent_runs` rows around LLM calls

## Required secrets later
Set via `supabase secrets set`, never in code or the database:
- `OPENROUTER_API_KEY` / `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GEMINI_API_KEY` / `GROQ_API_KEY` (whichever providers are enabled)
