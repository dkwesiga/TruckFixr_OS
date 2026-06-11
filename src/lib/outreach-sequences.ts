import {
  type Prospect,
  type ProspectContact,
  type SalesFollowUpStep,
  type SalesOutreachDraft,
} from "@/lib/types";

export const SEQUENCE_NAMES = [
  "Cold outbound sequence",
  "Warm referral sequence",
  "Post-discovery sequence",
  "Pilot proposal follow-up sequence",
  "Pilot-to-paid conversion sequence",
  "Nurture sequence",
] as const;

export type OutreachSequenceName = (typeof SEQUENCE_NAMES)[number];

function createId(prefix: string) {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function contactName(contact?: ProspectContact) {
  return contact?.name?.trim() || "there";
}

function optOutLine(channel: string) {
  if (channel !== "email") return "";
  return "\n\nOpt-out placeholder: Reply 'not interested' and I will not follow up again.";
}

function draftBody(
  prospect: Prospect,
  contact: ProspectContact | undefined,
  sequenceName: OutreachSequenceName,
  stepName: string,
  channel: SalesOutreachDraft["channel"]
) {
  const name = contactName(contact);
  const pain =
    prospect.maintenancePain ||
    prospect.discoveryWorkflow?.summary ||
    "downtime visibility, repair coordination, and maintenance decision speed";

  return [
    "Template draft - review before sending. Do not auto-send.",
    "",
    `Hi ${name},`,
    "",
    `Following up on ${prospect.companyName} around ${pain}.`,
    `This step is part of the ${sequenceName}: ${stepName}.`,
    "",
    "TruckFixr Fleet AI helps small and mid-sized fleets improve maintenance visibility and make repair decisions with clearer context. No savings or downtime outcomes are guaranteed.",
    "",
    "Would it make sense to book a 20-minute discovery call or confirm the next step?",
    "",
    "Dickson",
    "Founder, TruckFixr Fleet AI",
    optOutLine(channel),
  ].join("\n");
}

function draftTypeForStep(stepName: string): SalesOutreachDraft["draftType"] {
  const lower = stepName.toLowerCase();
  if (lower.includes("referral")) return "warm referral email";
  if (lower.includes("linkedin")) return "linkedin follow-up";
  if (lower.includes("phone")) return "phone script";
  if (lower.includes("voicemail")) return "voicemail script";
  if (lower.includes("discovery")) return "post-discovery follow-up";
  if (lower.includes("pilot proposal")) return "pilot proposal follow-up";
  if (lower.includes("pilot check")) return "pilot check-in";
  if (lower.includes("paid")) return "paid conversion follow-up";
  if (lower.includes("nurture")) return "nurture email";
  return "cold email";
}

const sequenceSteps: Record<
  OutreachSequenceName,
  Array<{ stepName: string; dueInDays: number; channel: SalesFollowUpStep["channel"] }>
> = {
  "Cold outbound sequence": [
    { stepName: "Send reviewed cold email", dueInDays: 0, channel: "email" },
    { stepName: "LinkedIn connection follow-up", dueInDays: 2, channel: "linkedin" },
    { stepName: "Phone follow-up", dueInDays: 4, channel: "phone" },
    { stepName: "Final polite email follow-up", dueInDays: 7, channel: "email" },
  ],
  "Warm referral sequence": [
    { stepName: "Send warm referral email", dueInDays: 0, channel: "email" },
    { stepName: "Thank referral partner", dueInDays: 1, channel: "email" },
    { stepName: "Follow up on intro", dueInDays: 3, channel: "email" },
  ],
  "Post-discovery sequence": [
    { stepName: "Send discovery summary", dueInDays: 0, channel: "email" },
    { stepName: "Confirm pilot scope", dueInDays: 2, channel: "email" },
    { stepName: "Book pilot proposal review", dueInDays: 5, channel: "email" },
  ],
  "Pilot proposal follow-up sequence": [
    { stepName: "Send pilot proposal follow-up", dueInDays: 2, channel: "email" },
    { stepName: "Call about pilot proposal", dueInDays: 5, channel: "phone" },
    { stepName: "Confirm pilot decision", dueInDays: 8, channel: "email" },
  ],
  "Pilot-to-paid conversion sequence": [
    { stepName: "Send pilot review summary", dueInDays: 0, channel: "email" },
    { stepName: "Send paid conversion follow-up", dueInDays: 2, channel: "email" },
    { stepName: "Book paid plan decision call", dueInDays: 5, channel: "phone" },
  ],
  "Nurture sequence": [
    { stepName: "Send nurture email", dueInDays: 14, channel: "email" },
    { stepName: "Share relevant proof/learning", dueInDays: 30, channel: "email" },
    { stepName: "Check future trigger", dueInDays: 60, channel: "email" },
  ],
};

export function generateSequence(
  prospect: Prospect,
  sequenceName: OutreachSequenceName,
  contact?: ProspectContact
): {
  steps: SalesFollowUpStep[];
  drafts: SalesOutreachDraft[];
} {
  const generatedAt = new Date().toISOString();
  const steps = sequenceSteps[sequenceName].map((template) => ({
    id: createId("sequence_step"),
    sequenceName,
    stepName: template.stepName,
    dueDate: addDays(template.dueInDays),
    channel: template.channel,
    status: "open" as const,
    notes: "",
  }));
  const drafts: SalesOutreachDraft[] = steps.map((step) => {
    const channel: SalesOutreachDraft["channel"] =
      step.channel === "email" ||
      step.channel === "linkedin" ||
      step.channel === "phone"
        ? step.channel
        : "other";

    return {
      id: createId("outreach_draft"),
      channel,
      draftType: draftTypeForStep(step.stepName),
      subject:
        step.channel === "email"
          ? `${prospect.companyName} maintenance visibility follow-up`
          : undefined,
      body: draftBody(prospect, contact, sequenceName, step.stepName, channel),
      status: "Draft",
      approvalStatus: "Needs Review",
      generatedAt,
      generatedReason: sequenceName,
      relatedContactId: contact?.id,
    };
  });

  return { steps, drafts };
}

export function getComplianceWarnings(
  prospect: Prospect,
  contact?: ProspectContact
) {
  const warnings: Array<{ level: "warning" | "block"; message: string }> = [];
  const consent = contact?.consentStatus ?? prospect.consentStatus ?? "unknown";

  if (prospect.doNotContact || contact?.doNotContact) {
    warnings.push({
      level: "block",
      message: "Do-not-contact is enabled. Do not send outreach unless this is explicitly reviewed and cleared.",
    });
  }

  if (prospect.unsubscribeStatus || consent === "unsubscribed") {
    warnings.push({
      level: "block",
      message: "This prospect/contact is unsubscribed. Do not send email outreach.",
    });
  }

  if (consent === "unknown") {
    warnings.push({
      level: "warning",
      message: "Email consent is unknown. Review CASL/commercial email requirements before using email drafts.",
    });
  }

  if ((prospect.outreachCount30Days ?? 0) >= 5) {
    warnings.push({
      level: "warning",
      message: "Outreach count in the last 30 days is high. Consider pausing or moving to nurture.",
    });
  }

  if (prospect.nextAllowedOutreachDate) {
    const allowed = new Date(prospect.nextAllowedOutreachDate).getTime();
    if (Number.isFinite(allowed) && allowed > Date.now()) {
      warnings.push({
        level: "warning",
        message: `Next allowed outreach date is ${prospect.nextAllowedOutreachDate}.`,
      });
    }
  }

  return warnings;
}
