export type WorkstreamStatus = "On Track" | "Watching" | "At Risk" | "Planned";

export type WorkstreamPriority = "Critical" | "High" | "Medium" | "Low";

export interface CompanySettings {
  companyName: string;
  corePositioning: string;
  primaryICP: string;
  secondaryICP: string;
  strategicICP: string;
  cta: string;
  pilotOffer: string;
  discoveryPilotValue: string;
  earlyPartnerRange: string;
  paidImplementationRange: string;
}

export type OutreachStatus =
  | "New"
  | "Researched"
  | "Drafted"
  | "Approved"
  | "Sent"
  | "Replied"
  | "Discovery Booked"
  | "Pilot Fit"
  | "Proposal Sent"
  | "Won"
  | "Nurture"
  | "Lost";

export type SalesPipelineStage =
  | "New Prospect"
  | "Researching"
  | "Qualified"
  | "Outreach Drafted"
  | "Outreach Sent"
  | "Follow-Up Due"
  | "Replied"
  | "Discovery Booked"
  | "Discovery Completed"
  | "Pilot Proposed"
  | "Pilot Agreed"
  | "Onboarding"
  | "Pilot Active"
  | "Pilot Review"
  | "Paid Proposal Sent"
  | "Won"
  | "Nurture"
  | "Lost";

export type SalesPriority = "Low" | "Medium" | "High" | "Critical";

export type SalesConsentStatus =
  | "unknown"
  | "implied"
  | "express"
  | "unsubscribed"
  | "do_not_contact";

export interface ProspectContact {
  id: string;
  name: string;
  title?: string;
  role?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  preferredChannel?: "Email" | "Phone" | "LinkedIn" | "SMS" | "Unknown";
  influenceLevel?: "low" | "medium" | "high";
  decisionRole?: "decision maker" | "influencer" | "user" | "blocker" | "unknown";
  consentStatus?: SalesConsentStatus;
  consentSource?: string;
  doNotContact?: boolean;
  notes?: string;
  lastContactedDate?: string;
  nextFollowUpDate?: string;
  archivedAt?: string;
}

export interface SalesOutreachDraft {
  id: string;
  channel: "email" | "linkedin" | "phone" | "voicemail" | "other";
  draftType:
    | "cold email"
    | "warm referral email"
    | "linkedin connection"
    | "linkedin follow-up"
    | "phone script"
    | "voicemail script"
    | "post-discovery follow-up"
    | "pilot proposal follow-up"
    | "pilot check-in"
    | "paid conversion follow-up"
    | "nurture email";
  subject?: string;
  body: string;
  status: "Draft" | "Needs Review" | "Approved" | "Sent" | "Used" | "Archived";
  approvalStatus: "Not Reviewed" | "Needs Review" | "Approved" | "Rejected";
  generatedAt: string;
  generatedReason?: string;
  relatedContactId?: string;
  manuallyMarkedSentDate?: string;
}

export interface SalesFollowUpStep {
  id: string;
  sequenceName: string;
  stepName: string;
  dueDate?: string;
  channel: "email" | "linkedin" | "phone" | "other";
  status: "open" | "in_progress" | "completed" | "dismissed";
  notes?: string;
}

export interface SalesDiscoveryWorkflow {
  completedAt?: string;
  fleetSize?: string;
  vehicleTypes?: string;
  locations?: string;
  maintenanceModel?: string;
  maintenanceSoftware?: string;
  eldTelematicsProvider?: string;
  inspectionProcess?: string;
  commonBreakdowns?: string;
  diagnosticDelays?: string;
  repeatRepairs?: string;
  inspectionIssues?: string;
  downtimeImpact?: string;
  communicationGaps?: string;
  documentationGaps?: string;
  currentWorkaround?: string;
  decisionMaker?: string;
  budgetOwner?: string;
  urgency?: "Low" | "Medium" | "High" | "Critical";
  willingnessToPilot?: "Yes" | "No" | "Maybe";
  preferredPilotScope?: string;
  successCriteria?: string;
  timeline?: string;
  objections?: string;
  availableDataSources?: string;
  supportLetterPotential?: "Low" | "Medium" | "High";
  paidConversionLikelihood?: "Low" | "Medium" | "High";
  recommendedStageTransition?: SalesPipelineStage;
  summary?: string;
}

