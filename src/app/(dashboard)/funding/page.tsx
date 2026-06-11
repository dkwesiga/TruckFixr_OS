"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangleIcon,
  CheckSquareIcon,
  CopyIcon,
  DownloadIcon,
  FileOutputIcon,
  PencilIcon,
  PlusIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import {
  FundingOpportunityForm,
  type FundingOpportunityFormValues,
} from "@/components/funding/FundingOpportunityForm";
import {
  InvestorForm,
  type InvestorFormValues,
} from "@/components/funding/InvestorForm";
import {
  RDEvidenceForm,
  type RDEvidenceFormValues,
} from "@/components/funding/RDEvidenceForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { copyToClipboard, exportToCSV, exportToJSON, exportToMarkdown } from "@/lib/export";
import {
  addFundingOpportunity,
  addInvestorContact,
  addRDEvidence,
  deleteFundingOpportunity,
  deleteInvestorContact,
  deleteRDEvidence,
  getFundingOpportunities,
  getInvestorContacts,
  getRDEvidence,
  updateFundingOpportunity,
  updateInvestorContact,
  updateRDEvidence,
} from "@/lib/funding";
import {
  type FundingOpportunity,
  type GrantReadinessKey,
  type InvestorContact,
  type RDEvidence,
} from "@/lib/types";
import { cn } from "@/lib/utils";

// ── Constants ────────────────────────────────────────────────────────────────

const CHECKLIST_ITEMS: Array<{ key: GrantReadinessKey; label: string }> = [
  { key: "eligibilityConfirmed", label: "Eligibility confirmed" },
  { key: "deadlineKnown", label: "Deadline known" },
  { key: "applicantEntityConfirmed", label: "Applicant entity confirmed" },
  { key: "projectOverviewReady", label: "Project overview ready" },
  { key: "budgetOutlineReady", label: "Budget outline ready" },
  { key: "customerPartnerIdentified", label: "Customer partner identified" },
  { key: "supportLetterRequested", label: "Support letter requested" },
  { key: "supportLetterReceived", label: "Support letter received" },
  {
    key: "technicalUncertaintyDocumented",
    label: "Technical uncertainty documented",
  },
  {
    key: "commercializationPlanDrafted",
    label: "Commercialization plan drafted",
  },
  { key: "applicationSubmitted", label: "Application submitted" },
  { key: "followUpScheduled", label: "Follow-up scheduled" },
];

const FUNDING_STATUSES = [
  "Researching",
  "Fit",
  "Applied",
  "Follow-up",
  "Not Fit",
  "Won",
  "Lost",
  "Deferred",
] as const;

const FUNDING_TYPES = [
  "Grant",
  "Loan",
  "Wage Subsidy",
  "Accelerator",
  "Competition",
  "Investor",
  "R&D Support",
  "Hiring Grant",
  "Pilot Funding",
  "Other",
] as const;

const INVESTOR_STATUSES = [
  "Researching",
  "Identified",
  "Outreached",
  "Meeting Booked",
  "Pitch Sent",
  "In Diligence",
  "Term Sheet",
  "Passed",
  "Follow-up Later",
] as const;

const INVESTOR_TYPES = [
  "Angel",
  "VC",
  "Strategic",
  "Government",
  "Accelerator",
  "Other",
] as const;

const RD_EVIDENCE_TYPES = [
  "Customer Discovery",
  "Pilot Feedback",
  "Technical Experiment",
  "Product Improvement",
  "ELD/Telematics Requirement",
  "Sales Conversation",
  "Grant Requirement",
  "Budget Justification",
  "Support Letter",
  "Market Evidence",
  "Compliance Requirement",
] as const;

const CONFIDENCE_LEVELS = ["Low", "Medium", "High"] as const;

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(value?: string | null) {
  return value?.trim() || "—";
}

function fmtDate(value?: string | null) {
  if (!value?.trim()) return "—";
  return value;
}

function fmtScore(score: FundingOpportunity["truckFixrFitScore"]) {
  return score === null ? "—" : `${score}/5`;
}

function isWithin30Days(dateStr?: string): boolean {
  if (!dateStr) return false;
  const deadline = new Date(dateStr);
  const now = new Date();
  const diff = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 30;
}

const oppStatusColors: Record<FundingOpportunity["status"], string> = {
  Researching: "bg-slate-100 text-slate-600",
  Fit: "bg-blue-100 text-blue-700",
  Applied: "bg-orange-100 text-orange-700",
  "Follow-up": "bg-yellow-100 text-yellow-800",
  "Not Fit": "bg-red-100 text-red-600",
  Won: "bg-green-100 font-bold text-green-800",
  Lost: "bg-red-100 text-red-700",
  Deferred: "bg-slate-100 text-slate-500",
};

const invStatusColors: Record<InvestorContact["status"], string> = {
  Researching: "bg-slate-100 text-slate-600",
  Identified: "bg-blue-100 text-blue-700",
  Outreached: "bg-yellow-100 text-yellow-800",
  "Meeting Booked": "bg-purple-100 text-purple-700",
  "Pitch Sent": "bg-orange-100 text-orange-700",
  "In Diligence": "bg-teal-100 text-teal-700",
  "Term Sheet": "bg-green-100 text-green-700",
  Passed: "bg-red-100 text-red-700",
  "Follow-up Later": "bg-slate-100 text-slate-500",
};

const confidenceColors: Record<RDEvidence["confidenceLevel"], string> = {
  Low: "bg-red-100 text-red-700",
  Medium: "bg-yellow-100 text-yellow-800",
  High: "bg-green-100 text-green-700",
};

function buildInvestorOutreachDraft(investor: InvestorContact): string {
  const stageNote = investor.investmentStage
    ? `${investor.investmentStage} stage`
    : "early-stage";
  return [
    `Subject: Introduction — TruckFixr Fleet AI (${stageNote} round)`,
    "",
    `Hi ${investor.investorName},`,
    "",
    "My name is [Founder Name], and I'm the founder of TruckFixr Fleet AI.",
    "We're building AI maintenance intelligence for small and mid-sized commercial fleets in Ontario and beyond.",
    "",
    `Given your background as a${investor.investorType === "Angel" ? "n" : ""} ${investor.investorType} investor${investor.fundName ? ` at ${investor.fundName}` : ""}, I believe there could be genuine alignment with what we're working on.`,
    "",
    "We're currently tracking investors as we prepare for our next round. I'd love to share our story and get your perspective.",
    "",
    "Would you be open to a 20-minute call in the next few weeks?",
    "",
    "Best,",
    "[Founder Name]",
    "TruckFixr Fleet AI",
    "[email] | [phone]",
    "",
    "---",
    "Template draft — review and personalize before sending. Do not send automatically.",
  ].join("\n");
}

// ── Research prompt generators ───────────────────────────────────────────────

