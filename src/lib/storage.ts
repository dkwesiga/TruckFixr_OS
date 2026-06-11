export const DASHBOARD_AUTH_KEY = "tf_os_auth";
export const DASHBOARD_HOME_PATH = "/";
export const DASHBOARD_LOGIN_PATH = "/login";

export const STORAGE_KEYS = {
  DASHBOARD_WEEKLY_PANEL: "tf_os_dashboard_weekly_panel",
  SETTINGS: "tf_os_settings",
  PROSPECTS: "tf_os_prospects",
  SALES_ACTIVITY_LOGS: "tf_os_sales_activity_logs",
  CONTENT_ITEMS: "tf_os_content",
  MARKETING_WEEKLY_PLAN: "tf_os_marketing_weekly_plan",
  FUNDING_OPPORTUNITIES: "tf_os_funding",
  RD_EVIDENCE: "tf_os_rd_evidence",
  INVESTORS: "tf_os_investors",
  ENGINEERING_TASKS: "tf_os_engineering",
  ENGINEERING_SPRINT_PLAN: "tf_os_engineering_sprint_plan",
  ROADMAP_ITEMS: "tf_os_roadmap",
  PILOT_EVIDENCE: "tf_os_pilot_evidence",
  PARTNERSHIPS: "tf_os_partnerships",
  DEMO_MODE: "tf_os_demo_mode",
} as const;

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

type ExportSnapshot = {
  exportedAt: string;
  version: 1;
  data: Partial<Record<StorageKey, unknown>>;
};

function canUseLocalStorage() {
  return typeof window !== "undefined" && "localStorage" in window;
}

function notifyStorageChange(key: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent("tf_os_storage_change", {
      detail: { key },
    })
  );
}

export function getItem<T>(key: string): T | null {
  if (!canUseLocalStorage()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(key);

  if (rawValue === null) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return rawValue as T;
  }
}

export function setItem<T>(key: string, value: T): void {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
  notifyStorageChange(key);
}

export function removeItem(key: string): void {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.removeItem(key);
  notifyStorageChange(key);
}

export function exportAllData(): ExportSnapshot {
  const data: Partial<Record<StorageKey, unknown>> = {};

  if (canUseLocalStorage()) {
    Object.values(STORAGE_KEYS).forEach((key) => {
      const value = getItem<unknown>(key);

      if (value !== null) {
        data[key] = value;
      }
    });
  }

  return {
    exportedAt: new Date().toISOString(),
    version: 1,
    data,
  };
}

export function importAllData(data: object): void {
  if (!canUseLocalStorage()) {
    return;
  }

  const maybeSnapshot = data as Partial<ExportSnapshot> &
    Partial<Record<StorageKey, unknown>>;
  const source =
    maybeSnapshot.data && typeof maybeSnapshot.data === "object"
      ? maybeSnapshot.data
      : maybeSnapshot;

  Object.values(STORAGE_KEYS).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      setItem(key, source[key]);
    }
  });
}

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => removeItem(key));
}
