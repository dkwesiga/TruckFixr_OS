import {
  type CompanySettings,
  type ContentItem,
  type ContentType,
} from "@/lib/types";

type GeneratedContentDraft = {
  draftTitle: string;
  draftContent: string;
  suggestedHashtags: string[];
  recommendedChannel: string;
  riskNotes?: string;
};

function trimWords(text: string, maxWords: number) {
  const words = text.trim().split(/\s+/);

  if (words.length <= maxWords) {
    return text.trim();
  }

  return `${words.slice(0, maxWords).join(" ")}.`;
}

function topicLabel(item: ContentItem) {
  return item.topic.trim() || "fleet maintenance visibility";
}

function topicSentence(item: ContentItem) {
  return topicLabel(item).replace(/[.?!]+$/g, "");
}

function contextSentence(item: ContentItem) {
  return (
    item.contextNotes?.trim() ||
    "smaller Ontario fleets still lose time when maintenance knowledge lives across calls, paper notes, and vendor inboxes"
  );
}

function ctaText(item: ContentItem, settings: CompanySettings) {
  return item.cta?.trim() || settings.cta;
}

function introNote() {
  return "Template draft - review before publishing.";
}

function canadianAngle(item: ContentItem) {
  if (
    item.contentType === "Grant/R&D Credibility Post" ||
    item.audience === "Grant/Funding Partner" ||
    item.audience === "Investor"
  ) {
    return "Ontario fleets and Canadian innovation programs are part of the operating context here.";
  }

  return "Ontario fleet operations give this topic its real-world edge.";
}

function recommendedChannel(contentType: ContentType) {
  switch (contentType) {
    case "Prospect Nurturing Email":
      return "Email";
    case "Blog Outline":
    case "Landing Page Copy Suggestion":
      return "Website";
    case "Case Study Draft":
      return "Internal case study draft";
    case "Event Announcement":
      return "LinkedIn and email";
    case "Investor Update Snippet":
      return "Investor update";
    default:
      return "LinkedIn";
  }
}

function buildHashtags(item: ContentItem) {
  const shared = ["#TruckFixr", "#FleetMaintenance", "#FleetOps"];

  if (
    item.contentType === "Grant/R&D Credibility Post" ||
    item.contentType === "Pilot Learning Post"
  ) {
    return [...shared, "#OntarioInnovation", "#CommercialFleets"];
  }

  if (item.contentType === "Prospect Nurturing Email") {
    return ["#FleetOperations", "#MaintenanceVisibility", "#OntarioFleets"];
  }

  return [...shared, "#OntarioFleets", "#RepairVisibility"];
}

