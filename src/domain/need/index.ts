/**
 * PRAXIA — Domain: Need Module
 * 
 * Barrel export for the Need domain module.
 */

// Types
export type {
  Need,
  NeedType,
  NeedStatus,
  NeedPriority,
  VerificationState,
  CreateNeedInput,
  Symptom,
  Evidence,
  AffectedArea,
  NeedObjectiveRelation,
} from './types';

// Families
export { FAMILIES, getFamilyById, isValidFamilyId } from './families';
export type { Family } from './families';

// Need Types
export { NEED_TYPES, getNeedTypeLabel } from './needTypes';
export type { NeedTypeDefinition } from './needTypes';

// Verification
export { VERIFICATION_STATES, getVerificationLabel, getVerificationColor } from './verification';
export type { VerificationStateDefinition } from './verification';

// Service
export {
  createNeedService,
  getAllNeedsService,
  getNeedService,
  deleteNeedService,
  updateNeedStatusService,
  validateNeedInput,
} from './needService';
export type { ValidationResult } from './needService';
