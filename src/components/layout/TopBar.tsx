"use client";

import { usePathname } from "next/navigation";
import { FileTextIcon, ShieldCheckIcon } from "lucide-react";

import { CopyButton } from "@/components/shared/CopyButton";
import { ExportButton } from "@/components/shared/ExportButton";
import { MobileNav } from "@/components/layout/MobileNav";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deploymentNotes, getPageMeta } from "@/lib/demo-data";

export function TopBar() {
  const pathname = usePathname();
  const meta = getPageMeta(pathname);

  return (
    <header className="border-b bg-background/95 px-4 py-4 backdrop-blur sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <MobileNav />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{meta.title}</h1>
              <ShieldCheckIcon className="size-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">{meta.description}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CopyButton
            label="Copy brief"
            text={`${meta.title}: ${meta.description}`}
          />
          <ExportButton />
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FileTextIcon data-icon="inline-start" />
                Deploy notes
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>TruckFixr OS scaffold notes</DialogTitle>
                <DialogDescription>
                  A quick reference for what this starter currently includes.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                {deploymentNotes.map((note) => (
                  <div
                    key={note}
                    className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground"
                  >
                    {note}
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
