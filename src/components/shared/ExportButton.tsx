"use client";

import { DownloadIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { buildWorkspaceSnapshot, downloadJson } from "@/lib/export";

export function ExportButton() {
  function handleExport() {
    downloadJson("truckfixr-os-snapshot.json", buildWorkspaceSnapshot());
    toast.success("Workspace snapshot exported.");
  }

  return (
    <Button onClick={handleExport} variant="outline" size="sm">
      <DownloadIcon data-icon="inline-start" />
      Export
    </Button>
  );
}
