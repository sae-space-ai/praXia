/**
 * PRAXIA — Tests: Objective Domain & Service
 *
 * T11 — crear OBJECTIVE válido
 * T12 — rechazar OBJECTIVE inválido
 * T13 — GENERAL puede existir sin parent
 * T14 — SPECIFIC/THEMATIC respetan reglas de parent
 * T15 — un OBJECTIVE no puede ser su propio parent
 * T16 — crear relación NEED↔OBJECTIVE
 * T17 — impedir relación duplicada
 * T18 — 1 NEED puede relacionarse con varios OBJECTIVES
 * T19 — 1 OBJECTIVE puede relacionarse con varias NEEDs
 * T20 — eliminar relación no elimina NEED ni OBJECTIVE
 * T21 — eliminar OBJECTIVE limpia relaciones pero conserva NEED
 * T22 — eliminar NEED limpia relaciones pero conserva OBJECTIVE
 * T23 — propuesta desde NEED no inventa baseline
 * T24 — propuesta desde NEED no inventa target
 * T25 — propuesta desde NEED no inventa KPI cuantitativo
 * T26 — propuesta requiere revisión humana antes de persistencia
 * T27 — verificationStatus y operationalStatus permanecen separados
 * T28 — baseline UNKNOWN no equivale a cero
 * T29 — target UNDEFINED no equivale a cero
 * T30 — objectiveIds no actúa como SOURCE OF TRUTH
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createObjectiveService,
  getAllObjectivesService,
  getObjectiveService,
  deleteObjectiveService,
  updateObjectiveService,
  createRelationService,
  getRelationsByNeedService,
  getRelationsByObjectiveService,
  deleteRelationService,
  validateObjectiveInput,
} from './objectiveService';
import { proposeObjectiveFromNeed } from './proposal';
import type { Need } from '../need/types';
import { createNeedService, deleteNeedService, getNeedService } from '../need/needService';

// ============================================================
// SETUP
// ============================================================
function clearStorage(): void {
  localStorage.clear();
}

function validObjectiveInput(overrides: Record<string, unknown> = {}) {
  return {
    organizationId: 'org_test',
    title: 'Test Objective',
    description: 'Test objective description.',
    objectiveClass: 'SPECIFIC' as const,
    ...overrides,
  };
}

function createTestNeed(): Need {
  const result = createNeedService({
    organizationId: 'org_test',
    title: 'Test Need for Objective',
    description: 'Need description for testing proposal.',
    type: 'PROBLEM',
    domain: 'F01',
    priority: 'MEDIUM',
  });
  return result.need!;
}

// ============================================================
// T11 — Create valid OBJECTIVE
// ============================================================
describe('T11 — Create valid OBJECTIVE', () => {
  beforeEach(() => clearStorage());

  it('creates an objective with all required fields', () => {
    const result = createObjectiveService(validObjectiveInput());
    expect(result.success).toBe(true);
    expect(result.objective).toBeDefined();

    const obj = result.objective!;
    expect(obj.id).toBeTruthy();
    expect(obj.organizationId).toBe('org_test');
    expect(obj.title).toBe('Test Objective');
    expect(obj.objectiveClass).toBe('SPECIFIC');
    expect(obj.verificationStatus).toBe('UNKNOWN');
    expect(obj.operationalStatus).toBe('DRAFT');
    expect(obj.baseline.state).toBe('UNKNOWN');
    expect(obj.target.state).toBe('UNDEFINED');
  });
});

// ============================================================
// T12 — Reject invalid OBJECTIVE
// ============================================================
describe('T12 — Reject invalid OBJECTIVE', () => {
  beforeEach(() => clearStorage());

  it('rejects objective with empty title', () => {
    const result = createObjectiveService(validObjectiveInput({ title: '' }));
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });

  it('rejects objective with invalid class', () => {
    const result = createObjectiveService(
      validObjectiveInput({ objectiveClass: 'INVALID' })
    );
    expect(result.success).toBe(false);
  });

  it('does not persist invalid objective', () => {
    createObjectiveService(validObjectiveInput({ title: '' }));
    expect(getAllObjectivesService()).toHaveLength(0);
  });
});

// ============================================================
// T13 — GENERAL can exist without parent
// ============================================================
describe('T13 — GENERAL can exist without parent', () => {
  beforeEach(() => clearStorage());

  it('creates GENERAL objective without parent', () => {
    const result = createObjectiveService(
      validObjectiveInput({ objectiveClass: 'GENERAL', parentObjectiveId: null })
    );
    expect(result.success).toBe(true);
    expect(result.objective!.parentObjectiveId).toBeNull();
  });
});

// ============================================================
// T14 — SPECIFIC/THEMATIC hierarchy rules
// ============================================================
describe('T14 — Hierarchy rules for SPECIFIC/THEMATIC', () => {
  beforeEach(() => clearStorage());

  it('THEMATIC with GENERAL parent is valid', () => {
    const general = createObjectiveService(
      validObjectiveInput({ objectiveClass: 'GENERAL', title: 'General' })
    );
    const result = createObjectiveService(
      validObjectiveInput({
        objectiveClass: 'THEMATIC',
        parentObjectiveId: general.objective!.id,
        title: 'Thematic',
      })
    );
    expect(result.success).toBe(true);
  });

  it('SPECIFIC with THEMATIC parent is valid', () => {
    const general = createObjectiveService(
      validObjectiveInput({ objectiveClass: 'GENERAL', title: 'General' })
    );
    const thematic = createObjectiveService(
      validObjectiveInput({
        objectiveClass: 'THEMATIC',
        parentObjectiveId: general.objective!.id,
        title: 'Thematic',
      })
    );
    const result = createObjectiveService(
      validObjectiveInput({
        objectiveClass: 'SPECIFIC',
        parentObjectiveId: thematic.objective!.id,
        title: 'Specific',
      })
    );
    expect(result.success).toBe(true);
  });

  it('SPECIFIC with GENERAL parent is rejected', () => {
    const general = createObjectiveService(
      validObjectiveInput({ objectiveClass: 'GENERAL', title: 'General' })
    );
    const result = createObjectiveService(
      validObjectiveInput({
        objectiveClass: 'SPECIFIC',
        parentObjectiveId: general.objective!.id,
        title: 'Specific',
      })
    );
    expect(result.success).toBe(false);
  });

  it('THEMATIC without parent is allowed (incomplete hierarchy)', () => {
    const result = createObjectiveService(
      validObjectiveInput({
        objectiveClass: 'THEMATIC',
        parentObjectiveId: null,
        title: 'Thematic without parent',
      })
    );
    expect(result.success).toBe(true);
    expect(result.objective!.parentObjectiveId).toBeNull();
  });

  it('SPECIFIC without parent is allowed (incomplete hierarchy)', () => {
    const result = createObjectiveService(
      validObjectiveInput({
        objectiveClass: 'SPECIFIC',
        parentObjectiveId: null,
        title: 'Specific without parent',
      })
    );
    expect(result.success).toBe(true);
    expect(result.objective!.parentObjectiveId).toBeNull();
  });
});

// ============================================================
// T15 — Objective cannot be its own parent
// ============================================================
describe('T15 — Objective cannot be its own parent', () => {
  beforeEach(() => clearStorage());

  it('rejects self-reference at creation', () => {
    // We cannot pass the ID of the objective being created as its own parent
    // because the ID doesn't exist yet. This test verifies the validation
    // catches non-existent parent IDs.
    const result = createObjectiveService(
      validObjectiveInput({ parentObjectiveId: 'non-existent-id' })
    );
    expect(result.success).toBe(false);
    expect(result.errors!.some((e) => e.includes('no existe'))).toBe(true);
  });

  it('rejects self-reference when updating parentObjectiveId', () => {
    // Create an objective
    const createResult = createObjectiveService(validObjectiveInput());
    expect(createResult.success).toBe(true);
    const objective = createResult.objective!;

    // Try to set its own ID as parent
    const updateResult = updateObjectiveService(objective.id, {
      parentObjectiveId: objective.id,
    });

    // Should fail
    expect(updateResult).toBeNull();

    // Verify the objective was not modified
    const unchanged = getObjectiveService(objective.id);
    expect(unchanged).not.toBeNull();
    expect(unchanged!.parentObjectiveId).toBeNull();
  });
});

// ============================================================
// T16 — Create NEED↔OBJECTIVE relation
// ============================================================
describe('T16 — Create NEED↔OBJECTIVE relation', () => {
  beforeEach(() => clearStorage());

  it('creates a relation between a NEED and an OBJECTIVE', () => {
    const need = createTestNeed();
    const objective = createObjectiveService(validObjectiveInput()).objective!;

    const result = createRelationService({
      needId: need.id,
      objectiveId: objective.id,
    });

    expect(result.success).toBe(true);
    expect(result.relation).toBeDefined();
    expect(result.relation!.needId).toBe(need.id);
    expect(result.relation!.objectiveId).toBe(objective.id);
  });
});

// ============================================================
// T17 — Prevent duplicate relation
// ============================================================
describe('T17 — Prevent duplicate relation', () => {
  beforeEach(() => clearStorage());

  it('rejects duplicate NEED↔OBJECTIVE relation', () => {
    const need = createTestNeed();
    const objective = createObjectiveService(validObjectiveInput()).objective!;

    createRelationService({ needId: need.id, objectiveId: objective.id });
    const result = createRelationService({
      needId: need.id,
      objectiveId: objective.id,
    });

    expect(result.success).toBe(false);
    expect(result.errors!.some((e) => e.includes('ya existe'))).toBe(true);
  });
});

// ============================================================
// T18 — 1 NEED → MANY OBJECTIVES
// ============================================================
describe('T18 — 1 NEED can relate to many OBJECTIVES', () => {
  beforeEach(() => clearStorage());

  it('relates one NEED to multiple OBJECTIVEs', () => {
    const need = createTestNeed();
    const obj1 = createObjectiveService(validObjectiveInput({ title: 'Obj 1' })).objective!;
    const obj2 = createObjectiveService(validObjectiveInput({ title: 'Obj 2' })).objective!;

    createRelationService({ needId: need.id, objectiveId: obj1.id });
    createRelationService({ needId: need.id, objectiveId: obj2.id });

    const relations = getRelationsByNeedService(need.id);
    expect(relations).toHaveLength(2);
  });
});

// ============================================================
// T19 — 1 OBJECTIVE → MANY NEEDs
// ============================================================
describe('T19 — 1 OBJECTIVE can relate to many NEEDs', () => {
  beforeEach(() => clearStorage());

  it('relates one OBJECTIVE to multiple NEEDs', () => {
    const need1 = createNeedService({
      organizationId: 'org_test',
      title: 'Need 1',
      description: 'Desc 1',
      type: 'PROBLEM',
      domain: 'F01',
      priority: 'MEDIUM',
    }).need!;
    const need2 = createNeedService({
      organizationId: 'org_test',
      title: 'Need 2',
      description: 'Desc 2',
      type: 'RISK',
      domain: 'F02',
      priority: 'HIGH',
    }).need!;
    const objective = createObjectiveService(validObjectiveInput()).objective!;

    createRelationService({ needId: need1.id, objectiveId: objective.id });
    createRelationService({ needId: need2.id, objectiveId: objective.id });

    const relations = getRelationsByObjectiveService(objective.id);
    expect(relations).toHaveLength(2);
  });
});

// ============================================================
// T20 — Delete relation does not delete NEED or OBJECTIVE
// ============================================================
describe('T20 — Delete relation preserves NEED and OBJECTIVE', () => {
  beforeEach(() => clearStorage());

  it('deleting a relation does not delete the entities', () => {
    const need = createTestNeed();
    const objective = createObjectiveService(validObjectiveInput()).objective!;
    const relation = createRelationService({
      needId: need.id,
      objectiveId: objective.id,
    }).relation!;

    deleteRelationService(relation.id);

    // Entities still exist
    expect(getNeedService(need.id)).not.toBeNull();
    expect(getObjectiveService(objective.id)).not.toBeNull();
    // Relation is gone
    expect(getRelationsByNeedService(need.id)).toHaveLength(0);
  });
});

// ============================================================
// T21 — Delete OBJECTIVE cleans relations, preserves NEED
// ============================================================
describe('T21 — Delete OBJECTIVE cleans relations, preserves NEED', () => {
  beforeEach(() => clearStorage());

  it('deleting an objective removes its relations but keeps the NEED', () => {
    const need = createTestNeed();
    const objective = createObjectiveService(validObjectiveInput()).objective!;
    createRelationService({ needId: need.id, objectiveId: objective.id });

    deleteObjectiveService(objective.id);

    // Objective is gone
    expect(getObjectiveService(objective.id)).toBeNull();
    // Relation is gone
    expect(getRelationsByNeedService(need.id)).toHaveLength(0);
    // NEED still exists
    expect(getNeedService(need.id)).not.toBeNull();
  });
});

// ============================================================
// T22 — Delete NEED cleans relations, preserves OBJECTIVE
// ============================================================
describe('T22 — Delete NEED cleans relations, preserves OBJECTIVE', () => {
  beforeEach(() => clearStorage());

  it('deleting a need removes its relations but keeps the OBJECTIVE', () => {
    const need = createTestNeed();
    const objective = createObjectiveService(validObjectiveInput()).objective!;
    createRelationService({ needId: need.id, objectiveId: objective.id });

    deleteNeedService(need.id);

    // NEED is gone
    expect(getNeedService(need.id)).toBeNull();
    // Relation is gone
    expect(getRelationsByObjectiveService(objective.id)).toHaveLength(0);
    // OBJECTIVE still exists
    expect(getObjectiveService(objective.id)).not.toBeNull();
  });
});

// ============================================================
// T23 — Proposal does not invent baseline
// ============================================================
describe('T23 — Proposal does not invent baseline', () => {
  beforeEach(() => clearStorage());

  it('proposal baseline state is UNKNOWN, not a numeric value', () => {
    const need = createTestNeed();
    const proposal = proposeObjectiveFromNeed(need);

    expect(proposal.input.baseline?.state).toBe('UNKNOWN');
    expect(proposal.input.baseline?.value).toBeNull();
  });
});

// ============================================================
// T24 — Proposal does not invent target
// ============================================================
describe('T24 — Proposal does not invent target', () => {
  beforeEach(() => clearStorage());

  it('proposal target state is UNDEFINED, not a numeric value', () => {
    const need = createTestNeed();
    const proposal = proposeObjectiveFromNeed(need);

    expect(proposal.input.target?.state).toBe('UNDEFINED');
    expect(proposal.input.target?.value).toBeNull();
    expect(proposal.input.target?.deadline).toBeNull();
  });
});

// ============================================================
// T25 — Proposal does not invent quantitative KPI
// ============================================================
describe('T25 — Proposal does not invent quantitative KPI', () => {
  beforeEach(() => clearStorage());

  it('proposal has no KPIs', () => {
    const need = createTestNeed();
    const proposal = proposeObjectiveFromNeed(need);

    expect(proposal.input.kpis).toEqual([]);
  });
});

// ============================================================
// T26 — Proposal requires human review before persistence
// ============================================================
describe('T26 — Proposal requires human review', () => {
  beforeEach(() => clearStorage());

  it('proposal is not automatically persisted', () => {
    const need = createTestNeed();
    proposeObjectiveFromNeed(need);

    // No objective should have been created
    expect(getAllObjectivesService()).toHaveLength(0);
  });

  it('proposal reports missing information', () => {
    const need = createTestNeed();
    const proposal = proposeObjectiveFromNeed(need);

    expect(proposal.missingInformation.length).toBeGreaterThan(0);
  });
});

// ============================================================
// T27 — verificationStatus and operationalStatus are separate
// ============================================================
describe('T27 — verificationStatus and operationalStatus are separate', () => {
  beforeEach(() => clearStorage());

  it('a new objective has independent verification and operational status', () => {
    const result = createObjectiveService(validObjectiveInput());
    const obj = result.objective!;

    expect(obj.verificationStatus).toBe('UNKNOWN');
    expect(obj.operationalStatus).toBe('DRAFT');

    // They are different fields with different semantics
    expect(obj.verificationStatus).not.toBe(obj.operationalStatus);
  });
});

// ============================================================
// T28 — baseline UNKNOWN is not zero
// ============================================================
describe('T28 — baseline UNKNOWN is not zero', () => {
  beforeEach(() => clearStorage());

  it('UNKNOWN baseline has null value, not 0', () => {
    const result = createObjectiveService(validObjectiveInput());
    const obj = result.objective!;

    expect(obj.baseline.state).toBe('UNKNOWN');
    expect(obj.baseline.value).toBeNull();
    expect(obj.baseline.value).not.toBe(0);
  });
});

// ============================================================
// T29 — target UNDEFINED is not zero
// ============================================================
describe('T29 — target UNDEFINED is not zero', () => {
  beforeEach(() => clearStorage());

  it('UNDEFINED target has null value, not 0', () => {
    const result = createObjectiveService(validObjectiveInput());
    const obj = result.objective!;

    expect(obj.target.state).toBe('UNDEFINED');
    expect(obj.target.value).toBeNull();
    expect(obj.target.value).not.toBe(0);
  });
});

// ============================================================
// T30 — objectiveIds is not SOURCE OF TRUTH
// ============================================================
describe('T30 — objectiveIds is not SOURCE OF TRUTH', () => {
  beforeEach(() => clearStorage());

  it('relations are stored in NeedObjectiveRelation, not Need.objectiveIds', () => {
    const need = createTestNeed();
    const objective = createObjectiveService(validObjectiveInput()).objective!;

    createRelationService({ needId: need.id, objectiveId: objective.id });

    // The relation exists in the relation store
    const relations = getRelationsByNeedService(need.id);
    expect(relations).toHaveLength(1);

    // Need.objectiveIds is empty (deprecated, not used)
    const freshNeed = getNeedService(need.id);
    expect(freshNeed!.objectiveIds).toEqual([]);
  });
});


