/**
 * PRAXIA — Domain: OBJECTIVE
 *
 * An OBJECTIVE represents a structured, traceable, and evaluable
 * business goal derived from one or more NEEDs.
 *
 * HIERARCHY:
 *   GENERAL → THEMATIC → SPECIFIC
 *
 * SOURCE OF TRUTH for NEED↔OBJECTIVE relationship:
 *   NeedObjectiveRelation (see relations.ts)
 *
 * NOTE: objectiveIds on Need (Order 1) is DEPRECATED.
 *       It is kept for backward compatibility only.
 *       Do not write to it. Do not use it as source of truth.
 */

import type { VerificationState } from '../need/types';

// ============================================================
// OBJECTIVE CLASS — Hierarchical level
// ============================================================
export type ObjectiveClass = 'GENERAL' | 'THEMATIC' | 'SPECIFIC';

// ============================================================
// OPERATIONAL STATUS — Execution lifecycle (separate from truth)
// ============================================================
export type OperationalStatus =
  | 'DRAFT'
  | 'PROPOSED'
  | 'APPROVED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED';

// ============================================================
// TIME HORIZON
// ============================================================
export type TimeHorizon =
  | 'SHORT_TERM'
  | 'MEDIUM_TERM'
  | 'LONG_TERM'
  | 'UNDEFINED';

// ============================================================
// BASELINE — Distinguishes real zero from unknown
// ============================================================
export type BaselineState = 'KNOWN' | 'UNKNOWN' | 'INTERNAL_DATA_REQUIRED';

export interface Baseline {
  state: BaselineState;
  /** Numeric value. Only meaningful when state === 'KNOWN'. */
  value: number | null;
  /** Unit of measure (free text, e.g. "EUR", "units", "%"). */
  unit: string | null;
  /** Optional reference date for the baseline measurement. */
  referenceDate: string | null;
}

// ============================================================
// TARGET — Distinguishes undefined from zero
// ============================================================
export type TargetState = 'DEFINED' | 'UNDEFINED' | 'INTERNAL_DATA_REQUIRED';

export interface Target {
  state: TargetState;
  value: number | null;
  unit: string | null;
  deadline: string | null;
}

// ============================================================
// KPI — Minimal structure for Order 2
// ============================================================
export type MeasurementStatus =
  | 'NOT_MEASURED'
  | 'IN_PROGRESS'
  | 'MEASURED'
  | 'VERIFIED';

export interface KPI {
  id: string;
  name: string;
  description: string;
  unit: string | null;
  baselineReference: string | null;
  targetReference: string | null;
  measurementStatus: MeasurementStatus;
}

// ============================================================
// EVALUATION — Three conceptual levels prepared (not computed)
// ============================================================
export interface Evaluation {
  executionProgress: 'NOT_MEASURED' | 'UNKNOWN';
  evidenceCoverage: 'NOT_MEASURED' | 'UNKNOWN';
  objectiveAttainment: 'NOT_MEASURED' | 'UNKNOWN';
  // Future: verifiedValue (NOT IMPLEMENTED in Order 2)
}

// ============================================================
// OBJECTIVE — Core entity
// ============================================================
export interface Objective {
  // Identity
  id: string;
  organizationId: string;

  // Description
  title: string;
  description: string;

  // Classification
  objectiveClass: ObjectiveClass;

  // Hierarchy (parent reference)
  parentObjectiveId: string | null;

  // Measurement
  baseline: Baseline;
  target: Target;
  kpis: KPI[];

  // Time
  timeHorizon: TimeHorizon;

  // Constraints (free text, no fake data)
  constraints: string[];

  // Epistemological status (truth/evidence)
  verificationStatus: VerificationState;

  // Operational lifecycle (execution)
  operationalStatus: OperationalStatus;

  // Evaluation (prepared, not computed)
  evaluation: Evaluation;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Future extensibility (prepared, not implemented)
  // These IDs will link to future entities
  missionIds: string[];
  taskIds: string[];
  evidenceIds: string[];
  decisionIds: string[];
  resultIds: string[];
  // verifiedValue: NOT IMPLEMENTED in Order 2
}

// ============================================================
// CREATE OBJECTIVE INPUT
// ============================================================
export interface CreateObjectiveInput {
  organizationId: string;
  title: string;
  description: string;
  objectiveClass: ObjectiveClass;
  parentObjectiveId?: string | null;
  baseline?: Partial<Baseline>;
  target?: Partial<Target>;
  timeHorizon?: TimeHorizon;
  constraints?: string[];
  kpis?: KPI[];
}

// ============================================================
// PROPOSED OBJECTIVE — Result of NEED→OBJECTIVE proposal
// ============================================================
// A proposal is NOT yet persisted. It requires human review.
export interface ProposedObjective {
  sourceNeedId: string;
  input: CreateObjectiveInput;
  missingInformation: string[];
  createdAt: string;
}
