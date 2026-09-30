/**
 * PRAXIA — Domain: Task
 * 
 * A Task is a governed unit of work that contributes to a WorkPlan/Mission.
 * NOT a simple checklist item — it has governance, readiness, and traceability.
 */

import type { VerificationState } from '../need/types';
import type { WorkPlan } from '../workplan/types';

// ============================================================
// TASK TYPE — Classification of work
// ============================================================
export type TaskType =
  | 'DISCOVERY'
  | 'RESEARCH'
  | 'DATA_COLLECTION'
  | 'DATA_VALIDATION'
  | 'ANALYSIS'
  | 'CALCULATION'
  | 'MODELING'
  | 'SIMULATION'
  | 'COMPARISON'
  | 'CHALLENGE'
  | 'DOCUMENTATION'
  | 'REVIEW'
  | 'DECISION_PREPARATION'
  | 'IMPLEMENTATION_PREPARATION'
  | 'MEASUREMENT'
  | 'VALIDATION'
  | 'OTHER';

// ============================================================
// TASK OPERATIONAL STATUS — Execution lifecycle
// ============================================================
export type TaskOperationalStatus =
  | 'DRAFT'
  | 'READY'
  | 'BLOCKED'
  | 'IN_PROGRESS'
  | 'AWAITING_HUMAN'
  | 'COMPLETED'
  | 'CANCELLED';

// ============================================================
// EXECUTION METHOD — How the task should be executed
// ============================================================
export type ExecutionMethod =
  | 'HUMAN'
  | 'AI_REASONING'
  | 'DETERMINISTIC'
  | 'HYBRID'
  | 'UNASSIGNED';

// ============================================================
// PRIORITY
// ============================================================
export type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_ASSESSED';

// ============================================================
// ASSUMPTION — Distinguished from facts
// ============================================================
export type AssumptionStatus = 'UNTESTED' | 'SUPPORTED' | 'REJECTED' | 'UNKNOWN';

export interface TaskAssumption {
  id: string;
  statement: string;
  status: AssumptionStatus;
}

// ============================================================
// SUCCESS CRITERION — Evaluation criteria
// ============================================================
export type MeasurementStatus = 'NOT_MEASURED' | 'PARTIALLY_MEASURED' | 'MEASURED';

export interface TaskSuccessCriterion {
  id: string;
  description: string;
  measurementStatus: MeasurementStatus;
}

// ============================================================
// TASK — Core entity
// ============================================================
export interface Task {
  id: string;
  organizationId: string;
  
  title: string;
  description: string;
  
  taskType: TaskType;
  
  purpose: string;
  expectedOutput: string;
  
  operationalStatus: TaskOperationalStatus;
  verificationStatus: VerificationState;
  
  executionMethod: ExecutionMethod;
  priority: TaskPriority;
  
  constraints: string[];
  assumptions: TaskAssumption[];
  dependencies: string[]; // Legacy field, use TaskDependencyRelation instead
  
  successCriteria: TaskSuccessCriterion[];
  
  humanApprovalRequired: boolean;
  
  createdAt: string;
  updatedAt: string;
  
  // Future extensibility (prepared, not implemented)
  // NOT source of truth for relations
  capabilityIds: string[]; // DEPRECATED_AS_RELATION_SOURCE
  dataRequirementIds: string[]; // DEPRECATED_AS_RELATION_SOURCE
}

// ============================================================
// CREATE TASK INPUT
// ============================================================
export interface CreateTaskInput {
  organizationId: string;
  title: string;
  description: string;
  taskType: TaskType;
  purpose: string;
  expectedOutput: string;
  executionMethod?: ExecutionMethod;
  priority?: TaskPriority;
  constraints?: string[];
  assumptions?: TaskAssumption[];
  successCriteria?: TaskSuccessCriterion[];
  humanApprovalRequired?: boolean;
}

// ============================================================
// TASK DEPENDENCY RELATION — SOURCE OF TRUTH
// ============================================================
export type DependencyType =
  | 'FINISH_TO_START'
  | 'START_TO_START'
  | 'FINISH_TO_FINISH'
  | 'START_TO_FINISH';

