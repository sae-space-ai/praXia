/**
 * PRAXIA — Persistence: Mission Store
 *
 * LocalStorage-based persistence for MISSION entities.
 * Designed to be replaceable with a backend API later.
 *
 * IMPORTANT: This is local development persistence only.
 */

import type { Mission, CreateMissionInput } from '../domain/mission/types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'praxia_missions';
const DEFAULT_ORG_ID = 'org_default';

/**
 * Get all missions from storage.
 */
export function getAllMissions(): Mission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Mission[];
  } catch {
    console.error('[PRAXIA] Error reading missions from storage');
    return [];
  }
}

/**
 * Get a single mission by ID.
 */
export function getMissionById(id: string): Mission | null {
  const missions = getAllMissions();
  return missions.find((m) => m.id === id) ?? null;
}

/**
 * Create a new mission.
 */
export function createMission(input: CreateMissionInput): Mission {
  const now = new Date().toISOString();
  const mission: Mission = {
    id: uuidv4(),
    organizationId: input.organizationId || DEFAULT_ORG_ID,
    title: input.title,
    description: input.description,
    missionType: input.missionType,
    scope: {
      included: input.scope?.included ?? [],
      excluded: input.scope?.excluded ?? [],
      notes: input.scope?.notes ?? [],
    },
    expectedOutcome: {
      description: input.expectedOutcome?.description ?? null,
      state: input.expectedOutcome?.state ?? 'UNDEFINED',
    },
    timeHorizon: input.timeHorizon ?? 'UNDEFINED',
    constraints: input.constraints ?? [],
    assumptions: input.assumptions ?? [],
    dependencies: input.dependencies ?? [],
    operationalStatus: 'DRAFT',
    verificationStatus: 'UNKNOWN',
    successCriteria: input.successCriteria ?? [],
    evaluation: {
      executionProgress: 'NOT_MEASURED',
      successCriteriaCoverage: 'NOT_MEASURED',
      objectiveContribution: 'NOT_MEASURED',
    },
    createdAt: now,
    updatedAt: now,
    taskIds: [],
    agentIds: [],
    evidenceIds: [],
    decisionIds: [],
    resultIds: [],
  };

  const missions = getAllMissions();
  missions.push(mission);
  saveMissions(missions);
  return mission;
}

/**
 * Update an existing mission.
 */
export function updateMission(id: string, updates: Partial<Mission>): Mission | null {
  const missions = getAllMissions();
  const index = missions.findIndex((m) => m.id === id);
  if (index === -1) return null;

  missions[index] = {
    ...missions[index],
    ...updates,
    id: missions[index].id,
    organizationId: missions[index].organizationId,
    createdAt: missions[index].createdAt,
    updatedAt: new Date().toISOString(),
  };

  saveMissions(missions);
  return missions[index];
}

/**
 * Delete a mission by ID.
 */
export function deleteMission(id: string): boolean {
  const missions = getAllMissions();
  const filtered = missions.filter((m) => m.id !== id);
  if (filtered.length === missions.length) return false;
  saveMissions(filtered);
  return true;
}

/**
 * Save missions array to storage.
 */
function saveMissions(missions: Mission[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(missions));
  } catch {
    console.error('[PRAXIA] Error saving missions to storage');
  }
}
