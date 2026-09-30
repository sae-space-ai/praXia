/**
 * PRAXIA — Domain: Objective Module
 *
 * Barrel export for the Objective domain module.
 */

// Types
export type {
  Objective,
  ObjectiveClass,
  OperationalStatus,
  TimeHorizon,
  Baseline,
  BaselineState,
  Target,
  TargetState,
  KPI,
  MeasurementStatus,
  Evaluation,
  CreateObjectiveInput,
  ProposedObjective,
} from './types';

// Relations
export type {
  NeedObjectiveRelation,
  CreateRelationInput,
} from './relations';

// Catalogs
export {
  OBJECTIVE_CLASSES,
  getObjectiveClassLabel,
  OPERATIONAL_STATUSES,
  getOperationalStatusLabel,
  TIME_HORIZONS,
  getTimeHorizonLabel,
  BASELINE_STATES,
  getBaselineStateLabel,
  TARGET_STATES,
  getTargetStateLabel,
  MEASUREMENT_STATUSES,
  getMeasurementStatusLabel,
} from './catalogs';

// Proposal
export { proposeObjectiveFromNeed } from './proposal';

// Service
export {
  createObjectiveService,
  getAllObjectivesService,
  getObjectiveService,
  updateObjectiveService,
  deleteObjectiveService,
  updateOperationalStatusService,
  validateObjectiveInput,
  validateHierarchy,
  createRelationService,
  getRelationsByNeedService,
  getRelationsByObjectiveService,
  deleteRelationService,
  cleanupRelationsForNeedService,
} from './objectiveService';
export type { ValidationResult } from './objectiveService';