export interface TaskDependencyRelation {
  id: string;
  organizationId: string;
  predecessorTaskId: string;
  successorTaskId: string;
  dependencyType: DependencyType;
  createdAt: string;
}

export interface CreateTaskDependencyInput {
  organizationId: string;
  predecessorTaskId: string;
  successorTaskId: string;
  dependencyType: DependencyType;
}

// ============================================================
// TASK CAPABILITY REQUIREMENT — SOURCE OF TRUTH
// ============================================================
export type RequirementLevel =
  | 'BASIC'
  | 'INTERMEDIATE'
  | 'ADVANCED'
  | 'EXPERT'
  | 'UNSPECIFIED';

export interface TaskCapabilityRequirement {
  id: string;
  organizationId: string;
  taskId: string;
  capabilityId: string;
  requirementLevel: RequirementLevel;
  isMandatory: boolean;
  createdAt: string;
}

export interface CreateTaskCapabilityRequirementInput {
  organizationId: string;
  taskId: string;
  capabilityId: string;
  requirementLevel?: RequirementLevel;
  isMandatory?: boolean;
}

// ============================================================
// DATA REQUIREMENT
// ============================================================
export type DataCategory =
  | 'FINANCIAL'
  | 'OPERATIONAL'
  | 'MARKET'
  | 'TECHNICAL'
  | 'REGULATORY'
  | 'HUMAN_RESOURCES'
  | 'CUSTOMER'
  | 'SUPPLIER'
  | 'OTHER';

export type DataAvailabilityStatus =
  | 'UNKNOWN'
  | 'AVAILABLE'
  | 'PARTIALLY_AVAILABLE'
  | 'NOT_AVAILABLE'
  | 'REQUESTED';

export type SourceExpectation = 'INTERNAL' | 'EXTERNAL' | 'EITHER' | 'NOT_DEFINED';

export interface DataRequirement {
  id: string;
  organizationId: string;
  taskId: string;
  
  name: string;
  description: string;
  purpose: string;
  
  dataCategory: DataCategory;
  
  required: boolean;
  availabilityStatus: DataAvailabilityStatus;
  verificationStatus: VerificationState;
  
  sourceExpectation: SourceExpectation;
  
  blockingIfMissing: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface CreateDataRequirementInput {
  organizationId: string;
  taskId: string;
  name: string;
  description: string;
  purpose: string;
  dataCategory: DataCategory;
  required?: boolean;
  availabilityStatus?: DataAvailabilityStatus;
  sourceExpectation?: SourceExpectation;
  blockingIfMissing?: boolean;
}

// ============================================================
// HUMAN GATE
// ============================================================
export type GateType = 'REVIEW' | 'APPROVAL' | 'AUTHORIZATION' | 'OVERRIDE' | 'DECISION';

export type GateStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface HumanGate {
  id: string;
  organizationId: string;
  
  entityType: 'TASK' | 'WORKPLAN' | 'MISSION';
  entityId: string;
  
  gateType: GateType;
  status: GateStatus;
  
  reason: string;
  requiredRole: string | null;
  
  createdAt: string;
  resolvedAt: string | null;
}

export interface CreateHumanGateInput {
  organizationId: string;
  entityType: 'TASK' | 'WORKPLAN' | 'MISSION';
  entityId: string;
  gateType: GateType;
  reason: string;
  requiredRole?: string | null;
}

// ============================================================
// READINESS RESULT
// ============================================================
export interface TaskReadinessResult {
  ready: boolean;
  blockingReasons: string[];
  warnings: string[];
  evaluatedAt: string;
}

export interface WorkPlanReadinessResult {
  ready: boolean;
  blockingTasks: string[];
  blockingReasons: string[];
  warnings: string[];
  evaluatedAt: string;
}

// ============================================================
// TRACEABILITY
// ============================================================
export interface MissionExecutionTrace {
  missionId: string;
  currentWorkPlan: WorkPlan | null;
  tasks: Task[];
  capabilities: string[]; // capabilityIds
  dataRequirements: DataRequirement[];
  humanGates: HumanGate[];
  dependencies: TaskDependencyRelation[];
}
