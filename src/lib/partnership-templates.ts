import { type CompanySettings, type Partnership } from "@/lib/types";

export type PartnershipDraftKey =
  | "initialInquiry"
  | "referralProposal"
  | "coPilotOpportunity"
  | "integrationStarter"
  | "followUp";

export type PartnershipDraftType =
  | "Initial Partnership Inquiry Email"
  | "Referral Partnership Proposal"
  | "Co-pilot Opportunity Email"
  | "Integration Conversation Starter"
  | "Follow-up Email";

export type PartnershipDrafts = Record<PartnershipDraftKey, string>;

export const partnershipDraftLabels: Record<
  PartnershipDraftKey,
  PartnershipDraftType
> = {
  initialInquiry: "Initial Partnership Inquiry Email",
  referralProposal: "Referral Partnership Proposal",
  coPilotOpportunity: "Co-pilot Opportunity Email",
  integrationStarter: "Integration Conversation Starter",
  followUp: "Follow-up Email",
};

const defaultSettings: CompanySettings = {
  companyName: "TruckFixr Fleet AI",
  corePositioning:
    "AI maintenance intelligence for small and mid-sized commercial fleets",
  primaryICP: "Ontario trucking/logistics fleets with 5-25 vehicles",
  secondaryICP: "Construction and contractor fleets",
  strategicICP: "ELD/telematics-ready fleet partners",
  cta: "Book a 20-minute discovery call",
  pilotOffer:
    "30-day diagnostic discovery pilot plus 60-90 day paid implementation pilot",
  discoveryPilotValue: "$1,000",
  earlyPartnerRange: "Free to $500",
  paidImplementationRange: "$2,500-$6,000",
};

function getGreeting(partnership: Partnership) {
  if (partnership.contactName?.trim()) {
    return `Hi ${partnership.contactName.trim()},`;
  }

  return "Hi there,";
}

function getPartnerContext(partnership: Partnership) {
  if (partnership.location?.trim()) {
    return `${partnership.partnerType} in ${partnership.location.trim()}`;
  }

  return partnership.partnerType;
}

function getValueLead(partnership: Partnership) {
  switch (partnership.partnerType) {
    case "Parts Supplier":
      return "We are seeing fleets ask for faster maintenance decisions and better repair visibility before downtime snowballs.";
    case "ELD/Telematics Provider":
      return "Fleets get more value when telematics signals and maintenance decisions work together instead of living in separate systems.";
    case "Fleet Management Platform":
      return "Fleet teams are asking for cleaner maintenance visibility inside the operating systems they already depend on.";
    case "Repair Shop Partner":
      return "Repair partners feel the pressure when fleet context is incomplete and approval cycles drag out service work.";
    case "Industry Association":
      return "A lot of Ontario fleets still struggle to turn maintenance issues into faster, clearer operating decisions.";
    default:
      return "Fleet uptime improves when maintenance context is easier to share, review, and act on across the people already supporting the fleet.";
  }
}

function getSharedOpportunity(partnership: Partnership) {
  if (partnership.integrationPotential === "Yes") {
    return "I think there may be a practical integration conversation worth exploring.";
  }

  if (partnership.coPilotPotential === "Yes") {
    return "I think there may be a strong co-pilot opportunity for the right fleet accounts.";
  }

  if (partnership.referralPotential === "High") {
    return "I think there may be a useful referral relationship to explore for fleets that need better maintenance visibility.";
  }

  return "I think there may be a useful partnership conversation here if the fit is real on both sides.";
}

function getFollowUpAnchor(partnership: Partnership) {
  if (partnership.nextAction?.trim()) {
    return `I wanted to follow up on the next step we noted: ${partnership.nextAction.trim()}.`;
  }

  if (partnership.relationshipStatus === "Contacted") {
    return "I wanted to follow up on my earlier note and see if there is a fit for a short conversation.";
  }

  if (partnership.relationshipStatus === "Active Conversation") {
    return "I wanted to keep our conversation moving while the fleet value case is still fresh.";
  }

  return "I wanted to circle back and see whether this is still worth a quick discussion.";
}

function withFooter(lines: string[]) {
  return [...lines, "", "Template draft - review before sending."].join("\n");
}

