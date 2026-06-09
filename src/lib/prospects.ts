import { getItem, setItem, STORAGE_KEYS } from "@/lib/storage";
import { type Prospect } from "@/lib/types";
import { calculateScores } from "@/lib/scoring";

export type ProspectInput = Omit<
  Prospect,
  "id" | "createdDate" | "updatedDate"
>;

function createProspectId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `prospect_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getProspects(): Prospect[] {
  return getItem<Prospect[]>(STORAGE_KEYS.PROSPECTS) ?? [];
}

export function saveProspects(prospects: Prospect[]): void {
  setItem(STORAGE_KEYS.PROSPECTS, prospects);
}

export function addProspect(prospect: ProspectInput): Prospect {
  const now = new Date().toISOString();
  const prospects = getProspects();
  const calculatedScores = calculateScores(prospect);
  const newProspect: Prospect = {
    ...prospect,
    pilotFitScore: prospect.pilotFitScore ?? calculatedScores.pilotFitScore,
    revenueFitScore:
      prospect.revenueFitScore ?? calculatedScores.revenueFitScore,
    grantFitScore: prospect.grantFitScore ?? calculatedScores.grantFitScore,
    id: createProspectId(),
    createdDate: now,
    updatedDate: now,
  };

  saveProspects([newProspect, ...prospects]);

  return newProspect;
}

export function updateProspect(
  id: string,
  updates: Partial<Prospect>
): Prospect | null {
  const prospects = getProspects();
  const prospectIndex = prospects.findIndex((prospect) => prospect.id === id);

  if (prospectIndex === -1) {
    return null;
  }

  const mergedProspect = {
    ...prospects[prospectIndex],
    ...updates,
  };
  const calculatedScores = calculateScores(mergedProspect);
  const updatedProspect: Prospect = {
    ...mergedProspect,
    pilotFitScore:
      mergedProspect.pilotFitScore ?? calculatedScores.pilotFitScore,
    revenueFitScore:
      mergedProspect.revenueFitScore ?? calculatedScores.revenueFitScore,
    grantFitScore:
      mergedProspect.grantFitScore ?? calculatedScores.grantFitScore,
    id,
    createdDate: prospects[prospectIndex].createdDate,
    updatedDate: new Date().toISOString(),
  };
  const nextProspects = [...prospects];
  nextProspects[prospectIndex] = updatedProspect;
  saveProspects(nextProspects);

  return updatedProspect;
}

export function deleteProspect(id: string): void {
  saveProspects(getProspects().filter((prospect) => prospect.id !== id));
}

export function getProspect(id: string): Prospect | null {
  return getProspects().find((prospect) => prospect.id === id) ?? null;
}

export function importProspects(
  prospectInputs: ProspectInput[]
): { imported: number; skipped: number } {
  const existingProspects = getProspects();
  const existingNames = new Set(
    existingProspects.map((prospect) => prospect.companyName.trim().toLowerCase())
  );
  const newProspects: Prospect[] = [];
  let skipped = 0;

  prospectInputs.forEach((prospectInput) => {
    const normalizedName = prospectInput.companyName.trim().toLowerCase();

    if (!prospectInput.companyName.trim() || !prospectInput.location.trim()) {
      skipped += 1;
      return;
    }

    if (existingNames.has(normalizedName)) {
      skipped += 1;
      return;
    }

    const now = new Date().toISOString();
    const calculatedScores = calculateScores(prospectInput);
    const newProspect: Prospect = {
      ...prospectInput,
      pilotFitScore:
        prospectInput.pilotFitScore ?? calculatedScores.pilotFitScore,
      revenueFitScore:
        prospectInput.revenueFitScore ?? calculatedScores.revenueFitScore,
      grantFitScore:
        prospectInput.grantFitScore ?? calculatedScores.grantFitScore,
      id: createProspectId(),
      createdDate: now,
      updatedDate: now,
    };

    existingNames.add(normalizedName);
    newProspects.push(newProspect);
  });

  if (newProspects.length > 0) {
    saveProspects([...newProspects, ...existingProspects]);
  }

  return { imported: newProspects.length, skipped };
}

export function loadDemoProspects(demoProspects: ProspectInput[]) {
  const currentProspects = getProspects();
  const realProspects = currentProspects.filter((prospect) => !prospect.isDemo);

  const savedDemoProspects = demoProspects.map((prospect, index) => {
    const calculatedScores = calculateScores(prospect);
    const now = new Date().toISOString();

    return {
      ...prospect,
      id: `demo_prospect_${index + 1}`,
      pilotFitScore: prospect.pilotFitScore ?? calculatedScores.pilotFitScore,
      revenueFitScore:
        prospect.revenueFitScore ?? calculatedScores.revenueFitScore,
      grantFitScore: prospect.grantFitScore ?? calculatedScores.grantFitScore,
      createdDate: now,
      updatedDate: now,
    };
  });

  saveProspects([...savedDemoProspects, ...realProspects]);
}

export function clearDemoProspects() {
  saveProspects(getProspects().filter((prospect) => !prospect.isDemo));
}
