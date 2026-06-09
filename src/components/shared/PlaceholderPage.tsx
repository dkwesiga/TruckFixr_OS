import { ArrowRightIcon, CheckCircle2Icon } from "lucide-react";

import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { placeholderPages } from "@/lib/demo-data";
import { type PlaceholderSectionKey } from "@/lib/types";

export function PlaceholderPage({
  section,
}: {
  section: PlaceholderSectionKey;
}) {
  const data = placeholderPages[section];

  return (
    <div className="flex flex-col gap-6">
      <Card className="border bg-card/80">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{data.title}</CardTitle>
            <StatusBadge status={data.status} />
            <PriorityBadge priority={data.priority} />
          </div>
          <CardDescription>{data.summary}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border bg-background/60">
              <CardHeader>
                <CardTitle>Focus Areas</CardTitle>
                <CardDescription>
                  What this workspace should hold first.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {data.focusAreas.map((focusArea) => (
                    <div
                      key={focusArea}
                      className="flex items-start gap-3 rounded-lg border border-dashed p-3"
                    >
                      <CheckCircle2Icon className="mt-0.5 size-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {focusArea}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border bg-background/60">
              <CardHeader>
                <CardTitle>Next Milestones</CardTitle>
                <CardDescription>
                  Useful near-term placeholders for the eventual module.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    {data.nextMilestones.map((milestone) => (
                      <TableRow key={milestone}>
                        <TableCell className="w-8">
                          <ArrowRightIcon className="size-4 text-muted-foreground" />
                        </TableCell>
                        <TableCell className="whitespace-normal text-sm text-muted-foreground">
                          {milestone}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Placeholder route is live and ready for real data wiring.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
