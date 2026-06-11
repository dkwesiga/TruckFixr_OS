# weekly-report — weekly operations summary generator

**Status: not implemented in Version 1. Placeholder only — no live API calls.**

## Intended purpose
Scheduled (cron) function that assembles a weekly internal report:
pipeline movement (prospects by status), content published, funding
deadlines approaching, R&D evidence logged, and engineering progress.
Output is stored as a `documents` row + optional `marketing_content`
draft — never emailed automatically.

## Expected future input
Triggered on a schedule (e.g. Monday 7:00 ET) or manually:
```json
{ "workspaceId": "uuid", "weekEnding": "2026-06-14" }
```

## Expected future output
```json
{
  "agentRunId": "uuid",
  "reportDocumentId": "uuid",
  "summary": "5 prospects advanced, 2 deadlines within 30 days, ..."
}
```

## Required secrets later
- LLM provider API key via `supabase secrets set` (for narrative summary)
- None for the data-only version

## Constraints carried into implementation
- Read-only over business tables; writes only its own report rows.
- No external sending — report stays inside the OS for review.
