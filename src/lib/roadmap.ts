import { getItem, setItem, STORAGE_KEYS } from "@/lib/storage";
import { type RoadmapItem, type WorkstreamPriority } from "@/lib/types";

export type RoadmapItemInput = Omit<
  RoadmapItem,
  "id" | "createdDate" | "updatedDate"
>;

const priorityWeight: Record<WorkstreamPriority, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

function createRoadmapId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `roadmap_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getRoadmapItems(): RoadmapItem[] {
  return getItem<RoadmapItem[]>(STORAGE_KEYS.ROADMAP_ITEMS) ?? [];
}

export function saveRoadmapItems(items: RoadmapItem[]): void {
  setItem(STORAGE_KEYS.ROADMAP_ITEMS, items);
}

export function addRoadmapItem(input: RoadmapItemInput): RoadmapItem {
  const now = new Date().toISOString();
  const item: RoadmapItem = {
    ...input,
    id: createRoadmapId(),
    createdDate: now,
    updatedDate: now,
  };

  saveRoadmapItems([item, ...getRoadmapItems()]);
  return item;
}

export function updateRoadmapItem(
  id: string,
  updates: Partial<RoadmapItem>
): RoadmapItem | null {
  const items = getRoadmapItems();
  const itemIndex = items.findIndex((item) => item.id === id);

  if (itemIndex === -1) {
    return null;
  }

  const updatedItem: RoadmapItem = {
    ...items[itemIndex],
    ...updates,
    id,
    createdDate: items[itemIndex].createdDate,
    updatedDate: new Date().toISOString(),
  };
  const nextItems = [...items];
  nextItems[itemIndex] = updatedItem;
  saveRoadmapItems(nextItems);

  return updatedItem;
}

export function deleteRoadmapItem(id: string): void {
  saveRoadmapItems(getRoadmapItems().filter((item) => item.id !== id));
}

export function loadDemoRoadmapItems(demoItems: RoadmapItemInput[]): void {
  const now = new Date().toISOString();
  const realItems = getRoadmapItems().filter((item) => !item.isDemo);
  const savedDemoItems: RoadmapItem[] = demoItems.map((item, index) => ({
    ...item,
    id: `demo_roadmap_${index + 1}`,
    createdDate: now,
    updatedDate: now,
  }));

  saveRoadmapItems([...savedDemoItems, ...realItems]);
}

export function clearDemoRoadmapItems(): void {
  saveRoadmapItems(getRoadmapItems().filter((item) => !item.isDemo));
}

function isWithinLastSevenDays(dateValue: string) {
  const timestamp = new Date(dateValue).getTime();

  if (Number.isNaN(timestamp)) {
    return false;
  }

  return timestamp >= Date.now() - 7 * 24 * 60 * 60 * 1000;
}

function sortByPriority(items: RoadmapItem[]) {
  return [...items].sort((a, b) => {
    const priorityDelta = priorityWeight[b.priority] - priorityWeight[a.priority];

    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    const targetTimeA = a.targetDate ? new Date(a.targetDate).getTime() : Infinity;
    const targetTimeB = b.targetDate ? new Date(b.targetDate).getTime() : Infinity;

    if (targetTimeA !== targetTimeB) {
      return targetTimeA - targetTimeB;
    }

    return new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime();
  });
}

function formatRoadmapBullet(item: RoadmapItem) {
  const extras: string[] = [item.module, item.priority, item.owner];

  if (item.targetDate) {
    extras.push(`target ${item.targetDate}`);
  }

  return `- ${item.title} (${extras.join(" | ")})`;
}

export function buildRoadmapMarkdown(items: RoadmapItem[]) {
  return [
    "# TruckFixr Roadmap",
    "",
    ...items.map((item) =>
      [
        `## ${item.title}`,
        `- Module: ${item.module}`,
        `- Phase: ${item.phase}`,
        `- Type: ${item.type}`,
        `- Priority: ${item.priority}`,
        `- Status: ${item.status}`,
        `- Owner: ${item.owner}`,
        `- Risk: ${item.riskLevel}`,
        `- Target Date: ${item.targetDate ?? "Not set"}`,
        `- Codex Prompt Used: ${item.codexPromptUsed ?? "Not set"}`,
        item.businessReason ? `- Business Reason: ${item.businessReason}` : "",
        item.successCriteria ? `- Success Criteria: ${item.successCriteria}` : "",
        item.notes ? `- Notes: ${item.notes}` : "",
        "",
      ]
        .filter(Boolean)
        .join("\n")
    ),
  ].join("\n");
}

export function generateWeeklyImprovementReport(items: RoadmapItem[]) {
  const completedThisWeek = items.filter(
    (item) => item.status === "Done" && isWithinLastSevenDays(item.updatedDate)
  );
  const inProgress = items.filter((item) => item.status === "In Progress");
  const blocked = items.filter((item) => item.status === "Blocked");
  const highestRisk = items.filter((item) => item.riskLevel === "High");
  const nextRecommended = sortByPriority(
    items.filter((item) => item.status === "Planned")
  ).slice(0, 5);
  const codexPromptsUsed = completedThisWeek
    .map((item) => item.codexPromptUsed)
    .filter((value): value is string => Boolean(value?.trim()));
  const suggestedNextSprint = sortByPriority(
    items.filter((item) => item.status === "Planned")
  ).slice(0, 5);

  return [
    "# TruckFixr Weekly Improvement Report",
    `**Generated:** ${new Date().toISOString().slice(0, 10)}`,
    "",
    "## Completed This Week",
    completedThisWeek.length
      ? completedThisWeek.map(formatRoadmapBullet).join("\n")
      : "- None completed this week",
    "",
    "## In Progress",
    inProgress.length
      ? inProgress.map(formatRoadmapBullet).join("\n")
      : "- No items currently in progress",
    "",
    "## Blocked",
    blocked.length ? blocked.map(formatRoadmapBullet).join("\n") : "- No blocked items",
    "",
    "## Highest Risk Items",
    highestRisk.length
      ? highestRisk.map(formatRoadmapBullet).join("\n")
      : "- No high-risk items",
    "",
    "## Next Recommended Priorities",
    nextRecommended.length
      ? nextRecommended.map(formatRoadmapBullet).join("\n")
      : "- No planned items available",
    "",
    "## Codex Prompts Used",
    codexPromptsUsed.length
      ? codexPromptsUsed.map((prompt) => `- ${prompt}`).join("\n")
      : "- No Codex prompts recorded on completed items",
    "",
    "## Suggested Next Sprint",
    suggestedNextSprint.length
      ? suggestedNextSprint.map(formatRoadmapBullet).join("\n")
      : "- No planned items available for the next sprint",
  ].join("\n");
}
