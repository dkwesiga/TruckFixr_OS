"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { bootstrapWorkspace } from "@/lib/data/bootstrap";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { exchangeCodeForSession } from "@/lib/supabase/auth";
import { DASHBOARD_AUTH_KEY, DASHBOARD_HOME_PATH } from "@/lib/storage";

function Spinner() {
  return (
    <div className="size-6 animate-spin rounded-full border-2 border-slate-600 border-t-orange-500" />
  );
}

function AuthCallbackInner() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let completed = false;
    const supabase = getSupabaseBrowserClient();

    async function completeSignIn(userId: string, email: string) {
      if (cancelled || completed) return;
      completed = true;
      try {
        await bootstrapWorkspace(userId, email);
        window.sessionStorage.setItem(DASHBOARD_AUTH_KEY, "true");
        router.replace(DASHBOARD_HOME_PATH);
      } catch (err) {
        completed = false;
        setErrorMsg(
          err instanceof Error ? err.message : "Account setup failed.",
        );
      }
    }

    // Subscribe first so we catch SIGNED_IN regardless of flow type.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session) {
        void completeSignIn(session.user.id, session.user.email ?? "");
      }
    });

    // A session may already be in storage (e.g. link opened twice, or the
    // hash was processed before this subscription) — fires INITIAL_SESSION,
    // not SIGNED_IN, so check explicitly.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        void completeSignIn(
          data.session.user.id,
          data.session.user.email ?? "",
        );
      }
    });

    // PKCE flow: code in ?code= query param needs to be exchanged first,
    // which will trigger SIGNED_IN above.
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) {
      exchangeCodeForSession(code).catch((err) => {
        if (!cancelled) {
          setErrorMsg(
            err instanceof Error ? err.message : "Authentication failed.",
          );
          subscription.unsubscribe();
        }
      });
    }

    // Timeout guard: magic link tokens expire; don't hang forever.
    const timeout = setTimeout(() => {
      if (!cancelled) {
        setErrorMsg(
          "Sign-in timed out. Your magic link may have expired — please request a new one.",
        );
        subscription.unsubscribe();
      }
    }, 15_000);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  if (errorMsg) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 px-4 text-center">
        <p className="max-w-sm text-sm text-red-400">{errorMsg}</p>
        <a href="/login" className="text-sm text-orange-400 underline">
          Back to login
        </a>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-950 text-slate-300">
      <Spinner />
      <p className="text-sm">Signing you in&hellip;</p>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-950">
          <Spinner />
        </main>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
