import {
  deploymentNotes,
  navigationItems,
  overviewMetrics,
  workstreams,
} from "@/lib/demo-data";

function downloadBlob(blob: Blob, filename: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function escapeCsvValue(value: unknown): string {
  const stringValue =
    value === null || value === undefined
      ? ""
      : typeof value === "object"
        ? JSON.stringify(value)
        : String(value);

  return `"${stringValue.replaceAll('"', '""')}"`;
}

export function exportToCSV(data: object[], filename: string): void {
  const headers = Array.from(
    data.reduce<Set<string>>((keys, row) => {
      Object.keys(row).forEach((key) => keys.add(key));
      return keys;
    }, new Set<string>())
  );

  const rows = data.map((row) => {
    const record = row as Record<string, unknown>;

    return headers.map((header) => escapeCsvValue(record[header])).join(",");
  });

  const csv = [headers.map(escapeCsvValue).join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });

  downloadBlob(blob, filename);
}

export function exportToJSON(data: object, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json;charset=utf-8",
  });

  downloadBlob(blob, filename);
}

export function exportToMarkdown(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });

  downloadBlob(blob, filename);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

export function buildWorkspaceSnapshot() {
  return {
    exportedAt: new Date().toISOString(),
    navigationItems,
    overviewMetrics,
    workstreams,
    deploymentNotes,
  };
}

export function downloadJson(filename: string, data: object) {
  exportToJSON(data, filename);
}
