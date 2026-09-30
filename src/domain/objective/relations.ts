/**
 * PRAXIA — Domain: Need ↔ Objective Relations
 *
 * SOURCE OF TRUTH for the relationship between NEEDs and OBJECTIVEs.
 *
 * IMPORTANT:
 *   Need.objectiveIds (Order 1) is DEPRECATED.
 *   This relation table is the authoritative source.
 *   Do not write to Need.objectiveIds.
 *   Future migration will remove Need.objectiveIds.
 *
 * Cardinality: MANY-TO-MANY
 *   1 NEED → MANY OBJECTIVES
 *   1 OBJECTIVE → MANY NEEDS
 */

import type { VerificationState } from '../need/types';

export interface NeedObjectiveRelation {
  id: string;
  needId: string;
  objectiveId: string;
  createdAt: string;
  /** Epistemological status of the relationship itself. */
  verificationState: VerificationState;
  /** Optional rationale for the relationship. */
  rationale: string | null;
}

export interface CreateRelationInput {
  needId: string;
  objectiveId: string;
  rationale?: string | null;
}
