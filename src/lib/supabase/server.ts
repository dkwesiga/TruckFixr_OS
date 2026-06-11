/**
 * Server-side Supabase clients.
 *
 * SECURITY:
 *  - This module must NEVER be imported from a "use client" file.
 *  - SUPABASE_SERVICE_ROLE_KEY bypasses RLS — server-only, and only
 *    for trusted operations (migrations tooling, future API routes,
 *    scheduled jobs). It is intentionally NOT prefixed NEXT_PUBLIC_.
 *
 * The current app is fully client-rendered, so nothing imports this
 * yet. It exists so future server routes / actions have a vetted
 * entry point.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function assertServerOnly() {
  if (typeof window !== "undefined") {
    throw new Error(
      "supabase/server.ts was imported in the browser. Use getSupabaseBrowserClient() from supabase/client.ts instead."
    );
  }
}

/**
 * Anon-key server client: respects RLS, suitable for SSR reads with
 * a user JWT attached later.
 */
export function getSupabaseServerClient(): SupabaseClient {
  assertServerOnly();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase server client requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}

/**
 * Service-role client: bypasses RLS. Server-only, trusted code paths
 * only. Returns a fresh client per call on purpose (no shared state).
 */
export function getSupabaseAdminClient(): SupabaseClient {
  assertServerOnly();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase admin client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (server-side only)."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
