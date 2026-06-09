export type WorkstreamStatus = "On Track" | "Watching" | "At Risk" | "Planned";

export type WorkstreamPriority = "Critical" | "High" | "Medium" | "Low";

export type NavItem = {
  title: string;
  href: string;
  description: string;
};

export type OverviewMetric = {
  label: string;
  value: string;
  trend: string;
  status: WorkstreamStatus;
};

export type Workstream = {
  name: string;
  owner: string;
  status: WorkstreamStatus;
  priority: WorkstreamPriority;
  eta: string;
};

export type PlaceholderSectionKey =
  | "sales"
  | "marketing"
  | "funding"
  | "engineering"
  | "evidence"
  | "partnerships"
  | "roadmap";

export type PlaceholderPageData = {
  title: string;
  summary: string;
  focusAreas: string[];
  nextMilestones: string[];
  status: WorkstreamStatus;
  priority: WorkstreamPriority;
};

export type PageMeta = {
  title: string;
  description: string;
};
