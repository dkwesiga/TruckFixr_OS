import { ArrowRightIcon, CheckCircle2Icon, ClipboardListIcon } from "lucide-react";

import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { placeholderPages } from "@/lib/demo-data";
import { type PlaceholderSectionKey } from "@/lib/types";

export function PlaceholderPage({
  section,
}: {
  section: PlaceholderSectionKey;
}) {
  const data = placeholderPages[section];

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[#e0c0b1] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <h2 className="text-3xl font-bold leading-10 text-slate-950">
                {data.title}
              </h2>
              <StatusBadge status={data.status} />
              <PriorityBadge priority={data.priority} />
            </div>
            <p className="text-sm leading-6 text-[#584237]">{data.summary}</p>
          </div>
          <div className="rounded-lg border border-[#e0c0b1] bg-[#f7f9fb] px-4 py-3 text-sm font-semibold text-[#584237]">
            Placeholder route is live and ready for real data wiring.
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-[#e0c0b1] bg-white shadow-sm">
          <header className="flex items-center gap-3 border-b border-[#e0c0b1] bg-slate-100/70 px-5 py-4">
            <CheckCircle2Icon className="size-5 text-[#9d4300]" />
            <div>
              <h3 className="font-bold text-slate-950">Focus Areas</h3>
              <p className="text-xs text-[#584237]">
                What this workspace should hold first.
              </p>
            </div>
          </header>
          <div className="space-y-3 p-5">
            {data.focusAreas.map((focusArea) => (
              <div
                className="flex items-start gap-3 rounded-lg border border-[#e0c0b1] bg-[#f7f9fb] p-4"
                key={focusArea}
              >
                <span className="mt-1 size-2 rounded-full bg-orange-500" />
                <p className="text-sm leading-6 text-slate-900">{focusArea}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="overflow-hidden rounded-xl border border-[#e0c0b1] bg-white shadow-sm">
          <header className="flex items-center gap-3 border-b border-[#e0c0b1] bg-slate-100/70 px-5 py-4">
            <ClipboardListIcon className="size-5 text-[#584237]" />
            <div>
              <h3 className="font-bold text-slate-950">Next Milestones</h3>
              <p className="text-xs text-[#584237]">
                Useful near-term placeholders for the eventual module.
              </p>
            </div>
          </header>
          <div className="divide-y divide-[#e0c0b1]">
            {data.nextMilestones.map((milestone) => (
              <div
                className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
                key={milestone}
              >
                <ArrowRightIcon className="mt-1 size-4 text-[#9d4300]" />
                <p className="text-sm leading-6 text-slate-900">{milestone}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
