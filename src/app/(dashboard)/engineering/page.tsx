"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  CheckSquareIcon,
  ClipboardListIcon,
  CopyIcon,
  FileOutputIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  SparklesIcon,
  Trash2Icon,
  WrenchIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  EngineeringTaskForm,
  type EngineeringTaskFormValues,
} from "@/components/engineering/EngineeringTaskForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  addEngineeringTask,
  deleteEngineeringTask,
  getEngineeringSprintPlan,
  getEngineeringTasks,
  saveEngineeringSprintPlan,
  updateEngineeringTask,
} from "@/lib/engineering";
import {
  engineeringPromptTypes,
  generateEngineeringPrompt,
  generateGitHubIssueMarkdown,
  generatePrChecklistMarkdown,
  generateSprintReport,
  type EngineeringPromptType,
} from "@/lib/engineering-prompts";
import {
  copyToClipboard,
  exportToCSV,
  exportToJSON,
  exportToMarkdown,
} from "@/lib/export";
import {
  type EngineeringSprintPlan,
  type EngineeringTask,
  type WorkstreamPriority,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const priorities: WorkstreamPriority[] = ["Low", "Medium", "High", "Critical"];

const affectedAreas: EngineeringTask["affectedArea"][] = [
  "Mobile UI",
  "Diagnostics",
  "Vehicle Management",
  "Onboarding",
  "Landing Page",
  "Supabase",
  "Security",
  "Payments",
  "Telematics",
  "Grant/R&D",
  "Dashboard",
  "Other",
];

const issueTypes: EngineeringTask["issueType"][] = [
  "Bug",
  "Feature",
  "Improvement",
  "Refactor",
  "Documentation",
  "Test",
  "Security",
  "Integration",
];

const statuses: EngineeringTask["status"][] = [
  "Planned",
  "In Progress",
  "Blocked",
  "Ready for Codex",
  "PR Drafted",
  "Review Needed",
  "Done",
  "Deferred",
];

const priorityClasses: Record<WorkstreamPriority, string> = {
  Low: "bg-slate-100 text-slate-700",
  Medium: "bg-blue-100 text-blue-700",
  High: "bg-orange-100 text-orange-700",
  Critical: "bg-red-100 text-red-700",
};

const statusClasses: Record<EngineeringTask["status"], string> = {
  Planned: "bg-slate-100 text-slate-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Blocked: "bg-red-100 text-red-700",
  "Ready for Codex": "bg-emerald-100 text-emerald-700",
  "PR Drafted": "bg-yellow-100 text-yellow-800",
  "Review Needed": "bg-purple-100 text-purple-700",
  Done: "bg-green-100 text-green-800",
  Deferred: "bg-slate-200 text-slate-700",
};

type EngineeringFilters = {
  search: string;
  priority: "" | WorkstreamPriority;
  status: "" | EngineeringTask["status"];
  issueType: "" | EngineeringTask["issueType"];
  affectedArea: "" | EngineeringTask["affectedArea"];
};

const emptyFilters: EngineeringFilters = {
  search: "",
  priority: "",
  status: "",
  issueType: "",
  affectedArea: "",
};

function sanitizeSprintPlan(
  plan: EngineeringSprintPlan,
  tasks: EngineeringTask[]
): EngineeringSprintPlan {
  const validIds = new Set(tasks.map((task) => task.id));

  return {
    taskIds: plan.taskIds.filter((taskId) => validIds.has(taskId)).slice(0, 5),
    generatedAt: plan.generatedAt,
  };
}

function countByStatus(tasks: EngineeringTask[], status: EngineeringTask["status"]) {
  return tasks.filter((task) => task.status === status).length;
}

function countByIssueType(tasks: EngineeringTask[], issueType: EngineeringTask["issueType"]) {
  return tasks.filter((task) => task.issueType === issueType).length;
}

function countDoneThisWeek(tasks: EngineeringTask[]) {
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  return tasks.filter((task) => {
    return task.status === "Done" && new Date(task.updatedDate).getTime() >= sevenDaysAgo;
  }).length;
}

function buildIssueFilename(task: EngineeringTask, suffix: string) {
  return `${task.title.toLowerCase().replace(/\s+/g, "-")}-${suffix}.md`;
}

export default function EngineeringPage() {
  const [tasks, setTasks] = useState<EngineeringTask[]>([]);
  const [filters, setFilters] = useState<EngineeringFilters>(emptyFilters);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [promptType, setPromptType] = useState<EngineeringPromptType>("Bug fix");
  const [sprintPlan, setSprintPlan] = useState<EngineeringSprintPlan>({
    taskIds: [],
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<EngineeringTask | null>(null);
  const [deletingTask, setDeletingTask] = useState<EngineeringTask | null>(null);
  const deferredSearch = useDeferredValue(filters.search);

  useEffect(() => {
    const storedTasks = getEngineeringTasks();
    const storedPlan = sanitizeSprintPlan(getEngineeringSprintPlan(), storedTasks);

    setTasks(storedTasks);
    setSprintPlan(storedPlan);
    saveEngineeringSprintPlan(storedPlan);

    if (storedTasks.length > 0) {
      setSelectedTaskId(storedTasks[0].id);
    }
  }, []);

  const filteredTasks = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    return tasks.filter((task) => {
      if (
        normalizedSearch &&
        !`${task.title} ${task.businessReason ?? ""} ${task.affectedArea}`
          .toLowerCase()
          .includes(normalizedSearch)
      ) {
        return false;
      }

      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }

      if (filters.status && task.status !== filters.status) {
        return false;
      }

      if (filters.issueType && task.issueType !== filters.issueType) {
        return false;
      }

      if (filters.affectedArea && task.affectedArea !== filters.affectedArea) {
        return false;
      }

      return true;
    });
  }, [deferredSearch, filters, tasks]);

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [selectedTaskId, tasks]
  );

  const selectedSprintTasks = useMemo(
    () => tasks.filter((task) => sprintPlan.taskIds.includes(task.id)),
    [sprintPlan.taskIds, tasks]
  );

  const generatedPrompt = useMemo(() => {
    if (!selectedTask) {
      return "";
    }

    return generateEngineeringPrompt(selectedTask, promptType);
  }, [promptType, selectedTask]);

  const sprintMarkdown = useMemo(() => {
    if (selectedSprintTasks.length === 0) {
      return "";
    }

    return generateSprintReport(selectedSprintTasks);
  }, [selectedSprintTasks]);

  const issueMarkdown = useMemo(() => {
    if (!selectedTask) {
      return "";
    }

    return generateGitHubIssueMarkdown(selectedTask);
  }, [selectedTask]);

  const prChecklistMarkdown = useMemo(() => {
    if (!selectedTask) {
      return "";
    }

    return generatePrChecklistMarkdown(selectedTask);
  }, [selectedTask]);

  const kpiCards = useMemo(
    () => [
      { label: "Total", value: tasks.length, className: "text-slate-700" },
      {
        label: "Critical",
        value: tasks.filter((task) => task.priority === "Critical").length,
        className: "text-red-700",
      },
      {
        label: "Bugs",
        value: countByIssueType(tasks, "Bug"),
        className: "text-orange-700",
      },
      {
        label: "Ready for Codex",
        value: countByStatus(tasks, "Ready for Codex"),
        className: "text-emerald-700",
      },
      {
        label: "Review Needed",
        value: countByStatus(tasks, "Review Needed"),
        className: "text-purple-700",
      },
      {
        label: "Done This Week",
        value: countDoneThisWeek(tasks),
        className: "text-green-800",
      },
    ],
    [tasks]
  );

  function refreshTasks() {
    const nextTasks = getEngineeringTasks();
    const nextPlan = sanitizeSprintPlan(sprintPlan, nextTasks);

    setTasks(nextTasks);
    setSprintPlan(nextPlan);
    saveEngineeringSprintPlan(nextPlan);

    if (!selectedTaskId && nextTasks.length > 0) {
      setSelectedTaskId(nextTasks[0].id);
      return;
    }

    if (selectedTaskId && !nextTasks.some((task) => task.id === selectedTaskId)) {
      setSelectedTaskId(nextTasks[0]?.id ?? "");
    }
  }

  function handleSave(values: EngineeringTaskFormValues) {
    if (editingTask) {
      updateEngineeringTask(editingTask.id, values);
      setSelectedTaskId(editingTask.id);
    } else {
      const newTask = addEngineeringTask(values);
      setSelectedTaskId(newTask.id);
    }

    refreshTasks();
    setIsFormOpen(false);
    setEditingTask(null);
  }

  function handleDeleteConfirmed() {
    if (!deletingTask) {
      return;
    }

    deleteEngineeringTask(deletingTask.id);
    setDeletingTask(null);
    refreshTasks();
    toast.success("Engineering task deleted.");
  }

  function updateFilter<K extends keyof EngineeringFilters>(
    key: K,
    value: EngineeringFilters[K]
  ) {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSprintToggle(taskId: string, checked: boolean) {
    const nextTaskIds = checked
      ? sprintPlan.taskIds.includes(taskId)
        ? sprintPlan.taskIds
        : [...sprintPlan.taskIds, taskId]
      : sprintPlan.taskIds.filter((id) => id !== taskId);

    if (nextTaskIds.length > 5) {
      toast.error("Select at most 5 sprint tasks.");
      return;
    }

    const nextPlan = {
      ...sprintPlan,
      taskIds: nextTaskIds,
    };

    setSprintPlan(nextPlan);
    saveEngineeringSprintPlan(nextPlan);
  }

  function handleGenerateSprintReport() {
    if (selectedSprintTasks.length < 3 || selectedSprintTasks.length > 5) {
      toast.error("Select between 3 and 5 tasks for the sprint report.");
      return;
    }

    const nextPlan = {
      ...sprintPlan,
      generatedAt: new Date().toISOString(),
    };
    setSprintPlan(nextPlan);
    saveEngineeringSprintPlan(nextPlan);
    toast.success("Sprint report generated.");
  }

  async function copyText(text: string, successMessage: string) {
    const didCopy = await copyToClipboard(text);

    if (didCopy) {
      toast.success(successMessage);
      return;
    }

    toast.error("Clipboard copy failed.");
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {kpiCards.map((card) => (
          <article
            className="rounded-xl border border-[#e0c0b1] bg-white p-5 shadow-sm"
            key={card.label}
          >
            <p className="text-xs font-bold uppercase tracking-wide text-[#584237]">
              {card.label}
            </p>
            <div className={cn("mt-3 text-3xl", card.className)}>
              {card.value}
            </div>
          </article>
        ))}
      </section>

      <Tabs className="space-y-6" defaultValue="tracker">
        <TabsList className="h-auto flex-wrap rounded-xl bg-white p-2 shadow-sm" variant="line">
          <TabsTrigger value="tracker">
            <WrenchIcon data-icon="inline-start" />
            Task Tracker
          </TabsTrigger>
          <TabsTrigger value="prompts">
            <SparklesIcon data-icon="inline-start" />
            Prompt Generator
          </TabsTrigger>
          <TabsTrigger value="sprint">
            <ClipboardListIcon data-icon="inline-start" />
            Sprint Planner
          </TabsTrigger>
          <TabsTrigger value="checklists">
            <CheckSquareIcon data-icon="inline-start" />
            Checklists
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tracker">
          <div className="space-y-6">
            <section className="rounded-xl border border-[#e0c0b1] bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                  <Input
                    className="h-11 border-[#e0c0b1] bg-[#f7f9fb] sm:max-w-sm"
                    placeholder="Search by title, reason, or area"
                    value={filters.search}
                    onChange={(event) =>
                      updateFilter("search", event.target.value)
                    }
                  />
                  <div className="flex flex-wrap gap-3">
                    <Select
                      value={filters.priority}
                      onValueChange={(value) =>
                        updateFilter("priority", value as EngineeringFilters["priority"])
                      }
                    >
                      <SelectTrigger className="h-11 w-[170px] border-[#e0c0b1] bg-[#f7f9fb]">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {priorities.map((priority) => (
                            <SelectItem key={priority} value={priority}>
                              {priority}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Select
                      value={filters.status}
                      onValueChange={(value) =>
                        updateFilter("status", value as EngineeringFilters["status"])
                      }
                    >
                      <SelectTrigger className="h-11 w-[190px] border-[#e0c0b1] bg-[#f7f9fb]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Select
                      value={filters.issueType}
                      onValueChange={(value) =>
                        updateFilter(
                          "issueType",
                          value as EngineeringFilters["issueType"]
                        )
                      }
                    >
                      <SelectTrigger className="h-11 w-[170px] border-[#e0c0b1] bg-[#f7f9fb]">
                        <SelectValue placeholder="Issue type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {issueTypes.map((issueType) => (
                            <SelectItem key={issueType} value={issueType}>
                              {issueType}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Select
                      value={filters.affectedArea}
                      onValueChange={(value) =>
                        updateFilter(
                          "affectedArea",
                          value as EngineeringFilters["affectedArea"]
                        )
                      }
                    >
                      <SelectTrigger className="h-11 w-[190px] border-[#e0c0b1] bg-[#f7f9fb]">
                        <SelectValue placeholder="Affected area" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {affectedAreas.map((affectedArea) => (
                            <SelectItem key={affectedArea} value={affectedArea}>
                              {affectedArea}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setFilters(emptyFilters)}>
                  Clear filters
                </Button>
              </div>

              <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="text-sm font-semibold text-[#584237]">
                  {filteredTasks.length} result
                  {filteredTasks.length === 1 ? "" : "s"} shown
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    className="bg-[#9d4300] text-white hover:bg-orange-600"
                    onClick={() => {
                      setEditingTask(null);
                      setIsFormOpen(true);
                    }}
                  >
                    <PlusIcon data-icon="inline-start" />
                    Add Task
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      exportToCSV(tasks, "truckfixr-os-engineering-tasks.csv")
                    }
                  >
                    <FileOutputIcon data-icon="inline-start" />
                    Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      exportToJSON(
                        { exportedAt: new Date().toISOString(), engineeringTasks: tasks },
                        "truckfixr-os-engineering-tasks.json"
                      )
                    }
                  >
                    <FileOutputIcon data-icon="inline-start" />
                    Export JSON
                  </Button>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-[#e0c0b1] bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1300px] border-collapse text-left">
                  <thead className="bg-slate-50 text-sm font-bold uppercase text-[#584237]">
                    <tr>
                      <th className="px-6 py-5">Task</th>
                      <th className="px-6 py-5">Area</th>
                      <th className="px-6 py-5">Issue Type</th>
                      <th className="px-6 py-5">Priority</th>
                      <th className="px-6 py-5">Status</th>
                      <th className="px-6 py-5">Updated</th>
                      <th className="px-6 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredTasks.length === 0 ? (
                      <tr>
                        <td
                          className="px-6 py-12 text-center text-sm font-semibold text-[#584237]"
                          colSpan={7}
                        >
                          No engineering tasks match the current search and filters.
                        </td>
                      </tr>
                    ) : (
                      filteredTasks.map((task) => (
                        <tr
                          className={cn(
                            "cursor-pointer hover:bg-slate-50",
                            selectedTaskId === task.id && "bg-orange-50/60"
                          )}
                          key={task.id}
                          onClick={() => setSelectedTaskId(task.id)}
                        >
                          <td className="px-6 py-5">
                            <div className="max-w-[340px]">
                              <div className="font-semibold text-slate-950">
                                {task.title}
                                {task.isDemo ? (
                                  <span className="ml-2 rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                                    Demo
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-1 text-xs text-[#584237]">
                                {task.businessReason ?? "No business reason added yet."}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-slate-700">
                            {task.affectedArea}
                          </td>
                          <td className="px-6 py-5 text-slate-700">
                            {task.issueType}
                          </td>
                          <td className="px-6 py-5">
                            <span
                              className={cn(
                                "rounded-full px-4 py-2 text-sm font-semibold",
                                priorityClasses[task.priority]
                              )}
                            >
                              {task.priority}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span
                              className={cn(
                                "rounded-full px-4 py-2 text-sm font-semibold",
                                statusClasses[task.status]
                              )}
                            >
                              {task.status}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-slate-600">
                            {new Date(task.updatedDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setEditingTask(task);
                                  setIsFormOpen(true);
                                }}
                              >
                                <PencilIcon data-icon="inline-start" />
                                Edit
                              </Button>
                              <Button
                                className="border-red-200 text-red-700 hover:bg-red-50"
                                size="sm"
                                variant="outline"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setDeletingTask(task);
                                }}
                              >
                                <Trash2Icon data-icon="inline-start" />
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="prompts">
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.4fr]">
            <section className="rounded-xl border border-[#e0c0b1] bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">
                Prompt Generator
              </h2>
              <p className="mt-1 text-sm text-[#584237]">
                Generate a structured Codex or review prompt from a selected engineering task.
              </p>
              <div className="mt-5 space-y-4">
                <div className="flex flex-col gap-2">
                  <LabelShim text="Selected task" />
                  <Select
                    value={selectedTaskId}
                    onValueChange={(value) => setSelectedTaskId(value)}
                  >
                    <SelectTrigger className="h-11 border-[#e0c0b1] bg-[#f7f9fb]">
                      <SelectValue placeholder="Select task" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {tasks.map((task) => (
                          <SelectItem key={task.id} value={task.id}>
                            {task.title}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <LabelShim text="Prompt type" />
                  <Select
                    value={promptType}
                    onValueChange={(value) =>
                      setPromptType(value as EngineeringPromptType)
                    }
                  >
                    <SelectTrigger className="h-11 border-[#e0c0b1] bg-[#f7f9fb]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {engineeringPromptTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {selectedTask ? (
                  <div className="rounded-xl border border-[#e0c0b1] bg-[#f7f9fb] p-4">
                    <p className="font-semibold text-slate-950">{selectedTask.title}</p>
                    <p className="mt-1 text-sm text-[#584237]">
                      {selectedTask.affectedArea} · {selectedTask.issueType} · {selectedTask.priority}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-[#e0c0b1] bg-[#f7f9fb] p-4 text-sm text-[#584237]">
                    Add or select a task to generate a prompt.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-[#e0c0b1] bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-950">Generated Prompt</h3>
                  <p className="text-sm text-[#584237]">
                    Includes task scope, required outputs, and safety rules.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      generatedPrompt
                        ? copyText(generatedPrompt, "Engineering prompt copied.")
                        : toast.error("Select a task first.")
                    }
                  >
                    <CopyIcon data-icon="inline-start" />
                    Copy Prompt
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      generatedPrompt && selectedTask
                        ? exportToMarkdown(
                            generatedPrompt,
                            buildIssueFilename(selectedTask, "codex-prompt")
                          )
                        : toast.error("Select a task first.")
                    }
                  >
                    <FileOutputIcon data-icon="inline-start" />
                    Export Markdown
                  </Button>
                </div>
              </div>
              <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap rounded-lg bg-[#f7f9fb] p-4 font-sans text-sm leading-6 text-slate-800">
                {generatedPrompt || "Select a task and prompt type to generate a structured engineering prompt."}
              </pre>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="sprint">
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.4fr]">
            <section className="rounded-xl border border-[#e0c0b1] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">Current Week</h2>
                  <p className="text-sm text-[#584237]">
                    Select 3 to 5 tasks to include in the sprint report.
                  </p>
                </div>
                <Badge className="border-transparent bg-[#f7f9fb] text-[#584237]" variant="secondary">
                  {selectedSprintTasks.length}/5 selected
                </Badge>
              </div>
              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#e0c0b1] bg-[#f7f9fb] p-4 text-sm text-[#584237]">
                    Add tasks first to build a sprint plan.
                  </div>
                ) : (
                  tasks.map((task) => (
                    <label
                      className="flex items-start gap-3 rounded-lg border border-[#e0c0b1] bg-[#f7f9fb] p-4"
                      key={task.id}
                    >
                      <input
                        checked={sprintPlan.taskIds.includes(task.id)}
                        className="mt-1 size-4 rounded border-[#e0c0b1]"
                        type="checkbox"
                        onChange={(event) =>
                          handleSprintToggle(task.id, event.target.checked)
                        }
                      />
                      <span className="min-w-0">
                        <span className="block font-semibold text-slate-950">
                          {task.title}
                        </span>
                        <span className="mt-1 block text-sm text-[#584237]">
                          {task.priority} · {task.affectedArea} · {task.status}
                        </span>
                      </span>
                    </label>
                  ))
                )}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button
                  className="bg-[#9d4300] text-white hover:bg-orange-600"
                  onClick={handleGenerateSprintReport}
                >
                  <SparklesIcon data-icon="inline-start" />
                  Generate Sprint Report
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    sprintMarkdown
                      ? copyText(sprintMarkdown, "Sprint report copied.")
                      : toast.error("Select 3 to 5 tasks first.")
                  }
                >
                  <CopyIcon data-icon="inline-start" />
                  Copy Report
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    sprintMarkdown
                      ? exportToMarkdown(
                          sprintMarkdown,
                          "truckfixr-os-engineering-sprint.md"
                        )
                      : toast.error("Select 3 to 5 tasks first.")
                  }
                >
                  <FileOutputIcon data-icon="inline-start" />
                  Export Markdown
                </Button>
              </div>
            </section>

            <section className="rounded-xl border border-[#e0c0b1] bg-white p-5 shadow-sm">
              <h3 className="text-xl font-bold text-slate-950">Sprint Markdown Report</h3>
              <p className="mb-4 text-sm text-[#584237]">
                Includes business rationale, impact summary, risks, expected outputs, and Codex prompts to run.
              </p>
              <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap rounded-lg bg-[#f7f9fb] p-4 font-sans text-sm leading-6 text-slate-800">
                {sprintMarkdown || "Select 3 to 5 tasks and generate the weekly sprint report."}
              </pre>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="checklists">
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.4fr]">
            <section className="space-y-6">
              <article className="rounded-xl border border-[#e0c0b1] bg-white p-5 shadow-sm">
                <h2 className="text-xl font-bold text-slate-950">Task Selection</h2>
                <p className="mt-1 text-sm text-[#584237]">
                  Pick a task to generate issue and PR review checklists.
                </p>
                <div className="mt-4">
                  <Select
                    value={selectedTaskId}
                    onValueChange={(value) => setSelectedTaskId(value)}
                  >
                    <SelectTrigger className="h-11 border-[#e0c0b1] bg-[#f7f9fb]">
                      <SelectValue placeholder="Select task" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {tasks.map((task) => (
                          <SelectItem key={task.id} value={task.id}>
                            {task.title}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </article>

              <article className="rounded-xl border border-[#e0c0b1] bg-white p-5 shadow-sm">
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={() =>
                      issueMarkdown
                        ? copyText(issueMarkdown, "GitHub issue markdown copied.")
                        : toast.error("Select a task first.")
                    }
                  >
                    <CopyIcon data-icon="inline-start" />
                    Copy Issue
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      issueMarkdown && selectedTask
                        ? exportToMarkdown(
                            issueMarkdown,
                            buildIssueFilename(selectedTask, "github-issue")
                          )
                        : toast.error("Select a task first.")
                    }
                  >
                    <FileOutputIcon data-icon="inline-start" />
                    Export Issue
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      prChecklistMarkdown
                        ? copyText(
                            prChecklistMarkdown,
                            "PR checklist markdown copied."
                          )
                        : toast.error("Select a task first.")
                    }
                  >
                    <CopyIcon data-icon="inline-start" />
                    Copy PR Checklist
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      prChecklistMarkdown && selectedTask
                        ? exportToMarkdown(
                            prChecklistMarkdown,
                            buildIssueFilename(selectedTask, "pr-checklist")
                          )
                        : toast.error("Select a task first.")
                    }
                  >
                    <FileOutputIcon data-icon="inline-start" />
                    Export PR Checklist
                  </Button>
                </div>
              </article>
            </section>

            <section className="space-y-6">
              <article className="rounded-xl border border-[#e0c0b1] bg-white p-5 shadow-sm">
                <h3 className="text-xl font-bold text-slate-950">GitHub Issue Markdown</h3>
                <pre className="mt-4 max-h-[32vh] overflow-auto whitespace-pre-wrap rounded-lg bg-[#f7f9fb] p-4 font-sans text-sm leading-6 text-slate-800">
                  {issueMarkdown || "Select a task to generate the GitHub issue markdown."}
                </pre>
              </article>

              <article className="rounded-xl border border-[#e0c0b1] bg-white p-5 shadow-sm">
                <h3 className="text-xl font-bold text-slate-950">PR Checklist Markdown</h3>
                <pre className="mt-4 max-h-[32vh] overflow-auto whitespace-pre-wrap rounded-lg bg-[#f7f9fb] p-4 font-sans text-sm leading-6 text-slate-800">
                  {prChecklistMarkdown || "Select a task to generate the PR checklist markdown."}
                </pre>
              </article>
            </section>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setEditingTask(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? "Edit Engineering Task" : "Add Engineering Task"}
            </DialogTitle>
            <DialogDescription>
              Manage scoped product work for TruckFixr without automatic code changes.
            </DialogDescription>
          </DialogHeader>
          <EngineeringTaskForm
            task={editingTask}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingTask(null);
            }}
            onSave={handleSave}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deletingTask)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingTask(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete engineering task?</DialogTitle>
            <DialogDescription>
              {deletingTask
                ? `This will permanently remove "${deletingTask.title}" from the Engineering Agent.`
                : "This engineering task will be permanently removed."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleDeleteConfirmed}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LabelShim({ text }: { text: string }) {
  return (
    <p className="text-sm font-medium leading-none text-slate-950">
      {text}
    </p>
  );
}
