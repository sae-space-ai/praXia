/**
 * PRAXIA — Persistence: Objective ↔ Mission Relation Store
 *
 * LocalStorage-based persistence for ObjectiveMissionRelation.
 * SOURCE OF TRUTH for OBJECTIVE↔MISSION relationships.
 */

import type {
  ObjectiveMissionRelation,
  CreateObjectiveMissionRelationInput,
} from '../domain/mission/relations';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'praxia_objective_mission_relations';

/**
 * Get all relations from storage.
 */
export function getAllObjectiveMissionRelations(): ObjectiveMissionRelation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ObjectiveMissionRelation[];
  } catch {
    console.error('[PRAXIA] Error reading objective-mission relations from storage');
    return [];
  }
}

/**
 * Get a relation by ID.
 */
export function getObjectiveMissionRelationById(
  id: string
): ObjectiveMissionRelation | null {
  const relations = getAllObjectiveMissionRelations();
  return relations.find((r) => r.id === id) ?? null;
}

/**
 * Get a relation by objectiveId and missionId (for duplicate check).
 */
export function getObjectiveMissionRelationByPair(
  objectiveId: string,
  missionId: string
): ObjectiveMissionRelation | null {
  const relations = getAllObjectiveMissionRelations();
  return (
    relations.find(
      (r) => r.objectiveId === objectiveId && r.missionId === missionId
    ) ?? null
  );
}

/**
 * Get all relations for a specific OBJECTIVE.
 */
export function getObjectiveMissionRelationsByObjectiveId(
  objectiveId: string
): ObjectiveMissionRelation[] {
  return getAllObjectiveMissionRelations().filter(
    (r) => r.objectiveId === objectiveId
  );
}

/**
 * Get all relations for a specific MISSION.
 */
export function getObjectiveMissionRelationsByMissionId(
  missionId: string
): ObjectiveMissionRelation[] {
  return getAllObjectiveMissionRelations().filter((r) => r.missionId === missionId);
}

/**
 * Create a new relation.
 */
export function createObjectiveMissionRelation(
  input: CreateObjectiveMissionRelationInput
): ObjectiveMissionRelation {
  const relation: ObjectiveMissionRelation = {
    id: uuidv4(),
    organizationId: input.organizationId,
    objectiveId: input.objectiveId,
    missionId: input.missionId,
    createdAt: new Date().toISOString(),
  };

  const relations = getAllObjectiveMissionRelations();
  relations.push(relation);
  saveObjectiveMissionRelations(relations);
  return relation;
}

/**
 * Delete a relation by ID.
 */
export function deleteObjectiveMissionRelation(id: string): boolean {
  const relations = getAllObjectiveMissionRelations();
  const filtered = relations.filter((r) => r.id !== id);
  if (filtered.length === relations.length) return false;
  saveObjectiveMissionRelations(filtered);
  return true;
}

/**
 * Delete all relations for a specific OBJECTIVE.
 */
export function deleteObjectiveMissionRelationsByObjectiveId(
  objectiveId: string
): void {
  const relations = getAllObjectiveMissionRelations();
  const filtered = relations.filter((r) => r.objectiveId !== objectiveId);
  saveObjectiveMissionRelations(filtered);
}

/**
 * Delete all relations for a specific MISSION.
 */
export function deleteObjectiveMissionRelationsByMissionId(
  missionId: string
): void {
  const relations = getAllObjectiveMissionRelations();
  const filtered = relations.filter((r) => r.missionId !== missionId);
  saveObjectiveMissionRelations(filtered);
}

/**
 * Save relations array to storage.
 */
function saveObjectiveMissionRelations(
  relations: ObjectiveMissionRelation[]
): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(relations));
  } catch {
    console.error('[PRAXIA] Error saving objective-mission relations to storage');
  }
}
