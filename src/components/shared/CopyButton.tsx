"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type CopyButtonProps = {
  text: string;
  label?: string;
};

export function CopyButton({
  text,
  label = "Copy summary",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard.");
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Button onClick={handleCopy} variant="outline" size="sm">
      {copied ? (
        <CheckIcon data-icon="inline-start" />
      ) : (
        <CopyIcon data-icon="inline-start" />
      )}
      {label}
    </Button>
  );
}
