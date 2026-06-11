"use client";

/**
 * Browser-side Supabase Auth helpers.
 * Only call these from client components or the auth callback page.
 */

import { getSupabaseBrowserClient } from "./client";

export async function signInWithMagicLink(email: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      shouldCreateUser: true,
    },
  });
  if (error) throw error;
}

export async function exchangeCodeForSession(code: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  await supabase.auth.signOut();
}
