/**
 * Data-mode + Supabase environment validation.
 *
 * Allowed modes (NEXT_PUBLIC_DATA_MODE):
 *  - "local"    (default) localStorage only; no Supabase required
 *  - "demo"     fictional demo data; no Supabase required
 *  - "supabase" reads/writes Supabase; requires URL + anon key
 *
 * SECURITY: only NEXT_PUBLIC_* variables may be referenced here.
 * Service role keys and AI provider keys must never reach the browser.
 */

export type DataMode = "local" | "demo" | "supabase";

const VALID_MODES: DataMode[] = ["local", "demo", "supabase"];

export function getDataMode(): DataMode {
  const raw = (process.env.NEXT_PUBLIC_DATA_MODE ?? "local").toLowerCase();
  return (VALID_MODES as string[]).includes(raw) ? (raw as DataMode) : "local";
}

export function getSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || undefined;
}

export function getSupabaseAnonKey(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || undefined;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export const SUPABASE_CONFIG_ERROR =
  "Supabase mode is enabled, but Supabase environment variables are missing. " +
  "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, or switch " +
  "NEXT_PUBLIC_DATA_MODE to local.";

/**
 * Returns a human-readable configuration error for the current mode,
 * or null when the configuration is valid.
 */
export function getDataModeConfigError(): string | null {
  if (getDataMode() === "supabase" && !isSupabaseConfigured()) {
    return SUPABASE_CONFIG_ERROR;
  }
  return null;
}
