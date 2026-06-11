import { getItem, setItem, STORAGE_KEYS } from "@/lib/storage";
import {
  type FundingOpportunity,
  type InvestorContact,
  type RDEvidence,
} from "@/lib/types";

function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export type FundingOpportunityInput = Omit<
  FundingOpportunity,
  "id" | "createdDate" | "updatedDate"
>;

export function getFundingOpportunities(): FundingOpportunity[] {
  return getItem<FundingOpportunity[]>(STORAGE_KEYS.FUNDING_OPPORTUNITIES) ?? [];
}

function saveFundingOpportunities(items: FundingOpportunity[]): void {
  setItem(STORAGE_KEYS.FUNDING_OPPORTUNITIES, items);
}

export function addFundingOpportunity(
  input: FundingOpportunityInput
): FundingOpportunity {
  const now = new Date().toISOString();
  const item: FundingOpportunity = {
    ...input,
    id: makeId("fo"),
    createdDate: now,
    updatedDate: now,
  };
  saveFundingOpportunities([item, ...getFundingOpportunities()]);
  return item;
}

export function updateFundingOpportunity(
  id: string,
  updates: Partial<FundingOpportunity>
): FundingOpportunity | null {
  const items = getFundingOpportunities();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  const updated: FundingOpportunity = {
    ...items[idx],
    ...updates,
    id,
    createdDate: items[idx].createdDate,
    updatedDate: new Date().toISOString(),
  };
  const next = [...items];
  next[idx] = updated;
  saveFundingOpportunities(next);
  return updated;
}

export function deleteFundingOpportunity(id: string): void {
  saveFundingOpportunities(getFundingOpportunities().filter((i) => i.id !== id));
}

export type RDEvidenceInput = Omit<RDEvidence, "id" | "createdDate" | "updatedDate">;

export function getRDEvidence(): RDEvidence[] {
  return getItem<RDEvidence[]>(STORAGE_KEYS.RD_EVIDENCE) ?? [];
}

function saveRDEvidence(items: RDEvidence[]): void {
  setItem(STORAGE_KEYS.RD_EVIDENCE, items);
}

export function addRDEvidence(input: RDEvidenceInput): RDEvidence {
  const now = new Date().toISOString();
  const item: RDEvidence = {
    ...input,
    id: makeId("rd"),
    createdDate: now,
    updatedDate: now,
  };
  saveRDEvidence([item, ...getRDEvidence()]);
  return item;
}

export function updateRDEvidence(
  id: string,
  updates: Partial<RDEvidence>
): RDEvidence | null {
  const items = getRDEvidence();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  const updated: RDEvidence = {
    ...items[idx],
    ...updates,
    id,
    createdDate: items[idx].createdDate,
    updatedDate: new Date().toISOString(),
  };
  const next = [...items];
  next[idx] = updated;
  saveRDEvidence(next);
  return updated;
}

export function deleteRDEvidence(id: string): void {
  saveRDEvidence(getRDEvidence().filter((i) => i.id !== id));
}

export type InvestorContactInput = Omit<
  InvestorContact,
  "id" | "createdDate" | "updatedDate"
>;

export function getInvestorContacts(): InvestorContact[] {
  return getItem<InvestorContact[]>(STORAGE_KEYS.INVESTORS) ?? [];
}

function saveInvestorContacts(items: InvestorContact[]): void {
  setItem(STORAGE_KEYS.INVESTORS, items);
}

export function addInvestorContact(
  input: InvestorContactInput
): InvestorContact {
  const now = new Date().toISOString();
  const item: InvestorContact = {
    ...input,
    id: makeId("inv"),
    createdDate: now,
    updatedDate: now,
  };
  saveInvestorContacts([item, ...getInvestorContacts()]);
  return item;
}

export function updateInvestorContact(
  id: string,
  updates: Partial<InvestorContact>
): InvestorContact | null {
  const items = getInvestorContacts();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  const updated: InvestorContact = {
    ...items[idx],
    ...updates,
    id,
    createdDate: items[idx].createdDate,
    updatedDate: new Date().toISOString(),
  };
  const next = [...items];
  next[idx] = updated;
  saveInvestorContacts(next);
  return updated;
}

export function deleteInvestorContact(id: string): void {
  saveInvestorContacts(getInvestorContacts().filter((i) => i.id !== id));
}

