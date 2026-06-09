"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { copyToClipboard } from "@/lib/export";
import { importProspects, type ProspectInput } from "@/lib/prospects";

type ResearchPromptGeneratorProps = {
  onImported: () => void;
  onManualAdd: () => void;
};

type ParsedResearchProspect = {
  companyName?: string;
  website?: string;
  location?: string;
  fleetType?: ProspectInput["fleetType"];
  estimatedFleetSize?: ProspectInput["estimatedFleetSize"];
  decisionMaker?: string;
  phone?: string;
  email?: string;
  linkedIn?: string;
  maintenancePain?: string;
  eldTelematicsRelevance?: string;
  sourceNotes?: string;
};

const sourceOptions = [
  "LinkedIn",
  "Company websites",
  "Industry directories",
  "Google Maps",
] as const;

export function ResearchPromptGenerator({
  onImported,
  onManualAdd,
}: ResearchPromptGeneratorProps) {
  const [targetLocation, setTargetLocation] = useState("Ontario, Canada");
  const [targetSegment, setTargetSegment] =
    useState<ProspectInput["fleetType"]>("Trucking/Logistics");
  const [fleetSizeRange, setFleetSizeRange] =
    useState<ProspectInput["estimatedFleetSize"]>("6-10");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [numberOfProspects, setNumberOfProspects] = useState("10");
  const [preferredSources, setPreferredSources] = useState<string[]>([
    "LinkedIn",
    "Company websites",
  ]);
  const [resultsText, setResultsText] = useState("");
  const [parseError, setParseError] = useState("");
  const [previewRows, setPreviewRows] = useState<ParsedResearchProspect[]>([]);

  const prompt = useMemo(
    () =>
      [
        `Find ${numberOfProspects} commercial fleet companies in ${targetLocation} that match these filters:`,
        `- Target segment: ${targetSegment}`,
        `- Fleet size range: ${fleetSizeRange}`,
        additionalNotes ? `- Additional notes: ${additionalNotes}` : "",
        `- Preferred sources: ${preferredSources.join(", ") || "Public web sources"}`,
        "",
        "Return the results as a structured JSON array.",
        "For each company include:",
        '- "companyName"',
        '- "website"',
        '- "location"',
        '- "fleetType"',
        '- "estimatedFleetSize"',
        '- "decisionMaker" (if public)',
        '- "phone" (if public)',
        '- "email" (if public)',
        '- "linkedIn" (if public)',
        '- "maintenancePain"',
        '- "eldTelematicsRelevance"',
        '- "sourceNotes"',
        "",
        "Use only publicly available information. Do not scrape restricted sources or violate platform terms of service.",
      ]
        .filter(Boolean)
        .join("\n"),
    [
      additionalNotes,
      fleetSizeRange,
      numberOfProspects,
      preferredSources,
      targetLocation,
      targetSegment,
    ]
  );

  function toggleSource(source: string) {
    setPreferredSources((currentSources) =>
      currentSources.includes(source)
        ? currentSources.filter((currentSource) => currentSource !== source)
        : [...currentSources, source]
    );
  }

  async function handleCopyPrompt() {
    const didCopy = await copyToClipboard(prompt);

    if (didCopy) {
      toast.success("Research prompt copied.");
      return;
    }

    toast.error("Clipboard copy failed.");
  }

  function handleParseResults() {
    try {
      const parsed = JSON.parse(resultsText) as unknown;

      if (!Array.isArray(parsed)) {
        throw new Error("Expected a JSON array.");
      }

      const normalizedRows = parsed
        .map((item) => item as ParsedResearchProspect)
        .filter((item) => item.companyName && item.location);

      setPreviewRows(normalizedRows);
      setParseError("");
      toast.success(`Parsed ${normalizedRows.length} research prospects.`);
    } catch {
      setPreviewRows([]);
      setParseError(
        "Parsing failed. Paste a valid JSON array response or use Manual Add."
      );
    }
  }

  function handleAddAll() {
    const { imported, skipped } = importProspects(
      previewRows.map((row) => ({
        companyName: row.companyName || "",
        website: row.website,
        location: row.location || "",
        fleetType: row.fleetType,
        estimatedFleetSize: row.estimatedFleetSize,
        decisionMaker: row.decisionMaker,
        email: row.email,
        phone: row.phone,
        linkedIn: row.linkedIn,
        sourceNotes: row.sourceNotes || "Imported from research prompt results.",
        maintenancePain: row.maintenancePain,
        usesEldTelematics:
          row.eldTelematicsRelevance?.toLowerCase().includes("yes")
            ? "Yes"
            : row.eldTelematicsRelevance?.toLowerCase().includes("no")
              ? "No"
              : "Unknown",
        pilotFitScore: null,
        revenueFitScore: null,
        grantFitScore: null,
        outreachStatus: "New",
        nextAction: "Review imported research prospect.",
        lastContactDate: "",
        notes: "",
        firstEmailDraft: "",
        linkedInConnectDraft: "",
        linkedInFollowUpDraft: "",
        phoneScript: "",
        cta: "Book a free 20-minute discovery call - [calendly link placeholder]",
        llmPersonalizationPrompt: "",
        isDemo: false,
      }))
    );

    onImported();
    toast.success(`${imported} imported, ${skipped} skipped`);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-semibold text-[#584237]">
          Target location
          <input
            className="h-11 rounded-lg border border-[#e0c0b1] bg-[#f7f9fb] px-3 text-slate-950"
            value={targetLocation}
            onChange={(event) => setTargetLocation(event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-[#584237]">
          Target segment
          <select
            className="h-11 rounded-lg border border-[#e0c0b1] bg-[#f7f9fb] px-3 text-slate-950"
            value={targetSegment}
            onChange={(event) =>
              setTargetSegment(event.target.value as ProspectInput["fleetType"])
            }
          >
            <option value="Trucking/Logistics">Trucking/Logistics</option>
            <option value="Construction">Construction</option>
            <option value="Contractor">Contractor</option>
            <option value="Courier">Courier</option>
            <option value="Mixed">Mixed</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-[#584237]">
          Fleet size range
          <select
            className="h-11 rounded-lg border border-[#e0c0b1] bg-[#f7f9fb] px-3 text-slate-950"
            value={fleetSizeRange}
            onChange={(event) =>
              setFleetSizeRange(
                event.target.value as ProspectInput["estimatedFleetSize"]
              )
            }
          >
            <option value="2-5">2-5</option>
            <option value="6-10">6-10</option>
            <option value="11-20">11-20</option>
            <option value="21-50">21-50</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-[#584237]">
          Number of prospects
          <select
            className="h-11 rounded-lg border border-[#e0c0b1] bg-[#f7f9fb] px-3 text-slate-950"
            value={numberOfProspects}
            onChange={(event) => setNumberOfProspects(event.target.value)}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm font-semibold text-[#584237]">
        Additional search notes
        <Textarea
          className="min-h-24 border-[#e0c0b1] bg-[#f7f9fb]"
          value={additionalNotes}
          onChange={(event) => setAdditionalNotes(event.target.value)}
        />
      </label>

      <div className="flex flex-col gap-2 text-sm font-semibold text-[#584237]">
        Preferred sources
        <div className="flex flex-wrap gap-3">
          {sourceOptions.map((source) => (
            <label
              className="flex items-center gap-2 rounded-lg border border-[#e0c0b1] bg-white px-3 py-2"
              key={source}
            >
              <input
                checked={preferredSources.includes(source)}
                type="checkbox"
                onChange={() => toggleSource(source)}
              />
              {source}
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-[#e0c0b1] bg-[#f7f9fb] p-4">
        <p className="mb-3 text-sm font-bold text-[#584237]">
          Copy-ready research prompt
        </p>
        <Textarea
          className="min-h-56 border-[#e0c0b1] bg-white font-mono text-sm"
          value={prompt}
          onChange={() => undefined}
        />
        <div className="mt-3 flex justify-end">
          <Button onClick={handleCopyPrompt}>Copy Prompt</Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-[#e0c0b1] bg-white p-4">
        <p className="text-sm font-bold text-[#584237]">Paste-back area</p>
        <Textarea
          className="min-h-40 border-[#e0c0b1] bg-[#f7f9fb] font-mono text-sm"
          placeholder="Paste the LLM JSON results here"
          value={resultsText}
          onChange={(event) => setResultsText(event.target.value)}
        />
        {parseError ? (
          <p className="text-sm font-semibold text-red-700">{parseError}</p>
        ) : null}
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="outline" onClick={onManualAdd}>
            Manual Add
          </Button>
          <Button variant="outline" onClick={handleParseResults}>
            Parse
          </Button>
          <Button disabled={previewRows.length === 0} onClick={handleAddAll}>
            Add All
          </Button>
        </div>
      </div>

      {previewRows.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-[#e0c0b1]">
          <table className="min-w-[720px] w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase text-[#584237]">
              <tr>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Fleet Type</th>
                <th className="px-4 py-3">Fleet Size</th>
                <th className="px-4 py-3">Decision Maker</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {previewRows.slice(0, 5).map((row, index) => (
                <tr key={`${row.companyName}-${index}`}>
                  <td className="px-4 py-3">{row.companyName}</td>
                  <td className="px-4 py-3">{row.location}</td>
                  <td className="px-4 py-3">{row.fleetType || "Not set"}</td>
                  <td className="px-4 py-3">
                    {row.estimatedFleetSize || "Not set"}
                  </td>
                  <td className="px-4 py-3">
                    {row.decisionMaker || "Not set"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