function buildGrantResearchPrompt(inputs: {
  geography: string;
  fundingType: string;
  sector: string;
  stage: string;
  urgency: string;
}): string {
  return [
    `You are a funding research specialist. Research grant and funding opportunities for the following company profile:`,
    "",
    `Company: TruckFixr Fleet AI — AI maintenance intelligence for small and mid-sized commercial fleets`,
    `Geography: ${inputs.geography || "[e.g., Ontario, Canada]"}`,
    `Funding type sought: ${inputs.fundingType || "[e.g., Grant, R&D Support, Accelerator]"}`,
    `Sector: ${inputs.sector || "[e.g., Commercial Fleet Technology, AI/ML, Transportation]"}`,
    `Company stage: ${inputs.stage || "[e.g., Pre-revenue, Early traction, Pilot stage]"}`,
    `Deadline urgency: ${inputs.urgency || "[e.g., Applications open in Q1, Not urgent]"}`,
    "",
    "For each relevant funding program you identify, provide:",
    "1. Program name and administering organization",
    "2. Funding type and typical amount range",
    "3. Eligibility criteria most relevant to this company",
    "4. Application deadline (if known)",
    "5. Whether a customer/industry partner letter of support is typically required",
    "6. Fit score (1–5) for this company profile",
    "7. Recommended next action",
    "",
    "List programs in order of fit score. Flag any programs that require specific R&D partnerships or certifications.",
    "Note: Verify all information from official program sources before any application activity.",
  ].join("\n");
}

function buildRDExtractionPrompt(inputs: {
  projectDescription: string;
  evidenceType: string;
}): string {
  return [
    "You are an R&D evidence extraction specialist helping a technology startup document evidence for grant applications.",
    "",
    `Company: TruckFixr Fleet AI — AI maintenance intelligence for commercial fleets`,
    `Project / activity description: ${inputs.projectDescription || "[Describe the discovery call, pilot, or experiment]"}`,
    `Evidence type to extract: ${inputs.evidenceType || "[e.g., Technical Experiment, Customer Discovery, Pilot Feedback]"}`,
    "",
    "From the description above, extract and structure the following R&D evidence:",
    "1. Problem observed: What specific fleet maintenance problem was identified?",
    "2. Technical uncertainty: What was not yet known or proven technically?",
    "3. Experiment / test conducted: What was done to investigate or address the uncertainty?",
    "4. Result / learning: What was discovered or validated?",
    "5. Commercialization evidence: What signal of market demand or willingness to pay was observed?",
    "6. Grant relevance: How does this evidence support an R&D funding application?",
    "7. Support letter potential: Did the customer/partner express interest in providing a letter of support? (Yes / No / Unknown)",
    "8. Confidence level: Rate the quality and specificity of this evidence (Low / Medium / High)",
    "",
    "Format your response as structured data with clear labels for each field.",
  ].join("\n");
}

function buildInvestorResearchPrompt(inputs: {
  stage: string;
  sector: string;
  geography: string;
}): string {
  return [
    "You are an investor research specialist. Identify investors who may be a good fit for the following company:",
    "",
    "Company: TruckFixr Fleet AI",
    "Description: AI maintenance intelligence for small and mid-sized commercial fleets in Ontario and beyond.",
    "Stage: Pre-revenue to early traction. Running discovery and paid pilots with fleet operators.",
    `Target raise stage: ${inputs.stage || "[e.g., Pre-seed, Seed]"}`,
    `Sector focus: ${inputs.sector || "[e.g., AI/ML, Fleet Technology, B2B SaaS, CleanTech, Transportation]"}`,
    `Target investor geography: ${inputs.geography || "[e.g., Canada, Ontario, North America]"}`,
    "",
    "For each investor or fund you identify, provide:",
    "1. Investor / fund name",
    "2. Investor type (Angel, VC, Accelerator, Strategic, Government)",
    "3. Typical check size / investment stage",
    "4. Relevant portfolio companies or sector focus",
    "5. Contact method or intro path",
    "6. Fit notes: Why this investor could be a good match",
    "7. Suggested next action",
    "",
    "Prioritize investors with fleet technology, AI/ML, B2B SaaS, or Canadian startup experience.",
    "Note: Verify investor details and current fund status from official sources before outreach.",
  ].join("\n");
}

function buildSupportLetterPrompt(inputs: {
  customerName: string;
  programName: string;
  companyName: string;
}): string {
  return [
    `You are drafting a support letter request email on behalf of ${inputs.companyName || "TruckFixr Fleet AI"}.`,
    "",
    `Program applying to: ${inputs.programName || "[Program name]"}`,
    `Customer / partner being asked: ${inputs.customerName || "[Customer or partner name]"}`,
    "",
    "Draft a professional email requesting a letter of support from this customer or partner.",
    "",
    "The email should:",
    "1. Briefly explain what TruckFixr Fleet AI does and the value they've experienced",
    `2. Describe the ${inputs.programName || "[program]"} and why a letter of support is required`,
    "3. Clearly outline what the letter should include (2–3 bullet points — no exaggeration of outcomes)",
    "4. Provide a template paragraph they can use or adapt",
    "5. Note that TruckFixr is not guaranteeing outcomes; the letter confirms the working relationship",
    "6. Propose a simple next step (e.g., confirm interest, share a draft for their review)",
    "",
    "Keep the tone warm, professional, and brief. The goal is to make it easy for them to say yes.",
    "",
    "---",
    "Template draft — review before sending. Do not send automatically.",
  ].join("\n");
}

function buildBudgetJustificationPrompt(inputs: {
  programName: string;
  projectDescription: string;
  totalBudget: string;
}): string {
  return [
    "You are a grant writing specialist helping to draft a budget justification.",
    "",
    "Company: TruckFixr Fleet AI — AI maintenance intelligence for commercial fleets",
    `Program: ${inputs.programName || "[Program name]"}`,
    `Project description: ${inputs.projectDescription || "[Describe the R&D project or initiative]"}`,
    `Total budget: ${inputs.totalBudget || "[e.g., $150,000]"}`,
    "",
    "Draft a structured budget justification that includes:",
    "1. Personnel costs — roles, time allocation, and rationale",
    "2. Subcontractor / professional services — if applicable",
    "3. Equipment and materials — hardware, software licenses, testing tools",
    "4. Travel and knowledge transfer — if applicable",
    "5. Overhead — if allowable under the program",
    "",
    "For each budget line, explain:",
    "- What the cost covers",
    "- Why it is necessary for the R&D project",
    "- How it directly advances the technical objectives",
    "",
    "Keep language clear, eligible, and aligned with R&D grant program criteria.",
    "Avoid vague descriptions — link each cost to a specific technical activity.",
  ].join("\n");
}

function buildCommercializationPrompt(inputs: {
  productName: string;
  targetMarket: string;
  revenueModel: string;
}): string {
  return [
    "You are a commercialization narrative specialist for an R&D grant application.",
    "",
    `Product: ${inputs.productName || "TruckFixr Fleet AI"} — AI maintenance intelligence for commercial fleets`,
    `Target market: ${inputs.targetMarket || "[e.g., Small and mid-sized commercial fleet operators in Ontario, 5–50 vehicles]"}`,
    `Revenue model: ${inputs.revenueModel || "[e.g., SaaS subscription, per-vehicle monthly fee, implementation fee]"}`,
    "",
    "Write a compelling commercialization narrative (300–500 words) that:",
    "1. Describes the market problem and customer segment",
    "2. Explains how the technology addresses a proven market need",
    "3. Outlines the path from R&D output to commercial deployment",
    "4. Demonstrates market traction, pilot evidence, or early customer validation",
    "5. Describes the revenue model and scale potential",
    "6. Notes competitive differentiation",
    "7. Identifies the export or broader Canadian market opportunity (if applicable)",
    "",
    "Tone: factual, evidence-grounded, and commercially focused.",
    "Avoid hype and unsubstantiated claims. Every statement should be defensible with evidence already documented.",
  ].join("\n");
}

// ── Export helpers ────────────────────────────────────────────────────────────

