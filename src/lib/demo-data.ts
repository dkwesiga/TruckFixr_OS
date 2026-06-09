import {
  type NavItem,
  type OverviewMetric,
  type PageMeta,
  type PlaceholderPageData,
  type PlaceholderSectionKey,
  type Prospect,
  type Workstream,
} from "@/lib/types";

export const navigationItems: NavItem[] = [
  {
    title: "Command Center",
    href: "/",
    description: "Top-level operating metrics and weekly workstreams.",
  },
  {
    title: "Sales",
    href: "/sales",
    description: "Pipeline quality, close motion, and revenue readiness.",
  },
  {
    title: "Marketing",
    href: "/marketing",
    description: "Acquisition loops, positioning, and launch assets.",
  },
  {
    title: "Funding",
    href: "/funding",
    description: "Capital strategy, investor updates, and diligence prep.",
  },
  {
    title: "Engineering",
    href: "/engineering",
    description: "Product delivery, infra, and technical debt tracking.",
  },
  {
    title: "Evidence",
    href: "/evidence",
    description: "Customer proof, testimonials, benchmarks, and case data.",
  },
  {
    title: "Partnerships",
    href: "/partnerships",
    description: "Strategic channel work, co-sell, and integration plans.",
  },
  {
    title: "Roadmap",
    href: "/roadmap",
    description: "Sequencing, dependency management, and milestone cadence.",
  },
  {
    title: "Settings",
    href: "/settings",
    description: "Demo controls, export helpers, and internal preferences.",
  },
];

export const pageMeta: Record<string, PageMeta> = {
  "/": {
    title: "Command Center",
    description: "A cross-functional pulse check for the operating system.",
  },
  "/dashboard": {
    title: "Command Center",
    description: "A cross-functional pulse check for the operating system.",
  },
  "/sales": {
    title: "Prospect Intelligence",
    description: "Sales agent workspace for lead research and pilot fit.",
  },
  "/marketing": {
    title: "Marketing Agent",
    description: "Placeholder workspace for demand generation and messaging.",
  },
  "/funding": {
    title: "Funding & R&D",
    description: "Placeholder workspace for fundraising and investor rhythm.",
  },
  "/engineering": {
    title: "Engineering",
    description: "Placeholder workspace for delivery cadence and platform work.",
  },
  "/evidence": {
    title: "Pilot Evidence",
    description: "Placeholder workspace for proof points and customer signals.",
  },
  "/partnerships": {
    title: "Partnerships",
    description: "Placeholder workspace for external growth relationships.",
  },
  "/roadmap": {
    title: "Roadmap",
    description: "Placeholder workspace for priorities, timing, and tradeoffs.",
  },
  "/settings": {
    title: "Settings",
    description: "Internal controls for the demo scaffold and workspace export.",
  },
};

export const overviewMetrics: OverviewMetric[] = [
  {
    label: "Fleet Shops Active",
    value: "18",
    trend: "+3 this week",
    status: "On Track",
  },
  {
    label: "Pilot Conversion",
    value: "42%",
    trend: "+7 pts MoM",
    status: "Watching",
  },
  {
    label: "Open Critical Tasks",
    value: "5",
    trend: "Down from 8",
    status: "On Track",
  },
  {
    label: "Runway Snapshot",
    value: "11.2 mo",
    trend: "Assumes current burn",
    status: "Planned",
  },
];

export const workstreams: Workstream[] = [
  {
    name: "Internal dashboard auth pass",
    owner: "Engineering",
    status: "On Track",
    priority: "High",
    eta: "This sprint",
  },
  {
    name: "Founder update packet",
    owner: "Funding",
    status: "Watching",
    priority: "Critical",
    eta: "Friday",
  },
  {
    name: "Case study capture loop",
    owner: "Evidence",
    status: "Planned",
    priority: "Medium",
    eta: "Next week",
  },
  {
    name: "Referral partner onboarding",
    owner: "Partnerships",
    status: "At Risk",
    priority: "High",
    eta: "Blocked on legal",
  },
];

export const deploymentNotes = [
  "Next.js 14 App Router scaffold with TypeScript, Tailwind CSS, and ESLint.",
  "Client-side password gate wired to NEXT_PUBLIC_INTERNAL_DASHBOARD_PASSWORD.",
  "Dashboard shell includes desktop sidebar, mobile sheet navigation, and export helpers.",
  "Placeholder workspaces are ready for real module implementation.",
];

export const demoProspects: Array<
  Omit<Prospect, "id" | "createdDate" | "updatedDate">
