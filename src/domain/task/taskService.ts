/**
 * PRAXIA — Domain: Task Service
 */

import type {
  Task,
  CreateTaskInput,
  TaskOperationalStatus,
  TaskDependencyRelation,
  CreateTaskDependencyInput,
  TaskReadinessResult,
  WorkPlanReadinessResult,
} from './types';
import * as store from '../../persistence/taskStore';
import * as relStore from '../../persistence/order4Stores';
import * as workPlanStore from '../../persistence/workPlanStore';

export function createTaskService(input: CreateTaskInput): Task {
  return store.createTask(input);
}

export function getTaskService(id: string): Task | null {
  return store.getTaskById(id);
}

export function getAllTasksService(): Task[] {
  return store.getAllTasks();
}

export function updateTaskService(id: string, updates: Partial<Task>): Task | null {
  return store.updateTask(id, updates);
}

export function updateTaskOperationalStatusService(
  id: string,
  status: TaskOperationalStatus
): Task | null {
  return store.updateTask(id, { operationalStatus: status });
}

export function deleteTaskService(id: string): boolean {
  relStore.deleteWorkPlanTaskRelationsByTaskId(id);
  relStore.deleteTaskDependenciesByTaskId(id);
  relStore.deleteTaskCapabilityRequirementsByTaskId(id);
  relStore.deleteDataRequirementsByTaskId(id);
  relStore.deleteHumanGatesByEntity('TASK', id);
  return store.deleteTask(id);
}

// ============================================================
// DEPENDENCY SERVICES WITH CYCLE DETECTION
// ============================================================

function detectCycle(
  taskId: string,
  targetId: string,
  visited: Set<string> = new Set()
): boolean {
  if (taskId === targetId) return true;
  if (visited.has(taskId)) return false;
  visited.add(taskId);
  
  const deps = relStore.getTaskDependenciesByPredecessorId(taskId);
  for (const dep of deps) {
    if (detectCycle(dep.successorTaskId, targetId, visited)) {
      return true;
    }
  }
  return false;
}

export function createTaskDependencyService(
  input: CreateTaskDependencyInput
): { success: boolean; relation?: TaskDependencyRelation; error?: string } {
  if (input.predecessorTaskId === input.successorTaskId) {
    return { success: false, error: 'Self-dependency not allowed' };
  }
  
  const predecessor = store.getTaskById(input.predecessorTaskId);
  const successor = store.getTaskById(input.successorTaskId);
  
  if (!predecessor || !successor) {
    return { success: false, error: 'Task does not exist' };
  }
  
  if (predecessor.organizationId !== input.organizationId || 
      successor.organizationId !== input.organizationId) {
    return { success: false, error: 'Organization mismatch' };
  }
  
  if (detectCycle(input.successorTaskId, input.predecessorTaskId)) {
    return { success: false, error: 'Cycle detected' };
  }
  
  const relation = relStore.createTaskDependency(input);
  return { success: true, relation };
}

// ============================================================
// READINESS SERVICES
// ============================================================

export function evaluateTaskReadinessService(taskId: string): TaskReadinessResult {
  const task = store.getTaskById(taskId);
  const blockingReasons: string[] = [];
  const warnings: string[] = [];
  
  if (!task) {
    return {
      ready: false,
      blockingReasons: ['Task does not exist'],
      warnings: [],
      evaluatedAt: new Date().toISOString(),
    };
  }
  
  if (!task.expectedOutput || task.expectedOutput.trim() === '') {
    blockingReasons.push('Missing expected output');
  }
  
  if (task.successCriteria.length === 0) {
    blockingReasons.push('No success criteria defined');
  }
  
  const capReqs = relStore.getTaskCapabilityRequirementsByTaskId(taskId);
  if (capReqs.length === 0) {
    warnings.push('No capabilities defined');
  }
  
  const dataReqs = relStore.getDataRequirementsByTaskId(taskId);
  const blockingData = dataReqs.filter(
    (dr: any) => dr.blockingIfMissing && dr.availabilityStatus !== 'AVAILABLE'
  );
  if (blockingData.length > 0) {
    blockingReasons.push(`${blockingData.length} blocking data requirement(s) unavailable`);
  }
  
  const deps = relStore.getTaskDependenciesBySuccessorId(taskId);
  const incompleteDeps = deps.filter((dep: any) => {
    const predTask = store.getTaskById(dep.predecessorTaskId);
    return !predTask || predTask.operationalStatus !== 'COMPLETED';
  });
  if (incompleteDeps.length > 0) {
    blockingReasons.push(`${incompleteDeps.length} dependency task(s) not completed`);
  }
  
  if (task.humanApprovalRequired) {
    const gates = relStore.getHumanGatesByEntity('TASK', taskId);
    const pendingGates = gates.filter((g: any) => g.status === 'PENDING');
    if (pendingGates.length > 0) {
      blockingReasons.push('Human approval pending');
    }
  }
  
  return {
    ready: blockingReasons.length === 0,
    blockingReasons,
    warnings,
    evaluatedAt: new Date().toISOString(),
  };
}

export function evaluateWorkPlanReadinessService(
  workPlanId: string
): WorkPlanReadinessResult {
  const workPlan = workPlanStore.getWorkPlanById(workPlanId);
  const blockingTasks: string[] = [];
  const blockingReasons: string[] = [];
  const warnings: string[] = [];
  
  if (!workPlan) {
    return {
      ready: false,
      blockingTasks: [],
      blockingReasons: ['WorkPlan does not exist'],
      warnings: [],
      evaluatedAt: new Date().toISOString(),
    };
  }
  
  const relations = relStore.getWorkPlanTaskRelationsByWorkPlanId(workPlanId);
  const requiredTasks = relations.filter((r: any) => r.isRequired);
  
  for (const rel of requiredTasks) {
    const readiness = evaluateTaskReadinessService(rel.taskId);
    if (!readiness.ready) {
      blockingTasks.push(rel.taskId);
      blockingReasons.push(...readiness.blockingReasons);
    }
    warnings.push(...readiness.warnings);
  }
  
  return {
    ready: blockingTasks.length === 0,
    blockingTasks,
    blockingReasons,
    warnings,
    evaluatedAt: new Date().toISOString(),
  };
}
