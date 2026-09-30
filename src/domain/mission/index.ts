/**
 * PRAXIA — Domain: Mission Module
 *
 * Barrel export for the Mission domain module.
 */

// Types
export type {
  Mission,
  MissionType,
  MissionOperationalStatus,
  MissionScope,
  ExpectedOutcome,
  ExpectedOutcomeState,
  Assumption,
  AssumptionStatus,
  Dependency,
  DependencyStatus,
  SuccessCriterion,
  MeasurementStatus,
  MissionEvaluation,
  CreateMissionInput,
  ProposedMission,
} from './types';

// Relations
export type {
  ObjectiveMissionRelation,
  CreateObjectiveMissionRelationInput,
} from './relations';

// Catalogs
export {
  MISSION_TYPES,
  getMissionTypeLabel,
  MISSION_OPERATIONAL_STATUSES,
  getMissionOperationalStatusLabel,
  ASSUMPTION_STATUSES,
  getAssumptionStatusLabel,
  DEPENDENCY_STATUSES,
  getDependencyStatusLabel,
  MEASUREMENT_STATUSES,
  getMeasurementStatusLabel,
  EXPECTED_OUTCOME_STATES,
  getExpectedOutcomeStateLabel,
} from './catalogs';

// Proposal
export { proposeMissionFromObjective } from './proposal';

// Service
export {
  createMissionService,
  getAllMissionsService,
  getMissionService,
  updateMissionService,
  deleteMissionService,
  updateMissionOperationalStatusService,
  validateMissionInput,
  createObjectiveMissionRelationService,
  getMissionsForObjectiveService,
  getObjectivesForMissionService,
  deleteObjectiveMissionRelationService,
  cleanupObjectiveMissionRelationsForObjectiveService,
  resolveOrganizationId,
} from './missionService';
export type { ValidationResult } from './missionService';
