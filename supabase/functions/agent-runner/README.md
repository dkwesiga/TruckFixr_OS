# agent-runner — generic AI agent execution endpoint

**Status: not implemented in Version 1. Placeholder only — no live API calls.**

## Intended purpose
Single entry point for running a configured AI agent task server-side.
Reads the workspace's `ai_provider_settings`, calls the configured LLM
provider, records the full run in `agent_runs`, and returns the output.

## Expected future input
```json
{
  "workspaceId": "uuid",
  "agentType": "sales_outreach | marketing_content | funding_research | ...",
  "useCase": "first_email_draft",
  "input": { "prospectId": "uuid", "instructions": "..." }
}
```

## Expected future output
```json
{
  "agentRunId": "uuid",
  "status": "succeeded",
  "output": "generated text",
  "tokenEstimate": 1234
}
```

## Required secrets later
- Provider API key(s) via `supabase secrets set`
- Uses caller JWT for workspace membership verification (no service role exposure to clients)

## Safety rules carried into implementation
- Drafts only — never auto-send emails or submit applications.
- Every run is logged to `agent_runs` (input, output, cost estimate).
