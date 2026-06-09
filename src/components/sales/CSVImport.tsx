"use client";

import { type ChangeEvent, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { importProspects, type ProspectInput } from "@/lib/prospects";

type CSVImportProps = {
  onImported: () => void;
};

type PreviewRow = {
  companyName: string;
  location: string;
  website?: string;
  fleetType?: ProspectInput["fleetType"];
  estimatedFleetSize?: ProspectInput["estimatedFleetSize"];
  decisionMaker?: string;
  email?: string;
  phone?: string;
  notes?: string;
};

const acceptedHeaders = [
  "companyname",
  "location",
  "website",
  "fleettype",
  "estimatedfleetsize",
  "decisionmaker",
  "email",
  "phone",
  "notes",
] as const;

function parseCsvLine(line: string) {
  const values: string[] = [];
  let currentValue = "";
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      if (insideQuotes && line[index + 1] === '"') {
        currentValue += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (character === "," && !insideQuotes) {
      values.push(currentValue.trim());
      currentValue = "";
      continue;
    }

    currentValue += character;
  }

  values.push(currentValue.trim());

  return values;
}

function normalizeHeader(header: string) {
  return header.toLowerCase().replace(/[\s_-]/g, "");
}

function mapRowToProspect(row: PreviewRow): ProspectInput {
  return {
    companyName: row.companyName,
    website: row.website,
    location: row.location,
    fleetType: row.fleetType,
    estimatedFleetSize: row.estimatedFleetSize,
    decisionMaker: row.decisionMaker,
    email: row.email,
    phone: row.phone,
    linkedIn: "",
    sourceNotes: "Imported from CSV.",
    maintenancePain: "",
    usesEldTelematics: "Unknown",
    pilotFitScore: null,
    revenueFitScore: null,
    grantFitScore: null,
    outreachStatus: "New",
    nextAction: "",
    lastContactDate: "",
    notes: row.notes,
    firstEmailDraft: "",
    linkedInConnectDraft: "",
    linkedInFollowUpDraft: "",
    phoneScript: "",
    cta: "Book a free 20-minute discovery call - [calendly link placeholder]",
    llmPersonalizationPrompt: "",
    isDemo: false,
  };
}

export function CSVImport({ onImported }: CSVImportProps) {
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [parsedRows, setParsedRows] = useState<PreviewRow[]>([]);
  const [summary, setSummary] = useState("");

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    file
      .text()
      .then((content) => {
        const lines = content
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean);

        if (lines.length < 2) {
          setParsedRows([]);
          setPreviewRows([]);
          setSummary("CSV file did not contain any prospect rows.");
          return;
        }

        const headers = parseCsvLine(lines[0]).map(normalizeHeader);
        const rows = lines.slice(1).map((line) => parseCsvLine(line));
        const parsed = rows
          .map((columns) => {
            const result: Partial<PreviewRow> = {};

            headers.forEach((header, index) => {
              if (!acceptedHeaders.includes(header as (typeof acceptedHeaders)[number])) {
                return;
              }

              const value = columns[index]?.trim();

              switch (header) {
                case "companyname":
                  result.companyName = value;
                  break;
                case "location":
                  result.location = value;
                  break;
                case "website":
                  result.website = value;
                  break;
                case "fleettype":
                  result.fleetType = value as PreviewRow["fleetType"];
                  break;
                case "estimatedfleetsize":
                  result.estimatedFleetSize =
                    value as PreviewRow["estimatedFleetSize"];
                  break;
                case "decisionmaker":
                  result.decisionMaker = value;
                  break;
                case "email":
                  result.email = value;
                  break;
                case "phone":
                  result.phone = value;
                  break;
                case "notes":
                  result.notes = value;
                  break;
                default:
                  break;
              }
            });

            return result as PreviewRow;
          })
          .filter((row) => row.companyName && row.location);

        setParsedRows(parsed);
        setPreviewRows(parsed.slice(0, 5));
        setSummary(`Parsed ${parsed.length} candidate prospect rows.`);
      })
      .catch(() => {
        setParsedRows([]);
        setPreviewRows([]);
        setSummary("CSV parsing failed. Check the file format and try again.");
      });
  }

  function handleImport() {
    const { imported, skipped } = importProspects(
      parsedRows.map((row) => mapRowToProspect(row))
    );

    setSummary(`${imported} imported, ${skipped} skipped`);
    onImported();
    toast.success(`${imported} imported, ${skipped} skipped`);
  }

  return (
    <div className="flex flex-col gap-4">
      <Input accept=".csv,text/csv" type="file" onChange={handleFileChange} />

      {summary ? (
        <p className="text-sm font-semibold text-[#584237]">{summary}</p>
      ) : null}

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
              {previewRows.map((row, index) => (
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

      <div className="flex justify-end">
        <Button disabled={parsedRows.length === 0} onClick={handleImport}>
          Import
        </Button>
      </div>
    </div>
  );
}
