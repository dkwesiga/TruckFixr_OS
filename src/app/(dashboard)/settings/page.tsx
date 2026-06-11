"use client";

import { type ChangeEvent, useEffect, useRef, useState } from "react";
import {
  AlertTriangleIcon,
  BotIcon,
  Building2Icon,
  DatabaseIcon,
  DownloadIcon,
  LockIcon,
  RocketIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { exportToJSON } from "@/lib/export";
import {
  demoContentItems,
  demoEngineeringTasks,
  demoFundingOpportunities,
  demoInvestorContacts,
  demoPartnerships,
  demoPilotEvidence,
  demoProspects,
  demoRDEvidenceItems,
  demoRoadmapItems,
} from "@/lib/demo-data";
import { clearDemoContentItems, loadDemoContentItems } from "@/lib/content";
import {
  clearDemoEngineeringTasks,
  loadDemoEngineeringTasks,
} from "@/lib/engineering";
import { clearDemoFundingData, loadDemoFundingData } from "@/lib/funding";
import {
  clearDemoPilotEvidence,
  loadDemoPilotEvidence,
} from "@/lib/pilot-evidence";
import {
  clearDemoPartnerships,
  loadDemoPartnerships,
} from "@/lib/partnerships";
import { clearDemoProspects, loadDemoProspects } from "@/lib/prospects";
import {
  clearDemoRoadmapItems,
  loadDemoRoadmapItems,
} from "@/lib/roadmap";
import {
  clearAllData,
  exportAllData,
  getItem,
  importAllData,
  removeItem,
  setItem,
  STORAGE_KEYS,
} from "@/lib/storage";
import { type CompanySettings } from "@/lib/types";

const defaultCompanySettings: CompanySettings = {
  companyName: "TruckFixr Fleet AI",
  corePositioning:
    "AI maintenance intelligence for small and mid-sized commercial fleets",
  primaryICP: "Ontario trucking/logistics fleets with 5-25 vehicles",
  secondaryICP: "Construction and contractor fleets",
  strategicICP: "ELD/telematics-ready fleet partners",
  cta: "Book a 20-minute discovery call",
  pilotOffer:
    "30-day diagnostic discovery pilot plus 60-90 day paid implementation pilot",
  discoveryPilotValue: "$1,000",
  earlyPartnerRange: "Free to $500",
  paidImplementationRange: "$2,500-$6,000",
};

const companyFields: Array<{
  key: keyof CompanySettings;
  label: string;
  multiline?: boolean;
}> = [
  { key: "companyName", label: "Company name" },
  { key: "corePositioning", label: "Core positioning", multiline: true },
  { key: "primaryICP", label: "Primary ICP" },
  { key: "secondaryICP", label: "Secondary ICP" },
  { key: "strategicICP", label: "Strategic ICP" },
  { key: "cta", label: "CTA" },
  { key: "pilotOffer", label: "Pilot offer", multiline: true },
  { key: "discoveryPilotValue", label: "Discovery pilot value" },
  { key: "earlyPartnerRange", label: "Early partner range" },
  { key: "paidImplementationRange", label: "Paid implementation range" },
];

const safetyRules = [
  "Do not guarantee downtime reduction",
  "Human approval required for all customer-facing content",
  "Do not auto-send, auto-post, auto-commit, or auto-submit",
  "Do not mention customer names without explicit approval",
  "Do not claim unproven results",
];

const futureIntegrations = [
  { name: "Supabase", status: "Planned" },
  { name: "HubSpot CRM", status: "Planned" },
  { name: "Gmail", status: "Planned" },
  { name: "GitHub API", status: "Planned" },
  { name: "Google Sheets", status: "Planned" },
  { name: "Make.com webhook", status: "Planned" },
  { name: "OpenRouter", status: "Optional (disabled)" },
  { name: "OpenAI", status: "Optional (disabled)" },
  { name: "Claude", status: "Optional (disabled)" },
];

type DemoModeState = {
  active: boolean;
  loadedAt: string;
  note: string;
};

function getStoredSettings() {
  return (
    getItem<CompanySettings>(STORAGE_KEYS.SETTINGS) ?? defaultCompanySettings
  );
}

export default function SettingsPage() {
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [settings, setSettings] = useState<CompanySettings>(
    defaultCompanySettings
  );
  const [isDemoModeActive, setIsDemoModeActive] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

  useEffect(() => {
    setSettings(getStoredSettings());
    setIsDemoModeActive(
      getItem<DemoModeState>(STORAGE_KEYS.DEMO_MODE)?.active ?? false
    );
  }, []);

  function handleSettingChange(key: keyof CompanySettings, value: string) {
    const nextSettings = {
      ...settings,
      [key]: value,
    };

    setSettings(nextSettings);
    setItem(STORAGE_KEYS.SETTINGS, nextSettings);
  }

  function handleExportAllData() {
    exportToJSON(exportAllData(), "truckfixr-os-backup.json");
    toast.success("TruckFixr OS backup exported.");
  }

  function handleImportClick() {
    importInputRef.current?.click();
  }

  async function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const importedText = await file.text();
      const importedData = JSON.parse(importedText) as object;

      importAllData(importedData);
      setSettings(getStoredSettings());
      setIsDemoModeActive(
        getItem<DemoModeState>(STORAGE_KEYS.DEMO_MODE)?.active ?? false
      );
      toast.success("Backup imported.");
    } catch {
      toast.error("Import failed. Choose a valid TruckFixr OS JSON backup.");
    }
  }

  function handleClearAllData() {
    clearAllData();
    setSettings(defaultCompanySettings);
    setIsDemoModeActive(false);
    setIsClearDialogOpen(false);
    toast.success("All TruckFixr OS local data cleared.");
  }

  function handleLoadDemoData() {
    const demoMode: DemoModeState = {
      active: true,
      loadedAt: new Date().toISOString(),
      note: "Demo data only - not real customer or investor information.",
    };

    loadDemoProspects(demoProspects);
    loadDemoContentItems(demoContentItems);
    loadDemoFundingData(
      demoFundingOpportunities,
      demoRDEvidenceItems,
      demoInvestorContacts
    );
    loadDemoEngineeringTasks(demoEngineeringTasks);
    loadDemoPilotEvidence(demoPilotEvidence);
    loadDemoPartnerships(demoPartnerships);
    loadDemoRoadmapItems(demoRoadmapItems);
    setItem(STORAGE_KEYS.DEMO_MODE, demoMode);
    setIsDemoModeActive(true);
    toast.success("Demo mode loaded.");
  }

  function handleClearDemoData() {
    clearDemoProspects();
    clearDemoContentItems();
    clearDemoFundingData();
    clearDemoEngineeringTasks();
    clearDemoPilotEvidence();
    clearDemoPartnerships();
    clearDemoRoadmapItems();
    removeItem(STORAGE_KEYS.DEMO_MODE);
    setIsDemoModeActive(false);
    toast.success("Demo mode cleared.");
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl bg-orange-500 px-5 py-4 text-white shadow-sm">
        <div className="flex gap-3">
          <AlertTriangleIcon className="mt-0.5 size-5 shrink-0" />
          <p className="text-sm font-bold leading-6">
            ⚠️ TruckFixr OS uses browser local storage for data persistence in
            Version 1. Clearing your browser cache will permanently delete all
            data. Export regular JSON backups using the Export All Data button
            below. Upgrade to Supabase before storing critical business data.
          </p>
        </div>
      </section>

      {isDemoModeActive ? (
        <section className="rounded-xl border border-orange-200 bg-orange-50 px-5 py-3 text-sm font-bold text-[#9d4300]">
          Demo data only — not real customer or investor information.
        </section>
      ) : null}

      <section>
        <h2 className="text-4xl font-bold leading-tight text-slate-950">
          System Configuration
        </h2>
        <p className="mt-1 text-[#584237]">
          Manage company defaults, data backups, demo mode, and future
          integrations.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.9fr_0.9fr]">
        <div className="flex flex-col gap-6">
          <article className="rounded-xl border border-[#e0c0b1] bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <Building2Icon className="size-6 text-[#9d4300]" />
              <h3 className="text-2xl font-bold text-slate-950">
                Company Defaults
              </h3>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {companyFields.map((field) => (
                <div
                  className={
                    field.multiline
                      ? "flex flex-col gap-2 md:col-span-2"
                      : "flex flex-col gap-2"
                  }
                  key={field.key}
                >
                  <Label htmlFor={field.key}>{field.label}</Label>
                  {field.multiline ? (
                    <Textarea
                      className="min-h-24 border-[#e0c0b1] bg-[#f7f9fb] focus-visible:ring-orange-500"
                      id={field.key}
                      value={settings[field.key]}
                      onChange={(event) =>
                        handleSettingChange(field.key, event.target.value)
                      }
                    />
                  ) : (
                    <Input
                      className="h-12 border-[#e0c0b1] bg-[#f7f9fb] focus-visible:ring-orange-500"
                      id={field.key}
                      value={settings[field.key]}
                      onChange={(event) =>
                        handleSettingChange(field.key, event.target.value)
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-[#e0c0b1] bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-950">
                Safety Rules
              </h3>
              <LockIcon className="size-5 text-slate-400" />
            </div>
            <div className="flex flex-col gap-3">
              {safetyRules.map((rule) => (
                <div
                  className="rounded-lg border border-[#e0c0b1] bg-slate-100/80 p-4 text-sm font-semibold text-slate-950"
                  key={rule}
                >
                  {rule}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-[#e0c0b1] bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-2xl font-bold text-slate-950">
              Future Integrations
            </h3>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {futureIntegrations.map((integration) => (
                <div
                  className="rounded-xl border border-slate-300 bg-slate-50 p-5 text-slate-500"
                  key={integration.name}
                >
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div className="flex size-11 items-center justify-center rounded-lg bg-white">
                      <DatabaseIcon className="size-5" />
                    </div>
                    <span className="rounded bg-slate-200 px-3 py-1 text-xs font-bold uppercase">
                      {integration.status}
                    </span>
                  </div>
                  <p className="text-lg font-bold">{integration.name}</p>
                  <p className="mt-1 text-sm font-semibold">Disabled</p>
                </div>
              ))}
            </div>
          </article>
        </div>

        <aside className="flex flex-col gap-6">
          <article className="rounded-xl border border-[#e0c0b1] bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-2xl font-bold text-slate-950">
              Data Management
            </h3>
            <div className="flex flex-col gap-4">
              <Button
                className="h-14 justify-start rounded-lg border-[#e0c0b1] bg-[#f7f9fb] px-5 text-slate-950 hover:bg-slate-50"
                variant="outline"
                onClick={handleExportAllData}
              >
                <DownloadIcon className="mr-3 size-5" />
                Export All Data (JSON)
              </Button>
              <Button
                className="h-14 justify-start rounded-lg border-[#e0c0b1] bg-[#f7f9fb] px-5 text-slate-950 hover:bg-slate-50"
                variant="outline"
                onClick={handleImportClick}
              >
                <UploadIcon className="mr-3 size-5" />
                Import Data from JSON backup
              </Button>
              <input
                ref={importInputRef}
                accept="application/json,.json"
                className="hidden"
                type="file"
                onChange={handleImportFile}
              />
              <div className="h-px bg-[#e0c0b1]" />
              <Button
                className="h-14 justify-start rounded-lg border-red-200 bg-white px-5 font-bold text-red-600 hover:bg-red-50"
                variant="outline"
                onClick={() => setIsClearDialogOpen(true)}
              >
                <Trash2Icon className="mr-3 size-5" />
                Clear All Data
              </Button>
            </div>
          </article>

          <article className="rounded-xl border border-[#e0c0b1] bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <RocketIcon className="size-6 text-[#9d4300]" />
              <h3 className="text-2xl font-bold text-slate-950">Demo Mode</h3>
            </div>
            <p className="mb-6 text-[#584237]">
              Load or clear the demo-mode flag without overwriting real module
              data.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                className="h-11 rounded-lg bg-slate-950 px-6 font-bold text-white hover:bg-slate-800"
                onClick={handleLoadDemoData}
              >
                Load Demo Data
              </Button>
              <Button
                className="h-11 rounded-lg border-[#e0c0b1] px-6"
                variant="outline"
                onClick={handleClearDemoData}
              >
                Clear Demo Data
              </Button>
            </div>
          </article>

          <article className="rounded-xl border border-[#e0c0b1] bg-white/70 p-6 text-slate-500 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <BotIcon className="size-6" />
                <h3 className="text-2xl font-bold">API Settings</h3>
              </div>
              <button
                aria-checked="false"
                aria-label="Enable live AI generation"
                className="h-7 w-12 rounded-full bg-slate-200 p-1"
                disabled
                role="switch"
                type="button"
              >
                <span className="block size-5 rounded-full bg-slate-400" />
              </button>
            </div>
            <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm font-bold text-slate-700">
                Enable live AI generation
              </p>
              <p className="mt-1 text-xs font-semibold uppercase text-slate-400">
                Off
              </p>
            </div>
            <p className="text-sm font-semibold">
              Experimental. All modules work without API keys using built-in
              templates.
            </p>
          </article>
        </aside>
      </section>

      <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear all local data?</DialogTitle>
            <DialogDescription>
              This removes all TruckFixr OS data stored in this browser,
              including settings, prospects, module data, and demo mode.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleClearAllData}
            >
              Clear All Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