export function detectContentRisks(item: Partial<ContentItem>) {
  const content = [
    item.topic,
    item.contextNotes,
    item.draftTitle,
    item.draftContent,
    item.approvalNotes,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const flags: string[] = [];

  if (/\bguarantee|save|savings|proven|certified\b/i.test(content)) {
    flags.push("Claim needs evidence");
  }

  if (item.customerName?.trim()) {
    flags.push("Customer name - confirm approval");
  }

  if (
    /\bgrant|funding|funder|sred|sr&ed|irap\b/i.test(content) ||
    item.contentType === "Grant/R&D Credibility Post" ||
    item.audience === "Grant/Funding Partner"
  ) {
    flags.push("Verify with funder source");
  }

  return Array.from(new Set(flags));
}

function buildLinkedInFounderPost(
  item: ContentItem,
  settings: CompanySettings
) {
  const content = [
    introNote(),
    "",
    `One pattern I keep seeing in Ontario fleets is this: ${topicSentence(item)}.`,
    `The real issue is not a lack of effort. It is that downtime decisions get harder when repair knowledge is scattered across drivers, texts, vendor calls, and half-complete history.`,
    `${settings.companyName} is being built to give smaller commercial fleets clearer maintenance visibility so teams can make faster, more grounded repair calls without adding more admin to the day.`,
    `${canadianAngle(item)} ${contextSentence(item)}.`,
    `${ctaText(item, settings)}.`,
  ].join("\n\n");

  return trimWords(content, 220);
}

function buildEducationalLinkedInPost(
  item: ContentItem,
  settings: CompanySettings
) {
  const content = [
    introNote(),
    "",
    `A practical fleet problem: ${topicSentence(item)}.`,
    `When a truck or van comes in with a rough driver report, the team still has to piece together history, recent repairs, and next-best actions. That is where delay creeps in.`,
    `Better maintenance tools do not replace judgement. They make the underlying repair knowledge easier to find, compare, and use when time is tight.`,
    `${settings.companyName} is focused on helping smaller fleets get that operating visibility in a form people can actually use.`,
    `${ctaText(item, settings)}.`,
  ].join("\n\n");

  return trimWords(content, 220);
}

function buildPilotLearningPost(
  item: ContentItem,
  settings: CompanySettings
) {
  const content = [
    introNote(),
    "",
    `One thing we are learning at ${settings.companyName}: ${topicSentence(item)}.`,
    `A repeated, non-identifying observation from early fleet conversations is that maintenance teams often know the right next question, but the supporting history is slow to surface when vehicles are already waiting.`,
    `That learning is shaping how we present repair context, issue summaries, and maintenance follow-through inside the product.`,
    `We are looking for practical fleet partners who want better maintenance visibility without a lot of process overhead. ${ctaText(item, settings)}.`,
  ].join("\n\n");

  return trimWords(content, 220);
}

function buildGrantCredibilityPost(
  item: ContentItem,
  settings: CompanySettings
) {
  const content = [
    introNote(),
    "",
    `A real technical challenge in fleet maintenance is ${topicSentence(item)}.`,
    `From an R&D perspective, the work is not about hype. It is about how to structure repair knowledge, service history, and issue context so smaller fleets can make better maintenance decisions with less friction.`,
    `That is exactly the kind of operational innovation that matters in Ontario and across Canada, especially when commercial fleets are under pressure to do more with lean teams.`,
    `${settings.companyName} is building in that direction. ${ctaText(item, settings)}.`,
  ].join("\n\n");

  return trimWords(content, 220);
}

function buildProspectNurturingEmail(
  item: ContentItem,
  settings: CompanySettings
) {
  const content = [
    introNote(),
    "",
    "Subject: A quick follow-up on fleet maintenance visibility",
    "",
    "Hi there,",
    "",
    `Following up on ${topicSentence(item)}. One thing we keep hearing is that downtime decisions slow down when repair history and recent issues are hard to pull together quickly.`,
    `${settings.companyName} is focused on helping smaller fleets make those maintenance calls with better visibility and less back-and-forth.`,
    `If this is relevant on your side, ${ctaText(item, settings).toLowerCase()}.`,
    "",
    "Dickson",
    "Founder, TruckFixr Fleet AI",
  ].join("\n");

  return trimWords(content, 150);
}

function buildBlogOutline(item: ContentItem) {
  return [
    introNote(),
    "",
    `Title: ${topicLabel(item)}`,
    "Recommended word count: 1,200-1,500 words",
    `Target keyword: ${topicSentence(item).toLowerCase()}`,
    "",
    "1. Why this fleet problem matters",
    "Briefly explain the operating pressure behind the topic.",
    "",
    "2. Where repair knowledge breaks down",
    "Describe how information gaps create slower maintenance decisions.",
    "",
    "3. What fleet teams usually do today",
    "Outline current workarounds, spreadsheets, calls, and tribal knowledge.",
    "",
    "4. What better visibility changes",
    "Show how faster access to maintenance context improves daily execution.",
    "",
    "5. What smaller Ontario fleets need from tools",
    "Focus on practical adoption, not hype or enterprise complexity.",
    "",
    "6. How TruckFixr thinks about the workflow",
    "Tie the topic back to product direction and founder insight.",
    "",
    "7. Closing CTA",
    "Invite a discovery conversation or response from operators.",
  ].join("\n");
}

function buildCaseStudyDraft(item: ContentItem, settings: CompanySettings) {
  return [
    introNote(),
    "",
    `Title: Case Study Draft - ${topicLabel(item)}`,
    "",
    "Context (anonymized)",
    "A small or mid-sized Ontario fleet needed better visibility into maintenance issues across daily operations.",
    "",
    "Problem",
    topicSentence(item),
    "",
    "Approach",
    `${settings.companyName} worked on making repair context, issue patterns, and maintenance follow-through easier to review.`,
    "",
    "Observations (factual only)",
    `- Teams needed faster access to repair history`,
    `- Maintenance knowledge was spread across people and systems`,
    `- ${contextSentence(item)}`,
    "",
    "Quote placeholder",
    '"[Approved customer quote goes here]"',
  ].join("\n");
}

function buildEventAnnouncement(item: ContentItem, settings: CompanySettings) {
  return [
    introNote(),
    "",
    `Event: ${topicLabel(item)}`,
    "Date: [date placeholder]",
    "Location: [location placeholder]",
    "",
    `We will be talking about ${topicSentence(item)} and what it means for fleet operators trying to reduce downtime friction and improve repair visibility.`,
    `${settings.companyName} will share practical founder-led observations from working on maintenance intelligence for smaller commercial fleets.`,
    `${ctaText(item, settings)}.`,
  ].join("\n");
}

function buildInvestorUpdateSnippet(item: ContentItem) {
  const content = [
    introNote(),
    "",
    `Milestone: ${topicSentence(item)}.`,
    "This matters because it sharpens the operating case for TruckFixr in fleets that need better maintenance visibility without heavyweight rollout requirements.",
    "Next milestone: convert these learnings into tighter product and go-to-market execution.",
  ].join(" ");

  return trimWords(content, 100);
}

function buildLandingPageCopy(item: ContentItem, settings: CompanySettings) {
  return [
    introNote(),
    "",
    `Hero headline: ${topicLabel(item)}`,
    `Subheading: ${settings.companyName} helps small and mid-sized commercial fleets improve repair visibility and make faster maintenance decisions.`,
    "",
    "Value bullets:",
    "- Bring repair context and issue history into one clearer workflow",
    "- Help operators and fleet managers act faster when downtime pressure hits",
    "- Support practical maintenance decisions without promising unrealistic outcomes",
    "",
    `CTA button text: ${ctaText(item, settings)}`,
  ].join("\n");
}

export function generateContentDraft(
  item: ContentItem,
  settings: CompanySettings
): GeneratedContentDraft {
  const draftTitle = `${item.contentType}: ${topicLabel(item)}`;
  let draftContent = "";

  switch (item.contentType) {
    case "LinkedIn Founder Post":
      draftContent = buildLinkedInFounderPost(item, settings);
      break;
    case "Educational LinkedIn Post":
      draftContent = buildEducationalLinkedInPost(item, settings);
      break;
    case "Pilot Learning Post":
      draftContent = buildPilotLearningPost(item, settings);
      break;
    case "Grant/R&D Credibility Post":
      draftContent = buildGrantCredibilityPost(item, settings);
      break;
    case "Prospect Nurturing Email":
      draftContent = buildProspectNurturingEmail(item, settings);
      break;
    case "Blog Outline":
      draftContent = buildBlogOutline(item);
      break;
    case "Case Study Draft":
      draftContent = buildCaseStudyDraft(item, settings);
      break;
    case "Event Announcement":
      draftContent = buildEventAnnouncement(item, settings);
      break;
    case "Investor Update Snippet":
      draftContent = buildInvestorUpdateSnippet(item);
      break;
    case "Landing Page Copy Suggestion":
      draftContent = buildLandingPageCopy(item, settings);
      break;
  }

  const suggestedHashtags = buildHashtags(item);
  const recommended = recommendedChannel(item.contentType);
  const riskFlags = detectContentRisks({
    ...item,
    draftTitle,
    draftContent,
  });

  return {
    draftTitle,
    draftContent,
    suggestedHashtags,
    recommendedChannel: recommended,
    riskNotes: riskFlags.join(" | ") || undefined,
  };
}

export function generateContentLLMPrompt(
  item: ContentItem,
  settings: CompanySettings
) {
  return [
    "Create a founder-led marketing draft for TruckFixr Fleet AI.",
    "",
    "TruckFixr positioning statement:",
    settings.corePositioning,
    "",
    "Content request:",
    JSON.stringify(
      {
        topic: item.topic,
        audience: item.audience,
        contentType: item.contentType,
        cta: item.cta,
        contextNotes: item.contextNotes,
        customerName: item.customerName,
        approvalNotes: item.approvalNotes,
      },
      null,
      2
    ),
    "",
    "Safety rules:",
    "- No guarantees or unproven claims",
    "- Do not auto-publish",
    "- Do not mention customer names unless explicitly approved",
    "- Template draft - review before publishing",
    "",
    "Tone guidance:",
    "- Practical founder-led voice from Dickson at TruckFixr Fleet AI",
    "- Lead with fleet downtime, repair knowledge, and maintenance visibility",
    "- Avoid generic AI hype language",
    "- Use Ontario or Canadian context where useful",
  ].join("\n");
}
