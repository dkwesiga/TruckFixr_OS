"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  LogInIcon,
  WrenchIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DASHBOARD_AUTH_KEY,
  DASHBOARD_HOME_PATH,
} from "@/lib/storage";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  useEffect(() => {
    if (window.sessionStorage.getItem(DASHBOARD_AUTH_KEY) === "true") {
      router.replace(DASHBOARD_HOME_PATH);
    }
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    // SECURITY NOTE: NEXT_PUBLIC_ variables are exposed in the browser bundle.
    // This password gate provides basic access control only.
    // Upgrade to Supabase Auth before storing real customer or financial data.
    const expectedPassword =
      process.env.NEXT_PUBLIC_INTERNAL_DASHBOARD_PASSWORD ?? "truckfixr-dev";

    if (password === expectedPassword) {
      window.sessionStorage.setItem(DASHBOARD_AUTH_KEY, "true");
      router.replace(DASHBOARD_HOME_PATH);
      return;
    }

    setErrorMessage("Incorrect password");
    setIsSubmitting(false);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-slate-100">
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute -left-24 -top-24 size-96 rounded-full bg-orange-500 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 size-[34rem] rounded-full bg-slate-500 blur-3xl" />
      </div>

      <section className="relative z-10 w-full max-w-[440px]">
        <div className="overflow-hidden rounded-xl bg-white px-8 py-12 text-slate-950 shadow-2xl shadow-black/30 sm:px-12">
          <div className="mb-8 text-center">
            <div className="mb-3 flex items-center justify-center gap-3">
              <WrenchIcon className="size-8 text-[#9d4300]" />
              <h1 className="text-3xl font-bold leading-10">
                TruckFixr AI <span className="text-orange-500">OS</span>
              </h1>
            </div>
            <p className="text-sm text-slate-500">
              Internal operating system for TruckFixr Fleet AI
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label
                className="text-xs font-bold uppercase tracking-wide text-slate-900"
                htmlFor="password"
              >
                Access Key
              </Label>
              <div className="relative">
                <Input
                  className="h-12 rounded-lg border-[#e0c0b1] bg-[#f7f9fb] pr-11 text-slate-950 placeholder:text-slate-400 focus-visible:ring-orange-500"
                  id="password"
                  type={isPasswordVisible ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter internal password"
                  autoComplete="current-password"
                />
                <button
                  aria-label={
                    isPasswordVisible ? "Hide password" : "Show password"
                  }
                  className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center rounded p-1 text-slate-500 transition-colors hover:text-orange-600"
                  type="button"
                  onClick={() => setIsPasswordVisible((current) => !current)}
                >
                  {isPasswordVisible ? (
                    <EyeOffIcon className="size-5" />
                  ) : (
                    <EyeIcon className="size-5" />
                  )}
                </button>
              </div>
            </div>

            {errorMessage ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {errorMessage}
              </p>
            ) : null}

            <Button
              className="h-12 w-full rounded-lg bg-orange-500 font-bold text-white shadow-lg shadow-orange-900/20 transition-all hover:bg-[#9d4300] active:scale-[0.98]"
              disabled={isSubmitting}
              type="submit"
            >
              Login
              <LogInIcon data-icon="inline-end" />
            </Button>

            <p className="flex items-center justify-center gap-1 text-center text-xs font-semibold leading-relaxed text-slate-400">
              <LockIcon className="size-3" />
              Basic internal protection only. Not suitable for production use
              with sensitive data.
            </p>
          </form>

          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="h-px w-16 bg-slate-200" />
            <div className="flex gap-6 font-mono text-xs text-slate-500">
              <span>V2.4.0-STABLE</span>
              <span>HELP_DESK</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between px-1 text-xs font-bold uppercase tracking-widest text-slate-500">
          <div className="flex items-center gap-2 normal-case tracking-normal text-slate-400">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-green-500" />
            </span>
            Core AI Online
          </div>
          <span>Fleet Reliability Engine</span>
        </div>
      </section>
    </main>
  );
}
