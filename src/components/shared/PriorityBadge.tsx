import { Badge } from "@/components/ui/badge";
import { type WorkstreamPriority } from "@/lib/types";

const priorityVariantMap: Record<
  WorkstreamPriority,
  "default" | "secondary" | "destructive" | "outline"
> = {
  Critical: "destructive",
  High: "default",
  Medium: "secondary",
  Low: "outline",
};

export function PriorityBadge({
  priority,
}: {
  priority: WorkstreamPriority;
}) {
  return <Badge variant={priorityVariantMap[priority]}>{priority}</Badge>;
}
