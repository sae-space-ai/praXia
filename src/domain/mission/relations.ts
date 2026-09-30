/**
 * PRAXIA — Domain: Objective ↔ Mission Relations
 *
 * SOURCE OF TRUTH for the relationship between OBJECTIVEs and MISSIONs.
 *
 * IMPORTANT:
 *   Objective.missionIds (Order 2) is DEPRECATED_AS_RELATION_SOURCE.
 *   This relation table is the authoritative source.
 *   Do not write to Objective.missionIds.
 *   Future migration will remove Objective.missionIds.
 *
 * Cardinality: MANY-TO-MANY
 *   1 OBJECTIVE → MANY MISSIONS
 *   1 MISSION → MANY OBJECTIVES
 */

export interface ObjectiveMissionRelation {
  id: string;
  organizationId: string;
  objectiveId: string;
  missionId: string;
  createdAt: string;
}

export interface CreateObjectiveMissionRelationInput {
  organizationId: string;
  objectiveId: string;
  missionId: string;
}
