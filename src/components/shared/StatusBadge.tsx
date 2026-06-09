import { Badge } from "@/components/ui/badge";
import { type WorkstreamStatus } from "@/lib/types";

const statusVariantMap: Record<
  WorkstreamStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  "On Track": "default",
  Watching: "secondary",
  "At Risk": "destructive",
  Planned: "outline",
};

export function StatusBadge({ status }: { status: WorkstreamStatus }) {
  return <Badge variant={statusVariantMap[status]}>{status}</Badge>;
}
