/**
 * PRAXIA — Domain: Mission Service
 *
 * Business logic for MISSION operations.
 * Separated from persistence and UI.
 */

import type {
  Mission,
  CreateMissionInput,
  MissionType,
  MissionOperationalStatus,
} from './types';
import { MISSION_TYPES, MISSION_OPERATIONAL_STATUSES } from './catalogs';
import * as store from '../../persistence/missionStore';
import * as relationStore from '../../persistence/objectiveMissionRelationStore';
import type {
  ObjectiveMissionRelation,
  CreateObjectiveMissionRelationInput,
} from './relations';
import { getObjectiveService as getObjectiveByIdRaw } from '../objective/objectiveService';
import { getOrganizationId } from '../../persistence/needStore';

// ============================================================
// VALIDATION
// ============================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const VALID_MISSION_TYPES: MissionType[] = MISSION_TYPES.map((t) => t.value);
const VALID_OPERATIONAL_STATUSES: MissionOperationalStatus[] =
  MISSION_OPERATIONAL_STATUSES.map((s) => s.value);

export function validateMissionInput(input: CreateMissionInput): ValidationResult {
  const errors: string[] = [];

  if (!input.title || input.title.trim().length === 0) {
    errors.push('El título es obligatorio.');
  }

  if (!input.description || input.description.trim().length === 0) {
    errors.push('La descripción es obligatoria.');
  }

  if (!input.organizationId || input.organizationId.trim().length === 0) {
    errors.push('organizationId es obligatorio.');
  }

  if (!VALID_MISSION_TYPES.includes(input.missionType)) {
    errors.push(`Tipo de misión inválido: ${input.missionType}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================
// SERVICE METHODS
// ============================================================

export function createMissionService(
  input: CreateMissionInput
): { success: boolean; mission?: Mission; errors?: string[] } {
  const validation = validateMissionInput(input);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }

  const mission = store.createMission(input);
  return { success: true, mission };
}

export function getAllMissionsService(): Mission[] {
  return store.getAllMissions();
}

export function getMissionService(id: string): Mission | null {
  return store.getMissionById(id);
}

export function updateMissionService(
  id: string,
  updates: Partial<Mission>
): Mission | null {
  // Validate operationalStatus if provided
  if (
    updates.operationalStatus &&
    !VALID_OPERATIONAL_STATUSES.includes(updates.operationalStatus)
  ) {
    console.error(`[PRAXIA] Invalid operational status: ${updates.operationalStatus}`);
    return null;
  }

  return store.updateMission(id, updates);
}

export function deleteMissionService(id: string): boolean {
  // Delete all ObjectiveMissionRelations involving this mission
  relationStore.deleteObjectiveMissionRelationsByMissionId(id);
  // Delete the mission
  return store.deleteMission(id);
}

export function updateMissionOperationalStatusService(
  id: string,
  status: MissionOperationalStatus
): Mission | null {
  if (!VALID_OPERATIONAL_STATUSES.includes(status)) {
    console.error(`[PRAXIA] Invalid operational status: ${status}`);
    return null;
  }
  return store.updateMission(id, { operationalStatus: status });
}

// ============================================================
// RELATION METHODS
// ============================================================

export function createObjectiveMissionRelationService(
  input: CreateObjectiveMissionRelationInput
): {
  success: boolean;
  relation?: ObjectiveMissionRelation;
  errors?: string[];
} {
  const errors: string[] = [];

  // Validate OBJECTIVE exists
  const objective = getObjectiveByIdRaw(input.objectiveId);
  if (!objective) {
    errors.push(`El OBJECTIVE no existe: ${input.objectiveId}`);
  }

  // Validate MISSION exists
  const mission = store.getMissionById(input.missionId);
  if (!mission) {
    errors.push(`La MISSION no existe: ${input.missionId}`);
  }

  // Validate organization consistency
  if (objective && objective.organizationId !== input.organizationId) {
    errors.push(
      `El OBJECTIVE pertenece a otra organización: ${objective.organizationId}`
    );
  }
  if (mission && mission.organizationId !== input.organizationId) {
    errors.push(`La MISSION pertenece a otra organización: ${mission.organizationId}`);
  }

  // Check for duplicate relation
  const existing = relationStore.getObjectiveMissionRelationByPair(
    input.objectiveId,
    input.missionId
  );
  if (existing) {
    errors.push('La relación ya existe.');
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const relation = relationStore.createObjectiveMissionRelation(input);
  return { success: true, relation };
}

export function getMissionsForObjectiveService(
  objectiveId: string
): ObjectiveMissionRelation[] {
  return relationStore.getObjectiveMissionRelationsByObjectiveId(objectiveId);
}

export function getObjectivesForMissionService(
  missionId: string
): ObjectiveMissionRelation[] {
  return relationStore.getObjectiveMissionRelationsByMissionId(missionId);
}

export function deleteObjectiveMissionRelationService(relationId: string): boolean {
  return relationStore.deleteObjectiveMissionRelation(relationId);
}

/**
 * When an OBJECTIVE is deleted, clean up its ObjectiveMissionRelations.
 * Does NOT delete the related MISSIONs.
 */
export function cleanupObjectiveMissionRelationsForObjectiveService(
  objectiveId: string
): void {
  relationStore.deleteObjectiveMissionRelationsByObjectiveId(objectiveId);
}

/**
 * Resolve the current organization ID.
 * UI must use this instead of importing from persistence directly.
 */
export function resolveOrganizationId(): string {
  return getOrganizationId();
}
