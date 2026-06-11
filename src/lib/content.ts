import { generateContentDraft, detectContentRisks } from "@/lib/content-templates";
import { getItem, setItem, STORAGE_KEYS } from "@/lib/storage";
import { type ContentItem } from "@/lib/types";

export type ContentItemInput = Omit<
  ContentItem,
  "id" | "createdDate" | "updatedDate"
>;

function createContentId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `content_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeRiskNotes(item: ContentItemInput) {
  const riskFlags = detectContentRisks(item);
  return riskFlags.join(" | ") || undefined;
}

export function getContentItems(): ContentItem[] {
  return getItem<ContentItem[]>(STORAGE_KEYS.CONTENT_ITEMS) ?? [];
}

export function saveContentItems(items: ContentItem[]): void {
  setItem(STORAGE_KEYS.CONTENT_ITEMS, items);
}

export function addContentItem(item: ContentItemInput): ContentItem {
  const now = new Date().toISOString();
  const items = getContentItems();
  const newItem: ContentItem = {
    ...item,
    id: createContentId(),
    riskNotes: item.riskNotes ?? normalizeRiskNotes(item),
    createdDate: now,
    updatedDate: now,
  };

  saveContentItems([newItem, ...items]);

  return newItem;
}

export function updateContentItem(
  id: string,
  updates: Partial<ContentItem>
): ContentItem | null {
  const items = getContentItems();
  const itemIndex = items.findIndex((item) => item.id === id);

  if (itemIndex === -1) {
    return null;
  }

  const mergedItem = {
    ...items[itemIndex],
    ...updates,
  };
  const updatedItem: ContentItem = {
    ...mergedItem,
    id,
    riskNotes:
      updates.riskNotes ?? normalizeRiskNotes(mergedItem as ContentItemInput),
    createdDate: items[itemIndex].createdDate,
    updatedDate: new Date().toISOString(),
  };
  const nextItems = [...items];
  nextItems[itemIndex] = updatedItem;
  saveContentItems(nextItems);

  return updatedItem;
}

export function deleteContentItem(id: string): void {
  saveContentItems(getContentItems().filter((item) => item.id !== id));
}

export function getContentItem(id: string): ContentItem | null {
  return getContentItems().find((item) => item.id === id) ?? null;
}

export function loadDemoContentItems(demoItems: ContentItemInput[]) {
  const currentItems = getContentItems();
  const realItems = currentItems.filter((item) => !item.isDemo);
  const savedDemoItems = demoItems.map((item, index) => {
    const now = new Date().toISOString();

    return {
      ...item,
      id: `demo_content_${index + 1}`,
      riskNotes: item.riskNotes ?? normalizeRiskNotes(item),
      createdDate: now,
      updatedDate: now,
    };
  });

  saveContentItems([...savedDemoItems, ...realItems]);
}

export function clearDemoContentItems() {
  saveContentItems(getContentItems().filter((item) => !item.isDemo));
}

export function generateAndSaveContentDraft(
  id: string,
  generator: (item: ContentItem) => ReturnType<typeof generateContentDraft>
) {
  const item = getContentItem(id);

  if (!item) {
    return null;
  }

  const generated = generator(item);

  return updateContentItem(id, {
    ...generated,
    contentStatus:
      item.contentStatus === "Approved" || item.contentStatus === "Published"
        ? item.contentStatus
        : "Drafted",
  });
}
