/**
 * PRAXIA — Domain: NEED
 * 
 * The NEED is the fundamental entry point of the system.
 * It represents a real problem, need, opportunity, risk, or decision
 * that an organization wants to address.
 */

// ============================================================
// NEED TYPES — What kind of need is this?
// ============================================================
export type NeedType =
  | 'PROBLEM'
  | 'NEED'
  | 'OPPORTUNITY'
  | 'RISK'
  | 'OBLIGATION'
  | 'DECISION'
  | 'TRANSFORMATION'
  | 'INCIDENT'
  | 'UNCERTAINTY'
  | 'AMBITION';

// ============================================================
// VERIFICATION STATES — Truth semantics
// ============================================================
// PRAXIA never converts a hypothesis into a fact automatically.
export type VerificationState =
  | 'UNKNOWN'
  | 'HYPOTHESIS'
  | 'SUPPORTED'
  | 'VERIFIED';

// ============================================================
// NEED STATUS — Lifecycle state
// ============================================================
export type NeedStatus =
  | 'DRAFT'
  | 'REGISTERED'
  | 'IN_DIAGNOSIS'
  | 'OBJECTIVES_DEFINED'
  | 'IN_PROGRESS'
  | 'EVALUATED'
  | 'CLOSED'
  | 'ARCHIVED';

// ============================================================
// PRIORITY
// ============================================================
export type NeedPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_ASSESSED';

// ============================================================
// SYMPTOM — A symptom observed but not yet diagnosed
// ============================================================
export interface Symptom {
  id: string;
  description: string;
  observedAt: string;
  verificationState: VerificationState;
}

// ============================================================
// EVIDENCE — Evidence attached to a need
// ============================================================
export interface Evidence {
  id: string;
  description: string;
  source: string;
  collectedAt: string;
  verificationState: VerificationState;
}

// ============================================================
// AFFECTED AREA — Area of the organization affected
// ============================================================
export interface AffectedArea {
  id: string;
  name: string;
  familyId: string | null;
}

// ============================================================
// NEED — Core entity
// ============================================================
export interface Need {
  // Core identity
  id: string;
  organizationId: string;
  
  // Description
  title: string;
  description: string;
  
  // Classification
  type: NeedType;
  domain: string; // familyId (F01-F09)
  
  // Lifecycle
  status: NeedStatus;
  priority: NeedPriority;
  
  // Verification
  overallVerification: VerificationState;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Extensible fields — may be empty, UNKNOWN, or NOT_ASSESSED
  symptoms: Symptom[];
  evidence: Evidence[];
  affectedAreas: AffectedArea[];
  relatedNeedIds: string[];
  constraints: string[];
  owner: string | null;
  source: string | null;
  confidence: VerificationState; // Uses verification semantics, not percentages
  
  // Future relationships (prepared but not yet implemented)
  // These IDs will link to future OBJECTIVE entities
  objectiveIds: string[];
}

// ============================================================
// CREATE NEED INPUT — What's required to create a new Need
// ============================================================
export interface CreateNeedInput {
  organizationId: string;
  title: string;
  description: string;
  type: NeedType;
  domain: string;
  priority: NeedPriority;
}

// ============================================================
// NEED RELATIONSHIP — Prepared for future many-to-many
// ============================================================
export interface NeedObjectiveRelation {
  needId: string;
  objectiveId: string;
  createdAt: string;
  verificationState: VerificationState;
}
