"use client";

import { useEffect, useRef, useState } from "react";
import { WandSparklesIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { calculateScores } from "@/lib/scoring";
import {
  type OutreachStatus,
  type Prospect,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type Score = 1 | 2 | 3 | 4 | 5 | null;

export type ProspectFormValues = Omit<
  Prospect,
  "id" | "createdDate" | "updatedDate"
>;

type ProspectFormProps = {
  prospect?: Prospect | null;
  /** When true, scrolls to and highlights the scoring section on open */
  focusScoring?: boolean;
  onCancel: () => void;
  onSave: (values: ProspectFormValues) => void;
};

const outreachStatuses: OutreachStatus[] = [
  "New",
  "Researched",
  "Drafted",
  "Approved",
  "Sent",
  "Replied",
  "Discovery Booked",
  "Pilot Fit",
  "Proposal Sent",
  "Won",
  "Nurture",
  "Lost",
];

const fleetTypes = [
  "Trucking/Logistics",
  "Construction",
  "Contractor",
  "Courier",
  "Mixed",
  "Other",
] as const;

const fleetSizes = ["2-5", "6-10", "11-20", "21-50", "50+"] as const;
const eldOptions = ["Yes", "No", "Unknown"] as const;
const scoreOptions = ["1", "2", "3", "4", "5"] as const;

const emptyValues: ProspectFormValues = {
  companyName: "",
  website: "",
  location: "",
  fleetType: undefined,
  estimatedFleetSize: undefined,
  decisionMaker: "",
  email: "",
  phone: "",
  linkedIn: "",
  maintenancePain: "",
  usesEldTelematics: "Unknown",
  pilotFitScore: null,
  revenueFitScore: null,
  grantFitScore: null,
  outreachStatus: "New",
  nextAction: "",
  lastContactDate: "",
  notes: "",
  firstEmailDraft: "",
  linkedInConnectDraft: "",
  linkedInFollowUpDraft: "",
  phoneScript: "",
  cta: "Book a 20-minute discovery call",
  isDemo: false,
};

function toFormValues(prospect?: Prospect | null): ProspectFormValues {
  if (!prospect) {
    return emptyValues;
  }

  return {
    companyName: prospect.companyName,
    website: prospect.website ?? "",
    location: prospect.location,
    fleetType: prospect.fleetType,
    estimatedFleetSize: prospect.estimatedFleetSize,
    decisionMaker: prospect.decisionMaker ?? "",
    email: prospect.email ?? "",
    phone: prospect.phone ?? "",
    linkedIn: prospect.linkedIn ?? "",
    maintenancePain: prospect.maintenancePain ?? "",
    usesEldTelematics: prospect.usesEldTelematics,
    pilotFitScore: prospect.pilotFitScore,
    revenueFitScore: prospect.revenueFitScore,
    grantFitScore: prospect.grantFitScore,
    outreachStatus: prospect.outreachStatus,
    nextAction: prospect.nextAction ?? "",
    lastContactDate: prospect.lastContactDate ?? "",
    notes: prospect.notes ?? "",
    firstEmailDraft: prospect.firstEmailDraft ?? "",
    linkedInConnectDraft: prospect.linkedInConnectDraft ?? "",
    linkedInFollowUpDraft: prospect.linkedInFollowUpDraft ?? "",
    phoneScript: prospect.phoneScript ?? "",
    cta: prospect.cta ?? "Book a 20-minute discovery call",
    isDemo: prospect.isDemo ?? false,
  };
}

function normalizeOptional(value?: string) {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : undefined;
}

function parseScore(value: string): Score {
  if (!value) return null;
  return Number(value) as Score;
}

function scoreToString(value: Score) {
  return value === null ? "" : String(value);
}

/** Returns a suggested nextAction string based on pilot fit score. */
function getNextActionSuggestion(pilotFitScore: Score): string {
  if (pilotFitScore === null) return "";
  if (pilotFitScore >= 4)
    return "Strong pilot fit — generate outreach drafts and advance to Drafted.";
  if (pilotFitScore === 3)
    return "Good fit — generate outreach drafts and schedule a warm follow-up.";
  if (pilotFitScore === 2)
    return "Marginal fit — gather more fleet info and maintenance pain detail before drafting.";
  return "Low pilot fit — consider Nurture track or remove from active pipeline.";
}

const SCORE_LABEL_COLORS: Record<number, string> = {
  5: "bg-green-100 text-green-800 border-green-300",
  4: "bg-emerald-50 text-emerald-700 border-emerald-300",
  3: "bg-yellow-50 text-yellow-800 border-yellow-300",
  2: "bg-orange-50 text-orange-700 border-orange-300",
  1: "bg-red-50 text-red-700 border-red-300",
};

export function ProspectForm({
  prospect,
  focusScoring = false,
  onCancel,
  onSave,
}: ProspectFormProps) {
  const [values, setValues] = useState<ProspectFormValues>(() =>
    toFormValues(prospect)
  );
  const [validationError, setValidationError] = useState("");

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scoringSectionRef = useRef<HTMLDivElement>(null);

  // Scroll scoring section into view when opened in scoring mode
  useEffect(() => {
    if (!focusScoring) return;
    const timer = setTimeout(() => {
      if (scoringSectionRef.current && scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: scoringSectionRef.current.offsetTop - 16,
          behavior: "smooth",
        });
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [focusScoring]);

  function updateField<K extends keyof ProspectFormValues>(
    key: K,
    value: ProspectFormValues[K]
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleAutoScore() {
    const scores = calculateScores(values);
    setValues((current) => ({
      ...current,
      pilotFitScore: scores.pilotFitScore,
      revenueFitScore: scores.revenueFitScore,
      grantFitScore: scores.grantFitScore,
    }));
    toast.success("Scores auto-calculated from prospect profile.");
  }

  function handleApplySuggestion() {
    const suggestion = getNextActionSuggestion(values.pilotFitScore);
    if (suggestion) {
      updateField("nextAction", suggestion);
      // If still New and scores are set, advance to Researched
      if (values.outreachStatus === "New" && values.pilotFitScore !== null) {
        updateField("outreachStatus", "Researched");
      }
    }
  }

  function handleSave() {
    if (!values.companyName.trim() || !values.location.trim()) {
      setValidationError("Company name and location are required.");
      return;
    }

    const normalizedValues: ProspectFormValues = {
      ...values,
      companyName: values.companyName.trim(),
      website: normalizeOptional(values.website),
      location: values.location.trim(),
      decisionMaker: normalizeOptional(values.decisionMaker),
      email: normalizeOptional(values.email),
      phone: normalizeOptional(values.phone),
      linkedIn: normalizeOptional(values.linkedIn),
      maintenancePain: normalizeOptional(values.maintenancePain),
      nextAction: normalizeOptional(values.nextAction),
      lastContactDate: normalizeOptional(values.lastContactDate),
      notes: normalizeOptional(values.notes),
      firstEmailDraft: normalizeOptional(values.firstEmailDraft),
      linkedInConnectDraft: normalizeOptional(values.linkedInConnectDraft),
      linkedInFollowUpDraft: normalizeOptional(values.linkedInFollowUpDraft),
      phoneScript: normalizeOptional(values.phoneScript),
      cta: normalizeOptional(values.cta),
    };

    onSave(normalizedValues);
    toast.success(prospect ? "Prospect updated." : "Prospect added.");
  }

  const suggestion = getNextActionSuggestion(values.pilotFitScore);
  const isUnscored = values.pilotFitScore === null;

  return (
    <div
      ref={scrollContainerRef}
      className="flex max-h-[72vh] flex-col gap-5 overflow-y-auto pr-1"
    >
      {validationError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {validationError}
        </div>
      ) : null}

      {/* Scoring mode banner */}
      {focusScoring && isUnscored && (
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <WandSparklesIcon className="mt-0.5 size-4 shrink-0 text-blue-500" />
          <div>
            <p className="font-bold">Score this prospect first</p>
            <p className="mt-0.5 text-blue-700">
              Set a Pilot Fit score to unlock <strong>Generate Drafts</strong>{" "}
              and get a recommended next action.
            </p>
          </div>
        </div>
      )}

      {/* ── Company & contact info ── */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="company-name">Company name</Label>
          <Input
            id="company-name"
            value={values.companyName}
            onChange={(e) => updateField("companyName", e.target.value)}
            placeholder="TruckFixr Fleet AI"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={values.location}
            onChange={(e) => updateField("location", e.target.value)}
            placeholder="Ontario, Canada"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={values.website ?? ""}
            onChange={(e) => updateField("website", e.target.value)}
            placeholder="https://example.com"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Fleet type</Label>
          <Select
            value={values.fleetType ?? ""}
            onValueChange={(v) =>
              updateField("fleetType", v as ProspectFormValues["fleetType"])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select fleet type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {fleetTypes.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Estimated fleet size</Label>
          <Select
            value={values.estimatedFleetSize ?? ""}
            onValueChange={(v) =>
              updateField(
                "estimatedFleetSize",
                v as ProspectFormValues["estimatedFleetSize"]
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select fleet size" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {fleetSizes.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="decision-maker">Decision maker name</Label>
          <Input
            id="decision-maker"
            value={values.decisionMaker ?? ""}
            onChange={(e) => updateField("decisionMaker", e.target.value)}
            placeholder="Operations lead"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={values.email ?? ""}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="ops@example.com"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={values.phone ?? ""}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder="(555) 555-0123"
          />
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <Label htmlFor="linkedin">LinkedIn URL</Label>
          <Input
            id="linkedin"
            value={values.linkedIn ?? ""}
            onChange={(e) => updateField("linkedIn", e.target.value)}
            placeholder="https://linkedin.com/in/..."
          />
        </div>
      </section>

      {/* ── Scoring section ── */}
      <section
        ref={scoringSectionRef}
        className={cn(
          "rounded-xl border-2 p-4 transition-all",
          focusScoring && isUnscored
            ? "border-blue-400 bg-blue-50/40 shadow-sm shadow-blue-100"
            : "border-[#e0c0b1] bg-white"
        )}
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-bold uppercase tracking-wide text-[#584237]">
            Fit Scores
            {isUnscored && (
              <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                Not scored
              </span>
            )}
          </p>
          <Button
            size="sm"
            type="button"
            variant="outline"
            className="h-8 gap-1.5 border-[#0d1e3d] text-[#0d1e3d] hover:bg-[#0d1e3d] hover:text-white"
            onClick={handleAutoScore}
          >
            <WandSparklesIcon className="size-3.5" />
            Auto-score
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="flex flex-col gap-2">
            <Label>ELD / telematics</Label>
            <Select
              value={values.usesEldTelematics}
              onValueChange={(v) =>
                updateField(
                  "usesEldTelematics",
                  v as ProspectFormValues["usesEldTelematics"]
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {eldOptions.map((o) => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {(
            [
              ["pilotFitScore", "Pilot fit ★"],
              ["revenueFitScore", "Revenue fit"],
              ["grantFitScore", "Grant fit"],
            ] as const
          ).map(([key, label]) => {
            const current = values[key] as Score;
            return (
              <div className="flex flex-col gap-2" key={key}>
                <Label>
                  {label}
                  {current !== null && (
                    <span
                      className={cn(
                        "ml-2 rounded border px-1.5 py-0.5 text-[11px] font-bold",
                        SCORE_LABEL_COLORS[current]
                      )}
                    >
                      {current}/5
                    </span>
                  )}
                </Label>
                <Select
                  value={scoreToString(current)}
                  onValueChange={(v) =>
                    updateField(key, parseScore(v))
                  }
                >
                  <SelectTrigger
                    className={cn(
                      key === "pilotFitScore" && isUnscored && focusScoring
                        ? "border-blue-400 ring-1 ring-blue-300"
                        : ""
                    )}
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {scoreOptions.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>

        {/* Score-based nextAction suggestion */}
        {suggestion && (
          <div className="mt-4 flex items-start justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-semibold text-emerald-800">
              <span className="mr-1.5">💡</span>
              {suggestion}
            </p>
            <Button
              size="sm"
              type="button"
              variant="outline"
              className="shrink-0 border-emerald-400 text-emerald-700 hover:bg-emerald-100"
              onClick={handleApplySuggestion}
            >
              Apply
            </Button>
          </div>
        )}
      </section>

      {/* ── Status & action ── */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label>Outreach status</Label>
          <Select
            value={values.outreachStatus}
            onValueChange={(v) =>
              updateField("outreachStatus", v as OutreachStatus)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {outreachStatuses.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="next-action">Next action</Label>
          <Input
            id="next-action"
            value={values.nextAction ?? ""}
            onChange={(e) => updateField("nextAction", e.target.value)}
            placeholder="Research decision maker"
          />
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <Label htmlFor="maintenance-pain">Maintenance pain / notes</Label>
          <Textarea
            id="maintenance-pain"
            value={values.maintenancePain ?? ""}
            onChange={(e) => updateField("maintenancePain", e.target.value)}
            rows={4}
          />
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={values.notes ?? ""}
            onChange={(e) => updateField("notes", e.target.value)}
            rows={4}
          />
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          className="bg-[#9d4300] text-white hover:bg-orange-600"
          type="button"
          onClick={handleSave}
        >
          {prospect ? "Save Changes" : "Add Prospect"}
        </Button>
      </div>
    </div>
  );
}