> = [
  {
    companyName: "HP Haulage",
    website: "https://example.com/hp-haulage",
    location: "Ontario, Canada",
    fleetType: "Trucking/Logistics",
    estimatedFleetSize: "8-12",
    decisionMaker: "Operations Manager",
    email: "",
    phone: "",
    linkedIn: "",
    sourceNotes: "Demo prospect seeded for Sales Agent preview.",
    maintenancePain:
      "Coordinating repair decisions across a growing regional haulage fleet.",
    usesEldTelematics: "Yes",
    pilotFitScore: null,
    revenueFitScore: null,
    grantFitScore: null,
    outreachStatus: "Researched",
    nextAction: "Review routing footprint and draft founder outreach.",
    lastContactDate: "",
    notes: "Demo record only.",
    firstEmailDraft: "",
    linkedInConnectDraft: "",
    linkedInFollowUpDraft: "",
    phoneScript: "",
    cta: "Book a free 20-minute discovery call - [calendly link placeholder]",
    llmPersonalizationPrompt: "",
    isDemo: true,
  },
  {
    companyName: "Jet Courier Services",
    website: "https://example.com/jet-courier-services",
    location: "Ontario, Canada",
    fleetType: "Courier",
    estimatedFleetSize: "5-8",
    decisionMaker: "Fleet Supervisor",
    email: "",
    phone: "",
    linkedIn: "",
    sourceNotes: "Demo prospect seeded for Sales Agent preview.",
    maintenancePain:
      "Limited repair visibility for time-sensitive same-day delivery vans.",
    usesEldTelematics: "Unknown",
    pilotFitScore: null,
    revenueFitScore: null,
    grantFitScore: null,
    outreachStatus: "New",
    nextAction: "Verify dispatch footprint and maintenance reporting workflow.",
    lastContactDate: "",
    notes: "Demo record only.",
    firstEmailDraft: "",
    linkedInConnectDraft: "",
    linkedInFollowUpDraft: "",
    phoneScript: "",
    cta: "Book a free 20-minute discovery call - [calendly link placeholder]",
    llmPersonalizationPrompt: "",
    isDemo: true,
  },
  {
    companyName: "Trisort Transport",
    website: "https://example.com/trisort-transport",
    location: "Ontario, Canada",
    fleetType: "Trucking/Logistics",
    estimatedFleetSize: "15-20",
    decisionMaker: "Director of Fleet Operations",
    email: "",
    phone: "",
    linkedIn: "",
    sourceNotes: "Demo prospect seeded for Sales Agent preview.",
    maintenancePain:
      "Repair approvals slow down dispatch commitments on a larger Ontario fleet.",
    usesEldTelematics: "Yes",
    pilotFitScore: null,
    revenueFitScore: null,
    grantFitScore: null,
    outreachStatus: "Drafted",
    nextAction: "Generate personalization prompt for outbound email.",
    lastContactDate: "",
    notes: "Demo record only.",
    firstEmailDraft: "",
    linkedInConnectDraft: "",
    linkedInFollowUpDraft: "",
    phoneScript: "",
    cta: "Book a free 20-minute discovery call - [calendly link placeholder]",
    llmPersonalizationPrompt: "",
    isDemo: true,
  },
  {
    companyName: "Rabbex Logistics",
    website: "https://example.com/rabbex-logistics",
    location: "Ontario, Canada",
    fleetType: "Mixed",
    estimatedFleetSize: "6-10",
    decisionMaker: "General Manager",
    email: "",
    phone: "",
    linkedIn: "",
    sourceNotes: "Demo prospect seeded for Sales Agent preview.",
    maintenancePain:
      "Mixed fleet repair visibility is scattered across several vendors.",
    usesEldTelematics: "Yes",
    pilotFitScore: null,
    revenueFitScore: null,
    grantFitScore: null,
    outreachStatus: "Approved",
    nextAction: "Prepare discovery-call talking points.",
    lastContactDate: "",
    notes: "Demo record only.",
    firstEmailDraft: "",
    linkedInConnectDraft: "",
    linkedInFollowUpDraft: "",
    phoneScript: "",
    cta: "Book a free 20-minute discovery call - [calendly link placeholder]",
    llmPersonalizationPrompt: "",
    isDemo: true,
  },
  {
    companyName: "The Fast Guy",
    website: "https://example.com/the-fast-guy",
    location: "Ontario, Canada",
    fleetType: "Courier",
    estimatedFleetSize: "2-5",
    decisionMaker: "Owner Operator",
    email: "",
    phone: "",
    linkedIn: "",
    sourceNotes: "Demo prospect seeded for Sales Agent preview.",
    maintenancePain:
      "Small courier team needs faster go or no-go maintenance decisions.",
    usesEldTelematics: "No",
    pilotFitScore: null,
    revenueFitScore: null,
    grantFitScore: null,
    outreachStatus: "Nurture",
    nextAction: "Hold for later-stage outreach after more research.",
    lastContactDate: "",
    notes: "Demo record only.",
    firstEmailDraft: "",
    linkedInConnectDraft: "",
    linkedInFollowUpDraft: "",
    phoneScript: "",
    cta: "Book a free 20-minute discovery call - [calendly link placeholder]",
    llmPersonalizationPrompt: "",
    isDemo: true,
  },
];

