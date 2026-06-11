import { getItem, setItem, STORAGE_KEYS } from "@/lib/storage";
import { type Partnership } from "@/lib/types";

export type PartnershipInput = Omit<
  Partnership,
  "id" | "createdDate" | "updatedDate"
>;

function createPartnershipId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `partnership_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function getPartnerships(): Partnership[] {
  return getItem<Partnership[]>(STORAGE_KEYS.PARTNERSHIPS) ?? [];
}

export function savePartnerships(partnerships: Partnership[]): void {
  setItem(STORAGE_KEYS.PARTNERSHIPS, partnerships);
}

export function addPartnership(partnership: PartnershipInput): Partnership {
  const now = new Date().toISOString();
  const partnerships = getPartnerships();
  const newPartnership: Partnership = {
    ...partnership,
    id: createPartnershipId(),
    createdDate: now,
    updatedDate: now,
  };

  savePartnerships([newPartnership, ...partnerships]);

  return newPartnership;
}

export function updatePartnership(
  id: string,
  updates: Partial<Partnership>
): Partnership | null {
  const partnerships = getPartnerships();
  const partnershipIndex = partnerships.findIndex(
    (partnership) => partnership.id === id
  );

  if (partnershipIndex === -1) {
    return null;
  }

  const updatedPartnership: Partnership = {
    ...partnerships[partnershipIndex],
    ...updates,
    id,
    createdDate: partnerships[partnershipIndex].createdDate,
    updatedDate: new Date().toISOString(),
  };
  const nextPartnerships = [...partnerships];
  nextPartnerships[partnershipIndex] = updatedPartnership;
  savePartnerships(nextPartnerships);

  return updatedPartnership;
}

export function deletePartnership(id: string): void {
  savePartnerships(
    getPartnerships().filter((partnership) => partnership.id !== id)
  );
}

export function getPartnership(id: string): Partnership | null {
  return getPartnerships().find((partnership) => partnership.id === id) ?? null;
}

export function loadDemoPartnerships(demoPartnerships: PartnershipInput[]) {
  const currentPartnerships = getPartnerships();
  const realPartnerships = currentPartnerships.filter(
    (partnership) => !partnership.isDemo
  );
  const savedDemoPartnerships = demoPartnerships.map((partnership, index) => {
    const now = new Date().toISOString();

    return {
      ...partnership,
      id: `demo_partnership_${index + 1}`,
      createdDate: now,
      updatedDate: now,
    };
  });

  savePartnerships([...savedDemoPartnerships, ...realPartnerships]);
}

export function clearDemoPartnerships() {
  savePartnerships(
    getPartnerships().filter((partnership) => !partnership.isDemo)
  );
}
