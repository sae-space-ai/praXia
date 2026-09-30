/**
 * PRAXIA — Domain: MISSION
 *
 * A MISSION is a structured unit of work created to contribute
 * to one or more objectives, with explicit scope, purpose, status,
 * success criteria, constraints, and governance.
 *
 * MISSION is NOT:
 * - an agent, prompt, conversation, individual task, recommendation
 * - evidence, workflow, project, result, decision, simulation
 *
 * MISSION represents WHAT work PRAXIA must do and FOR WHAT objective.
 * It does NOT represent WHO will execute it or HOW agents will execute it.
 *
 * SOURCE OF TRUTH for OBJECTIVE↔MISSION relationship:
 *   ObjectiveMissionRelation (see relations.ts)
 *
 * NOTE: Objective.missionIds (Order 2) is DEPRECATED_AS_RELATION_SOURCE.
 *       Do not write to it. Do not use it as source of truth.
 */

import type { VerificationState } from '../need/types';
import type { TimeHorizon } from '../objective/types';

// ============================================================
// MISSION TYPE — Taxonomy of mission purposes
// ============================================================
export type MissionType =
  | 'DIAGNOSTIC'
  | 'RESEARCH'
  | 'ANALYSIS'
  | 'DESIGN'
  | 'OPTIMIZATION'
  | 'COMPLIANCE'
  | 'TRANSFORMATION'
  | 'IMPLEMENTATION'
  | 'MONITORING'
  | 'OTHER';

// ============================================================
// MISSION OPERATIONAL STATUS — Execution lifecycle
// ============================================================
export type MissionOperationalStatus =
  | 'DRAFT'
  | 'PROPOSED'
  | 'APPROVED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED';

// ============================================================
// MISSION SCOPE — What is included/excluded
// ============================================================
export interface MissionScope {
  included: string[];
  excluded: string[];
  notes: string[];
}

// ============================================================
// EXPECTED OUTCOME — What result is expected (not achieved)
// ============================================================
export type ExpectedOutcomeState = 'DEFINED' | 'UNDEFINED' | 'INTERNAL_DATA_REQUIRED';

export interface ExpectedOutcome {
  description: string | null;
  state: ExpectedOutcomeState;
}

// ============================================================
// ASSUMPTION — Distinguished from facts
// ============================================================
export type AssumptionStatus = 'UNTESTED' | 'SUPPORTED' | 'REJECTED' | 'UNKNOWN';

export interface Assumption {
  id: string;
  statement: string;
  status: AssumptionStatus;
}

// ============================================================
// DEPENDENCY — Known dependencies (no engine yet)
// ============================================================
export type DependencyStatus = 'KNOWN' | 'UNKNOWN' | 'RESOLVED';

export interface Dependency {
  id: string;
  description: string;
  status: DependencyStatus;
}

// ============================================================
// SUCCESS CRITERION — Evaluation criteria (no evidence engine yet)
// ============================================================
export type MeasurementStatus = 'NOT_MEASURED' | 'PARTIALLY_MEASURED' | 'MEASURED';

export interface SuccessCriterion {
  id: string;
  description: string;
  measurementStatus: MeasurementStatus;
}

// ============================================================
// EVALUATION — Prepared for future, not computed
// ============================================================
export interface MissionEvaluation {
  executionProgress: 'NOT_MEASURED';
  successCriteriaCoverage: 'NOT_MEASURED';
  objectiveContribution: 'NOT_MEASURED';
}

// ============================================================
// MISSION — Core entity
// ============================================================
export interface Mission {
  // Identity
  id: string;
  organizationId: string;

  // Description
  title: string;
  description: string;

  // Classification
  missionType: MissionType;

  // Scope
  scope: MissionScope;

  // Expected outcome (not achieved result)
  expectedOutcome: ExpectedOutcome;

  // Time
  timeHorizon: TimeHorizon;

  // Constraints (known only, no fake data)
  constraints: string[];

  // Assumptions (distinguished from facts)
  assumptions: Assumption[];

  // Dependencies (no engine yet)
  dependencies: Dependency[];

  // Operational status (execution)
  operationalStatus: MissionOperationalStatus;

  // Verification status (truth/evidence)
  verificationStatus: VerificationState;

  // Success criteria
  successCriteria: SuccessCriterion[];

  // Evaluation (prepared, not computed)
  evaluation: MissionEvaluation;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Future extensibility (prepared, not implemented)
  // These IDs will link to future entities
  // WARNING: NOT source of truth for relations
  taskIds: string[];
  agentIds: string[];
  evidenceIds: string[];
  decisionIds: string[];
  resultIds: string[];
}

// ============================================================
// CREATE MISSION INPUT
// ============================================================
export interface CreateMissionInput {
  organizationId: string;
  title: string;
  description: string;
  missionType: MissionType;
  scope?: Partial<MissionScope>;
  expectedOutcome?: Partial<ExpectedOutcome>;
  timeHorizon?: TimeHorizon;
  constraints?: string[];
  assumptions?: Assumption[];
  dependencies?: Dependency[];
  successCriteria?: SuccessCriterion[];
}

// ============================================================
// PROPOSED MISSION — Result of OBJECTIVE→MISSION proposal
// ============================================================
export interface ProposedMission {
  sourceObjectiveId: string;
  input: CreateMissionInput;
  missingInformation: string[];
  createdAt: string;
}
