/**
 * PRAXIA — Domain: Objective Service
 *
 * Business logic for OBJECTIVE operations.
 * Separated from persistence and UI.
 */

import type {
  Objective,
  CreateObjectiveInput,
  ObjectiveClass,
  OperationalStatus,
} from './types';
import { OBJECTIVE_CLASSES, OPERATIONAL_STATUSES } from './catalogs';
import * as store from '../../persistence/objectiveStore';
import * as relationStore from '../../persistence/relationStore';
import type { NeedObjectiveRelation, CreateRelationInput } from './relations';
import { getNeedByIdRaw } from '../need/needService';

// ============================================================
// VALIDATION
// ============================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const VALID_CLASSES: ObjectiveClass[] = OBJECTIVE_CLASSES.map((c) => c.value);
const VALID_OPERATIONAL_STATUSES: OperationalStatus[] = OPERATIONAL_STATUSES.map(
  (s) => s.value
);

export function validateObjectiveInput(input: CreateObjectiveInput): ValidationResult {
  const errors: string[] = [];

  if (!input.title || input.title.trim().length === 0) {
    errors.push('El título es obligatorio.');
  }

  if (!input.description || input.description.trim().length === 0) {
    errors.push('La descripción es obligatoria.');
  }

  if (!VALID_CLASSES.includes(input.objectiveClass)) {
    errors.push(`Clase de objetivo inválida: ${input.objectiveClass}`);
  }

  // Parent validation
  if (input.parentObjectiveId) {
    const parent = store.getObjectiveById(input.parentObjectiveId);
    if (!parent) {
      errors.push(`El objetivo padre no existe: ${input.parentObjectiveId}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate hierarchy rules:
 * - GENERAL: no parent required
 * - THEMATIC: parent should be GENERAL (if exists)
 * - SPECIFIC: parent should be THEMATIC (if exists)
 *
 * NOTE: We do not FORCE the hierarchy. We only validate
 * when a parent is explicitly provided.
 */
export function validateHierarchy(
  objectiveClass: ObjectiveClass,
  parentObjectiveId: string | null
): ValidationResult {
  const errors: string[] = [];

  if (!parentObjectiveId) {
    // No parent: only GENERAL is allowed without parent
    // THEMATIC and SPECIFIC can exist without parent (incomplete hierarchy)
    return { valid: true, errors: [] };
  }

  const parent = store.getObjectiveById(parentObjectiveId);
  if (!parent) {
    errors.push(`El objetivo padre no existe: ${parentObjectiveId}`);
    return { valid: false, errors };
  }

  // Self-reference check
  // (This would be called with the new objective's ID if it exists)
  // For creation, we don't have an ID yet, so this is handled at relation time.

  // Hierarchy validation
  if (objectiveClass === 'THEMATIC' && parent.objectiveClass !== 'GENERAL') {
    errors.push(
      `Un objetivo TEMÁTICO debe tener un padre GENERAL. El padre actual es ${parent.objectiveClass}.`
    );
  }

  if (objectiveClass === 'SPECIFIC' && parent.objectiveClass !== 'THEMATIC') {
    errors.push(
      `Un objetivo ESPECÍFICO debe tener un padre TEMÁTICO. El padre actual es ${parent.objectiveClass}.`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================
// SERVICE METHODS
// ============================================================

export function createObjectiveService(
  input: CreateObjectiveInput
): { success: boolean; objective?: Objective; errors?: string[] } {
  const validation = validateObjectiveInput(input);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }

  // Hierarchy validation (if parent provided)
  if (input.parentObjectiveId) {
    const hierarchyValidation = validateHierarchy(
      input.objectiveClass,
      input.parentObjectiveId
    );
    if (!hierarchyValidation.valid) {
      return { success: false, errors: hierarchyValidation.errors };
    }
  }

  const objective = store.createObjective(input);
  return { success: true, objective };
}

export function getAllObjectivesService(): Objective[] {
  return store.getAllObjectives();
}

export function getObjectiveService(id: string): Objective | null {
  return store.getObjectiveById(id);
}

export function updateObjectiveService(
  id: string,
  updates: Partial<Objective>
): Objective | null {
  // Self-reference validation: an objective cannot be its own parent
  if (updates.parentObjectiveId === id) {
    console.error(`[PRAXIA] An objective cannot be its own parent: ${id}`);
    return null;
  }
  
  // Hierarchy validation (if parent is being changed)
  if (updates.parentObjectiveId && updates.objectiveClass) {
    const hierarchyValidation = validateHierarchy(
      updates.objectiveClass,
      updates.parentObjectiveId
    );
    if (!hierarchyValidation.valid) {
      console.error(`[PRAXIA] Hierarchy validation failed:`, hierarchyValidation.errors);
      return null;
    }
  }
  
  return store.updateObjective(id, updates);
}

export function deleteObjectiveService(id: string): boolean {
  // Delete all relations involving this objective
  relationStore.deleteRelationsByObjectiveId(id);
  // Delete the objective
  return store.deleteObjective(id);
}

export function updateOperationalStatusService(
  id: string,
  status: OperationalStatus
): Objective | null {
  if (!VALID_OPERATIONAL_STATUSES.includes(status)) {
    console.error(`[PRAXIA] Invalid operational status: ${status}`);
    return null;
  }
  return store.updateObjective(id, { operationalStatus: status });
}

// ============================================================
// RELATION METHODS
// ============================================================

export function createRelationService(
  input: CreateRelationInput
): { success: boolean; relation?: NeedObjectiveRelation; errors?: string[] } {
  const errors: string[] = [];

  // Validate NEED exists
  const need = getNeedByIdRaw(input.needId);
  if (!need) {
    errors.push(`La NEED no existe: ${input.needId}`);
  }

  // Validate OBJECTIVE exists
  const objective = store.getObjectiveById(input.objectiveId);
  if (!objective) {
    errors.push(`El OBJECTIVE no existe: ${input.objectiveId}`);
  }

  // Check for duplicate relation
  const existing = relationStore.getRelationByNeedAndObjective(
    input.needId,
    input.objectiveId
  );
  if (existing) {
    errors.push('La relación ya existe.');
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const relation = relationStore.createRelation(input);
  return { success: true, relation };
}

export function getRelationsByNeedService(needId: string): NeedObjectiveRelation[] {
  return relationStore.getRelationsByNeedId(needId);
}

export function getRelationsByObjectiveService(
  objectiveId: string
): NeedObjectiveRelation[] {
  return relationStore.getRelationsByObjectiveId(objectiveId);
}

export function deleteRelationService(relationId: string): boolean {
  return relationStore.deleteRelation(relationId);
}

/**
 * When a NEED is deleted, clean up its relations.
 * Does NOT delete the related OBJECTIVEs.
 */
export function cleanupRelationsForNeedService(needId: string): void {
  relationStore.deleteRelationsByNeedId(needId);
}
