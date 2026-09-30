/**
 * PRAXIA — Domain: WorkPlan
 * 
 * A WorkPlan represents a structured execution plan for a Mission.
 * Supports versioning: multiple versions can exist, but only one is CURRENT.
 */

import type { VerificationState } from '../need/types';

// ============================================================
// PLANNING STATUS — Lifecycle of the work plan
// ============================================================
export type PlanningStatus =
  | 'DRAFT'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'ACTIVE'
  | 'SUPERSEDED'
  | 'CANCELLED';

// ============================================================
// WORK PLAN — Core entity
// ============================================================
export interface WorkPlan {
  id: string;
  organizationId: string;
  missionId: string;
  
  title: string;
  description: string;
  
  planningStatus: PlanningStatus;
  verificationStatus: VerificationState;
  
  version: number;
  isCurrentVersion: boolean;
  
  createdAt: string;
  updatedAt: string;
  
  // Future extensibility (prepared, not implemented)
  // NOT source of truth for task relations
  taskIds: string[]; // DEPRECATED_AS_RELATION_SOURCE
}

// ============================================================
// CREATE WORK PLAN INPUT
// ============================================================
export interface CreateWorkPlanInput {
  organizationId: string;
  missionId: string;
  title: string;
  description: string;
}

// ============================================================
// WORK PLAN TASK RELATION — SOURCE OF TRUTH
// ============================================================
export interface WorkPlanTaskRelation {
  id: string;
  organizationId: string;
  workPlanId: string;
  taskId: string;
  sequence: number;
  isRequired: boolean;
  createdAt: string;
}

export interface CreateWorkPlanTaskRelationInput {
  organizationId: string;
  workPlanId: string;
  taskId: string;
  sequence: number;
  isRequired?: boolean;
}
