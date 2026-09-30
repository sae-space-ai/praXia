/**
 * PRAXIA — Persistence: Task Store
 */

import type { Task, CreateTaskInput } from '../domain/task/types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'praxia_tasks';

export function getAllTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Task[];
  } catch {
    console.error('[PRAXIA] Error reading tasks from storage');
    return [];
  }
}

export function getTaskById(id: string): Task | null {
  return getAllTasks().find((t) => t.id === id) ?? null;
}

export function createTask(input: CreateTaskInput): Task {
  const now = new Date().toISOString();
  const task: Task = {
    id: uuidv4(),
    organizationId: input.organizationId,
    title: input.title,
    description: input.description,
    taskType: input.taskType,
    purpose: input.purpose,
    expectedOutput: input.expectedOutput,
    operationalStatus: 'DRAFT',
    verificationStatus: 'UNKNOWN',
    executionMethod: input.executionMethod ?? 'UNASSIGNED',
    priority: input.priority ?? 'NOT_ASSESSED',
    constraints: input.constraints ?? [],
    assumptions: input.assumptions ?? [],
    dependencies: [],
    successCriteria: input.successCriteria ?? [],
    humanApprovalRequired: input.humanApprovalRequired ?? false,
    createdAt: now,
    updatedAt: now,
    capabilityIds: [],
    dataRequirementIds: [],
  };
  
  const tasks = getAllTasks();
  tasks.push(task);
  saveTasks(tasks);
  return task;
}

export function updateTask(id: string, updates: Partial<Task>): Task | null {
  const tasks = getAllTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;
  
  tasks[index] = {
    ...tasks[index],
    ...updates,
    id: tasks[index].id,
    organizationId: tasks[index].organizationId,
    createdAt: tasks[index].createdAt,
    updatedAt: new Date().toISOString(),
  };
  
  saveTasks(tasks);
  return tasks[index];
}

export function deleteTask(id: string): boolean {
  const tasks = getAllTasks();
  const filtered = tasks.filter((t) => t.id !== id);
  if (filtered.length === tasks.length) return false;
  saveTasks(filtered);
  return true;
}

function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    console.error('[PRAXIA] Error saving tasks to storage');
  }
}
