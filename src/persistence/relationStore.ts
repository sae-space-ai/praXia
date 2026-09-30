/**
 * PRAXIA — Persistence: Need ↔ Objective Relation Store
 *
 * LocalStorage-based persistence for NeedObjectiveRelation.
 * SOURCE OF TRUTH for NEED↔OBJECTIVE relationships.
 */

import type { NeedObjectiveRelation, CreateRelationInput } from '../domain/objective/relations';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'praxia_need_objective_relations';

/**
 * Get all relations from storage.
 */
export function getAllRelations(): NeedObjectiveRelation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as NeedObjectiveRelation[];
  } catch {
    console.error('[PRAXIA] Error reading relations from storage');
    return [];
  }
}

/**
 * Get a relation by ID.
 */
export function getRelationById(id: string): NeedObjectiveRelation | null {
  const relations = getAllRelations();
  return relations.find((r) => r.id === id) ?? null;
}

/**
 * Get a relation by needId and objectiveId (for duplicate check).
 */
export function getRelationByNeedAndObjective(
  needId: string,
  objectiveId: string
): NeedObjectiveRelation | null {
  const relations = getAllRelations();
  return (
    relations.find((r) => r.needId === needId && r.objectiveId === objectiveId) ?? null
  );
}

/**
 * Get all relations for a specific NEED.
 */
export function getRelationsByNeedId(needId: string): NeedObjectiveRelation[] {
  return getAllRelations().filter((r) => r.needId === needId);
}

/**
 * Get all relations for a specific OBJECTIVE.
 */
export function getRelationsByObjectiveId(objectiveId: string): NeedObjectiveRelation[] {
  return getAllRelations().filter((r) => r.objectiveId === objectiveId);
}

/**
 * Create a new relation.
 */
export function createRelation(input: CreateRelationInput): NeedObjectiveRelation {
  const relation: NeedObjectiveRelation = {
    id: uuidv4(),
    needId: input.needId,
    objectiveId: input.objectiveId,
    createdAt: new Date().toISOString(),
    verificationState: 'HYPOTHESIS',
    rationale: input.rationale ?? null,
  };

  const relations = getAllRelations();
  relations.push(relation);
  saveRelations(relations);
  return relation;
}

/**
 * Delete a relation by ID.
 */
export function deleteRelation(id: string): boolean {
  const relations = getAllRelations();
  const filtered = relations.filter((r) => r.id !== id);
  if (filtered.length === relations.length) return false;
  saveRelations(filtered);
  return true;
}

/**
 * Delete all relations for a specific NEED.
 */
export function deleteRelationsByNeedId(needId: string): void {
  const relations = getAllRelations();
  const filtered = relations.filter((r) => r.needId !== needId);
  saveRelations(filtered);
}

/**
 * Delete all relations for a specific OBJECTIVE.
 */
export function deleteRelationsByObjectiveId(objectiveId: string): void {
  const relations = getAllRelations();
  const filtered = relations.filter((r) => r.objectiveId !== objectiveId);
  saveRelations(filtered);
}

/**
 * Save relations array to storage.
 */
function saveRelations(relations: NeedObjectiveRelation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(relations));
  } catch {
    console.error('[PRAXIA] Error saving relations to storage');
  }
}