export const placeholderPages: Record<
  PlaceholderSectionKey,
  PlaceholderPageData
> = {
  sales: {
    title: "Sales",
    summary:
      "Track outbound, pipeline health, and the operating friction between first meeting and signed pilot.",
    focusAreas: [
      "Lead qualification rules for shop owners and fleet operators",
      "Weekly call review cadence and objection tracking",
      "Handoff readiness between demo, pilot, and expansion",
    ],
    nextMilestones: [
      "Define a clean CRM stage model for pilots",
      "Capture the top five repeat objections in one view",
      "Tie recent closes back to acquisition source quality",
    ],
    status: "On Track",
    priority: "High",
  },
  marketing: {
    title: "Marketing",
    summary:
      "Shape positioning and demand experiments around the jobs-to-be-done that move real buyers.",
    focusAreas: [
      "Homepage and demo narrative alignment",
      "Content repurposing for testimonials and trade-show follow-up",
      "Acquisition loops that feed qualified fleet leads",
    ],
    nextMilestones: [
      "Assemble launch copy for the dashboard story",
      "Map paid vs. partner channel experiments",
      "Create a proof-driven nurture sequence draft",
    ],
    status: "Watching",
    priority: "Medium",
  },
  funding: {
    title: "Funding",
    summary:
      "Keep investor communication disciplined, current, and easy to operationalize during diligence.",
    focusAreas: [
      "Monthly investor update packet",
      "Runway and scenario planning assumptions",
      "Diligence room structure for traction, product, and ops",
    ],
    nextMilestones: [
      "Publish a current KPI summary for outreach",
      "Outline the next raise narrative",
      "Tighten assumptions behind burn and payback",
    ],
    status: "Watching",
    priority: "Critical",
  },
  engineering: {
    title: "Engineering",
    summary:
      "Coordinate platform work, product delivery, and internal tooling without losing the plot on customer value.",
    focusAreas: [
      "Release readiness for internal operating dashboards",
      "Shared component patterns and auth guardrails",
      "Debt paydown around data and export ergonomics",
    ],
    nextMilestones: [
      "Land page scaffolds for every business lane",
      "Confirm local build and lint health",
      "Establish first-pass module boundaries for real data",
    ],
    status: "On Track",
    priority: "High",
  },
  evidence: {
    title: "Evidence",
    summary:
      "Gather proof that makes the product easier to buy, fund, and expand across the org chart.",
    focusAreas: [
      "Before-and-after workflow wins from pilot shops",
      "Repair-order and uptime proof points",
      "Quote bank for marketing, sales, and fundraising reuse",
    ],
    nextMilestones: [
      "Create a reusable customer proof template",
      "Tag evidence by funnel stage",
      "Publish a lightweight case study backlog",
    ],
    status: "Planned",
    priority: "Medium",
  },
  partnerships: {
    title: "Partnerships",
    summary:
      "Coordinate channel conversations and integration paths that can expand reach without bloating the roadmap.",
    focusAreas: [
      "Fleet maintenance network introductions",
      "Co-sell enablement for trusted operators",
      "Integration dependency mapping and ownership",
    ],
    nextMilestones: [
      "Prioritize partner targets by expected leverage",
      "Draft a lightweight enablement packet",
      "Clarify technical dependencies for the first integration",
    ],
    status: "At Risk",
    priority: "High",
  },
  roadmap: {
    title: "Roadmap",
    summary:
      "Keep the sequencing visible so product bets, go-to-market motion, and fundraising all tell the same story.",
    focusAreas: [
      "Cross-functional milestone planning",
      "Dependency calls between product, evidence, and sales",
      "Quarterly narrative for internal and external stakeholders",
    ],
    nextMilestones: [
      "Pin the next three milestone reviews",
      "Identify dependencies that could stall launch timing",
      "Set a simple status rhythm for every lane",
    ],
    status: "On Track",
    priority: "Medium",
  },
};

export function getPageMeta(pathname: string): PageMeta {
  return pageMeta[pathname] ?? pageMeta["/"];
}
