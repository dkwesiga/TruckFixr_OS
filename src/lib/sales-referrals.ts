import { addPartnership, getPartnerships, updatePartnership } from "@/lib/partnerships";
import { type Partnership, type Prospect, type SalesPartnerReferral } from "@/lib/types";

export const SALES_PARTNER_TYPES = [
  "Mr Diesel relationship",
  "Repair shop",
  "Mobile mechanic",
  "Towing company",
  "ELD/telematics provider",
  "Fleet consultant",
  "Insurance/risk advisor",
  "Accelerator intro",
  "Grant/R&D ecosystem contact",
  "Existing pilot/customer referral",
  "Other",
] as const;

export const REFERRAL_STATUSES: NonNullable<
  SalesPartnerReferral["referralStatus"]
>[] = [
  "Identified",
  "Intro Pending",
  "Intro Made",
  "Discovery Booked",
  "Pilot Started",
  "Paid Customer Won",
  "Closed Lost",
  "Dormant",
];

function createId(prefix: string) {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function mapSalesPartnerTypeToPartnershipType(
  partnerType?: string
): Partnership["partnerType"] {
  if (!partnerType) return "Referral Partner";
  if (partnerType.includes("ELD")) return "ELD/Telematics Provider";
  if (partnerType.includes("Repair")) return "Repair Shop Partner";
  if (partnerType.includes("Accelerator")) return "Accelerator/Incubator";
  if (partnerType.includes("Grant")) return "Government/Economic Dev";
  return "Referral Partner";
}

export function createEmptyReferral(prospect: Prospect): SalesPartnerReferral {
  return {
    id: createId("referral"),
    partnerName: "",
    company: "",
    partnerType: "Referral Partner",
    contactPerson: "",
    email: "",
    phone: "",
    linkedinUrl: "",
    relationshipStrength: "Medium",
    referralPotential: "Medium",
    notes: "",
    lastContactDate: "",
    nextFollowUpDate: "",
    referredProspect: prospect.companyName,
    referralDate: new Date().toISOString().slice(0, 10),
    referralStatus: "Identified",
    introMade: false,
    introPending: true,
    outcome: "",
    estimatedValue: prospect.estimatedAnnualValue ?? prospect.estimatedPilotValue ?? 0,
    pilotFit:
      typeof prospect.pilotFitScore === "number" && prospect.pilotFitScore >= 4
        ? "High"
        : "Medium",
    partnerNotes: "",
    referralsMade: 1,
    discoveryCallsBooked: 0,
    pilotsStarted: 0,
    paidCustomersWon: 0,
    rdFundingValueGenerated: "",
  };
}

export function syncReferralToPartnership(
  referral: SalesPartnerReferral
): Partnership {
  const existing =
    referral.linkedPartnershipId
      ? getPartnerships().find((item) => item.id === referral.linkedPartnershipId)
      : getPartnerships().find(
          (item) =>
            item.partnerName.trim().toLowerCase() ===
            referral.partnerName.trim().toLowerCase()
        );

  const updates: Omit<Partnership, "id" | "createdDate" | "updatedDate"> = {
    partnerName: referral.partnerName || referral.company || "Referral partner",
    website: undefined,
    partnerType: mapSalesPartnerTypeToPartnershipType(referral.partnerType),
    contactName: referral.contactPerson || referral.partnerName,
    contactEmail: referral.email,
    contactPhone: referral.phone,
    contactLinkedIn: referral.linkedinUrl,
    location: undefined,
    relationshipStatus:
      referral.referralStatus === "Paid Customer Won"
        ? "Referral Active"
        : referral.referralStatus === "Intro Made" ||
            referral.referralStatus === "Discovery Booked"
          ? "Active Conversation"
          : "Identified",
    referralPotential: referral.referralPotential ?? "Medium",
    coPilotPotential: "Maybe",
    integrationPotential:
      referral.partnerType === "ELD/telematics provider" ? "Maybe" : "No",
    lastContactDate: referral.lastContactDate,
    nextAction: referral.nextFollowUpDate
      ? `Follow up on referral by ${referral.nextFollowUpDate}`
      : "Follow up on referral opportunity.",
    notes: [
      referral.notes,
      referral.partnerNotes,
      referral.referredProspect &&
        `Sales referral tied to prospect: ${referral.referredProspect}`,
      referral.outcome && `Outcome: ${referral.outcome}`,
    ]
      .filter(Boolean)
      .join("\n"),
    isDemo: false,
  };

  if (existing) {
    return updatePartnership(existing.id, updates) ?? existing;
  }

  return addPartnership(updates);
}

export function generateReferralOutreachPrompt(
  prospect: Prospect,
  referral: SalesPartnerReferral
) {
  return [
    `# Partner Referral Outreach Prompt: ${referral.partnerName || "Partner"}`,
    "",
    "Create a practical founder-led partner/referral message from Dickson at TruckFixr Fleet AI.",
    "",
    "## Context",
    `Partner: ${referral.partnerName || "Not set"}`,
    `Partner company: ${referral.company || "Not set"}`,
    `Partner type: ${referral.partnerType || "Referral Partner"}`,
    `Contact: ${referral.contactPerson || "Not set"}`,
    `Referred prospect: ${referral.referredProspect || prospect.companyName}`,
    `Prospect fit: ${prospect.fleetType ?? "Fleet type unknown"}, ${prospect.location}`,
    "",
    "## Requested Drafts",
    "- Initial partner/referral outreach",
    "- Follow-up message",
    "- Referral thank-you note",
    "",
    "## Tone and Safety",
    "- Practical, founder-led, relationship-first",
    "- Lead with shared fleet value: uptime, maintenance visibility, better repair coordination",
    "- No guarantees of savings or downtime reduction",
    "- Do not auto-send",
    "- Template draft - review before sending",
  ].join("\n");
}

export function buildReferralSummary(
  prospect: Prospect,
  referral: SalesPartnerReferral
) {
  return [
    `# Sales Referral: ${referral.partnerName || "Unnamed partner"}`,
    "",
    `**Partner company:** ${referral.company || "Not set"}`,
    `**Partner type:** ${referral.partnerType || "Not set"}`,
    `**Contact:** ${referral.contactPerson || "Not set"}`,
    `**Referred prospect:** ${referral.referredProspect || prospect.companyName}`,
    `**Referral status:** ${referral.referralStatus || "Identified"}`,
    `**Estimated value:** ${referral.estimatedValue ? `CAD $${referral.estimatedValue.toLocaleString("en-CA")}` : "Not set"}`,
    `**Pilot fit:** ${referral.pilotFit || "Medium"}`,
    "",
    "## Partner Value",
    `- Referrals made: ${referral.referralsMade ?? 0}`,
    `- Discovery calls booked: ${referral.discoveryCallsBooked ?? 0}`,
    `- Pilots started: ${referral.pilotsStarted ?? 0}`,
    `- Paid customers won: ${referral.paidCustomersWon ?? 0}`,
    `- R&D/funding value: ${referral.rdFundingValueGenerated || "Not captured"}`,
    "",
    "## Notes",
    referral.partnerNotes || referral.notes || "No notes captured.",
    "",
    "---",
    "Internal referral record. Do not share partner or prospect details without approval.",
  ].join("\n");
}

export function countReferralMetrics(prospects: Prospect[]) {
  const referrals = prospects.flatMap((prospect) => prospect.partnerReferrals ?? []);

  return {
    totalPartners: referrals.length,
    referralsMade: referrals.reduce((sum, item) => sum + (item.referralsMade ?? 0), 0),
    discoveryCallsBooked: referrals.reduce(
      (sum, item) => sum + (item.discoveryCallsBooked ?? 0),
      0
    ),
    pilotsStarted: referrals.reduce((sum, item) => sum + (item.pilotsStarted ?? 0), 0),
    paidCustomersWon: referrals.reduce(
      (sum, item) => sum + (item.paidCustomersWon ?? 0),
      0
    ),
  };
}
