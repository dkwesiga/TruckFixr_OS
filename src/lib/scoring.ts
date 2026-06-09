import { type Prospect } from "@/lib/types";

type ScoreValue = 1 | 2 | 3 | 4 | 5;

function clampScore(score: number): ScoreValue {
  const roundedScore = Math.max(1, Math.min(5, Math.round(score)));
  return roundedScore as ScoreValue;
}

function parseFleetSizeRange(estimatedFleetSize?: string) {
  if (!estimatedFleetSize) {
    return null;
  }

  const normalized = estimatedFleetSize.replace(/[^\d+-]/g, "");
  const [rawMin, rawMax] = normalized.split("-");

  if (normalized.includes("+")) {
    const min = Number.parseInt(normalized.replace("+", ""), 10);
    return Number.isFinite(min) ? { min, max: min + 10 } : null;
  }

  const min = Number.parseInt(rawMin, 10);
  const max = Number.parseInt(rawMax ?? rawMin, 10);

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return null;
  }

  return { min, max };
}

function isOntarioLocation(location?: string) {
  if (!location) {
    return false;
  }

  return /ontario|\bon\b|toronto|mississauga|ottawa|hamilton|brampton/i.test(
    location
  );
}

function hasDecisionMaker(prospect: Partial<Prospect>) {
  return Boolean(
    prospect.decisionMaker?.trim() ||
      prospect.email?.trim() ||
      prospect.phone?.trim() ||
      prospect.linkedIn?.trim()
  );
}

function hasMaintenancePain(prospect: Partial<Prospect>) {
  return Boolean(prospect.maintenancePain?.trim() || prospect.notes?.trim());
}

function scoreToFiveScale(
  weight: number,
  maxWeight: number,
  minDataPoints: number
): ScoreValue {
  if (minDataPoints <= 0) {
    return 2;
  }

  const normalized = 1 + (weight / maxWeight) * 4;
  return clampScore(normalized);
}

export function calculateScores(prospect: Partial<Prospect>): {
  pilotFitScore: ScoreValue;
  revenueFitScore: ScoreValue;
  grantFitScore: ScoreValue;
} {
  const fleetRange = parseFleetSizeRange(prospect.estimatedFleetSize);
  const isOntario = isOntarioLocation(prospect.location);
  const hasDecisionContact = hasDecisionMaker(prospect);
  const hasPain = hasMaintenancePain(prospect);
  const hasTelematics = prospect.usesEldTelematics === "Yes";
  const fleetType = prospect.fleetType;

  let pilotWeight = 0;
  let revenueWeight = 0;
  let grantWeight = 0;
  let pilotDataPoints = 0;
  let revenueDataPoints = 0;
  let grantDataPoints = 0;

  if (fleetRange) {
    pilotDataPoints += 1;
    revenueDataPoints += 1;
    grantDataPoints += 1;

    if (fleetRange.min >= 6 && fleetRange.max <= 25) {
      pilotWeight += 4;
      grantWeight += 2;
    } else if (fleetRange.min >= 6 && fleetRange.min <= 25) {
      pilotWeight += 3;
      grantWeight += 1.5;
    } else if (fleetRange.max < 6 || fleetRange.min > 25) {
      pilotWeight += 1;
      grantWeight += 1;
    }

    if (fleetRange.min >= 11 && fleetRange.max <= 25) {
      revenueWeight += 4;
    } else if (fleetRange.min >= 11 && fleetRange.min <= 25) {
      revenueWeight += 3;
    } else if (fleetRange.min >= 6 && fleetRange.max <= 10) {
      revenueWeight += 2;
    } else {
      revenueWeight += 1;
    }
  }

  if (fleetType) {
    pilotDataPoints += 1;

    if (
      fleetType === "Trucking/Logistics" ||
      fleetType === "Construction"
    ) {
      pilotWeight += 2;
    } else if (fleetType === "Contractor" || fleetType === "Courier") {
      pilotWeight += 1.5;
    } else {
      pilotWeight += 1;
    }
  }

  if (hasTelematics) {
    pilotDataPoints += 1;
    grantDataPoints += 1;
    pilotWeight += 2;
    grantWeight += 2;
  } else if (prospect.usesEldTelematics) {
    pilotDataPoints += 1;
    grantDataPoints += 1;
    pilotWeight += 0.75;
    grantWeight += 0.75;
  }

  if (hasPain) {
    pilotDataPoints += 1;
    grantDataPoints += 1;
    pilotWeight += 1.5;
    grantWeight += 1.5;
  }

  if (hasDecisionContact) {
    pilotDataPoints += 1;
    revenueDataPoints += 1;
    pilotWeight += 1.5;
    revenueWeight += 2;
  }

  if (isOntario) {
    revenueDataPoints += 1;
    grantDataPoints += 1;
    revenueWeight += 2;
    grantWeight += 2;
  }

  const pilotFitScore =
    pilotDataPoints === 0 ? 2 : scoreToFiveScale(pilotWeight, 11, pilotDataPoints);
  const revenueFitScore =
    revenueDataPoints === 0
      ? 2
      : scoreToFiveScale(revenueWeight, 8, revenueDataPoints);
  const grantFitScore =
    grantDataPoints === 0
      ? 2
      : scoreToFiveScale(grantWeight, 7.5, grantDataPoints);

  return {
    pilotFitScore,
    revenueFitScore,
    grantFitScore,
  };
}
