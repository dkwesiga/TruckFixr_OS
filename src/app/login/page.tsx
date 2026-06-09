"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyholeIcon, ShieldCheckIcon, WrenchIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DASHBOARD_AUTH_KEY,
  DASHBOARD_HOME_PATH,
} from "@/lib/storage";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export default function LoginPage() {
  const router = useRouter();
  const { value: isAuthenticated, setValue, isReady } = useLocalStorage(
    DASHBOARD_AUTH_KEY,
    false
  );
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isReady && isAuthenticated) {
      router.replace(DASHBOARD_HOME_PATH);
    }
  }, [isAuthenticated, isReady, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const expectedPassword =
      process.env.NEXT_PUBLIC_INTERNAL_DASHBOARD_PASSWORD ?? "";

    if (password === expectedPassword) {
      setValue(true);
      toast.success("Access granted.");
      router.replace(DASHBOARD_HOME_PATH);
      return;
    }

    toast.error("Incorrect dashboard password.");
    setIsSubmitting(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <Card className="w-full max-w-md border bg-background">
        <CardHeader>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <WrenchIcon className="size-5" />
            </div>
            <div>
              <CardTitle>TruckFixr OS</CardTitle>
              <CardDescription>Internal dashboard access</CardDescription>
            </div>
          </div>
          <div className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
            Use the internal password to unlock the placeholder operating
            system. This scaffold stores access locally in your browser.
          </div>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Dashboard password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter internal password"
                autoComplete="current-password"
              />
            </div>
            <Button disabled={isSubmitting} type="submit">
              <LockKeyholeIcon data-icon="inline-start" />
              Unlock workspace
            </Button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheckIcon className="size-3.5" />
              Password source:{" "}
              <code>NEXT_PUBLIC_INTERNAL_DASHBOARD_PASSWORD</code>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
