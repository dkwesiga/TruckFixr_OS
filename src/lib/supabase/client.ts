"use client";

/**
 * Browser-side Supabase client (anon key only).
 *
 * SECURITY: this module must only ever use NEXT_PUBLIC_* values.
 * Never import the service role key here.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  SUPABASE_CONFIG_ERROR,
} from "@/lib/supabase/env";

// NOTE: the client is intentionally untyped until generated types
// replace src/lib/supabase/types.ts (see that file's header). The
// data layer casts rows to the hand-written Row types explicitly.
let browserClient: SupabaseClient | null = null;

/**
 * Returns a singleton browser Supabase client, or throws a clear
 * setup error when Supabase env vars are missing. Callers in the
 * data layer catch this and surface it in the UI instead of crashing.
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  if (!url || !anonKey) {
    throw new Error(SUPABASE_CONFIG_ERROR);
  }

  if (!browserClient) {
    browserClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  return browserClient;
}