export interface SalesPilotProposal {
  id: string;
  status: "Draft" | "Needs Review" | "Sent" | "Accepted" | "Rejected" | "Revised";
  pricingPath:
    | "Free structured pilot"
    | "Paid pilot"
    | "Discounted early adopter pilot"
    | "Standard subscription quote"
    | "Custom strategic pilot";
  proposalMarkdown?: string;
  pilotObjective?: string;
  pilotScope?: string;
  vehiclesUsersIncluded?: string;
  modulesIncluded?: string;
  dataSourcesUsed?: string;
  successMetrics?: string;
  timeline?: string;
  reviewDate?: string;
  risksAssumptions?: string;
  nextSteps?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesQuote {
  id: string;
  selectedPlan:
    | "Owner-Operator"
    | "Small Fleet"
    | "Fleet Growth"
    | "Fleet Pro"
    | "Custom Fleet";
  poweredVehicles?: number;
  trailers?: number;
  users?: number;
  pilotPrice?: string;
  discount?: string;
  discountReason?: string;
  monthlyPrice?: string;
  annualPrice?: string;
  customPrice?: string;
  quoteExpiryDate?: string;
  notes?: string;
  summaryMarkdown?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesOnboardingChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  owner?: string;
  notes?: string;
}

export interface SalesPilotHealth {
  vehiclesOnboarded?: number;
  usersInvited?: number;
  inspectionsIssuesCaptured?: number;
  diagnosticInteractions?: number;
  maintenanceActionsCreated?: number;
  lastActivityDate?: string;
  driverFeedback?: string;
  fleetManagerFeedback?: string;
  technicianFeedback?: string;
  usabilityIssues?: string;
  featureRequests?: string;
  objectionsConcerns?: string;
  successMetricsAchieved?: string[];
  conversionReadiness?: "low" | "medium" | "high";
  supportLetterPotential?: "low" | "medium" | "high";
  healthStatus:
    | "Healthy"
    | "Needs Attention"
    | "At Risk"
    | "Ready for Review"
    | "Ready for Paid Conversion";
}

export interface SalesLossNurtureRecord {
  reason?: string;
  mainObjection?: string;
  currentSolution?: string;
  competitor?: string;
  priceConcern?: string;
  timingIssue?: string;
  missingFeature?: string;
  decisionBlocker?: string;
  futureTrigger?: string;
  nextCheckInDate?: string;
  recommendedNurtureSequence?: string;
}

export interface SalesPartnerReferral {
  id: string;
  partnerName: string;
  company?: string;
  partnerType?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  relationshipStrength?: "Low" | "Medium" | "High";
  referralPotential?: "Low" | "Medium" | "High";
  notes?: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  linkedPartnershipId?: string;
  referredProspect?: string;
  referralDate?: string;
  referralStatus?:
    | "Identified"
    | "Intro Pending"
    | "Intro Made"
    | "Discovery Booked"
    | "Pilot Started"
    | "Paid Customer Won"
    | "Closed Lost"
    | "Dormant";
  introMade?: boolean;
  introPending?: boolean;
  outcome?: string;
  estimatedValue?: number;
  pilotFit?: "Low" | "Medium" | "High";
  partnerNotes?: string;
  referralsMade?: number;
  discoveryCallsBooked?: number;
  pilotsStarted?: number;
  paidCustomersWon?: number;
  rdFundingValueGenerated?: string;
}

export interface SalesIntelligenceRecord {
  id: string;
  objectionType?: string;
  objectionDetail?: string;
  recommendedResponse?: string;
  competitorOrAlternative?: string;
  missingFeature?: string;
  roadmapImplication?: string;
  pricingConcern?: string;
  integrationRequirement?: string;
  proofRequirement?: string;
  createdAt: string;
}

export interface SalesHandoff {
  id: string;
  target: "Marketing Agent" | "Funding/R&D Agent" | "Engineering Agent" | "Roadmap";
  trigger: string;
  outputType: string;
  status: "Draft" | "Reviewed" | "Accepted" | "Completed" | "Rejected";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesActivityLog {
  id: string;
  prospectId: string;
  companyName: string;
  eventType:
    | "stage_changed"
    | "prospect_updated"
    | "draft_generated"
    | "draft_marked_sent"
    | "discovery_completed"
    | "proposal_updated"
    | "proposal_decided"
    | "pilot_health_updated"
    | "handoff_written"
    | "handoff_status_changed"
    | "note";
  title: string;
  detail?: string;
  createdAt: string;
}

export interface Prospect {
  id: string;
  companyName: string;
  website?: string;
  location: string;
  serviceArea?: string;
  fleetType?:
    | "Trucking/Logistics"
    | "Construction"
    | "Contractor"
    | "Courier"
    | "Mixed"
    | "Other";
  estimatedFleetSize?:
    | "2-5"
    | "5-8"
    | "6-10"
    | "8-12"
    | "11-20"
    | "15-20"
    | "21-50"
    | "50+";
  vehicleTypes?: string;
  numberOfLocations?: number;
  inHouseMaintenance?: boolean;
  outsourcedMaintenance?: boolean;
  currentMaintenanceProcess?: string;
  currentMaintenanceSoftware?: string;
  eldTelematicsProvider?: string;
  decisionMaker?: string;
  email?: string;
  phone?: string;
  linkedIn?: string;
  sourceNotes?: string;
  leadSource?: string;
  leadSourceDetail?: string;
  campaignName?: string;
  campaignType?: string;
  referrerName?: string;
  referrerCompany?: string;
  eventName?: string;
  landingPageUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  firstTouchDate?: string;
  latestTouchDate?: string;
  convertedFromCampaign?: boolean;
  maintenancePain?: string;
  urgency?: "Low" | "Medium" | "High" | "Critical";
  decisionMakerIdentified?: boolean;
  budgetOwnerIdentified?: boolean;
  pilotInterest?: "No" | "Maybe" | "Yes";
  buyingTimeline?: string;
  estimatedMonthlyValue?: number;
  estimatedPilotValue?: number;
  estimatedAnnualValue?: number;
  pricingFit?: "Low" | "Medium" | "High" | "Unknown";
  commercialNotes?: string;
  usesEldTelematics: "Yes" | "No" | "Unknown";
  pilotFitScore: 1 | 2 | 3 | 4 | 5 | null;
  revenueFitScore: 1 | 2 | 3 | 4 | 5 | null;
  grantFitScore: 1 | 2 | 3 | 4 | 5 | null;
  rdFundingEvidenceScore?: 1 | 2 | 3 | 4 | 5 | null;
  speedToCloseScore?: 1 | 2 | 3 | 4 | 5 | null;
  commercialReadinessScore?: 1 | 2 | 3 | 4 | 5 | null;
  outreachStatus: OutreachStatus;
  currentStage?: SalesPipelineStage;
  previousStage?: SalesPipelineStage;
  stageChangedDate?: string;
  stageNotes?: string;
  nextAction?: string;
  nextActionDueDate?: string;
  nextActionOwner?: string;
  priority?: SalesPriority;
  stalled?: boolean;
  stalledReason?: string;
  lastContactDate?: string;
  consentStatus?: SalesConsentStatus;
  consentSource?: string;
  consentNotes?: string;
  consentCapturedAt?: string;
  unsubscribeStatus?: boolean;
  unsubscribedAt?: string;
  doNotContact?: boolean;
  doNotContactReason?: string;
  lastOutreachDate?: string;
  outreachCount30Days?: number;
  nextAllowedOutreachDate?: string;
  externalSource?: string;
  externalId?: string;
  syncStatus?: "not_synced" | "pending" | "synced" | "failed" | "imported" | "exported";
  lastSyncedAt?: string;
  gmailThreadId?: string;
  gmailMessageId?: string;
  calendarEventId?: string;
  meetingUrl?: string;
  lastEmailSentAt?: string;
  lastEmailReceivedAt?: string;
  lastMeetingDate?: string;
  nextMeetingDate?: string;
  notes?: string;
  firstEmailDraft?: string;
  linkedInConnectDraft?: string;
  linkedInFollowUpDraft?: string;
  phoneScript?: string;
  cta?: string;
  llmPersonalizationPrompt?: string;
  contacts?: ProspectContact[];
  outreachDrafts?: SalesOutreachDraft[];
  followUpSequence?: SalesFollowUpStep[];
  discoveryWorkflow?: SalesDiscoveryWorkflow;
  pilotProposal?: SalesPilotProposal;
  quote?: SalesQuote;
  onboardingChecklist?: SalesOnboardingChecklistItem[];
  pilotSuccessPlan?: string;
  internalHandoffNote?: string;
  pilotHealth?: SalesPilotHealth;
  pilotReviewReport?: string;
  lossNurture?: SalesLossNurtureRecord;
  partnerReferrals?: SalesPartnerReferral[];
  intelligenceRecords?: SalesIntelligenceRecord[];
  handoffs?: SalesHandoff[];
  isDemo?: boolean;
  metadata?: Record<string, unknown>;
  createdDate: string;
  updatedDate: string;
  archivedAt?: string;
}

export type ContentAudience =
  | "Fleet Owner"
  | "Owner-Operator"
  | "Fleet Manager"
  | "Repair Partner"
  | "Grant/Funding Partner"
  | "Investor"
  | "Ecosystem Partner";

export type ContentType =
  | "LinkedIn Founder Post"
  | "Educational LinkedIn Post"
  | "Pilot Learning Post"
  | "Grant/R&D Credibility Post"
  | "Prospect Nurturing Email"
  | "Blog Outline"
  | "Case Study Draft"
  | "Event Announcement"
  | "Investor Update Snippet"
  | "Landing Page Copy Suggestion";

export type ContentStatus =
  | "Idea"
  | "Drafted"
  | "Approved"
  | "Published"
  | "Deferred";

export interface ContentItem {
  id: string;
  topic: string;
  audience: ContentAudience;
  contentType: ContentType;
  cta?: string;
  contextNotes?: string;
  customerName?: string;
  draftTitle?: string;
  draftContent?: string;
  suggestedHashtags?: string[];
  riskNotes?: string;
  recommendedChannel?: string;
  approvalNotes?: string;
  contentStatus: ContentStatus;
  isDemo?: boolean;
  createdDate: string;
  updatedDate: string;
}

export type GrantReadinessKey =
  | "eligibilityConfirmed"
  | "deadlineKnown"
  | "applicantEntityConfirmed"
  | "projectOverviewReady"
  | "budgetOutlineReady"
  | "customerPartnerIdentified"
  | "supportLetterRequested"
  | "supportLetterReceived"
  | "technicalUncertaintyDocumented"
  | "commercializationPlanDrafted"
  | "applicationSubmitted"
  | "followUpScheduled";

export interface FundingOpportunity {
  id: string;
  programName: string;
  funderOrganization: string;
  fundingType:
    | "Grant"
    | "Loan"
    | "Wage Subsidy"
    | "Accelerator"
    | "Competition"
    | "Investor"
    | "R&D Support"
    | "Hiring Grant"
    | "Pilot Funding"
    | "Other";
  amountRange?: string;
  deadline?: string;
  eligibilitySummary?: string;
  truckFixrFitScore: 1 | 2 | 3 | 4 | 5 | null;
  requiredPartner: "Yes" | "No" | "Unknown";
  customerSupportLetterNeeded: "Yes" | "No" | "Unknown";
  contactPerson?: string;
  contactEmail?: string;
  status:
    | "Researching"
    | "Fit"
    | "Applied"
    | "Follow-up"
    | "Not Fit"
    | "Won"
    | "Lost"
    | "Deferred";
  nextAction?: string;
  notes?: string;
  sourceLink?: string;
  grantReadiness?: Partial<Record<GrantReadinessKey, boolean>>;
  isDemo?: boolean;
  createdDate: string;
  updatedDate: string;
}

export interface RDEvidence {
  id: string;
  date: string;
  evidenceType:
    | "Customer Discovery"
    | "Pilot Feedback"
    | "Technical Experiment"
    | "Product Improvement"
    | "ELD/Telematics Requirement"
    | "Sales Conversation"
    | "Grant Requirement"
    | "Budget Justification"
    | "Support Letter"
    | "Market Evidence"
    | "Compliance Requirement";
  source?: string;
  customerPartner?: string;
  fleetSegment?: string;
  problemObserved?: string;
  technicalUncertainty?: string;
  experimentTestConducted?: string;
  resultLearning?: string;
  commercializationEvidence?: string;
  grantRelevance?: string;
  supportLetterPotential: "Yes" | "No" | "Unknown";
  confidenceLevel: "Low" | "Medium" | "High";
  nextAction?: string;
  notes?: string;
  isDemo?: boolean;
  createdDate: string;
  updatedDate: string;
}

export interface InvestorContact {
  id: string;
  investorName: string;
  fundName?: string;
  investorType:
    | "Angel"
    | "VC"
    | "Strategic"
    | "Government"
    | "Accelerator"
    | "Other";
  investmentStage?: string;
  email?: string;
  linkedIn?: string;
  status:
    | "Researching"
    | "Identified"
    | "Outreached"
    | "Meeting Booked"
    | "Pitch Sent"
    | "In Diligence"
    | "Term Sheet"
    | "Passed"
    | "Follow-up Later";
  pitchDeckVersion?: string;
  lastContactDate?: string;
  meetingNotes?: string;
  nextAction?: string;
  notes?: string;
  isDemo?: boolean;
  createdDate: string;
  updatedDate: string;
}

export interface EngineeringTask {
  id: string;
  title: string;
  businessReason?: string;
  userStory?: string;
  priority: WorkstreamPriority;
  affectedArea:
    | "Mobile UI"
    | "Diagnostics"
    | "Vehicle Management"
    | "Onboarding"
    | "Landing Page"
    | "Supabase"
    | "Security"
    | "Payments"
    | "Telematics"
    | "Grant/R&D"
    | "Dashboard"
    | "Other";
  issueType:
    | "Bug"
    | "Feature"
    | "Improvement"
    | "Refactor"
    | "Documentation"
    | "Test"
    | "Security"
    | "Integration";
  currentBehavior?: string;
  desiredBehavior?: string;
  acceptanceCriteria?: string;
  filesLikelyInvolved?: string;
  risks?: string;
  testRequirements?: string;
  doNotChangeAreas?: string;
  notesForAI?: string;
  status:
    | "Planned"
    | "In Progress"
    | "Blocked"
    | "Ready for Codex"
    | "PR Drafted"
    | "Review Needed"
    | "Done"
    | "Deferred";
  isDemo?: boolean;
  createdDate: string;
  updatedDate: string;
}

export interface RoadmapItem {
  id: string;
  title: string;
  module:
    | "Sales"
    | "Marketing"
    | "Engineering"
    | "Funding/R&D"
    | "Dashboard"
    | "Settings"
    | "Integrations"
    | "Pilot Evidence"
    | "Partnerships";
  phase: "Phase 1" | "Phase 2" | "Phase 3" | "Phase 4" | "Future";
  type:
    | "Feature"
    | "Bug"
    | "Improvement"
    | "Integration"
    | "Security"
    | "UX"
    | "Data"
    | "Automation";
  priority: WorkstreamPriority;
  status: "Planned" | "In Progress" | "Blocked" | "Done" | "Deferred";
  businessReason?: string;
  successCriteria?: string;
  owner: "Dickson" | "Codex" | "Developer" | "Future Hire";
  riskLevel: "Low" | "Medium" | "High";
  notes?: string;
  isDemo?: boolean;
  createdDate: string;
  updatedDate: string;
  targetDate?: string;
  codexPromptUsed?: string;
}

export interface PilotEvidence {
  id: string;
  pilotName: string;
  fleetType?: string;
  fleetSize?: string;
  pilotType: "Discovery Pilot" | "Implementation Pilot" | "Informal Assessment";
  pilotStatus: "Active" | "Completed" | "Paused" | "Cancelled";
  startDate?: string;
  endDate?: string;
  primaryContact?: string;
  problemStatement?: string;
  solutionDeployed?: string;
  outcomesObserved?: string;
  technicalLearnings?: string;
  productFeedback?: string;
  expansionPotential?: string;
  revenueImpact?: string;
  grantEvidenceValue: "Low" | "Medium" | "High";
  supportLetterPotential: "Yes" | "No" | "Maybe";
  caseStudyPotential: "Yes" | "No" | "Maybe";
  nextAction?: string;
  notes?: string;
  isDemo?: boolean;
  createdDate: string;
  updatedDate: string;
}

export interface Partnership {
  id: string;
  partnerName: string;
  website?: string;
  partnerType:
    | "Parts Supplier"
    | "ELD/Telematics Provider"
    | "Fleet Management Platform"
    | "Truck Manufacturer"
    | "Repair Shop Partner"
    | "Referral Partner"
    | "Accelerator/Incubator"
    | "Government/Economic Dev"
    | "Industry Association"
    | "Other";
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactLinkedIn?: string;
  location?: string;
  relationshipStatus:
    | "Identified"
    | "Contacted"
    | "Active Conversation"
    | "Formal Agreement"
    | "Referral Active"
    | "Integration Planning"
    | "Dormant"
    | "Not a Fit";
  referralPotential: "Low" | "Medium" | "High";
  coPilotPotential: "Yes" | "No" | "Maybe";
  integrationPotential: "Yes" | "No" | "Maybe";
  lastContactDate?: string;
  nextAction?: string;
  notes?: string;
  isDemo?: boolean;
  createdDate: string;
  updatedDate: string;
}

export type NavItem = {
  title: string;
  href: string;
  description: string;
};

export type OverviewMetric = {
  label: string;
  value: string;
  trend: string;
  status: WorkstreamStatus;
};

export type Workstream = {
  name: string;
  owner: string;
  status: WorkstreamStatus;
  priority: WorkstreamPriority;
  eta: string;
};

export type PlaceholderSectionKey =
  | "sales"
  | "marketing"
  | "funding"
  | "engineering"
  | "evidence"
  | "partnerships"
  | "roadmap";

export type PlaceholderPageData = {
  title: string;
  summary: string;
  focusAreas: string[];
  nextMilestones: string[];
  status: WorkstreamStatus;
  priority: WorkstreamPriority;
};

export type PageMeta = {
  title: string;
  description: string;
};

export type WeeklyContentDay =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday";

export type WeeklyContentPlan = Record<WeeklyContentDay, string | null>;

export type EngineeringSprintPlan = {
  taskIds: string[];
  generatedAt?: string;
};