function buildGrantReadinessReport(opps: FundingOpportunity[]): string {
  const lines: string[] = [
    "# TruckFixr OS — Grant Readiness Report",
    `Generated: ${new Date().toLocaleString()}`,
    "",
    "---",
  ];

  opps.forEach((opp) => {
    const completed = CHECKLIST_ITEMS.filter(
      (item) => opp.grantReadiness?.[item.key]
    ).length;
    lines.push(
      "",
      `## ${opp.programName}`,
      `**Funder:** ${opp.funderOrganization}`,
      `**Type:** ${opp.fundingType} | **Status:** ${opp.status} | **Fit Score:** ${fmtScore(opp.truckFixrFitScore)}`,
      `**Deadline:** ${fmtDate(opp.deadline)} | **Amount:** ${fmt(opp.amountRange)}`,
      "",
      `### Grant Readiness Checklist (${completed}/${CHECKLIST_ITEMS.length})`
    );
    CHECKLIST_ITEMS.forEach((item) => {
      const done = opp.grantReadiness?.[item.key] ? "[x]" : "[ ]";
      lines.push(`- ${done} ${item.label}`);
    });
    if (opp.nextAction) lines.push("", `**Next action:** ${opp.nextAction}`);
    if (opp.notes) lines.push("", `**Notes:** ${opp.notes}`);
    lines.push("", "---");
  });

  return lines.join("\n");
}

function buildRDEvidenceReport(items: RDEvidence[]): string {
  const lines: string[] = [
    "# TruckFixr OS — R&D Evidence Report",
    `Generated: ${new Date().toLocaleString()}`,
    "",
    "---",
  ];

  items.forEach((item) => {
    lines.push(
      "",
      `## ${item.evidenceType} — ${item.date}`,
      `**Confidence:** ${item.confidenceLevel} | **Support Letter Potential:** ${item.supportLetterPotential}`,
      item.customerPartner ? `**Customer/Partner:** ${item.customerPartner}` : "",
      item.fleetSegment ? `**Fleet Segment:** ${item.fleetSegment}` : "",
      item.problemObserved ? `\n**Problem Observed:**\n${item.problemObserved}` : "",
      item.technicalUncertainty
        ? `\n**Technical Uncertainty:**\n${item.technicalUncertainty}`
        : "",
      item.resultLearning ? `\n**Result/Learning:**\n${item.resultLearning}` : "",
      item.grantRelevance
        ? `\n**Grant Relevance:**\n${item.grantRelevance}`
        : "",
      "",
      "---"
    );
  });

  return lines.filter((l) => l !== "").join("\n");
}

// ── Filter types ─────────────────────────────────────────────────────────────

type OppFilters = {
  search: string;
  status: "" | FundingOpportunity["status"];
  fundingType: "" | FundingOpportunity["fundingType"];
  fitScore: "" | "1" | "2" | "3" | "4" | "5";
  deadlineSoon: boolean;
};

type RDFilters = {
  search: string;
  evidenceType: "" | RDEvidence["evidenceType"];
  confidenceLevel: "" | RDEvidence["confidenceLevel"];
  supportLetterPotential: "" | "Yes" | "No" | "Unknown";
};

type InvFilters = {
  search: string;
  status: "" | InvestorContact["status"];
  investorType: "" | InvestorContact["investorType"];
};

const emptyOppFilters: OppFilters = {
  search: "",
  status: "",
  fundingType: "",
  fitScore: "",
  deadlineSoon: false,
};

const emptyRDFilters: RDFilters = {
  search: "",
  evidenceType: "",
  confidenceLevel: "",
  supportLetterPotential: "",
};

const emptyInvFilters: InvFilters = {
  search: "",
  status: "",
  investorType: "",
};

// ── Component ────────────────────────────────────────────────────────────────

