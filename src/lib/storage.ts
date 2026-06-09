export const DASHBOARD_AUTH_KEY = "tf_os_auth";
export const DASHBOARD_HOME_PATH = "/";
export const DASHBOARD_LOGIN_PATH = "/login";

export const STORAGE_KEYS = {
  SETTINGS: "tf_os_settings",
  PROSPECTS: "tf_os_prospects",
  CONTENT_ITEMS: "tf_os_content",
  FUNDING_OPPORTUNITIES: "tf_os_funding",
  RD_EVIDENCE: "tf_os_rd_evidence",
  INVESTORS: "tf_os_investors",
  ENGINEERING_TASKS: "tf_os_engineering",
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
}

export function removeItem(key: string): void {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.removeItem(key);
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
