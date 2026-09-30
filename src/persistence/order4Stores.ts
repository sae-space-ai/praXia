/**
 * PRAXIA — Persistence: Order 4 Stores
 * Consolidated stores for Capability, DataRequirement, HumanGate, and relations
 */

import { v4 as uuidv4 } from 'uuid';
import type { Capability, CreateCapabilityInput } from '../domain/capability/types';
import type { WorkPlanTaskRelation, CreateWorkPlanTaskRelationInput } from '../domain/workplan/types';
import type {
  DataRequirement,
  CreateDataRequirementInput,
  HumanGate,
  CreateHumanGateInput,
  TaskDependencyRelation,
  CreateTaskDependencyInput,
  TaskCapabilityRequirement,
  CreateTaskCapabilityRequirementInput,
} from '../domain/task/types';

// ============================================================
// CAPABILITY STORE
// ============================================================
const CAPABILITY_KEY = 'praxia_capabilities';

export function getAllCapabilities(): Capability[] {
  try {
    const raw = localStorage.getItem(CAPABILITY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getCapabilityById(id: string): Capability | null {
  return getAllCapabilities().find((c) => c.id === id) ?? null;
}

export function createCapability(input: CreateCapabilityInput): Capability {
  const now = new Date().toISOString();
  const capability: Capability = {
    id: uuidv4(),
    organizationId: input.organizationId ?? null,
    code: input.code,
    name: input.name,
    description: input.description,
    category: input.category,
    status: input.status ?? 'ACTIVE',
    createdAt: now,
    updatedAt: now,
  };
  const capabilities = getAllCapabilities();
  capabilities.push(capability);
  localStorage.setItem(CAPABILITY_KEY, JSON.stringify(capabilities));
  return capability;
}

export function updateCapability(id: string, updates: Partial<Capability>): Capability | null {
  const capabilities = getAllCapabilities();
  const index = capabilities.findIndex((c) => c.id === id);
  if (index === -1) return null;
  capabilities[index] = { ...capabilities[index], ...updates, updatedAt: new Date().toISOString() };
  localStorage.setItem(CAPABILITY_KEY, JSON.stringify(capabilities));
  return capabilities[index];
}

export function deleteCapability(id: string): boolean {
  const capabilities = getAllCapabilities();
  const filtered = capabilities.filter((c) => c.id !== id);
  if (filtered.length === capabilities.length) return false;
  localStorage.setItem(CAPABILITY_KEY, JSON.stringify(filtered));
  return true;
}

// ============================================================
// DATA REQUIREMENT STORE
// ============================================================
const DATA_REQ_KEY = 'praxia_data_requirements';

export function getAllDataRequirements(): DataRequirement[] {
  try {
    const raw = localStorage.getItem(DATA_REQ_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getDataRequirementById(id: string): DataRequirement | null {
  return getAllDataRequirements().find((dr) => dr.id === id) ?? null;
}

export function getDataRequirementsByTaskId(taskId: string): DataRequirement[] {
  return getAllDataRequirements().filter((dr) => dr.taskId === taskId);
}

export function createDataRequirement(input: CreateDataRequirementInput): DataRequirement {
  const now = new Date().toISOString();
  const dr: DataRequirement = {
    id: uuidv4(),
    organizationId: input.organizationId,
    taskId: input.taskId,
    name: input.name,
    description: input.description,
    purpose: input.purpose,
    dataCategory: input.dataCategory,
    required: input.required ?? true,
    availabilityStatus: input.availabilityStatus ?? 'UNKNOWN',
    verificationStatus: 'UNKNOWN',
    sourceExpectation: input.sourceExpectation ?? 'NOT_DEFINED',
    blockingIfMissing: input.blockingIfMissing ?? false,
    createdAt: now,
    updatedAt: now,
  };
  const all = getAllDataRequirements();
  all.push(dr);
  localStorage.setItem(DATA_REQ_KEY, JSON.stringify(all));
  return dr;
}

export function updateDataRequirement(id: string, updates: Partial<DataRequirement>): DataRequirement | null {
  const all = getAllDataRequirements();
  const index = all.findIndex((dr) => dr.id === id);
  if (index === -1) return null;
  all[index] = { ...all[index], ...updates, updatedAt: new Date().toISOString() };
  localStorage.setItem(DATA_REQ_KEY, JSON.stringify(all));
  return all[index];
}

export function deleteDataRequirement(id: string): boolean {
  const all = getAllDataRequirements();
  const filtered = all.filter((dr) => dr.id !== id);
  if (filtered.length === all.length) return false;
  localStorage.setItem(DATA_REQ_KEY, JSON.stringify(filtered));
  return true;
}

export function deleteDataRequirementsByTaskId(taskId: string): void {
  const all = getAllDataRequirements();
  const filtered = all.filter((dr) => dr.taskId !== taskId);
  localStorage.setItem(DATA_REQ_KEY, JSON.stringify(filtered));
}

// ============================================================
// HUMAN GATE STORE
// ============================================================
const HUMAN_GATE_KEY = 'praxia_human_gates';

export function getAllHumanGates(): HumanGate[] {
  try {
    const raw = localStorage.getItem(HUMAN_GATE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getHumanGateById(id: string): HumanGate | null {
  return getAllHumanGates().find((g) => g.id === id) ?? null;
}

export function getHumanGatesByEntity(entityType: string, entityId: string): HumanGate[] {
  return getAllHumanGates().filter((g) => g.entityType === entityType && g.entityId === entityId);
}

export function createHumanGate(input: CreateHumanGateInput): HumanGate {
  const now = new Date().toISOString();
  const gate: HumanGate = {
    id: uuidv4(),
    organizationId: input.organizationId,
    entityType: input.entityType,
    entityId: input.entityId,
    gateType: input.gateType,
    status: 'PENDING',
    reason: input.reason,
    requiredRole: input.requiredRole ?? null,
    createdAt: now,
    resolvedAt: null,
  };
  const all = getAllHumanGates();
  all.push(gate);
  localStorage.setItem(HUMAN_GATE_KEY, JSON.stringify(all));
  return gate;
}

export function updateHumanGate(id: string, updates: Partial<HumanGate>): HumanGate | null {
  const all = getAllHumanGates();
  const index = all.findIndex((g) => g.id === id);
  if (index === -1) return null;
  all[index] = { ...all[index], ...updates };
  localStorage.setItem(HUMAN_GATE_KEY, JSON.stringify(all));
  return all[index];
}

export function deleteHumanGate(id: string): boolean {
  const all = getAllHumanGates();
  const filtered = all.filter((g) => g.id !== id);
  if (filtered.length === all.length) return false;
  localStorage.setItem(HUMAN_GATE_KEY, JSON.stringify(filtered));
  return true;
}

export function deleteHumanGatesByEntity(entityType: string, entityId: string): void {
  const all = getAllHumanGates();
  const filtered = all.filter((g) => !(g.entityType === entityType && g.entityId === entityId));
  localStorage.setItem(HUMAN_GATE_KEY, JSON.stringify(filtered));
}

// ============================================================
// WORK PLAN TASK RELATION STORE
// ============================================================
const WP_TASK_REL_KEY = 'praxia_work_plan_task_relations';

export function getAllWorkPlanTaskRelations(): WorkPlanTaskRelation[] {
  try {
    const raw = localStorage.getItem(WP_TASK_REL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getWorkPlanTaskRelationsByWorkPlanId(workPlanId: string): WorkPlanTaskRelation[] {
  return getAllWorkPlanTaskRelations()
    .filter((r) => r.workPlanId === workPlanId)
    .sort((a, b) => a.sequence - b.sequence);
}

export function getWorkPlanTaskRelationsByTaskId(taskId: string): WorkPlanTaskRelation[] {
  return getAllWorkPlanTaskRelations().filter((r) => r.taskId === taskId);
}

export function createWorkPlanTaskRelation(input: CreateWorkPlanTaskRelationInput): WorkPlanTaskRelation {
  const rel: WorkPlanTaskRelation = {
    id: uuidv4(),
    organizationId: input.organizationId,
    workPlanId: input.workPlanId,
    taskId: input.taskId,
    sequence: input.sequence,
    isRequired: input.isRequired ?? true,
    createdAt: new Date().toISOString(),
  };
  const all = getAllWorkPlanTaskRelations();
  all.push(rel);
  localStorage.setItem(WP_TASK_REL_KEY, JSON.stringify(all));
  return rel;
}

export function deleteWorkPlanTaskRelation(id: string): boolean {
  const all = getAllWorkPlanTaskRelations();
  const filtered = all.filter((r) => r.id !== id);
  if (filtered.length === all.length) return false;
  localStorage.setItem(WP_TASK_REL_KEY, JSON.stringify(filtered));
  return true;
}

export function deleteWorkPlanTaskRelationsByWorkPlanId(workPlanId: string): void {
  const all = getAllWorkPlanTaskRelations();
  const filtered = all.filter((r) => r.workPlanId !== workPlanId);
  localStorage.setItem(WP_TASK_REL_KEY, JSON.stringify(filtered));
}

export function deleteWorkPlanTaskRelationsByTaskId(taskId: string): void {
  const all = getAllWorkPlanTaskRelations();
  const filtered = all.filter((r) => r.taskId !== taskId);
  localStorage.setItem(WP_TASK_REL_KEY, JSON.stringify(filtered));
}

// ============================================================
// TASK DEPENDENCY RELATION STORE
// ============================================================
const TASK_DEP_KEY = 'praxia_task_dependencies';

export function getAllTaskDependencies(): TaskDependencyRelation[] {
  try {
    const raw = localStorage.getItem(TASK_DEP_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getTaskDependenciesBySuccessorId(successorId: string): TaskDependencyRelation[] {
  return getAllTaskDependencies().filter((d) => d.successorTaskId === successorId);
}

export function getTaskDependenciesByPredecessorId(predecessorId: string): TaskDependencyRelation[] {
  return getAllTaskDependencies().filter((d) => d.predecessorTaskId === predecessorId);
}

export function createTaskDependency(input: CreateTaskDependencyInput): TaskDependencyRelation {
  const rel: TaskDependencyRelation = {
    id: uuidv4(),
    organizationId: input.organizationId,
    predecessorTaskId: input.predecessorTaskId,
    successorTaskId: input.successorTaskId,
    dependencyType: input.dependencyType,
    createdAt: new Date().toISOString(),
  };
  const all = getAllTaskDependencies();
  all.push(rel);
  localStorage.setItem(TASK_DEP_KEY, JSON.stringify(all));
  return rel;
}

export function deleteTaskDependency(id: string): boolean {
  const all = getAllTaskDependencies();
  const filtered = all.filter((d) => d.id !== id);
  if (filtered.length === all.length) return false;
  localStorage.setItem(TASK_DEP_KEY, JSON.stringify(filtered));
  return true;
}

export function deleteTaskDependenciesByTaskId(taskId: string): void {
  const all = getAllTaskDependencies();
  const filtered = all.filter((d) => d.predecessorTaskId !== taskId && d.successorTaskId !== taskId);
  localStorage.setItem(TASK_DEP_KEY, JSON.stringify(filtered));
}

// ============================================================
// TASK CAPABILITY REQUIREMENT STORE
// ============================================================
const TASK_CAP_KEY = 'praxia_task_capability_requirements';

export function getAllTaskCapabilityRequirements(): TaskCapabilityRequirement[] {
  try {
    const raw = localStorage.getItem(TASK_CAP_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getTaskCapabilityRequirementsByTaskId(taskId: string): TaskCapabilityRequirement[] {
  return getAllTaskCapabilityRequirements().filter((r) => r.taskId === taskId);
}

export function createTaskCapabilityRequirement(
  input: CreateTaskCapabilityRequirementInput
): TaskCapabilityRequirement {
  const rel: TaskCapabilityRequirement = {
    id: uuidv4(),
    organizationId: input.organizationId,
    taskId: input.taskId,
    capabilityId: input.capabilityId,
    requirementLevel: input.requirementLevel ?? 'UNSPECIFIED',
    isMandatory: input.isMandatory ?? false,
    createdAt: new Date().toISOString(),
  };
  const all = getAllTaskCapabilityRequirements();
  all.push(rel);
  localStorage.setItem(TASK_CAP_KEY, JSON.stringify(all));
  return rel;
}

export function deleteTaskCapabilityRequirement(id: string): boolean {
  const all = getAllTaskCapabilityRequirements();
  const filtered = all.filter((r) => r.id !== id);
  if (filtered.length === all.length) return false;
  localStorage.setItem(TASK_CAP_KEY, JSON.stringify(filtered));
  return true;
}

export function deleteTaskCapabilityRequirementsByTaskId(taskId: string): void {
  const all = getAllTaskCapabilityRequirements();
  const filtered = all.filter((r) => r.taskId !== taskId);
  localStorage.setItem(TASK_CAP_KEY, JSON.stringify(filtered));
}