export default function FundingPage() {
  const [opportunities, setOpportunities] = useState<FundingOpportunity[]>([]);
  const [rdEvidence, setRdEvidence] = useState<RDEvidence[]>([]);
  const [investors, setInvestors] = useState<InvestorContact[]>([]);

  // Opportunity dialogs
  const [isOppFormOpen, setIsOppFormOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState<FundingOpportunity | null>(null);
  const [deletingOpp, setDeletingOpp] = useState<FundingOpportunity | null>(null);
  const [checklistOpp, setChecklistOpp] = useState<FundingOpportunity | null>(null);

  // R&D Evidence dialogs
  const [isRDFormOpen, setIsRDFormOpen] = useState(false);
  const [editingRD, setEditingRD] = useState<RDEvidence | null>(null);
  const [deletingRD, setDeletingRD] = useState<RDEvidence | null>(null);

  // Investor dialogs
  const [isInvFormOpen, setIsInvFormOpen] = useState(false);
  const [editingInv, setEditingInv] = useState<InvestorContact | null>(null);
  const [deletingInv, setDeletingInv] = useState<InvestorContact | null>(null);
  const [outreachInv, setOutreachInv] = useState<InvestorContact | null>(null);

  // Filters
  const [oppFilters, setOppFilters] = useState<OppFilters>(emptyOppFilters);
  const [rdFilters, setRdFilters] = useState<RDFilters>(emptyRDFilters);
  const [invFilters, setInvFilters] = useState<InvFilters>(emptyInvFilters);

  // Research prompt inputs
  const [grantInputs, setGrantInputs] = useState({
    geography: "Ontario, Canada",
    fundingType: "",
    sector: "Commercial Fleet Technology, AI/ML",
    stage: "Pre-revenue, early pilot traction",
    urgency: "",
  });
  const [rdExtractInputs, setRdExtractInputs] = useState({
    projectDescription: "",
    evidenceType: "",
  });
  const [invResearchInputs, setInvResearchInputs] = useState({
    stage: "Pre-seed / Seed",
    sector: "AI/ML, Fleet Technology, B2B SaaS",
    geography: "Canada",
  });
  const [supportLetterInputs, setSupportLetterInputs] = useState({
    customerName: "",
    programName: "",
    companyName: "TruckFixr Fleet AI",
  });
  const [budgetInputs, setBudgetInputs] = useState({
    programName: "",
    projectDescription: "",
    totalBudget: "",
  });
  const [commercializationInputs, setCommercializationInputs] = useState({
    productName: "TruckFixr Fleet AI",
    targetMarket: "Small and mid-sized commercial fleet operators in Ontario, 5–25 vehicles",
    revenueModel: "SaaS subscription per vehicle per month, plus implementation fee",
  });

  useEffect(() => {
    setOpportunities(getFundingOpportunities());
    setRdEvidence(getRDEvidence());
    setInvestors(getInvestorContacts());
  }, []);

  // ── KPIs ─────────────────────────────────────────────────────────────────

  const oppKPIs = useMemo(() => {
    const total = opportunities.length;
    const fit = opportunities.filter((o) => o.status === "Fit").length;
    const applied = opportunities.filter((o) => o.status === "Applied").length;
    const won = opportunities.filter((o) => o.status === "Won").length;
    const deadlineSoon = opportunities.filter(
      (o) =>
        isWithin30Days(o.deadline) &&
        !["Won", "Lost", "Not Fit", "Deferred"].includes(o.status)
    ).length;
    return [
      { label: "Total", value: total, cls: "text-slate-700" },
      { label: "Fit", value: fit, cls: "text-blue-700" },
      { label: "Applied", value: applied, cls: "text-orange-700" },
      { label: "Won", value: won, cls: "font-bold text-green-800" },
      { label: "Deadlines ≤30 days", value: deadlineSoon, cls: deadlineSoon > 0 ? "font-bold text-red-700" : "text-slate-700" },
    ];
  }, [opportunities]);

  const rdKPIs = useMemo(() => {
    const total = rdEvidence.length;
    const highConfidence = rdEvidence.filter(
      (e) => e.confidenceLevel === "High"
    ).length;
    const supportLetterPotential = rdEvidence.filter(
      (e) => e.supportLetterPotential === "Yes"
    ).length;
    const technicalUncertainties = rdEvidence.filter(
      (e) => e.technicalUncertainty?.trim()
    ).length;
    return [
      { label: "Total items", value: total, cls: "text-slate-700" },
      { label: "High confidence", value: highConfidence, cls: "text-green-700" },
      { label: "Support letter potential", value: supportLetterPotential, cls: "text-teal-700" },
      { label: "Technical uncertainties", value: technicalUncertainties, cls: "text-blue-700" },
    ];
  }, [rdEvidence]);

  const invKPIs = useMemo(() => {
    const total = investors.length;
    const meetingsBooked = investors.filter(
      (i) => i.status === "Meeting Booked"
    ).length;
    const pitchesSent = investors.filter(
      (i) => i.status === "Pitch Sent"
    ).length;
    const active = investors.filter((i) =>
      ["Outreached", "Meeting Booked", "Pitch Sent", "In Diligence"].includes(
        i.status
      )
    ).length;
    return [
      { label: "Total tracked", value: total, cls: "text-slate-700" },
      { label: "Meetings booked", value: meetingsBooked, cls: "text-purple-700" },
      { label: "Pitches sent", value: pitchesSent, cls: "text-orange-700" },
      { label: "Active conversations", value: active, cls: "text-teal-700" },
    ];
  }, [investors]);

  // ── Filtered lists ────────────────────────────────────────────────────────

  const filteredOpps = useMemo(() => {
    const q = oppFilters.search.toLowerCase();
    return opportunities.filter((o) => {
      if (q && !`${o.programName} ${o.funderOrganization}`.toLowerCase().includes(q)) return false;
      if (oppFilters.status && o.status !== oppFilters.status) return false;
      if (oppFilters.fundingType && o.fundingType !== oppFilters.fundingType) return false;
      if (oppFilters.fitScore && String(o.truckFixrFitScore ?? "") !== oppFilters.fitScore) return false;
      if (oppFilters.deadlineSoon && !isWithin30Days(o.deadline)) return false;
      return true;
    });
  }, [opportunities, oppFilters]);

  const filteredRD = useMemo(() => {
    const q = rdFilters.search.toLowerCase();
    return rdEvidence.filter((e) => {
      if (q && !`${e.evidenceType} ${e.customerPartner ?? ""} ${e.source ?? ""}`.toLowerCase().includes(q)) return false;
      if (rdFilters.evidenceType && e.evidenceType !== rdFilters.evidenceType) return false;
      if (rdFilters.confidenceLevel && e.confidenceLevel !== rdFilters.confidenceLevel) return false;
      if (rdFilters.supportLetterPotential && e.supportLetterPotential !== rdFilters.supportLetterPotential) return false;
      return true;
    });
  }, [rdEvidence, rdFilters]);

  const filteredInvestors = useMemo(() => {
    const q = invFilters.search.toLowerCase();
    return investors.filter((i) => {
      if (q && !`${i.investorName} ${i.fundName ?? ""}`.toLowerCase().includes(q)) return false;
      if (invFilters.status && i.status !== invFilters.status) return false;
      if (invFilters.investorType && i.investorType !== invFilters.investorType) return false;
      return true;
    });
  }, [investors, invFilters]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  function refreshOpps() {
    setOpportunities(getFundingOpportunities());
  }
  function refreshRD() {
    setRdEvidence(getRDEvidence());
  }
  function refreshInvestors() {
    setInvestors(getInvestorContacts());
  }

  function handleSaveOpp(values: FundingOpportunityFormValues) {
    if (editingOpp) {
      updateFundingOpportunity(editingOpp.id, values);
    } else {
      addFundingOpportunity(values);
    }
    refreshOpps();
    setIsOppFormOpen(false);
    setEditingOpp(null);
    toast.success(editingOpp ? "Opportunity updated." : "Opportunity added.");
  }

  function handleDeleteOpp() {
    if (!deletingOpp) return;
    deleteFundingOpportunity(deletingOpp.id);
    refreshOpps();
    setDeletingOpp(null);
    toast.success("Opportunity deleted.");
  }

  function handleToggleChecklist(opp: FundingOpportunity, key: GrantReadinessKey, checked: boolean) {
    const updated = updateFundingOpportunity(opp.id, {
      grantReadiness: { ...(opp.grantReadiness ?? {}), [key]: checked },
    });
    if (updated) {
      refreshOpps();
      setChecklistOpp(updated);
    }
  }

  function handleSaveRD(values: RDEvidenceFormValues) {
    if (editingRD) {
      updateRDEvidence(editingRD.id, values);
    } else {
      addRDEvidence(values);
    }
    refreshRD();
    setIsRDFormOpen(false);
    setEditingRD(null);
    toast.success(editingRD ? "Evidence updated." : "Evidence added.");
  }

  function handleDeleteRD() {
    if (!deletingRD) return;
    deleteRDEvidence(deletingRD.id);
    refreshRD();
    setDeletingRD(null);
    toast.success("Evidence deleted.");
  }

  function handleSaveInv(values: InvestorFormValues) {
    if (editingInv) {
      updateInvestorContact(editingInv.id, values);
    } else {
      addInvestorContact(values);
    }
    refreshInvestors();
    setIsInvFormOpen(false);
    setEditingInv(null);
    toast.success(editingInv ? "Investor updated." : "Investor added.");
  }

  function handleDeleteInv() {
    if (!deletingInv) return;
    deleteInvestorContact(deletingInv.id);
    refreshInvestors();
    setDeletingInv(null);
    toast.success("Investor deleted.");
  }

  async function handleCopyPrompt(text: string) {
    const ok = await copyToClipboard(text);
    toast[ok ? "success" : "error"](ok ? "Prompt copied." : "Clipboard copy failed.");
  }

  // ── Export handlers ──────────────────────────────────────────────────────

  function handleExportOppsCSV() {
    exportToCSV(opportunities, "truckfixr-funding-opportunities.csv");
  }
  function handleExportRDCSV() {
    exportToCSV(rdEvidence, "truckfixr-rd-evidence.csv");
  }
  function handleExportInvCSV() {
    exportToCSV(investors, "truckfixr-investor-pipeline.csv");
  }
  function handleExportGrantReadinessMd() {
    exportToMarkdown(
      buildGrantReadinessReport(opportunities),
      "truckfixr-grant-readiness.md"
    );
  }
  function handleExportRDMd() {
    exportToMarkdown(
      buildRDEvidenceReport(rdEvidence),
      "truckfixr-rd-evidence.md"
    );
  }
  function handleExportAllJSON() {
    exportToJSON(
      {
        exportedAt: new Date().toISOString(),
        opportunities,
        rdEvidence,
        investors,
      },
      "truckfixr-funding-backup.json"
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <Tabs defaultValue="opportunities">
        <TabsList variant="line" className="flex-wrap">
          <TabsTrigger value="opportunities">Funding Opportunities</TabsTrigger>
          <TabsTrigger value="rd-evidence">R&D Evidence</TabsTrigger>
          <TabsTrigger value="investors">Investor Relations</TabsTrigger>
          <TabsTrigger value="research-prompts">Research Prompts</TabsTrigger>
          <TabsTrigger value="export">Export Reports</TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Funding Opportunities ─────────────────────────────── */}
        <TabsContent value="opportunities" className="space-y-5">
          <div className="flex items-start gap-3 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
            <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-yellow-600" />
            <p>
              <strong>Funding information changes frequently.</strong> Verify
              eligibility, deadlines, and program details from official sources
              before applying. No applications are submitted automatically.
            </p>
          </div>

          <section className="grid gap-4 sm:grid-cols-5">
            {oppKPIs.map((kpi) => (
              <article
                className="rounded-xl border border-[#e0c0b1] bg-white p-5 shadow-sm"
                key={kpi.label}
              >
                <p className="text-xs font-bold uppercase tracking-wide text-[#584237]">
                  {kpi.label}
                </p>
                <div className={cn("mt-3 text-3xl", kpi.cls)}>{kpi.value}</div>
              </article>
            ))}
          </section>

          <section className="flex flex-col gap-4 rounded-xl border border-[#e0c0b1] bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <Input
                className="h-11 border-[#e0c0b1] bg-[#f7f9fb] sm:max-w-xs"
                placeholder="Search program or funder"
                value={oppFilters.search}
                onChange={(e) =>
                  setOppFilters((f) => ({ ...f, search: e.target.value }))
                }
              />
              <Select
                value={oppFilters.status}
                onValueChange={(v) =>
                  setOppFilters((f) => ({
                    ...f,
                    status: v as OppFilters["status"],
                  }))
                }
              >
                <SelectTrigger className="h-11 w-[160px] border-[#e0c0b1] bg-[#f7f9fb]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {FUNDING_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                value={oppFilters.fundingType}
                onValueChange={(v) =>
                  setOppFilters((f) => ({
                    ...f,
                    fundingType: v as OppFilters["fundingType"],
                  }))
                }
              >
                <SelectTrigger className="h-11 w-[160px] border-[#e0c0b1] bg-[#f7f9fb]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {FUNDING_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                value={oppFilters.fitScore}
                onValueChange={(v) =>
                  setOppFilters((f) => ({
                    ...f,
                    fitScore: v as OppFilters["fitScore"],
                  }))
                }
              >
                <SelectTrigger className="h-11 w-[130px] border-[#e0c0b1] bg-[#f7f9fb]">
                  <SelectValue placeholder="Fit score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {(["1", "2", "3", "4", "5"] as const).map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}/5
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-[#584237]">
                <input
                  checked={oppFilters.deadlineSoon}
                  className="size-4 rounded border-[#e0c0b1]"
                  type="checkbox"
                  onChange={(e) =>
                    setOppFilters((f) => ({
                      ...f,
                      deadlineSoon: e.target.checked,
                    }))
                  }
                />
                Deadline ≤30 days
              </label>
              <Button
                variant="outline"
                onClick={() => setOppFilters(emptyOppFilters)}
              >
                Clear
              </Button>
              <Button
                className="ml-auto bg-[#9d4300] text-white hover:bg-orange-600"
                onClick={() => {
                  setEditingOpp(null);
                  setIsOppFormOpen(true);
                }}
              >
                <PlusIcon data-icon="inline-start" />
                Add Opportunity
              </Button>
            </div>
            <p className="text-sm font-semibold text-[#584237]">
              {filteredOpps.length} result
              {filteredOpps.length === 1 ? "" : "s"} shown
            </p>
          </section>

          <section className="rounded-xl border border-[#e0c0b1] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse text-left">
                <thead className="bg-slate-50 text-sm font-bold uppercase text-[#584237]">
                  <tr>
                    <th className="px-5 py-4">Program</th>
                    <th className="px-5 py-4">Type</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Deadline</th>
                    <th className="px-5 py-4">Fit</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Next Action</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredOpps.length === 0 ? (
                    <tr>
                      <td
                        className="px-5 py-10 text-center text-sm font-semibold text-[#584237]"
                        colSpan={8}
                      >
                        No opportunities match the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredOpps.map((opp) => (
                      <tr className="hover:bg-slate-50" key={opp.id}>
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-950">
                            {opp.programName}
                            {opp.isDemo && (
                              <span className="ml-2 rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                                Demo
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">
                            {opp.funderOrganization}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                          {opp.fundingType}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                          {fmt(opp.amountRange)}
                        </td>
                        <td
                          className={cn(
                            "px-5 py-4 text-sm",
                            isWithin30Days(opp.deadline)
                              ? "font-bold text-red-700"
                              : "text-slate-600"
                          )}
                        >
                          {fmtDate(opp.deadline)}
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-[#9d4300]">
                          {fmtScore(opp.truckFixrFitScore)}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={cn(
                              "rounded-full px-3 py-1 text-xs font-semibold",
                              oppStatusColors[opp.status]
                            )}
                          >
                            {opp.status}
                          </span>
                        </td>
                        <td className="max-w-[200px] px-5 py-4 text-sm text-slate-600">
                          {fmt(opp.nextAction)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingOpp(opp);
                                setIsOppFormOpen(true);
                              }}
                            >
                              <PencilIcon data-icon="inline-start" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setChecklistOpp(opp)}
                            >
                              <CheckSquareIcon data-icon="inline-start" />
                              Checklist
                            </Button>
                            <Button
                              className="border-red-200 text-red-700 hover:bg-red-50"
                              size="sm"
                              variant="outline"
                              onClick={() => setDeletingOpp(opp)}
                            >
                              <Trash2Icon data-icon="inline-start" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </TabsContent>

        {/* ── Tab 2: R&D Evidence ──────────────────────────────────────── */}
        <TabsContent value="rd-evidence" className="space-y-5">
          <section className="grid gap-4 sm:grid-cols-4">
            {rdKPIs.map((kpi) => (
              <article
                className="rounded-xl border border-[#e0c0b1] bg-white p-5 shadow-sm"
                key={kpi.label}
              >
                <p className="text-xs font-bold uppercase tracking-wide text-[#584237]">
                  {kpi.label}
                </p>
                <div className={cn("mt-3 text-3xl", kpi.cls)}>{kpi.value}</div>
              </article>
            ))}
          </section>

          <section className="flex flex-col gap-4 rounded-xl border border-[#e0c0b1] bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <Input
                className="h-11 border-[#e0c0b1] bg-[#f7f9fb] sm:max-w-xs"
                placeholder="Search evidence type or source"
                value={rdFilters.search}
                onChange={(e) =>
                  setRdFilters((f) => ({ ...f, search: e.target.value }))
                }
              />
              <Select
                value={rdFilters.evidenceType}
                onValueChange={(v) =>
                  setRdFilters((f) => ({
                    ...f,
                    evidenceType: v as RDFilters["evidenceType"],
                  }))
                }
              >
                <SelectTrigger className="h-11 w-[200px] border-[#e0c0b1] bg-[#f7f9fb]">
                  <SelectValue placeholder="Evidence type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {RD_EVIDENCE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                value={rdFilters.confidenceLevel}
                onValueChange={(v) =>
                  setRdFilters((f) => ({
                    ...f,
                    confidenceLevel: v as RDFilters["confidenceLevel"],
                  }))
                }
              >
                <SelectTrigger className="h-11 w-[150px] border-[#e0c0b1] bg-[#f7f9fb]">
                  <SelectValue placeholder="Confidence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {CONFIDENCE_LEVELS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                value={rdFilters.supportLetterPotential}
                onValueChange={(v) =>
                  setRdFilters((f) => ({
                    ...f,
                    supportLetterPotential: v as RDFilters["supportLetterPotential"],
                  }))
                }
              >
                <SelectTrigger className="h-11 w-[170px] border-[#e0c0b1] bg-[#f7f9fb]">
                  <SelectValue placeholder="Support letter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {(["Yes", "No", "Unknown"] as const).map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setRdFilters(emptyRDFilters)}
              >
                Clear
              </Button>
              <Button
                className="ml-auto bg-[#9d4300] text-white hover:bg-orange-600"
                onClick={() => {
                  setEditingRD(null);
                  setIsRDFormOpen(true);
                }}
              >
                <PlusIcon data-icon="inline-start" />
                Add Evidence
              </Button>
            </div>
            <p className="text-sm font-semibold text-[#584237]">
              {filteredRD.length} result{filteredRD.length === 1 ? "" : "s"} shown
            </p>
          </section>

          <section className="rounded-xl border border-[#e0c0b1] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead className="bg-slate-50 text-sm font-bold uppercase text-[#584237]">
                  <tr>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Type</th>
                    <th className="px-5 py-4">Source / Customer</th>
                    <th className="px-5 py-4">Confidence</th>
                    <th className="px-5 py-4">Support Letter</th>
                    <th className="px-5 py-4">Problem / Learning</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredRD.length === 0 ? (
                    <tr>
                      <td
                        className="px-5 py-10 text-center text-sm font-semibold text-[#584237]"
                        colSpan={7}
                      >
                        No R&D evidence matches the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredRD.map((item) => (
                      <tr className="hover:bg-slate-50" key={item.id}>
                        <td className="px-5 py-4 text-sm text-slate-600">
                          {item.date}
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-slate-950">
                          {item.evidenceType}
                          {item.isDemo && (
                            <span className="ml-2 rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                              Demo
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                          {[item.source, item.customerPartner]
                            .filter(Boolean)
                            .join(" / ") || "—"}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={cn(
                              "rounded-full px-3 py-1 text-xs font-semibold",
                              confidenceColors[item.confidenceLevel]
                            )}
                          >
                            {item.confidenceLevel}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                          {item.supportLetterPotential}
                        </td>
                        <td className="max-w-[240px] px-5 py-4 text-sm text-slate-600">
                          {item.problemObserved?.slice(0, 80) ||
                            item.resultLearning?.slice(0, 80) ||
                            "—"}
                          {(item.problemObserved?.length ?? 0) > 80 && "…"}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingRD(item);
                                setIsRDFormOpen(true);
                              }}
                            >
                              <PencilIcon data-icon="inline-start" />
                              Edit
                            </Button>
                            <Button
                              className="border-red-200 text-red-700 hover:bg-red-50"
                              size="sm"
                              variant="outline"
                              onClick={() => setDeletingRD(item)}
                            >
                              <Trash2Icon data-icon="inline-start" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </TabsContent>

        {/* ── Tab 3: Investor Relations ────────────────────────────────── */}
        <TabsContent value="investors" className="space-y-5">
          <section className="grid gap-4 sm:grid-cols-4">
            {invKPIs.map((kpi) => (
              <article
                className="rounded-xl border border-[#e0c0b1] bg-white p-5 shadow-sm"
                key={kpi.label}
              >
                <p className="text-xs font-bold uppercase tracking-wide text-[#584237]">
                  {kpi.label}
                </p>
                <div className={cn("mt-3 text-3xl", kpi.cls)}>{kpi.value}</div>
              </article>
            ))}
          </section>

          <section className="flex flex-col gap-4 rounded-xl border border-[#e0c0b1] bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <Input
                className="h-11 border-[#e0c0b1] bg-[#f7f9fb] sm:max-w-xs"
                placeholder="Search investor or fund name"
                value={invFilters.search}
                onChange={(e) =>
                  setInvFilters((f) => ({ ...f, search: e.target.value }))
                }
              />
              <Select
                value={invFilters.status}
                onValueChange={(v) =>
                  setInvFilters((f) => ({
                    ...f,
                    status: v as InvFilters["status"],
                  }))
                }
              >
                <SelectTrigger className="h-11 w-[170px] border-[#e0c0b1] bg-[#f7f9fb]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {INVESTOR_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select
                value={invFilters.investorType}
                onValueChange={(v) =>
                  setInvFilters((f) => ({
                    ...f,
                    investorType: v as InvFilters["investorType"],
                  }))
                }
              >
                <SelectTrigger className="h-11 w-[150px] border-[#e0c0b1] bg-[#f7f9fb]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {INVESTOR_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setInvFilters(emptyInvFilters)}
              >
                Clear
              </Button>
              <Button
                className="ml-auto bg-[#9d4300] text-white hover:bg-orange-600"
                onClick={() => {
                  setEditingInv(null);
                  setIsInvFormOpen(true);
                }}
              >
                <PlusIcon data-icon="inline-start" />
                Add Investor
              </Button>
            </div>
            <p className="text-sm font-semibold text-[#584237]">
              {filteredInvestors.length} result
              {filteredInvestors.length === 1 ? "" : "s"} shown
            </p>
          </section>

          <section className="rounded-xl border border-[#e0c0b1] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] border-collapse text-left">
                <thead className="bg-slate-50 text-sm font-bold uppercase text-[#584237]">
                  <tr>
                    <th className="px-5 py-4">Investor</th>
                    <th className="px-5 py-4">Type</th>
                    <th className="px-5 py-4">Stage</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Deck Version</th>
                    <th className="px-5 py-4">Last Contact</th>
                    <th className="px-5 py-4">Next Action</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredInvestors.length === 0 ? (
                    <tr>
                      <td
                        className="px-5 py-10 text-center text-sm font-semibold text-[#584237]"
                        colSpan={8}
                      >
                        No investors match the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredInvestors.map((inv) => (
                      <tr className="hover:bg-slate-50" key={inv.id}>
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-950">
                            {inv.investorName}
                            {inv.isDemo && (
                              <span className="ml-2 rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                                Demo
                              </span>
                            )}
                          </div>
                          {inv.fundName && (
                            <div className="text-xs text-slate-500">
                              {inv.fundName}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                          {inv.investorType}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                          {fmt(inv.investmentStage)}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={cn(
                              "rounded-full px-3 py-1 text-xs font-semibold",
                              invStatusColors[inv.status]
                            )}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                          {fmt(inv.pitchDeckVersion)}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-600">
                          {fmtDate(inv.lastContactDate)}
                        </td>
                        <td className="max-w-[180px] px-5 py-4 text-sm text-slate-600">
                          {fmt(inv.nextAction)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingInv(inv);
                                setIsInvFormOpen(true);
                              }}
                            >
                              <PencilIcon data-icon="inline-start" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setOutreachInv(inv)}
                            >
                              <SparklesIcon data-icon="inline-start" />
                              Outreach Draft
                            </Button>
                            <Button
                              className="border-red-200 text-red-700 hover:bg-red-50"
                              size="sm"
                              variant="outline"
                              onClick={() => setDeletingInv(inv)}
                            >
                              <Trash2Icon data-icon="inline-start" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </TabsContent>

        {/* ── Tab 4: Research Prompts ──────────────────────────────────── */}
        <TabsContent value="research-prompts" className="space-y-6">
          <p className="text-sm text-slate-600">
            Generate copy-ready prompts. Paste into an LLM or document editor,
            then review before acting on results.
          </p>

          {/* 1. Grant Research */}
          <PromptPanel
            title="1. Grant Research"
            description="Generate a prompt to research relevant funding programs."
            prompt={buildGrantResearchPrompt(grantInputs)}
            onCopy={() => handleCopyPrompt(buildGrantResearchPrompt(grantInputs))}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Geography"
                value={grantInputs.geography}
                onChange={(v) => setGrantInputs((i) => ({ ...i, geography: v }))}
              />
              <Field
                label="Funding type"
                value={grantInputs.fundingType}
                placeholder="e.g. Grant, R&D Support"
                onChange={(v) => setGrantInputs((i) => ({ ...i, fundingType: v }))}
              />
              <Field
                label="Sector"
                value={grantInputs.sector}
                onChange={(v) => setGrantInputs((i) => ({ ...i, sector: v }))}
              />
              <Field
                label="Company stage"
                value={grantInputs.stage}
                onChange={(v) => setGrantInputs((i) => ({ ...i, stage: v }))}
              />
              <Field
                label="Deadline urgency"
                value={grantInputs.urgency}
                placeholder="e.g. Q1 applications open"
                onChange={(v) => setGrantInputs((i) => ({ ...i, urgency: v }))}
              />
            </div>
          </PromptPanel>

          {/* 2. R&D Evidence Extraction */}
          <PromptPanel
            title="2. R&D Evidence Extraction"
            description="Extract structured R&D evidence from a discovery call or pilot."
            prompt={buildRDExtractionPrompt(rdExtractInputs)}
            onCopy={() => handleCopyPrompt(buildRDExtractionPrompt(rdExtractInputs))}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Project / activity description</Label>
                <Textarea
                  rows={3}
                  placeholder="Describe the call, pilot, or experiment you want to extract evidence from…"
                  value={rdExtractInputs.projectDescription}
                  onChange={(e) =>
                    setRdExtractInputs((i) => ({
                      ...i,
                      projectDescription: e.target.value,
                    }))
                  }
                />
              </div>
              <Field
                label="Evidence type"
                value={rdExtractInputs.evidenceType}
                placeholder="e.g. Customer Discovery, Pilot Feedback"
                onChange={(v) =>
                  setRdExtractInputs((i) => ({ ...i, evidenceType: v }))
                }
              />
            </div>
          </PromptPanel>

          {/* 3. Investor Research */}
          <PromptPanel
            title="3. Investor Research"
            description="Find investors who match TruckFixr's stage and sector."
            prompt={buildInvestorResearchPrompt(invResearchInputs)}
            onCopy={() => handleCopyPrompt(buildInvestorResearchPrompt(invResearchInputs))}
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                label="Target raise stage"
                value={invResearchInputs.stage}
                onChange={(v) =>
                  setInvResearchInputs((i) => ({ ...i, stage: v }))
                }
              />
              <Field
                label="Sector focus"
                value={invResearchInputs.sector}
                onChange={(v) =>
                  setInvResearchInputs((i) => ({ ...i, sector: v }))
                }
              />
              <Field
                label="Investor geography"
                value={invResearchInputs.geography}
                onChange={(v) =>
                  setInvResearchInputs((i) => ({ ...i, geography: v }))
                }
              />
            </div>
          </PromptPanel>

          {/* 4. Support Letter Request */}
          <PromptPanel
            title="4. Support Letter Request Draft"
            description="Draft an email requesting a letter of support from a customer or partner."
            prompt={buildSupportLetterPrompt(supportLetterInputs)}
            onCopy={() => handleCopyPrompt(buildSupportLetterPrompt(supportLetterInputs))}
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                label="Customer / partner name"
                value={supportLetterInputs.customerName}
                placeholder="e.g. ABC Trucking"
                onChange={(v) =>
                  setSupportLetterInputs((i) => ({ ...i, customerName: v }))
                }
              />
              <Field
                label="Program name"
                value={supportLetterInputs.programName}
                placeholder="e.g. IRAP, OVIN R&D Fund"
                onChange={(v) =>
                  setSupportLetterInputs((i) => ({ ...i, programName: v }))
                }
              />
              <Field
                label="Your company name"
                value={supportLetterInputs.companyName}
                onChange={(v) =>
                  setSupportLetterInputs((i) => ({ ...i, companyName: v }))
                }
              />
            </div>
          </PromptPanel>

          {/* 5. Budget Justification */}
          <PromptPanel
            title="5. Budget Justification"
            description="Draft a structured budget justification for a grant application."
            prompt={buildBudgetJustificationPrompt(budgetInputs)}
            onCopy={() => handleCopyPrompt(buildBudgetJustificationPrompt(budgetInputs))}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Program name"
                value={budgetInputs.programName}
                placeholder="e.g. IRAP"
                onChange={(v) => setBudgetInputs((i) => ({ ...i, programName: v }))}
              />
              <Field
                label="Total budget"
                value={budgetInputs.totalBudget}
                placeholder="e.g. $150,000"
                onChange={(v) => setBudgetInputs((i) => ({ ...i, totalBudget: v }))}
              />
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Project description</Label>
                <Textarea
                  rows={3}
                  placeholder="Describe the R&D project or initiative…"
                  value={budgetInputs.projectDescription}
                  onChange={(e) =>
                    setBudgetInputs((i) => ({
                      ...i,
                      projectDescription: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </PromptPanel>

          {/* 6. Commercialization Narrative */}
          <PromptPanel
            title="6. Commercialization Narrative"
            description="Write a commercialization section for an R&D grant application."
            prompt={buildCommercializationPrompt(commercializationInputs)}
            onCopy={() =>
              handleCopyPrompt(
                buildCommercializationPrompt(commercializationInputs)
              )
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Product name"
                value={commercializationInputs.productName}
                onChange={(v) =>
                  setCommercializationInputs((i) => ({ ...i, productName: v }))
                }
              />
              <Field
                label="Revenue model"
                value={commercializationInputs.revenueModel}
                onChange={(v) =>
                  setCommercializationInputs((i) => ({ ...i, revenueModel: v }))
                }
              />
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Target market</Label>
                <Textarea
                  rows={2}
                  value={commercializationInputs.targetMarket}
                  onChange={(e) =>
                    setCommercializationInputs((i) => ({
                      ...i,
                      targetMarket: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </PromptPanel>
        </TabsContent>

        {/* ── Tab 5: Export Reports ──────────────────────────────────── */}
        <TabsContent value="export" className="space-y-5">
          <p className="text-sm text-slate-600">
            Export data as CSV, Markdown, or JSON for offline use, grant
            applications, or backups.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ExportCard
              title="Funding Opportunities CSV"
              description={`${opportunities.length} record${opportunities.length === 1 ? "" : "s"}`}
              icon={<DownloadIcon className="size-5 text-[#9d4300]" />}
              onClick={handleExportOppsCSV}
            />
            <ExportCard
              title="R&D Evidence CSV"
              description={`${rdEvidence.length} record${rdEvidence.length === 1 ? "" : "s"}`}
              icon={<DownloadIcon className="size-5 text-[#9d4300]" />}
              onClick={handleExportRDCSV}
            />
            <ExportCard
              title="Investor Pipeline CSV"
              description={`${investors.length} record${investors.length === 1 ? "" : "s"}`}
              icon={<DownloadIcon className="size-5 text-[#9d4300]" />}
              onClick={handleExportInvCSV}
            />
            <ExportCard
              title="Grant Readiness Report"
              description="Markdown — checklist per opportunity"
              icon={<FileOutputIcon className="size-5 text-[#9d4300]" />}
              onClick={handleExportGrantReadinessMd}
            />
            <ExportCard
              title="R&D Evidence Report"
              description="Markdown — structured evidence log"
              icon={<FileOutputIcon className="size-5 text-[#9d4300]" />}
              onClick={handleExportRDMd}
            />
            <ExportCard
              title="Full JSON Backup"
              description="All three datasets in one file"
              icon={<FileOutputIcon className="size-5 text-[#9d4300]" />}
              onClick={handleExportAllJSON}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Dialogs ──────────────────────────────────────────────────────── */}

      {/* Add / Edit Opportunity */}
      <Dialog
        open={isOppFormOpen}
        onOpenChange={(open) => {
          setIsOppFormOpen(open);
          if (!open) setEditingOpp(null);
        }}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingOpp ? "Edit Opportunity" : "Add Funding Opportunity"}
            </DialogTitle>
            <DialogDescription>
              No applications are submitted automatically.
            </DialogDescription>
          </DialogHeader>
          <FundingOpportunityForm
            opportunity={editingOpp}
            onCancel={() => {
              setIsOppFormOpen(false);
              setEditingOpp(null);
            }}
            onSave={handleSaveOpp}
          />
        </DialogContent>
      </Dialog>

      {/* Grant Readiness Checklist */}
      <Dialog
        open={Boolean(checklistOpp)}
        onOpenChange={(open) => {
          if (!open) setChecklistOpp(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Grant Readiness — {checklistOpp?.programName}
            </DialogTitle>
            <DialogDescription>
              Check off items as you complete them. Progress saves automatically.
            </DialogDescription>
          </DialogHeader>
          {checklistOpp && (
            <div className="space-y-3 py-2">
              {CHECKLIST_ITEMS.map((item) => {
                const checked = Boolean(
                  checklistOpp.grantReadiness?.[item.key]
                );
                return (
                  <label
                    className="flex cursor-pointer items-center gap-3"
                    key={item.key}
                  >
                    <input
                      checked={checked}
                      className="size-4 rounded border-[#e0c0b1]"
                      type="checkbox"
                      onChange={(e) =>
                        handleToggleChecklist(
                          checklistOpp,
                          item.key,
                          e.target.checked
                        )
                      }
                    />
                    <span
                      className={cn(
                        "text-sm",
                        checked
                          ? "text-slate-400 line-through"
                          : "text-slate-900"
                      )}
                    >
                      {item.label}
                    </span>
                  </label>
                );
              })}
              <p className="pt-2 text-xs text-slate-500">
                {
                  CHECKLIST_ITEMS.filter(
                    (item) => checklistOpp.grantReadiness?.[item.key]
                  ).length
                }
                /{CHECKLIST_ITEMS.length} completed
              </p>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Opportunity */}
      <Dialog
        open={Boolean(deletingOpp)}
        onOpenChange={(open) => {
          if (!open) setDeletingOpp(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete opportunity?</DialogTitle>
            <DialogDescription>
              {deletingOpp?.programName} will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleDeleteOpp}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add / Edit R&D Evidence */}
      <Dialog
        open={isRDFormOpen}
        onOpenChange={(open) => {
          setIsRDFormOpen(open);
          if (!open) setEditingRD(null);
        }}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingRD ? "Edit R&D Evidence" : "Add R&D Evidence"}
            </DialogTitle>
            <DialogDescription>
              Document customer discovery, pilot feedback, and technical
              experiments for grant applications.
            </DialogDescription>
          </DialogHeader>
          <RDEvidenceForm
            evidence={editingRD}
            onCancel={() => {
              setIsRDFormOpen(false);
              setEditingRD(null);
            }}
            onSave={handleSaveRD}
          />
        </DialogContent>
      </Dialog>

      {/* Delete R&D Evidence */}
      <Dialog
        open={Boolean(deletingRD)}
        onOpenChange={(open) => {
          if (!open) setDeletingRD(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete evidence item?</DialogTitle>
            <DialogDescription>
              This R&D evidence record will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleDeleteRD}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add / Edit Investor */}
      <Dialog
        open={isInvFormOpen}
        onOpenChange={(open) => {
          setIsInvFormOpen(open);
          if (!open) setEditingInv(null);
        }}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingInv ? "Edit Investor" : "Add Investor"}
            </DialogTitle>
            <DialogDescription>
              Track investor relationships and outreach in the funding pipeline.
            </DialogDescription>
          </DialogHeader>
          <InvestorForm
            investor={editingInv}
            onCancel={() => {
              setIsInvFormOpen(false);
              setEditingInv(null);
            }}
            onSave={handleSaveInv}
          />
        </DialogContent>
      </Dialog>

      {/* Investor Outreach Draft */}
      <Dialog
        open={Boolean(outreachInv)}
        onOpenChange={(open) => {
          if (!open) setOutreachInv(null);
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Outreach Draft — {outreachInv?.investorName}
            </DialogTitle>
            <DialogDescription>
              Template draft only. Review and personalize before sending. Do
              not send automatically.
            </DialogDescription>
          </DialogHeader>
          {outreachInv && (
            <div className="space-y-4">
              <Textarea
                className="min-h-[280px] font-mono text-sm"
                readOnly
                value={buildInvestorOutreachDraft(outreachInv)}
              />
              <Button
                className="bg-[#9d4300] text-white hover:bg-orange-600"
                onClick={() =>
                  handleCopyPrompt(buildInvestorOutreachDraft(outreachInv))
                }
              >
                <CopyIcon data-icon="inline-start" />
                Copy draft
              </Button>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Investor */}
      <Dialog
        open={Boolean(deletingInv)}
        onOpenChange={(open) => {
          if (!open) setDeletingInv(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete investor?</DialogTitle>
            <DialogDescription>
              {deletingInv?.investorName} will be permanently removed from the
              pipeline.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleDeleteInv}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Small shared sub-components ───────────────────────────────────────────────

function Field({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        className="border-[#e0c0b1] bg-[#f7f9fb]"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function PromptPanel({
  title,
  description,
  prompt,
  onCopy,
  children,
}: {
  title: string;
  description: string;
  prompt: string;
  onCopy: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#e0c0b1] bg-white p-5 shadow-sm space-y-4">
      <div>
        <h3 className="font-bold text-[#584237]">{title}</h3>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      {children}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-slate-500">Generated prompt</Label>
          <Button size="sm" variant="outline" onClick={onCopy}>
            <CopyIcon data-icon="inline-start" />
            Copy prompt
          </Button>
        </div>
        <Textarea
          className="min-h-[120px] font-mono text-xs"
          readOnly
          value={prompt}
        />
      </div>
    </div>
  );
}

function ExportCard({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className="flex items-start gap-4 rounded-xl border border-[#e0c0b1] bg-white p-5 shadow-sm text-left transition hover:bg-slate-50 active:scale-[0.98]"
      type="button"
      onClick={onClick}
    >
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </button>
  );
}