export function generatePartnershipDrafts(
  partnership: Partnership,
  settings: CompanySettings = defaultSettings
): PartnershipDrafts {
  const greeting = getGreeting(partnership);
  const valueLead = getValueLead(partnership);
  const partnerContext = getPartnerContext(partnership);
  const sharedOpportunity = getSharedOpportunity(partnership);
  const contactClose = settings.cta;

  return {
    initialInquiry: withFooter([
      greeting,
      "",
      `I am Dickson, founder at ${settings.companyName}. ${valueLead}`,
      `We are building practical tools that help fleets move from reported issues to clearer repair visibility and faster maintenance decisions.`,
      `${sharedOpportunity} Your team stood out as a relevant ${partnerContext}.`,
      `Would you be open to a short conversation to compare where your customers or members are feeling the most maintenance friction? ${contactClose}.`,
      "",
      "Dickson",
      "Founder, TruckFixr Fleet AI",
    ]),
    referralProposal: withFooter([
      greeting,
      "",
      `I wanted to reach out about a simple referral partnership between ${settings.companyName} and ${partnership.partnerName}.`,
      "We work with fleets that need clearer maintenance visibility and faster repair decision support, especially when operating context is scattered across calls, notes, and vendor updates.",
      "If your team runs into fleets that are struggling with downtime coordination or maintenance follow-through, I think there could be a clean handoff model that creates value on both sides.",
      `If that is interesting, I would be glad to walk through a lightweight referral motion. ${contactClose}.`,
      "",
      "Dickson",
      "Founder, TruckFixr Fleet AI",
    ]),
    coPilotOpportunity: withFooter([
      greeting,
      "",
      `I am reaching out because I think ${partnership.partnerName} and ${settings.companyName} may have a practical co-pilot opportunity for fleets that need better maintenance visibility.`,
      "We are focused on helping operators get from issue reports to better repair context and faster maintenance decisions without adding more noise to the workflow.",
      "A joint pilot or shared discovery conversation could help us understand where our tools and your customer relationships fit together.",
      `If that sounds relevant, I would welcome a short call. ${contactClose}.`,
      "",
      "Dickson",
      "Founder, TruckFixr Fleet AI",
    ]),
    integrationStarter: withFooter([
      greeting,
      "",
      `I wanted to open a practical integration conversation between ${settings.companyName} and ${partnership.partnerName}.`,
      "We are hearing from fleets that maintenance visibility is strongest when repair workflow, issue intake, and connected fleet data are easier to review together.",
      "I am not assuming there is a fit yet, but I would value a conversation about where integration could improve fleet uptime decision-making and reduce maintenance blind spots.",
      `If useful, I can share the workflow gaps we are seeing most often and compare notes. ${contactClose}.`,
      "",
      "Dickson",
      "Founder, TruckFixr Fleet AI",
    ]),
    followUp: withFooter([
      greeting,
      "",
      getFollowUpAnchor(partnership),
      "From our side, the core opportunity is still the same: helping fleets make faster maintenance decisions with better repair visibility and clearer issue context.",
      "If the timing is better now, I would be glad to reconnect and see whether there is a realistic path forward.",
      `${contactClose}.`,
      "",
      "Dickson",
      "Founder, TruckFixr Fleet AI",
    ]),
  };
}

export function generatePartnershipLLMPrompt(
  partnership: Partnership,
  settings: CompanySettings = defaultSettings
) {
  return [
    `You are helping Dickson, founder of ${settings.companyName}.`,
    "",
    "TruckFixr positioning:",
    settings.corePositioning,
    "",
    "Partner details:",
    `- Partner name: ${partnership.partnerName}`,
    `- Partner type: ${partnership.partnerType}`,
    `- Website: ${partnership.website ?? "Not provided"}`,
    `- Contact name: ${partnership.contactName ?? "Not provided"}`,
    `- Contact email: ${partnership.contactEmail ?? "Not provided"}`,
    `- Contact phone: ${partnership.contactPhone ?? "Not provided"}`,
    `- LinkedIn: ${partnership.contactLinkedIn ?? "Not provided"}`,
    `- Location: ${partnership.location ?? "Not provided"}`,
    `- Relationship status: ${partnership.relationshipStatus}`,
    `- Referral potential: ${partnership.referralPotential}`,
    `- Co-pilot potential: ${partnership.coPilotPotential}`,
    `- Integration potential: ${partnership.integrationPotential}`,
    `- Last contact date: ${partnership.lastContactDate ?? "Not provided"}`,
    `- Next action: ${partnership.nextAction ?? "Not provided"}`,
    `- Notes: ${partnership.notes ?? "Not provided"}`,
    "",
    "Requested outputs:",
    "- Initial partnership inquiry email",
    "- Referral partnership proposal",
    "- Co-pilot opportunity email",
    "- Integration conversation starter",
    "- Follow-up email",
    "",
    "Tone guidance:",
    "- Practical, founder-led, direct, and useful",
    "- Lead with shared customer value: fleet uptime, maintenance visibility, faster maintenance decisions",
    "- Do not overstate fit or promise outcomes",
    "",
    "Safety rules:",
    "- No guarantees or unproven claims",
    "- Review before use",
    "- Do not auto-send",
    "- Keep pricing out unless provided separately",
    "",
    "Return all five drafts in clearly labeled sections.",
  ].join("\n");
}

export function buildPartnershipMarkdown(
  partnership: Partnership,
  settings: CompanySettings = defaultSettings
) {
  const drafts = generatePartnershipDrafts(partnership, settings);
  const prompt = generatePartnershipLLMPrompt(partnership, settings);

  return [
    `# Partnership: ${partnership.partnerName}`,
    `**Partner Type:** ${partnership.partnerType}`,
    `**Relationship Status:** ${partnership.relationshipStatus}`,
    `**Referral Potential:** ${partnership.referralPotential}`,
    `**Co-pilot Potential:** ${partnership.coPilotPotential}`,
    `**Integration Potential:** ${partnership.integrationPotential}`,
    `**Contact:** ${partnership.contactName ?? "Not set"}`,
    `**Location:** ${partnership.location ?? "Not set"}`,
    `**Last Contact:** ${partnership.lastContactDate ?? "Not set"}`,
    `**Next Action:** ${partnership.nextAction ?? "Not set"}`,
    "",
    "## Initial Partnership Inquiry Email",
    drafts.initialInquiry,
    "",
    "## Referral Partnership Proposal",
    drafts.referralProposal,
    "",
    "## Co-pilot Opportunity Email",
    drafts.coPilotOpportunity,
    "",
    "## Integration Conversation Starter",
    drafts.integrationStarter,
    "",
    "## Follow-up Email",
    drafts.followUp,
    "",
    "## LLM Prompt",
    prompt,
    "",
    "---",
    "Template draft - review before sending.",
  ].join("\n");
}
