import {
  deploymentNotes,
  navigationItems,
  overviewMetrics,
  workstreams,
} from "@/lib/demo-data";

export function buildWorkspaceSnapshot() {
  return {
    exportedAt: new Date().toISOString(),
    navigationItems,
    overviewMetrics,
    workstreams,
    deploymentNotes,
  };
}

export function downloadJson(filename: string, data: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}
