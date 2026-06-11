# funding-research — grant/funding opportunity research agent

**Status: not implemented in Version 1. Placeholder only — no live API calls.**

## Intended purpose
Server-side version of the Funding module's research prompt workflow:
researches candidate funding programs matching TruckFixr's profile and
inserts rows into `funding_opportunities` for human verification.

## Expected future input
```json
{
  "workspaceId": "uuid",
  "region": "Ontario, Canada",
  "fundingTypes": ["Grant", "R&D Support", "Wage Subsidy"],
  "companyStage": "pre-seed",
  "notes": "vehicle maintenance AI, customer pilots underway"
}
```

## Expected future output
```json
{
  "agentRunId": "uuid",
  "opportunitiesCreated": 5,
  "opportunityIds": ["uuid", "..."]
}
```

## Required secrets later
- LLM provider API key via `supabase secrets set`

## Constraints carried into implementation
- Every created record keeps the standing disclaimer: funding information
  changes frequently — verify eligibility, deadlines, and program details
  from official sources before applying.
- Status always starts at `Researching`. No applications are submitted
  automatically.
