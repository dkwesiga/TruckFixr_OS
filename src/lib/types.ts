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

export interface Prospect {
  id: string;
  companyName: string;
  website?: string;
  location: string;
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
  decisionMaker?: string;
  email?: string;
  phone?: string;
  linkedIn?: string;
  sourceNotes?: string;
  maintenancePain?: string;
  usesEldTelematics: "Yes" | "No" | "Unknown";
  pilotFitScore: 1 | 2 | 3 | 4 | 5 | null;
  revenueFitScore: 1 | 2 | 3 | 4 | 5 | null;
  grantFitScore: 1 | 2 | 3 | 4 | 5 | null;
  outreachStatus: OutreachStatus;
  nextAction?: string;
  lastContactDate?: string;
  notes?: string;
  firstEmailDraft?: string;
  linkedInConnectDraft?: string;
  linkedInFollowUpDraft?: string;
  phoneScript?: string;
  cta?: string;
  llmPersonalizationPrompt?: string;
  isDemo?: boolean;
  createdDate: string;
  updatedDate: string;
}

export interface ContentItem {
  id: string;
  title: string;
  channel: string;
  status: string;
  audience: string;
  draft: string;
  scheduledFor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FundingOpportunity {
  id: string;
  name: string;
  source: string;
  status: string;
  deadline?: string;
  amountRange?: string;
  fitScore?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RDEvidence {
  id: string;
  title: string;
  category: string;
  status: string;
  summary: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvestorContact {
  id: string;
  name: string;
  firm: string;
  stage: string;
  status: string;
  lastContactedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EngineeringTask {
  id: string;
  title: string;
  owner: string;
  status: string;
  priority: WorkstreamPriority;
  module: string;
  dueDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapItem {
  id: string;
  title: string;
  lane: string;
  status: string;
  quarter: string;
  dependencies?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PilotEvidence {
  id: string;
  title: string;
  customerSegment: string;
  status: string;
  metric?: string;
  summary: string;
  approvedForExternalUse: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Partnership {
  id: string;
  organizationName: string;
  partnerType: string;
  status: string;
  owner: string;
  nextStep?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
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
