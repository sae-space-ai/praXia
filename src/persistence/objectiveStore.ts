/**
 * PRAXIA — Persistence: Objective Store
 *
 * LocalStorage-based persistence for OBJECTIVE entities.
 * Designed to be replaceable with a backend API later.
 *
 * IMPORTANT: This is local development persistence only.
 */

import type { Objective, CreateObjectiveInput } from '../domain/objective/types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'praxia_objectives';
const DEFAULT_ORG_ID = 'org_default';

/**
 * Get all objectives from storage.
 */
export function getAllObjectives(): Objective[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Objective[];
  } catch {
    console.error('[PRAXIA] Error reading objectives from storage');
    return [];
  }
}

/**
 * Get a single objective by ID.
 */
export function getObjectiveById(id: string): Objective | null {
  const objectives = getAllObjectives();
  return objectives.find((o) => o.id === id) ?? null;
}

/**
 * Create a new objective.
 */
export function createObjective(input: CreateObjectiveInput): Objective {
  const now = new Date().toISOString();
  const objective: Objective = {
    id: uuidv4(),
    organizationId: input.organizationId || DEFAULT_ORG_ID,
    title: input.title,
    description: input.description,
    objectiveClass: input.objectiveClass,
    parentObjectiveId: input.parentObjectiveId ?? null,
    baseline: {
      state: input.baseline?.state ?? 'UNKNOWN',
      value: input.baseline?.value ?? null,
      unit: input.baseline?.unit ?? null,
      referenceDate: input.baseline?.referenceDate ?? null,
    },
    target: {
      state: input.target?.state ?? 'UNDEFINED',
      value: input.target?.value ?? null,
      unit: input.target?.unit ?? null,
      deadline: input.target?.deadline ?? null,
    },
    kpis: input.kpis ?? [],
    timeHorizon: input.timeHorizon ?? 'UNDEFINED',
    constraints: input.constraints ?? [],
    verificationStatus: 'UNKNOWN',
    operationalStatus: 'DRAFT',
    evaluation: {
      executionProgress: 'NOT_MEASURED',
      evidenceCoverage: 'NOT_MEASURED',
      objectiveAttainment: 'NOT_MEASURED',
    },
    createdAt: now,
    updatedAt: now,
    missionIds: [],
    taskIds: [],
    evidenceIds: [],
    decisionIds: [],
    resultIds: [],
  };

  const objectives = getAllObjectives();
  objectives.push(objective);
  saveObjectives(objectives);
  return objective;
}

/**
 * Update an existing objective.
 */
export function updateObjective(id: string, updates: Partial<Objective>): Objective | null {
  const objectives = getAllObjectives();
  const index = objectives.findIndex((o) => o.id === id);
  if (index === -1) return null;

  objectives[index] = {
    ...objectives[index],
    ...updates,
    id: objectives[index].id,
    organizationId: objectives[index].organizationId,
    createdAt: objectives[index].createdAt,
    updatedAt: new Date().toISOString(),
  };

  saveObjectives(objectives);
  return objectives[index];
}

/**
 * Delete an objective by ID.
 */
export function deleteObjective(id: string): boolean {
  const objectives = getAllObjectives();
  const filtered = objectives.filter((o) => o.id !== id);
  if (filtered.length === objectives.length) return false;
  saveObjectives(filtered);
  return true;
}

/**
 * Save objectives array to storage.
 */
function saveObjectives(objectives: Objective[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(objectives));
  } catch {
    console.error('[PRAXIA] Error saving objectives to storage');
  }
}
