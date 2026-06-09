"use client";

import { useState } from "react";
import { CopyIcon, PencilIcon, RotateCcwIcon, SparklesIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { copyToClipboard } from "@/lib/export";
import { updateProspect } from "@/lib/prospects";
import {
  generateLLMPersonalizationPrompt,
  generateOutreachTemplates,
} from "@/lib/outreach-templates";
import {
  type CompanySettings,
  type Prospect,
} from "@/lib/types";

type DraftFieldKey =
  | "firstEmailDraft"
  | "linkedInConnectDraft"
  | "linkedInFollowUpDraft"
  | "phoneScript"
  | "cta";

type ProspectDraftsProps = {
  prospect: Prospect;
  settings: CompanySettings;
  onUpdated: () => void;
};

const draftCards: Array<{
  key: DraftFieldKey;
  label: string;
  outputType: "email" | "linkedin" | "phone";
}> = [
  { key: "firstEmailDraft", label: "First Email Draft", outputType: "email" },
  {
    key: "linkedInConnectDraft",
    label: "LinkedIn Connection Request",
    outputType: "linkedin",
  },
  {
    key: "linkedInFollowUpDraft",
    label: "LinkedIn Follow-Up",
    outputType: "linkedin",
  },
  { key: "phoneScript", label: "Phone Script", outputType: "phone" },
  { key: "cta", label: "CTA", outputType: "email" },
];

export function ProspectDrafts({
  prospect,
  settings,
  onUpdated,
}: ProspectDraftsProps) {
  const [editingKey, setEditingKey] = useState<DraftFieldKey | null>(null);
  const [draftValue, setDraftValue] = useState("");

  function startEditing(key: DraftFieldKey) {
    setEditingKey(key);
    setDraftValue(prospect[key] || "");
  }

  async function handleCopy(text: string) {
    const didCopy = await copyToClipboard(text);

    if (didCopy) {
      toast.success("Draft copied.");
      return;
    }

    toast.error("Clipboard copy failed.");
  }

  function handleSaveDraft() {
    if (!editingKey) {
      return;
    }

    updateProspect(prospect.id, {
      [editingKey]: draftValue,
    });
    setEditingKey(null);
    setDraftValue("");
    onUpdated();
    toast.success("Draft saved.");
  }

  function handleRegenerate(key: DraftFieldKey, outputType: "email" | "linkedin" | "phone") {
    const confirmed = window.confirm(
      "Regenerate this draft? Any manual edits to this field will be overwritten."
    );

    if (!confirmed) {
      return;
    }

    const templates = generateOutreachTemplates(prospect, settings);
    const llmPersonalizationPrompt = generateLLMPersonalizationPrompt(
      prospect,
      settings,
      outputType
    );

    updateProspect(prospect.id, {
      [key]: templates[key],
      llmPersonalizationPrompt,
    });
    onUpdated();
    toast.success("Draft regenerated.");
  }

  async function handleGeneratePrompt(outputType: "email" | "linkedin" | "phone") {
    const prompt = generateLLMPersonalizationPrompt(
      prospect,
      settings,
      outputType
    );
    updateProspect(prospect.id, { llmPersonalizationPrompt: prompt });
    onUpdated();

    const didCopy = await copyToClipboard(prompt);

    if (didCopy) {
      toast.success("LLM prompt copied.");
      return;
    }

    toast.error("Clipboard copy failed.");
  }

  return (
    <div className="flex max-h-[72vh] flex-col gap-4 overflow-y-auto pr-1">
      {draftCards.map((draftCard) => {
        const value = prospect[draftCard.key] || "Not generated yet.";
        const isEditing = editingKey === draftCard.key;

        return (
          <section
            className="rounded-xl border border-[#e0c0b1] bg-white p-4 shadow-sm"
            key={draftCard.key}
          >
            <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <h4 className="text-base font-bold text-slate-950">
                {draftCard.label}
              </h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(value)}
                >
                  <CopyIcon data-icon="inline-start" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => startEditing(draftCard.key)}
                >
                  <PencilIcon data-icon="inline-start" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleRegenerate(draftCard.key, draftCard.outputType)
                  }
                >
                  <RotateCcwIcon data-icon="inline-start" />
                  Regenerate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleGeneratePrompt(draftCard.outputType)}
                >
                  <SparklesIcon data-icon="inline-start" />
                  Generate LLM Prompt
                </Button>
              </div>
            </div>

            {isEditing ? (
              <div className="flex flex-col gap-3">
                <Textarea
                  className="min-h-32 border-[#e0c0b1] bg-[#f7f9fb]"
                  value={draftValue}
                  onChange={(event) => setDraftValue(event.target.value)}
                />
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingKey(null);
                      setDraftValue("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveDraft}>Save</Button>
                </div>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap rounded-lg bg-[#f7f9fb] p-3 font-sans text-sm leading-6 text-slate-800">
                {value}
              </pre>
            )}
          </section>
        );
      })}
    </div>
  );
}
