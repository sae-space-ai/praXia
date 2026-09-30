/**
 * PRAXIA — Tests: Mission Domain & Service
 *
 * T31 — create valid MISSION
 * T32 — reject invalid MISSION
 * T33 — default operationalStatus = DRAFT
 * T34 — default verificationStatus = UNKNOWN
 * T35 — create OBJECTIVE↔MISSION relation
 * T36 — prevent duplicate OBJECTIVE↔MISSION relation
 * T37 — one OBJECTIVE can relate to many MISSIONS
 * T38 — one MISSION can relate to many OBJECTIVES
 * T39 — deleting relation preserves OBJECTIVE and MISSION
 * T40 — deleting MISSION cleans relations but preserves OBJECTIVES
 * T41 — deleting OBJECTIVE cleans ObjectiveMissionRelations
 * T42 — deleting OBJECTIVE still preserves related NEEDS
 * T43 — deleting NEED preserves OBJECTIVES and MISSIONS
 * T44 — proposeMissionFromObjective does not invent expected outcome
 * T45 — proposal does not invent quantitative result
 * T46 — proposal does not invent success criteria
 * T47 — proposal does not invent assumptions
 * T48 — proposal does not invent dependencies
 * T49 — proposal requires HUMAN REVIEW before persistence
 * T50 — COMPLETED does not imply VERIFIED
 * T51 — COMPLETED does not automatically imply 100% progress
 * T52 — operationalStatus and verificationStatus remain independent
 * T53 — Objective.missionIds is NOT relation SOURCE OF TRUTH
 * T54 — relation cannot reference nonexistent OBJECTIVE
 * T55 — relation cannot reference nonexistent MISSION
 * T56 — relation cannot cross organization boundary
 * T57 — missing objective information is represented as missingInformation
 * T58 — UNKNOWN/UNDEFINED is not represented as zero
 * T59 — success criterion NOT_MEASURED is not treated as achieved
 * T60 — deletion cascade affects relations only as specified
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createMissionService,
  getAllMissionsService,
  getMissionService,
  deleteMissionService,
  updateMissionOperationalStatusService,
  createObjectiveMissionRelationService,
  getMissionsForObjectiveService,
  getObjectivesForMissionService,
  deleteObjectiveMissionRelationService,
} from './missionService';
import { proposeMissionFromObjective } from './proposal';
import { createObjectiveService, deleteObjectiveService, createRelationService } from '../objective/objectiveService';
import { createNeedService, deleteNeedService, getNeedService } from '../need/needService';
import type { CreateMissionInput } from './types';
import type { CreateObjectiveInput } from '../objective/types';

// ============================================================
// SETUP
// ============================================================
function clearStorage(): void {
  localStorage.clear();
}

function validMissionInput(overrides: Record<string, unknown> = {}): CreateMissionInput {
  return {
    organizationId: 'org_test',
    title: 'Test Mission',
    description: 'Test mission description.',
    missionType: 'ANALYSIS',
    ...overrides,
  };
}

function validObjectiveInput(overrides: Record<string, unknown> = {}): CreateObjectiveInput {
  return {
    organizationId: 'org_test',
    title: 'Test Objective',
    description: 'Test objective description.',
    objectiveClass: 'SPECIFIC',
    ...overrides,
  };
}

function createTestObjective() {
  const result = createObjectiveService(validObjectiveInput());
  return result.objective!;
}

function createTestNeed() {
  const result = createNeedService({
    organizationId: 'org_test',
    title: 'Test Need',
    description: 'Test need description.',
    type: 'PROBLEM',
    domain: 'F01',
    priority: 'MEDIUM',
  });
  return result.need!;
}

// ============================================================
// T31 — Create valid MISSION
// ============================================================
describe('T31 — Create valid MISSION', () => {
  beforeEach(() => clearStorage());

  it('creates a mission with all required fields', () => {
    const result = createMissionService(validMissionInput());
    expect(result.success).toBe(true);
    expect(result.mission).toBeDefined();

    const mission = result.mission!;
    expect(mission.id).toBeTruthy();
    expect(mission.organizationId).toBe('org_test');
    expect(mission.title).toBe('Test Mission');
    expect(mission.missionType).toBe('ANALYSIS');
    expect(mission.operationalStatus).toBe('DRAFT');
    expect(mission.verificationStatus).toBe('UNKNOWN');
  });
});

// ============================================================
// T32 — Reject invalid MISSION
// ============================================================
describe('T32 — Reject invalid MISSION', () => {
  beforeEach(() => clearStorage());

  it('rejects mission with empty title', () => {
    const result = createMissionService(validMissionInput({ title: '' }));
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });

  it('rejects mission with invalid type', () => {
    const result = createMissionService(
      validMissionInput({ missionType: 'INVALID_TYPE' })
    );
    expect(result.success).toBe(false);
  });

  it('does not persist invalid mission', () => {
    createMissionService(validMissionInput({ title: '' }));
    expect(getAllMissionsService()).toHaveLength(0);
  });
});

// ============================================================
// T33 — Default operationalStatus = DRAFT
// ============================================================
describe('T33 — Default operationalStatus = DRAFT', () => {
  beforeEach(() => clearStorage());

  it('new mission has operationalStatus DRAFT', () => {
    const result = createMissionService(validMissionInput());
    expect(result.mission!.operationalStatus).toBe('DRAFT');
  });
});

// ============================================================
// T34 — Default verificationStatus = UNKNOWN
// ============================================================
describe('T34 — Default verificationStatus = UNKNOWN', () => {
  beforeEach(() => clearStorage());

  it('new mission has verificationStatus UNKNOWN', () => {
    const result = createMissionService(validMissionInput());
    expect(result.mission!.verificationStatus).toBe('UNKNOWN');
  });
});

// ============================================================
// T35 — Create OBJECTIVE↔MISSION relation
// ============================================================
describe('T35 — Create OBJECTIVE↔MISSION relation', () => {
  beforeEach(() => clearStorage());

  it('creates a relation between OBJECTIVE and MISSION', () => {
    const objective = createTestObjective();
    const mission = createMissionService(validMissionInput()).mission!;

    const result = createObjectiveMissionRelationService({
      organizationId: 'org_test',
      objectiveId: objective.id,
      missionId: mission.id,
    });

    expect(result.success).toBe(true);
    expect(result.relation).toBeDefined();
    expect(result.relation!.objectiveId).toBe(objective.id);
    expect(result.relation!.missionId).toBe(mission.id);
  });
});

// ============================================================
// T36 — Prevent duplicate OBJECTIVE↔MISSION relation
// ============================================================
describe('T36 — Prevent duplicate OBJECTIVE↔MISSION relation', () => {
  beforeEach(() => clearStorage());

  it('rejects duplicate relation', () => {
    const objective = createTestObjective();
    const mission = createMissionService(validMissionInput()).mission!;

    createObjectiveMissionRelationService({
      organizationId: 'org_test',
      objectiveId: objective.id,
      missionId: mission.id,
    });

    const result = createObjectiveMissionRelationService({
      organizationId: 'org_test',
      objectiveId: objective.id,
      missionId: mission.id,
    });

    expect(result.success).toBe(false);
    expect(result.errors!.some((e) => e.includes('ya existe'))).toBe(true);
  });
});

// ============================================================
// T37 — One OBJECTIVE can relate to many MISSIONS
// ============================================================
describe('T37 — One OBJECTIVE can relate to many MISSIONS', () => {
  beforeEach(() => clearStorage());

  it('relates one OBJECTIVE to multiple MISSIONS', () => {
    const objective = createTestObjective();
    const mission1 = createMissionService(validMissionInput({ title: 'Mission 1' })).mission!;
    const mission2 = createMissionService(validMissionInput({ title: 'Mission 2' })).mission!;

    createObjectiveMissionRelationService({
      organizationId: 'org_test',
      objectiveId: objective.id,
      missionId: mission1.id,
    });
    createObjectiveMissionRelationService({
      organizationId: 'org_test',
      objectiveId: objective.id,
      missionId: mission2.id,
    });

    const relations = getMissionsForObjectiveService(objective.id);
    expect(relations).toHaveLength(2);
  });
});

// ============================================================
// T38 — One MISSION can relate to many OBJECTIVES
// ============================================================
describe('T38 — One MISSION can relate to many OBJECTIVES', () => {
  beforeEach(() => clearStorage());

  it('relates one MISSION to multiple OBJECTIVEs', () => {
    const objective1 = createObjectiveService(
      validObjectiveInput({ title: 'Objective 1' })
    ).objective!;
    const objective2 = createObjectiveService(
      validObjectiveInput({ title: 'Objective 2' })
    ).objective!;
    const mission = createMissionService(validMissionInput()).mission!;

    createObjectiveMissionRelationService({
      organizationId: 'org_test',
      objectiveId: objective1.id,
      missionId: mission.id,
    });
    createObjectiveMissionRelationService({
      organizationId: 'org_test',
      objectiveId: objective2.id,
      missionId: mission.id,
    });

    const relations = getObjectivesForMissionService(mission.id);
    expect(relations).toHaveLength(2);
  });
});

// ============================================================
// T39 — Deleting relation preserves OBJECTIVE and MISSION
// ============================================================
describe('T39 — Deleting relation preserves OBJECTIVE and MISSION', () => {
  beforeEach(() => clearStorage());

  it('deleting a relation does not delete the entities', () => {
    const objective = createTestObjective();
    const mission = createMissionService(validMissionInput()).mission!;
    const relation = createObjectiveMissionRelationService({
      organizationId: 'org_test',
      objectiveId: objective.id,
      missionId: mission.id,
    }).relation!;

    deleteObjectiveMissionRelationService(relation.id);

    // Entities still exist
    expect(getObjectiveService(objective.id)).not.toBeNull();
    expect(getMissionService(mission.id)).not.toBeNull();
    // Relation is gone
    expect(getMissionsForObjectiveService(objective.id)).toHaveLength(0);
  });
});

// ============================================================
// T40 — Deleting MISSION cleans relations but preserves OBJECTIVES
// ============================================================
describe('T40 — Deleting MISSION cleans relations but preserves OBJECTIVES', () => {
  beforeEach(() => clearStorage());

  it('deleting a mission removes its relations but keeps the OBJECTIVE', () => {
    const objective = createTestObjective();
    const mission = createMissionService(validMissionInput()).mission!;
    createObjectiveMissionRelationService({
      organizationId: 'org_test',
      objectiveId: objective.id,
      missionId: mission.id,
    });

    deleteMissionService(mission.id);

    // Mission is gone
    expect(getMissionService(mission.id)).toBeNull();
    // Relation is gone
    expect(getMissionsForObjectiveService(objective.id)).toHaveLength(0);
    // OBJECTIVE still exists
    expect(getObjectiveService(objective.id)).not.toBeNull();
  });
});

// ============================================================
// T41 — Deleting OBJECTIVE cleans ObjectiveMissionRelations
// ============================================================
describe('T41 — Deleting OBJECTIVE cleans ObjectiveMissionRelations', () => {
  beforeEach(() => clearStorage());

  it('deleting an objective removes its mission relations', () => {
    const objective = createTestObjective();
    const mission = createMissionService(validMissionInput()).mission!;
    createObjectiveMissionRelationService({
      organizationId: 'org_test',
      objectiveId: objective.id,
      missionId: mission.id,
    });

    deleteObjectiveService(objective.id);

    // Relation is gone
    expect(getObjectivesForMissionService(mission.id)).toHaveLength(0);
  });
});

// ============================================================
// T42 — Deleting OBJECTIVE still preserves related NEEDS
// ============================================================
describe('T42 — Deleting OBJECTIVE still preserves related NEEDS', () => {
  beforeEach(() => clearStorage());

  it('deleting an objective does not delete related NEEDs', () => {
    const need = createTestNeed();
    const objective = createTestObjective();

    // Create NeedObjectiveRelation (from Order 2)
    createRelationService({ needId: need.id, objectiveId: objective.id });

    deleteObjectiveService(objective.id);

    // NEED still exists
    expect(getNeedService(need.id)).not.toBeNull();
  });
});

// ============================================================
// T43 — Deleting NEED preserves OBJECTIVES and MISSIONS
// ============================================================
describe('T43 — Deleting NEED preserves OBJECTIVES and MISSIONS', () => {
  beforeEach(() => clearStorage());

  it('deleting a need does not delete OBJECTIVEs or MISSIONs', () => {
    const need = createTestNeed();
    const objective = createTestObjective();
    const mission = createMissionService(validMissionInput()).mission!;

    // Create relations
    createRelationService({ needId: need.id, objectiveId: objective.id });
    createObjectiveMissionRelationService({
      organizationId: 'org_test',
      objectiveId: objective.id,
      missionId: mission.id,
    });

    deleteNeedService(need.id);

    // OBJECTIVE and MISSION still exist
    expect(getObjectiveService(objective.id)).not.toBeNull();
    expect(getMissionService(mission.id)).not.toBeNull();
  });
});

// ============================================================
// T44 — proposeMissionFromObjective does not invent expected outcome
// ============================================================
describe('T44 — Proposal does not invent expected outcome', () => {
  beforeEach(() => clearStorage());

  it('proposal expectedOutcome state is UNDEFINED', () => {
    const objective = createTestObjective();
    const proposal = proposeMissionFromObjective(objective);

    expect(proposal.input.expectedOutcome?.state).toBe('UNDEFINED');
    expect(proposal.input.expectedOutcome?.description).toBeNull();
  });
});

// ============================================================
// T45 — Proposal does not invent quantitative result
// ============================================================
describe('T45 — Proposal does not invent quantitative result', () => {
  beforeEach(() => clearStorage());

  it('proposal does not contain quantitative values', () => {
    const objective = createTestObjective();
    const proposal = proposeMissionFromObjective(objective);

    // No numeric values in expected outcome
    expect(proposal.input.expectedOutcome?.description).toBeNull();
  });
});

// ============================================================
// T46 — Proposal does not invent success criteria
// ============================================================
describe('T46 — Proposal does not invent success criteria', () => {
  beforeEach(() => clearStorage());

  it('proposal has no success criteria', () => {
    const objective = createTestObjective();
    const proposal = proposeMissionFromObjective(objective);

    expect(proposal.input.successCriteria).toEqual([]);
  });
});

// ============================================================
// T47 — Proposal does not invent assumptions
// ============================================================
describe('T47 — Proposal does not invent assumptions', () => {
  beforeEach(() => clearStorage());

  it('proposal has no assumptions', () => {
    const objective = createTestObjective();
    const proposal = proposeMissionFromObjective(objective);

    expect(proposal.input.assumptions).toEqual([]);
  });
});

// ============================================================
// T48 — Proposal does not invent dependencies
// ============================================================
describe('T48 — Proposal does not invent dependencies', () => {
  beforeEach(() => clearStorage());

  it('proposal has no dependencies', () => {
    const objective = createTestObjective();
    const proposal = proposeMissionFromObjective(objective);

    expect(proposal.input.dependencies).toEqual([]);
  });
});

// ============================================================
// T49 — Proposal requires HUMAN REVIEW before persistence
// ============================================================
describe('T49 — Proposal requires HUMAN REVIEW', () => {
  beforeEach(() => clearStorage());

  it('proposal is not automatically persisted', () => {
    const objective = createTestObjective();
    proposeMissionFromObjective(objective);

    // No mission should have been created
    expect(getAllMissionsService()).toHaveLength(0);
  });

  it('proposal reports missing information', () => {
    const objective = createTestObjective();
    const proposal = proposeMissionFromObjective(objective);

    expect(proposal.missingInformation.length).toBeGreaterThan(0);
  });
});

// ============================================================
// T50 — COMPLETED does not imply VERIFIED
// ============================================================
describe('T50 — COMPLETED does not imply VERIFIED', () => {
  beforeEach(() => clearStorage());

  it('COMPLETED mission can have UNKNOWN verification', () => {
    const result = createMissionService(validMissionInput());
    const mission = result.mission!;

    updateMissionOperationalStatusService(mission.id, 'COMPLETED');
    const updated = getMissionService(mission.id);

    expect(updated!.operationalStatus).toBe('COMPLETED');
    expect(updated!.verificationStatus).toBe('UNKNOWN');
  });
});

// ============================================================
// T51 — COMPLETED does not automatically imply 100% progress
// ============================================================
describe('T51 — COMPLETED does not imply 100% progress', () => {
  beforeEach(() => clearStorage());

  it('COMPLETED mission has NOT_MEASURED evaluation', () => {
    const result = createMissionService(validMissionInput());
    const mission = result.mission!;

    updateMissionOperationalStatusService(mission.id, 'COMPLETED');
    const updated = getMissionService(mission.id);

    expect(updated!.evaluation.executionProgress).toBe('NOT_MEASURED');
    expect(updated!.evaluation.successCriteriaCoverage).toBe('NOT_MEASURED');
    expect(updated!.evaluation.objectiveContribution).toBe('NOT_MEASURED');
  });
});

// ============================================================
// T52 — operationalStatus and verificationStatus remain independent
// ============================================================
describe('T52 — operationalStatus and verificationStatus are independent', () => {
  beforeEach(() => clearStorage());

  it('changing operationalStatus does not change verificationStatus', () => {
    const result = createMissionService(validMissionInput());
    const mission = result.mission!;

    updateMissionOperationalStatusService(mission.id, 'ACTIVE');
    const updated = getMissionService(mission.id);

    expect(updated!.operationalStatus).toBe('ACTIVE');
    expect(updated!.verificationStatus).toBe('UNKNOWN');
  });
});

// ============================================================
// T53 — Objective.missionIds is NOT relation SOURCE OF TRUTH
// ============================================================
describe('T53 — Objective.missionIds is NOT SOURCE OF TRUTH', () => {
  beforeEach(() => clearStorage());

  it('relations are stored in ObjectiveMissionRelation, not Objective.missionIds', () => {
    const objective = createTestObjective();
    const mission = createMissionService(validMissionInput()).mission!;

    createObjectiveMissionRelationService({
      organizationId: 'org_test',
      objectiveId: objective.id,
      missionId: mission.id,
    });

    // The relation exists in the relation store
    const relations = getMissionsForObjectiveService(objective.id);
    expect(relations).toHaveLength(1);

    // Objective.missionIds is empty (deprecated, not used)
    const freshObjective = getObjectiveService(objective.id);
    expect(freshObjective!.missionIds).toEqual([]);
  });
});

// ============================================================
// T54 — Relation cannot reference nonexistent OBJECTIVE
// ============================================================
describe('T54 — Relation cannot reference nonexistent OBJECTIVE', () => {
  beforeEach(() => clearStorage());

  it('rejects relation with nonexistent objective', () => {
    const mission = createMissionService(validMissionInput()).mission!;

    const result = createObjectiveMissionRelationService({
      organizationId: 'org_test',
      objectiveId: 'nonexistent-id',
      missionId: mission.id,
    });

    expect(result.success).toBe(false);
    expect(result.errors!.some((e) => e.includes('no existe'))).toBe(true);
  });
});

// ============================================================
// T55 — Relation cannot reference nonexistent MISSION
// ============================================================
describe('T55 — Relation cannot reference nonexistent MISSION', () => {
  beforeEach(() => clearStorage());

  it('rejects relation with nonexistent mission', () => {
    const objective = createTestObjective();

    const result = createObjectiveMissionRelationService({
      organizationId: 'org_test',
      objectiveId: objective.id,
      missionId: 'nonexistent-id',
    });

    expect(result.success).toBe(false);
    expect(result.errors!.some((e) => e.includes('no existe'))).toBe(true);
  });
});

// ============================================================
// T56 — Relation cannot cross organization boundary
// ============================================================
describe('T56 — Relation cannot cross organization boundary', () => {
  beforeEach(() => clearStorage());

  it('rejects relation with different organization', () => {
    const objective = createTestObjective();
    const mission = createMissionService(validMissionInput()).mission!;

    const result = createObjectiveMissionRelationService({
      organizationId: 'org_different',
      objectiveId: objective.id,
      missionId: mission.id,
    });

    expect(result.success).toBe(false);
    expect(result.errors!.some((e) => e.includes('organización'))).toBe(true);
  });
});

// ============================================================
// T57 — Missing objective information is represented as missingInformation
// ============================================================
describe('T57 — Missing information is reported', () => {
  beforeEach(() => clearStorage());

  it('proposal reports missing scope', () => {
    const objective = createTestObjective();
    const proposal = proposeMissionFromObjective(objective);

    expect(
      proposal.missingInformation.some((info: string) => info.toLowerCase().includes('alcance'))
    ).toBe(true);
  });
});

// ============================================================
// T58 — UNKNOWN/UNDEFINED is not represented as zero
// ============================================================
describe('T58 — UNKNOWN/UNDEFINED is not zero', () => {
  beforeEach(() => clearStorage());

  it('proposal does not use zero for unknown values', () => {
    const objective = createTestObjective();
    const proposal = proposeMissionFromObjective(objective);

    // Expected outcome is UNDEFINED, not 0
    expect(proposal.input.expectedOutcome?.state).toBe('UNDEFINED');
    expect(proposal.input.expectedOutcome?.description).toBeNull();
  });
});

// ============================================================
// T59 — Success criterion NOT_MEASURED is not treated as achieved
// ============================================================
describe('T59 — NOT_MEASURED is not achieved', () => {
  beforeEach(() => clearStorage());

  it('mission with no criteria has NOT_MEASURED evaluation', () => {
    const result = createMissionService(validMissionInput());
    const mission = result.mission!;

    expect(mission.successCriteria).toEqual([]);
    expect(mission.evaluation.successCriteriaCoverage).toBe('NOT_MEASURED');
  });
});

// ============================================================
// T60 — Deletion cascade affects relations only as specified
// ============================================================
describe('T60 — Deletion cascade is correct', () => {
  beforeEach(() => clearStorage());

  it('deleting mission cleans relations but not objectives', () => {
    const objective = createTestObjective();
    const mission = createMissionService(validMissionInput()).mission!;

    createObjectiveMissionRelationService({
      organizationId: 'org_test',
      objectiveId: objective.id,
      missionId: mission.id,
    });

    deleteMissionService(mission.id);

    expect(getMissionService(mission.id)).toBeNull();
    expect(getObjectiveService(objective.id)).not.toBeNull();
    expect(getMissionsForObjectiveService(objective.id)).toHaveLength(0);
  });
});

// Helper imports
import { getObjectiveService } from '../objective/objectiveService';
