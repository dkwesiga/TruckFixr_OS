import {
  type ContentItem,
  type EngineeringTask,
  type FundingOpportunity,
  type InvestorContact,
  type NavItem,
  type OverviewMetric,
  type Partnership,
  type PageMeta,
  type PlaceholderPageData,
  type PlaceholderSectionKey,
  type PilotEvidence,
  type Prospect,
  type RDEvidence,
  type RoadmapItem,
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
    description:
      "Content planning, founder-led drafts, and nurture workflows for TruckFixr.",
  },
  "/funding": {
    title: "Funding & R&D",
    description: "Placeholder workspace for fundraising and investor rhythm.",
  },
  "/engineering": {
    title: "Engineering",
    description:
      "Engineering task planning, sprint scoping, and Codex-ready prompt generation.",
  },
  "/evidence": {
    title: "Pilot Evidence",
    description:
      "Pilot feedback capture, case study drafting, and grant-ready evidence documentation.",
  },
  "/partnerships": {
    title: "Partnerships",
    description:
      "Relationship tracker for strategic partners, referrals, and integration conversations.",
  },
  "/roadmap": {
    title: "Roadmap",
    description:
      "Improvement tracker for phased roadmap work, risks, and next-sprint planning.",
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

export const demoContentItems: Array<
  Omit<ContentItem, "id" | "createdDate" | "updatedDate">
> = [
  {
    topic: "What gets lost in the first 15 minutes after a driver reports a fault",
    audience: "Fleet Manager",
    contentType: "LinkedIn Founder Post",
    cta: "Book a 20-minute discovery call",
    contextNotes:
      "Founder-led post about how phone calls, texts, and memory create avoidable diagnostic delays for small and mid-sized fleets.",
    draftTitle: "The first 15 minutes after a driver reports a fault are where fleets lose the plot",
    draftContent: "",
    suggestedHashtags: ["#FleetMaintenance", "#FleetOps", "#Diagnostics"],
    riskNotes: undefined,
    recommendedChannel: "LinkedIn",
    approvalNotes: "Keep examples realistic and avoid claiming quantified savings unless supported by pilot evidence.",
    contentStatus: "Idea",
    isDemo: true,
  },
  {
    topic: "Why AI diagnostics need repair history, not just telematics alerts",
    audience: "Fleet Owner",
    contentType: "Educational LinkedIn Post",
    cta: "Book a 20-minute discovery call",
    contextNotes:
      "Teach the market that useful diagnostics combine driver symptoms, prior repairs, and shop context instead of relying on black-box AI claims.",
    draftTitle: "AI is only useful to fleets when it remembers the repair story",
    draftContent: "",
    suggestedHashtags: ["#FleetTech", "#MaintenanceData", "#AIForOps"],
    riskNotes: undefined,
    recommendedChannel: "LinkedIn",
    approvalNotes: "Stay practical, anti-hype, and operations-first.",
    contentStatus: "Idea",
    isDemo: true,
  },
  {
    topic: "What early fleet conversations are teaching us about downtime visibility",
    audience: "Investor",
    contentType: "Pilot Learning Post",
    cta: "Book a 20-minute discovery call",
    contextNotes:
      "Share founder learning from Ontario fleets without naming customers or implying signed case-study approval.",
    draftTitle: "Three patterns we keep hearing from fleet teams when a truck goes down",
    draftContent: "",
    suggestedHashtags: ["#B2BSaaS", "#FleetOperations", "#FounderNotes"],
    riskNotes: undefined,
    recommendedChannel: "LinkedIn",
    approvalNotes: "No customer names unless explicitly approved.",
    contentStatus: "Idea",
    isDemo: true,
  },
  {
    topic: "How pilot notes become grant-ready R&D evidence",
    audience: "Grant/Funding Partner",
    contentType: "Grant/R&D Credibility Post",
    cta: "Book a 20-minute discovery call",
    contextNotes:
      "Explain how TruckFixr turns fleet pain points, technical uncertainty, and workflow experiments into credible funding narratives.",
    draftTitle: "Good grant applications start with messy field evidence",
    draftContent: "",
    suggestedHashtags: ["#SRandED", "#OntarioInnovation", "#AppliedAI"],
    riskNotes: undefined,
    recommendedChannel: "LinkedIn",
    approvalNotes: "Ground every claim in observed workflow problems, not future product promises.",
    contentStatus: "Idea",
    isDemo: true,
  },
  {
    topic: "What a strong fleet support letter should say about maintenance pain",
    audience: "Repair Partner",
    contentType: "Prospect Nurturing Email",
    cta: "Book a 20-minute discovery call",
    contextNotes:
      "Email-style content that helps partners understand how to describe downtime pain, workflow friction, and why the product matters.",
    draftTitle: "A simple template for fleet partners supporting a TruckFixr application or pilot",
    draftContent: "",
    suggestedHashtags: [],
    riskNotes: undefined,
    recommendedChannel: "Email",
    approvalNotes: "Make this usable by sales and funding teams as a partner-enablement asset.",
    contentStatus: "Idea",
    isDemo: true,
  },
];

export const demoEngineeringTasks: Array<
  Omit<EngineeringTask, "id" | "createdDate" | "updatedDate">
> = [
  {
    title: "Improve mobile diagnostic form layout",
    businessReason:
      "Pilot fleets need a cleaner mobile workflow so diagnostic intake is easier to complete in the field.",
    userStory:
      "As a fleet operator using a phone, I want the diagnostic form to fit comfortably on mobile so I can submit issues without layout friction.",
    priority: "High",
    affectedArea: "Mobile UI",
    issueType: "Improvement",
    currentBehavior:
      "The diagnostic form feels cramped on smaller screens and key controls compete for space.",
    desiredBehavior:
      "The form should stack cleanly, maintain tap-friendly spacing, and keep primary actions visible.",
    acceptanceCriteria:
      "No overlapping fields on mobile, consistent spacing, clear primary CTA, and responsive layout on common phone widths.",
    filesLikelyInvolved:
      "mobile form components, shared input layouts, responsive utility styles",
    risks: "Could unintentionally affect desktop layout if spacing rules are shared.",
    testRequirements:
      "Manual responsive QA on mobile widths and regression check on desktop/tablet.",
    doNotChangeAreas:
      "Authentication flow, payment components, Supabase policies",
    notesForAI:
      "Keep changes scoped to layout and styling. Do not redesign unrelated screens.",
    status: "Ready for Codex",
    isDemo: true,
  },
  {
    title: "Add onboarding validation for vehicle setup",
    businessReason:
      "Incomplete vehicle setup creates downstream data quality issues for maintenance workflows.",
    userStory:
      "As an admin setting up vehicles, I want clear validation so I do not miss required configuration fields.",
    priority: "Critical",
    affectedArea: "Onboarding",
    issueType: "Feature",
    currentBehavior:
      "Vehicle setup accepts incomplete entries and does not consistently explain missing requirements.",
    desiredBehavior:
      "Required fields should validate clearly before submission, with inline guidance for missing or invalid data.",
    acceptanceCriteria:
      "Required fields block submit, validation messages are readable, and successful setup still works end to end.",
    filesLikelyInvolved:
      "onboarding vehicle setup form, validation helpers, related tests",
    risks: "Validation changes can block valid edge cases if rules are too strict.",
    testRequirements:
      "Add form validation tests and manual happy-path plus failure-path checks.",
    doNotChangeAreas:
      "User auth, billing, RLS, and unrelated onboarding screens",
    notesForAI:
      "Prefer existing form validation patterns already used in the repo.",
    status: "Planned",
    isDemo: true,
  },
  {
    title: "Review Supabase RLS policies",
    businessReason:
      "Security posture needs a focused review before broader internal usage and future live data storage.",
    userStory:
      "As the founding team, we want confidence that row-level access patterns are scoped correctly before production-sensitive data is introduced.",
    priority: "Critical",
    affectedArea: "Supabase",
    issueType: "Security",
    currentBehavior:
      "RLS assumptions and policy coverage are not summarized in one place for review.",
    desiredBehavior:
      "Produce a clear review of existing RLS scope, risks, and any follow-up actions required.",
    acceptanceCriteria:
      "Review output identifies tables, policy gaps, risk areas, and recommended next steps without changing production data access automatically.",
    filesLikelyInvolved:
      "Supabase schema files, policy definitions, server data access helpers",
    risks: "Security reviews can broaden scope quickly if not kept focused on written requirements.",
    testRequirements:
      "Policy review checklist and, if code changes are approved later, targeted access tests.",
    doNotChangeAreas:
      "Authentication implementation, payment flows, customer-facing permissions without explicit approval",
    notesForAI:
      "Do not modify RLS or auth automatically. Focus on review and documentation first.",
    status: "Review Needed",
    isDemo: true,
  },
  {
    title: "Improve landing page CTA for fleet pilots",
    businessReason:
      "Founder outreach and pilot conversion depend on clearer calls to action for fleet operators.",
    userStory:
      "As a prospective fleet partner, I want the landing page CTA to clearly tell me the next step for learning about a pilot.",
    priority: "Medium",
    affectedArea: "Landing Page",
    issueType: "Improvement",
    currentBehavior:
      "The current CTA does not strongly connect the value proposition to the pilot discovery action.",
    desiredBehavior:
      "CTA copy and surrounding support text should make the pilot next step clear and specific.",
    acceptanceCriteria:
      "Updated CTA is concise, founder-led, and visible without relying on hype language.",
    filesLikelyInvolved:
      "landing page hero section, supporting CTA copy blocks",
    risks: "Copy changes can drift from approved positioning if not checked against company defaults.",
    testRequirements:
      "Content review, mobile/desktop layout pass, and CTA visibility check.",
    doNotChangeAreas:
      "Payments, auth, and unrelated marketing modules",
    notesForAI:
      "Keep the page structure stable unless a small layout adjustment is clearly needed.",
    status: "In Progress",
    isDemo: true,
  },
  {
    title: "Plan ELD/telematics integration architecture",
    businessReason:
      "Future commercial and grant pathways depend on a credible integration plan for telematics-ready fleets.",
    userStory:
      "As the product team, we want a phased telematics architecture plan so we can decide what to build and what to defer.",
    priority: "High",
    affectedArea: "Telematics",
    issueType: "Integration",
    currentBehavior:
      "Integration requirements are discussed informally but not yet structured into an implementation-ready plan.",
    desiredBehavior:
      "Document architecture options, data boundaries, risks, and phased rollout guidance.",
    acceptanceCriteria:
      "Output covers possible providers, data flow, security concerns, open questions, and recommended next steps.",
    filesLikelyInvolved:
      "integration docs, architecture notes, telematics service layer if present",
    risks: "Could overreach into implementation details before security and provider constraints are settled.",
    testRequirements:
      "Planning artifact only for now, with follow-up test strategy once scope is approved.",
    doNotChangeAreas:
      "Billing, auth, and Supabase RLS unless separately approved",
    notesForAI:
      "Treat this as architecture planning, not code generation by default.",
    status: "Ready for Codex",
    isDemo: true,
  },
];

export const demoPilotEvidence: Array<
  Omit<PilotEvidence, "id" | "createdDate" | "updatedDate">
> = [
  {
    pilotName: "Fleet Partner A",
    fleetType: "Trucking",
    fleetSize: "10",
    pilotType: "Discovery Pilot",
    pilotStatus: "Completed",
    startDate: "2026-04-07",
    endDate: "2026-05-02",
    primaryContact: "Operations Lead",
    problemStatement:
      "Maintenance decisions were slowed by fragmented repair history and inconsistent issue capture.",
    solutionDeployed:
      "TruckFixr ran a discovery pilot focused on issue intake, repair context review, and maintenance workflow mapping.",
    outcomesObserved:
      "The fleet team consistently surfaced repeat pain around missing repair context and manual follow-up between drivers and coordinators.",
    technicalLearnings:
      "Teams needed clearer issue summaries and an easier way to connect reported symptoms to recent maintenance history.",
    productFeedback:
      "Users responded well to structured issue capture and wanted faster access to prior repair context.",
    expansionPotential:
      "Potential follow-on implementation pilot tied to broader maintenance workflow adoption.",
    revenueImpact:
      "Discovery pilot validated interest in a paid implementation phase if workflow fit is confirmed.",
    grantEvidenceValue: "High",
    supportLetterPotential: "Maybe",
    caseStudyPotential: "Yes",
    nextAction: "Draft anonymized case study outline and prepare follow-up implementation scope.",
    notes: "Demo pilot evidence only.",
    isDemo: true,
  },
  {
    pilotName: "Fleet Partner B",
    fleetType: "Construction",
    fleetSize: "6",
    pilotType: "Implementation Pilot",
    pilotStatus: "Active",
    startDate: "2026-05-20",
    endDate: "",
    primaryContact: "Fleet Supervisor",
    problemStatement:
      "Vehicle maintenance coordination depended on scattered updates across texts, calls, and vendor notes.",
    solutionDeployed:
      "TruckFixr is testing a more structured implementation workflow for repair visibility and internal maintenance follow-through.",
    outcomesObserved:
      "Early feedback suggests the team values having issue context captured in one place, though the pilot is still active.",
    technicalLearnings:
      "Implementation pilots need low-friction setup and clearer language for field teams entering issue details.",
    productFeedback:
      "Mobile readability and faster issue-entry flows remain important for adoption.",
    expansionPotential:
      "Could expand into a broader fleet rollout if the current implementation phase continues to align with field needs.",
    revenueImpact:
      "Active implementation pilot supports future revenue conversations but should not be overstated while still in progress.",
    grantEvidenceValue: "Medium",
    supportLetterPotential: "Maybe",
    caseStudyPotential: "Maybe",
    nextAction: "Capture midpoint pilot review and convert learnings into product requirements.",
    notes: "Demo pilot evidence only.",
    isDemo: true,
  },
];

export const demoPartnerships: Array<
  Omit<Partnership, "id" | "createdDate" | "updatedDate">
> = [
  {
    partnerName: "Ontario Parts Supplier A",
    website: "https://example.com/ontario-parts-supplier-a",
    partnerType: "Parts Supplier",
    contactName: "Regional Partnerships Lead",
    contactEmail: "",
    contactPhone: "",
    contactLinkedIn: "",
    location: "Ontario, Canada",
    relationshipStatus: "Active Conversation",
    referralPotential: "High",
    coPilotPotential: "Maybe",
    integrationPotential: "No",
    lastContactDate: "2026-06-02",
    nextAction: "Share a simple referral workflow for fleet accounts needing better maintenance visibility.",
    notes: "Demo relationship record only.",
    isDemo: true,
  },
  {
    partnerName: "ELD Provider B",
    website: "https://example.com/eld-provider-b",
    partnerType: "ELD/Telematics Provider",
    contactName: "Partnerships Manager",
    contactEmail: "",
    contactPhone: "",
    contactLinkedIn: "",
    location: "Ontario, Canada",
    relationshipStatus: "Identified",
    referralPotential: "Medium",
    coPilotPotential: "Maybe",
    integrationPotential: "Yes",
    lastContactDate: "",
    nextAction: "Prepare an integration conversation brief tied to Ontario fleet uptime workflows.",
    notes: "Demo relationship record only.",
    isDemo: true,
  },
  {
    partnerName: "Fleet Association C",
    website: "https://example.com/fleet-association-c",
    partnerType: "Industry Association",
    contactName: "Membership Director",
    contactEmail: "",
    contactPhone: "",
    contactLinkedIn: "",
    location: "Ontario, Canada",
    relationshipStatus: "Contacted",
    referralPotential: "Medium",
    coPilotPotential: "No",
    integrationPotential: "No",
    lastContactDate: "2026-05-28",
    nextAction: "Follow up on a founder-led session about fleet maintenance visibility for members.",
    notes: "Demo relationship record only.",
    isDemo: true,
  },
];

export const demoFundingOpportunities: Array<
  Omit<FundingOpportunity, "id" | "createdDate" | "updatedDate">
> = [
  {
    programName: "OVIN Research & Development Partnership Fund",
    funderOrganization: "Ontario Vehicle Innovation Network (OVIN)",
    fundingType: "R&D Support",
    amountRange: "Up to $100,000 (Stream 1) or up to $1,000,000 (Stream 2)",
    deadline: undefined,
    eligibilitySummary:
      "Ontario SMEs with operations in Ontario and at least one partner can apply for projects advancing automotive and mobility technologies toward commercialization. Focus areas include connected and autonomous vehicles, smart mobility, and AI.",
    truckFixrFitScore: 5,
    requiredPartner: "Yes",
    customerSupportLetterNeeded: "Yes",
    status: "Fit",
    nextAction:
      "Package a smart mobility + AI project scope, identify one Ontario fleet or data partner, and confirm the project fits TRL 3-9 commercialization work.",
    notes:
      "Reviewed against OVIN official pages on 2026-06-09. OVIN states programs were open as of June 8, 2026 and Stream 1 is reviewed on a rolling basis.",
    sourceLink: "https://www.ovinhub.ca/programs/rd-partnership-fund/",
    grantReadiness: {
      deadlineKnown: true,
      projectOverviewReady: false,
      customerPartnerIdentified: false,
      technicalUncertaintyDocumented: true,
      commercializationPlanDrafted: false,
    },
    isDemo: true,
  },
  {
    programName: "Mitacs Accelerate",
    funderOrganization: "Mitacs",
    fundingType: "R&D Support",
    amountRange: "$15,000 per internship unit or $20,000 per postdoctoral unit",
    deadline: undefined,
    eligibilitySummary:
      "For-profit partners can work with a Canadian academic institution on a research project. Partner contributions start at $7,500 per internship, which Mitacs leverages into a $15,000 research award.",
    truckFixrFitScore: 4,
    requiredPartner: "Yes",
    customerSupportLetterNeeded: "Unknown",
    status: "Fit",
    nextAction:
      "Find an Ontario academic supervisor in AI, operations research, or transportation systems and scope a 4-6 month applied research project around diagnostic workflows.",
    notes:
      "Reviewed against Mitacs official program page on 2026-06-09. Applications are ongoing through Mitacs Advisors and typical review time is about 6-8 weeks.",
    sourceLink: "https://www.mitacs.ca/our-programs/accelerate/",
    grantReadiness: {
      projectOverviewReady: false,
      budgetOutlineReady: false,
      customerPartnerIdentified: false,
      technicalUncertaintyDocumented: true,
    },
    isDemo: true,
  },
  {
    programName: "Scientific Research and Experimental Development (SR&ED)",
    funderOrganization: "Canada Revenue Agency",
    fundingType: "Grant",
    amountRange: "Refundable or non-refundable tax credits based on eligible R&D expenditures",
    deadline: undefined,
    eligibilitySummary:
      "Canadian businesses performing eligible scientific research or experimental development in Canada can claim tax incentives on qualifying expenditures.",
    truckFixrFitScore: 5,
    requiredPartner: "No",
    customerSupportLetterNeeded: "No",
    status: "Fit",
    nextAction:
      "Set up contemporaneous R&D documentation for uncertainty, experiments, code iterations, and technical results across the diagnostics product roadmap.",
    notes:
      "Reviewed against the official CRA page on 2026-06-09. Best fit if TruckFixr captures technical uncertainty and experiment evidence as work happens rather than retroactively.",
    sourceLink:
      "https://www.canada.ca/en/revenue-agency/services/scientific-research-experimental-development-tax-incentive-program.html",
    grantReadiness: {
      deadlineKnown: true,
      applicantEntityConfirmed: true,
      technicalUncertaintyDocumented: false,
      commercializationPlanDrafted: false,
    },
    isDemo: true,
  },
  {
    programName: "Collaborate 2 Commercialize (C2C)",
    funderOrganization: "Ontario Centre of Innovation + NSERC",
    fundingType: "Grant",
    amountRange:
      "OCI $20,000-$50,000 plus matched NSERC and industry contribution (Alliance stream)",
    deadline: "2026-07-31",
    eligibilitySummary:
      "Ontario for-profit companies incorporated for at least two years with five FTEs in Ontario can partner with an eligible Ontario post-secondary institution on commercialization-focused R&D.",
    truckFixrFitScore: 3,
    requiredPartner: "Yes",
    customerSupportLetterNeeded: "Yes",
    status: "Researching",
    nextAction:
      "Confirm whether TruckFixr meets the two-year incorporation and five-FTE requirements, then approach an Ontario college or university lab plus one industry sponsor.",
    notes:
      "Reviewed against OCI official page on 2026-06-09. The first targeted call is open from June 1, 2026 to July 31, 2026 and is focused on defense and dual-use technologies, so fit may depend on future calls.",
    sourceLink: "https://www.oc-innovation.ca/programs/collaborate-2-commercialize/",
    grantReadiness: {
      deadlineKnown: true,
      eligibilityConfirmed: false,
      customerPartnerIdentified: false,
      supportLetterRequested: false,
      technicalUncertaintyDocumented: true,
    },
    isDemo: true,
  },
  {
    programName: "Ready 4 Market Fund",
    funderOrganization: "Ontario Centre of Innovation",
    fundingType: "Investor",
    amountRange: "Up to $250,000 with total rounds of $500,000 to $2,000,000",
    deadline: undefined,
    eligibilitySummary:
      "Ontario-based early-stage technology companies raising pre-seed or seed rounds may qualify if they have strong IP, principal operations in Ontario, are incorporated for no more than five years, and meet the fund's co-investment criteria.",
    truckFixrFitScore: 2,
    requiredPartner: "Yes",
    customerSupportLetterNeeded: "No",
    status: "Researching",
    nextAction:
      "Check whether TruckFixr has eligible Ontario-linked IP origins and whether the current round size, investor syndicate, and capital raised to date match OCI requirements.",
    notes:
      "Reviewed against OCI official page on 2026-06-09. This is a competitive co-investment fund and is most realistic if TruckFixr is actively building a qualifying pre-seed or seed round.",
    sourceLink: "https://www.oc-innovation.ca/programs/ready-4-market/",
    grantReadiness: {
      applicantEntityConfirmed: false,
      commercializationPlanDrafted: true,
      followUpScheduled: false,
    },
    isDemo: true,
  },
];

export const demoRDEvidenceItems: Array<
  Omit<RDEvidence, "id" | "createdDate" | "updatedDate">
> = [
  {
    date: "2026-05-05",
    evidenceType: "Customer Discovery",
    source: "Demo fleet discovery call",
    customerPartner: "Fleet Partner Demo A",
    fleetSegment: "Ontario trucking fleet, 10 vehicles",
    problemObserved:
      "Maintenance context was spread across phone calls, driver notes, and vendor updates.",
    technicalUncertainty:
      "Whether structured issue capture could preserve enough repair context for faster internal decisions.",
    experimentTestConducted:
      "Mapped a sample issue intake workflow and compared it against recent repair-history notes.",
    resultLearning:
      "The team needed clearer symptom summaries and a consistent way to connect issues to prior maintenance.",
    commercializationEvidence:
      "The fleet showed interest in a follow-on implementation discussion if workflow fit is confirmed.",
    grantRelevance:
      "Supports an R&D narrative around field workflow validation and maintenance decision support.",
    supportLetterPotential: "Unknown",
    confidenceLevel: "High",
    nextAction: "Convert learning into pilot evidence and product requirements.",
    notes: "Demo R&D evidence only.",
    isDemo: true,
  },
  {
    date: "2026-05-18",
    evidenceType: "Technical Experiment",
    source: "Demo diagnostic workflow test",
    customerPartner: "Fleet Partner Demo B",
    fleetSegment: "Construction fleet, 6 vehicles",
    problemObserved:
      "Field teams needed lower-friction mobile issue entry during active workdays.",
    technicalUncertainty:
      "How much structure can be added before drivers avoid completing maintenance intake.",
    experimentTestConducted:
      "Tested a shorter mobile intake flow with guided notes and priority cues.",
    resultLearning:
      "Short labels and fewer required fields improved clarity for field users.",
    commercializationEvidence:
      "Feedback suggested mobile usability is important for paid implementation adoption.",
    grantRelevance:
      "Documents product experimentation tied to field usability and workflow adoption.",
    supportLetterPotential: "Unknown",
    confidenceLevel: "Medium",
    nextAction: "Review mobile form requirements with engineering.",
    notes: "Demo R&D evidence only.",
    isDemo: true,
  },
  {
    date: "2026-06-01",
    evidenceType: "ELD/Telematics Requirement",
    source: "Demo telematics partner conversation",
    customerPartner: "ELD Provider Demo",
    fleetSegment: "Telematics-ready fleet partners",
    problemObserved:
      "Telematics events and maintenance decisions were not easy for small fleets to review together.",
    technicalUncertainty:
      "Which connected-fleet signals are most useful for maintenance prioritization without adding noise.",
    experimentTestConducted:
      "Outlined data fields and decision points for a future integration discovery sprint.",
    resultLearning:
      "Initial integration should focus on practical maintenance visibility, not broad data ingestion.",
    commercializationEvidence:
      "Integration planning may support partnerships with ELD-ready fleets and providers.",
    grantRelevance:
      "Supports future R&D scope around connected fleet data and maintenance intelligence.",
    supportLetterPotential: "Yes",
    confidenceLevel: "Medium",
    nextAction: "Add telematics architecture task to roadmap.",
    notes: "Demo R&D evidence only.",
    isDemo: true,
  },
];

export const demoInvestorContacts: Array<
  Omit<InvestorContact, "id" | "createdDate" | "updatedDate">
> = [
  {
    investorName: "Ontario Mobility Angel Group",
    fundName: "Demo Angel Network",
    investorType: "Angel",
    investmentStage: "Pre-seed",
    email: "",
    linkedIn: "",
    status: "Identified",
    pitchDeckVersion: "Demo v1",
    lastContactDate: "",
    meetingNotes:
      "Fictional demo investor focused on Ontario mobility and B2B software.",
    nextAction: "Prepare warm intro request after pilot evidence summary is ready.",
    notes: "Demo investor contact only.",
    isDemo: true,
  },
  {
    investorName: "FleetTech Seed Fund",
    fundName: "Demo Seed Fund",
    investorType: "VC",
    investmentStage: "Seed",
    email: "",
    linkedIn: "",
    status: "Researching",
    pitchDeckVersion: "Demo v1",
    lastContactDate: "",
    meetingNotes:
      "Fictional demo fund with a transportation and operations-software thesis.",
    nextAction: "Research portfolio fit and likely intro path.",
    notes: "Demo investor contact only.",
    isDemo: true,
  },
  {
    investorName: "Commercial Fleet Strategic Partner",
    fundName: "Demo Strategic Capital",
    investorType: "Strategic",
    investmentStage: "Pilot-to-commercial",
    email: "",
    linkedIn: "",
    status: "Follow-up Later",
    pitchDeckVersion: "Demo v1",
    lastContactDate: "",
    meetingNotes:
      "Fictional strategic contact for future fleet maintenance ecosystem conversations.",
    nextAction: "Revisit after two implementation pilots are documented.",
    notes: "Demo investor contact only.",
    isDemo: true,
  },
];

export const demoRoadmapItems: Array<
  Omit<RoadmapItem, "id" | "createdDate" | "updatedDate">
> = [
  {
    title: "Add command center weekly operating summary",
    module: "Dashboard",
    phase: "Phase 1",
    type: "Feature",
    priority: "High",
    status: "Done",
    businessReason:
      "Dickson needs one weekly view of operating priorities, blockers, and KPI movement.",
    successCriteria:
      "Weekly priorities persist, blockers are pulled from engineering tasks, and Markdown export works.",
    owner: "Codex",
    riskLevel: "Low",
    targetDate: "2026-06-10",
    notes: "Demo roadmap item only.",
    codexPromptUsed: "Build the Command Center home screen.",
    isDemo: true,
  },
  {
    title: "Improve mobile table scrolling across modules",
    module: "Dashboard",
    phase: "Phase 1",
    type: "UX",
    priority: "High",
    status: "In Progress",
    businessReason:
      "The founder and team need usable workflows on small screens during field conversations.",
    successCriteria:
      "No horizontal page overflow at 375px; data tables scroll inside their containers.",
    owner: "Codex",
    riskLevel: "Medium",
    targetDate: "2026-06-12",
    notes: "Demo roadmap item only.",
    codexPromptUsed: "",
    isDemo: true,
  },
  {
    title: "Plan Supabase auth migration",
    module: "Settings",
    phase: "Phase 2",
    type: "Security",
    priority: "Critical",
    status: "Planned",
    businessReason:
      "The current browser password gate is basic protection only and should not hold sensitive data.",
    successCriteria:
      "Document auth scope, roles, migration risks, and rollout path before real customer data is stored.",
    owner: "Dickson",
    riskLevel: "High",
    targetDate: "2026-07-15",
    notes: "Demo roadmap item only.",
    codexPromptUsed: "",
    isDemo: true,
  },
  {
    title: "Add partner-driven lead source tracking",
    module: "Partnerships",
    phase: "Phase 2",
    type: "Improvement",
    priority: "Medium",
    status: "Planned",
    businessReason:
      "TruckFixr needs to understand which relationship channels produce useful fleet conversations.",
    successCriteria:
      "Partnership records can connect to prospects or referral notes without overwriting sales data.",
    owner: "Future Hire",
    riskLevel: "Medium",
    targetDate: "2026-08-01",
    notes: "Demo roadmap item only.",
    codexPromptUsed: "",
    isDemo: true,
  },
  {
    title: "Create ELD integration discovery plan",
    module: "Integrations",
    phase: "Phase 3",
    type: "Integration",
    priority: "High",
    status: "Blocked",
    businessReason:
      "Future fleet and grant opportunities may depend on credible telematics integration planning.",
    successCriteria:
      "Define provider assumptions, data boundaries, privacy review needs, and a phased prototype plan.",
    owner: "Developer",
    riskLevel: "High",
    targetDate: "2026-09-15",
    notes: "Demo roadmap item only.",
    codexPromptUsed: "",
    isDemo: true,
  },
  {
    title: "Launch a five-asset proof-led content sprint",
    module: "Marketing",
    phase: "Phase 1",
    type: "Automation",
    priority: "High",
    status: "Planned",
    businessReason:
      "TruckFixr needs consistent top-of-funnel education that turns field pain into demand without relying on hype.",
    successCriteria:
      "Five content assets are published or drafted, each tied to a CTA, a target audience, and at least one reusable proof point.",
    owner: "Dickson",
    riskLevel: "Low",
    targetDate: "2026-06-20",
    notes: "Derived from the refreshed Marketing Agent content backlog.",
    codexPromptUsed: "",
    isDemo: true,
  },
  {
    title: "Build the June funding pipeline around OVIN, Mitacs, SR&ED, C2C, and R4M",
    module: "Funding/R&D",
    phase: "Phase 1",
    type: "Automation",
    priority: "Critical",
    status: "Planned",
    businessReason:
      "TruckFixr needs a live funding pipeline with deadlines, eligibility notes, and next actions instead of generic grant ideas.",
    successCriteria:
      "Each priority program has a fit score, owner, next action, and partial grant-readiness checklist with missing items called out.",
    owner: "Dickson",
    riskLevel: "Medium",
    targetDate: "2026-06-18",
    notes: "Use the Funding Agent to convert research into application-ready work.",
    codexPromptUsed: "",
    isDemo: true,
  },
  {
    title: "Capture three pilot-grade proof points for reuse across sales, marketing, and funding",
    module: "Pilot Evidence",
    phase: "Phase 1",
    type: "Data",
    priority: "High",
    status: "Planned",
    businessReason:
      "The same evidence should support sales follow-up, investor updates, and funding narratives rather than being recollected each time.",
    successCriteria:
      "Three evidence records include problem observed, technical uncertainty, result learning, commercialization relevance, and quote-ready language.",
    owner: "Dickson",
    riskLevel: "Low",
    targetDate: "2026-06-17",
    notes: "Prioritize fleets willing to support a letter or anonymized case study.",
    codexPromptUsed: "",
    isDemo: true,
  },
  {
    title: "Turn qualified fleet conversations into one support-letter pipeline",
    module: "Sales",
    phase: "Phase 1",
    type: "Improvement",
    priority: "High",
    status: "Planned",
    businessReason:
      "Funding targets depend on real fleet pain, partner interest, and support letters from operators with credible use cases.",
    successCriteria:
      "Top prospects are tagged by funding relevance, decision-maker status, and support-letter likelihood with clear follow-up tasks.",
    owner: "Dickson",
    riskLevel: "Medium",
    targetDate: "2026-06-24",
    notes: "Best early targets are Ontario fleets with repeat maintenance coordination pain.",
    codexPromptUsed: "",
    isDemo: true,
  },
  {
    title: "Recruit one Ontario academic and one ecosystem partner for co-development funding",
    module: "Partnerships",
    phase: "Phase 1",
    type: "Integration",
    priority: "High",
    status: "Planned",
    businessReason:
      "Mitacs, C2C, and OVIN become more actionable once TruckFixr has an academic contact and a commercialization partner in motion.",
    successCriteria:
      "At least one university or college contact and one ecosystem or fleet partner are in active conversation with a shared project concept note.",
    owner: "Dickson",
    riskLevel: "Medium",
    targetDate: "2026-06-27",
    notes: "Ideal partners cover AI applied research, fleet operations, or mobility data workflows.",
    codexPromptUsed: "",
    isDemo: true,
  },
  {
    title: "Add exportable funding-evidence packets from the operating system",
    module: "Engineering",
    phase: "Phase 2",
    type: "Feature",
    priority: "High",
    status: "Planned",
    businessReason:
      "The agents move faster when evidence, content, and funding records can be exported into one defensible application packet.",
    successCriteria:
      "Funding opportunities, R&D evidence, and selected proof assets can be exported together in a founder-ready grant package.",
    owner: "Codex",
    riskLevel: "Medium",
    targetDate: "2026-07-05",
    notes: "Keep scope focused on export, tagging, and cross-module reuse rather than full workflow automation.",
    codexPromptUsed: "",
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
