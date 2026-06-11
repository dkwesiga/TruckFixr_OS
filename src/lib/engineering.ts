import { getItem, setItem, STORAGE_KEYS } from "@/lib/storage";
import {
  type EngineeringSprintPlan,
  type EngineeringTask,
} from "@/lib/types";

export type EngineeringTaskInput = Omit<
  EngineeringTask,
  "id" | "createdDate" | "updatedDate"
>;

function createEngineeringTaskId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `engineering_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getEngineeringTasks(): EngineeringTask[] {
  return getItem<EngineeringTask[]>(STORAGE_KEYS.ENGINEERING_TASKS) ?? [];
}

export function saveEngineeringTasks(tasks: EngineeringTask[]): void {
  setItem(STORAGE_KEYS.ENGINEERING_TASKS, tasks);
}

export function addEngineeringTask(task: EngineeringTaskInput): EngineeringTask {
  const now = new Date().toISOString();
  const tasks = getEngineeringTasks();
  const newTask: EngineeringTask = {
    ...task,
    id: createEngineeringTaskId(),
    createdDate: now,
    updatedDate: now,
  };

  saveEngineeringTasks([newTask, ...tasks]);

  return newTask;
}

export function updateEngineeringTask(
  id: string,
  updates: Partial<EngineeringTask>
): EngineeringTask | null {
  const tasks = getEngineeringTasks();
  const taskIndex = tasks.findIndex((task) => task.id === id);

  if (taskIndex === -1) {
    return null;
  }

  const updatedTask: EngineeringTask = {
    ...tasks[taskIndex],
    ...updates,
    id,
    createdDate: tasks[taskIndex].createdDate,
    updatedDate: new Date().toISOString(),
  };
  const nextTasks = [...tasks];
  nextTasks[taskIndex] = updatedTask;
  saveEngineeringTasks(nextTasks);

  return updatedTask;
}

export function deleteEngineeringTask(id: string): void {
  saveEngineeringTasks(getEngineeringTasks().filter((task) => task.id !== id));
}

export function getEngineeringTask(id: string): EngineeringTask | null {
  return getEngineeringTasks().find((task) => task.id === id) ?? null;
}

export function getEngineeringSprintPlan(): EngineeringSprintPlan {
  return (
    getItem<EngineeringSprintPlan>(STORAGE_KEYS.ENGINEERING_SPRINT_PLAN) ?? {
      taskIds: [],
    }
  );
}

export function saveEngineeringSprintPlan(plan: EngineeringSprintPlan): void {
  setItem(STORAGE_KEYS.ENGINEERING_SPRINT_PLAN, plan);
}

export function loadDemoEngineeringTasks(demoTasks: EngineeringTaskInput[]) {
  const currentTasks = getEngineeringTasks();
  const realTasks = currentTasks.filter((task) => !task.isDemo);
  const savedDemoTasks = demoTasks.map((task, index) => {
    const now = new Date().toISOString();

    return {
      ...task,
      id: `demo_engineering_${index + 1}`,
      createdDate: now,
      updatedDate: now,
    };
  });

  saveEngineeringTasks([...savedDemoTasks, ...realTasks]);
}

export function clearDemoEngineeringTasks() {
  saveEngineeringTasks(getEngineeringTasks().filter((task) => !task.isDemo));
}