const DEMO_FUNDING: FundingOpportunityInput[] = [
  {
    programName: "OVIN Research & Development Partnership Fund",
    funderOrganization: "Ontario Vehicle Innovation Network (OVIN)",
    fundingType: "R&D Support",
    amountRange: "Up to $100,000 (Stream 1) or up to $1,000,000 (Stream 2)",
    deadline: undefined,
    eligibilitySummary:
      "Ontario SMEs with operations in Ontario and at least one partner can apply for commercialization-oriented projects in smart mobility, connected and autonomous vehicles, and AI.",
    truckFixrFitScore: 5,
    requiredPartner: "Yes",
    customerSupportLetterNeeded: "Yes",
    status: "Fit",
    nextAction:
      "Identify an Ontario fleet or ecosystem partner and package a commercialization-ready project scope.",
    notes:
      "Reviewed from OVIN official sources on 2026-06-09. Stream 1 is reviewed on a rolling basis.",
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
      "For-profit partners collaborate with a Canadian academic institution on research internships. Partner contributions start at $7,500 per internship and are leveraged by Mitacs.",
    truckFixrFitScore: 4,
    requiredPartner: "Yes",
    customerSupportLetterNeeded: "Unknown",
    status: "Fit",
    nextAction:
      "Find an Ontario academic supervisor and scope a 4-6 month research project around fleet diagnostics workflows.",
    notes:
      "Reviewed from Mitacs official sources on 2026-06-09. Applications are ongoing through Mitacs Advisors.",
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
    amountRange:
      "Refundable or non-refundable tax credits based on eligible R&D expenditures",
    deadline: undefined,
    eligibilitySummary:
      "Canadian businesses performing eligible scientific research or experimental development in Canada can claim tax incentives on qualifying expenditures.",
    truckFixrFitScore: 5,
    requiredPartner: "No",
    customerSupportLetterNeeded: "No",
    status: "Fit",
    nextAction:
      "Capture technical uncertainty, experiments, code iterations, and results as the product work happens.",
    notes:
      "Reviewed from the official CRA SR&ED page on 2026-06-09. Best fit if documentation is contemporaneous.",
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
      "Confirm whether TruckFixr meets the incorporation and FTE thresholds, then approach an Ontario academic lab and industry sponsor.",
    notes:
      "Reviewed from OCI official sources on 2026-06-09. The current targeted call runs from June 1, 2026 to July 31, 2026.",
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
      "Ontario-based early-stage technology companies raising pre-seed or seed rounds may qualify if they have strong IP, principal operations in Ontario, are incorporated for no more than five years, and meet co-investment criteria.",
    truckFixrFitScore: 2,
    requiredPartner: "Yes",
    customerSupportLetterNeeded: "No",
    status: "Researching",
    nextAction:
      "Check capital raised to date, IP origins, and investor syndicate readiness before treating this as an active near-term target.",
    notes:
      "Reviewed from OCI official sources on 2026-06-09. Best fit if TruckFixr is actively building a qualifying pre-seed or seed round.",
    sourceLink: "https://www.oc-innovation.ca/programs/ready-4-market/",
    grantReadiness: {
      applicantEntityConfirmed: false,
      commercializationPlanDrafted: true,
      followUpScheduled: false,
    },
    isDemo: true,
  },
];

export function loadDemoFundingData(
  demoFunding: FundingOpportunityInput[] = DEMO_FUNDING,
  demoRDEvidence: RDEvidenceInput[] = [],
  demoInvestors: InvestorContactInput[] = []
): void {
  const now = new Date().toISOString();
  const realOpps = getFundingOpportunities().filter((o) => !o.isDemo);
  const demoOpps: FundingOpportunity[] = demoFunding.map((d, i) => ({
    ...d,
    id: `demo_fo_${i + 1}`,
    createdDate: now,
    updatedDate: now,
  }));
  const realEvidence = getRDEvidence().filter((item) => !item.isDemo);
  const demoEvidence: RDEvidence[] = demoRDEvidence.map((item, i) => ({
    ...item,
    id: `demo_rd_${i + 1}`,
    createdDate: now,
    updatedDate: now,
  }));
  const realInvestors = getInvestorContacts().filter((item) => !item.isDemo);
  const demoInvestorItems: InvestorContact[] = demoInvestors.map((item, i) => ({
    ...item,
    id: `demo_investor_${i + 1}`,
    createdDate: now,
    updatedDate: now,
  }));

  saveFundingOpportunities([...demoOpps, ...realOpps]);
  saveRDEvidence([...demoEvidence, ...realEvidence]);
  saveInvestorContacts([...demoInvestorItems, ...realInvestors]);
}

export function clearDemoFundingData(): void {
  saveFundingOpportunities(getFundingOpportunities().filter((o) => !o.isDemo));
  saveRDEvidence(getRDEvidence().filter((o) => !o.isDemo));
  saveInvestorContacts(getInvestorContacts().filter((o) => !o.isDemo));
}
