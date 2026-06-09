import { type CompanySettings, type Prospect } from "@/lib/types";

function fallbackDecisionMaker(prospect: Prospect) {
  return prospect.decisionMaker?.trim() || "there";
}

function fleetDescriptor(prospect: Prospect) {
  return prospect.fleetType || "commercial fleet";
}

function fleetSizeDescriptor(prospect: Prospect) {
  return prospect.estimatedFleetSize || "small to mid-sized";
}

function painPoint(prospect: Prospect) {
  return (
    prospect.maintenancePain?.trim() ||
    "unplanned downtime, repair visibility, and slower maintenance decisions"
  );
}

function locationDescriptor(prospect: Prospect) {
  return prospect.location || "Ontario";
}

function trimWords(text: string, maxWords: number) {
  const words = text.trim().split(/\s+/);

  if (words.length <= maxWords) {
    return text.trim();
  }

  return `${words.slice(0, maxWords).join(" ")}.`;
}

function trimCharacters(text: string, maxCharacters: number) {
  if (text.length <= maxCharacters) {
    return text;
  }

  return `${text.slice(0, maxCharacters - 3).trimEnd()}...`;
}

export function generateCTA() {
  return "Book a free 20-minute discovery call - [calendly link placeholder]";
}

export function generateFirstEmailDraft(
  prospect: Prospect,
  settings: CompanySettings
) {
  const subject = `Subject: ${fleetDescriptor(prospect)} maintenance visibility at ${prospect.companyName}`;
  const body = [
    subject,
    "",
    "Template draft - review before sending.",
    "",
    `Hi ${fallbackDecisionMaker(prospect)},`,
    "",
    `${fleetSizeDescriptor(prospect)} ${fleetDescriptor(prospect).toLowerCase()} teams often feel pressure around downtime, repair visibility, and faster maintenance decisions, especially when issues stack up across the week.`,
    "",
    `${settings.companyName} helps fleets get clearer maintenance signals so operators can make faster repair decisions and keep work moving. We focus on practical operating visibility, not hype.`,
    "",
    `From the outside, ${prospect.companyName} looks like a possible fit because of ${painPoint(prospect)} in ${locationDescriptor(prospect)}.`,
    "",
    `Would you be open to a short conversation? ${settings.cta}.`,
    "",
    "Dickson",
    "Founder, TruckFixr Fleet AI",
  ].join("\n");

  return trimWords(body, 150);
}

export function generateLinkedInConnectDraft(
  prospect: Prospect,
  settings: CompanySettings
) {
  const text = `Template draft - review before sending. Hi ${fallbackDecisionMaker(prospect)}, I work with ${settings.companyName} on downtime visibility and faster fleet maintenance decisions for ${fleetDescriptor(prospect).toLowerCase()} teams. Would be glad to connect.`;

  return trimCharacters(text, 300);
}

export function generateLinkedInFollowUpDraft(
  prospect: Prospect,
  settings: CompanySettings
) {
  const text = [
    "Template draft - review before sending.",
    "Thanks for connecting. We help fleets improve repair visibility and speed up maintenance decisions without changing how operators already work.",
    `If ${painPoint(prospect)} is on your radar at ${prospect.companyName}, ${settings.cta.toLowerCase()}.`,
  ].join(" ");

  return trimWords(text, 100);
}

export function generatePhoneScript(
  prospect: Prospect,
  settings: CompanySettings
) {
  const text = [
    "Template draft - review before sending.",
    `Hi, is this ${fallbackDecisionMaker(prospect)}?`,
    `This is Dickson from ${settings.companyName}.`,
    `Do you handle fleet maintenance decisions at ${prospect.companyName}?`,
    "We help fleets improve downtime visibility and make repair decisions faster.",
    `${settings.cta}.`,
  ].join(" ");

  return trimWords(text, 75);
}

export function generateLLMPersonalizationPrompt(
  prospect: Prospect,
  settings: CompanySettings,
  outputType: "email" | "linkedin" | "phone"
) {
  return [
    "Create a personalized outreach draft for TruckFixr Fleet AI.",
    "",
    "TruckFixr positioning statement:",
    settings.corePositioning,
    "",
    "Full prospect details:",
    JSON.stringify(prospect, null, 2),
    "",
    `Requested output: ${outputType}`,
    "",
    "Safety rules:",
    "- No guarantees or claims of savings",
    "- Template draft - review before use",
    "- Do not auto-send",
    "",
    "Tone guidance:",
    "- Founder-led",
    "- Practical and direct",
    "- Lead with downtime, repair visibility, and faster maintenance decisions",
    "- Avoid overusing the term AI",
  ].join("\n");
}

export function generateOutreachTemplates(
  prospect: Prospect,
  settings: CompanySettings
) {
  const cta = generateCTA();

  return {
    firstEmailDraft: generateFirstEmailDraft(prospect, settings),
    linkedInConnectDraft: generateLinkedInConnectDraft(prospect, settings),
    linkedInFollowUpDraft: generateLinkedInFollowUpDraft(prospect, settings),
    phoneScript: generatePhoneScript(prospect, settings),
    cta,
    llmPersonalizationPrompt: generateLLMPersonalizationPrompt(
      prospect,
      settings,
      "email"
    ),
  };
}
