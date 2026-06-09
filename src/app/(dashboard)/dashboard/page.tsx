import {
  ActivityIcon,
  ArrowUpRightIcon,
  Clock3Icon,
  TargetIcon,
} from "lucide-react";

import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { overviewMetrics, workstreams } from "@/lib/demo-data";

const metricIcons = [TargetIcon, ArrowUpRightIcon, ActivityIcon, Clock3Icon];

export default function CommandCenterPage() {
  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewMetrics.map((metric, index) => {
          const Icon = metricIcons[index];

          return (
            <Card key={metric.label} className="border bg-card">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardDescription>{metric.label}</CardDescription>
                  <Icon className="size-4 text-muted-foreground" />
                </div>
                <CardTitle>{metric.value}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">
                  {metric.trend}
                </span>
                <StatusBadge status={metric.status} />
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="border bg-card">
          <CardHeader>
            <CardTitle>Cross-functional workstreams</CardTitle>
            <CardDescription>
              Current placeholder operating items across the business.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workstream</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>ETA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workstreams.map((workstream) => (
                  <TableRow key={workstream.name}>
                    <TableCell className="font-medium">
                      {workstream.name}
                    </TableCell>
                    <TableCell>{workstream.owner}</TableCell>
                    <TableCell>
                      <StatusBadge status={workstream.status} />
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={workstream.priority} />
                    </TableCell>
                    <TableCell>{workstream.eta}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border bg-card">
          <CardHeader>
            <CardTitle>Execution snapshot</CardTitle>
            <CardDescription>
              A clean home for weekly priorities, blockers, and questions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="next">
              <TabsList>
                <TabsTrigger value="next">Next 7 days</TabsTrigger>
                <TabsTrigger value="questions">Open questions</TabsTrigger>
              </TabsList>
              <TabsContent className="mt-4" value="next">
                <div className="flex flex-col gap-3">
                  <div className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
                    Finalize which real modules land first in Sales, Evidence,
                    and Funding.
                  </div>
                  <div className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
                    Decide whether auth graduates from localStorage to real
                    session handling in the next pass.
                  </div>
                </div>
              </TabsContent>
              <TabsContent className="mt-4" value="questions">
                <div className="flex flex-col gap-3">
                  <div className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
                    Which workspace needs live data first?
                  </div>
                  <div className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
                    What export formats matter beyond JSON?
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
