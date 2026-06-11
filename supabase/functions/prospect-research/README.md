# prospect-research — fleet prospect research agent

**Status: not implemented in Version 1. Placeholder only — no live API calls.**

## Intended purpose
Server-side version of the Sales Agent "Generate Prospects" workflow:
takes the research criteria currently built in
`src/components/sales/ResearchPromptGenerator.tsx`, runs the LLM call,
parses the JSON result, and inserts rows into `prospects` with
`sync_status = 'imported'` and an `agent_runs` audit record.

## Expected future input
```json
{
  "workspaceId": "uuid",
  "targetLocation": "Ontario, Canada",
  "targetSegment": "Trucking/Logistics",
  "fleetSizeRange": "6-10",
  "numberOfProspects": 10,
  "preferredSources": ["LinkedIn", "Company websites"]
}
```

## Expected future output
```json
{
  "agentRunId": "uuid",
  "imported": 8,
  "skipped": 2,
  "prospectIds": ["uuid", "..."]
}
```

## Required secrets later
- LLM provider API key via `supabase secrets set`

## Constraints carried into implementation
- Public sources only; respect platform terms of service.
- Imported prospects start at `outreach_status = 'New'` for human review.
