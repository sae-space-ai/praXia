/**
 * PRAXIA — Tests: Need Service & Persistence
 * 
 * TEST 1 — CREATION
 * TEST 2 — VALIDATION
 * TEST 3 — TRUTH SEMANTICS
 * TEST 4 — PERSISTENCE (CREATE → STORE → READ)
 * TEST 5 — RETRIEVAL BY ID
 * TEST 6 — UPDATE
 * TEST 7 — DELETE
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createNeedService,
  getAllNeedsService,
  getNeedService,
  deleteNeedService,
  updateNeedStatusService,
  validateNeedInput,
} from './needService';
import type { CreateNeedInput, Need } from './types';

// ============================================================
// SETUP — Clear localStorage before each test
// ============================================================
function clearStorage(): void {
  localStorage.clear();
}

function validInput(overrides: Partial<CreateNeedInput> = {}): CreateNeedInput {
  return {
    organizationId: 'org_test',
    title: 'Test Need Title',
    description: 'Test need description for verification purposes.',
    type: 'PROBLEM',
    domain: 'F01',
    priority: 'MEDIUM',
    ...overrides,
  };
}

// ============================================================
// TEST 1 — CREATION
// ============================================================
describe('TEST 1 — Create a valid NEED', () => {
  beforeEach(() => {
    clearStorage();
  });

  it('creates a need with all required fields populated', () => {
    const input = validInput();
    const result = createNeedService(input);

    expect(result.success).toBe(true);
    expect(result.need).toBeDefined();

    const need = result.need!;

    // id generated
    expect(need.id).toBeTruthy();
    expect(typeof need.id).toBe('string');
    expect(need.id.length).toBeGreaterThan(0);

    // organizationId
    expect(need.organizationId).toBe('org_test');

    // title
    expect(need.title).toBe('Test Need Title');

    // description
    expect(need.description).toBe('Test need description for verification purposes.');

    // type
    expect(need.type).toBe('PROBLEM');

    // family/domain
    expect(need.domain).toBe('F01');

    // status
    expect(need.status).toBe('REGISTERED');

    // priority
    expect(need.priority).toBe('MEDIUM');

    // createdAt
    expect(need.createdAt).toBeTruthy();
    expect(typeof need.createdAt).toBe('string');

    // updatedAt
    expect(need.updatedAt).toBeTruthy();
    expect(typeof need.updatedAt).toBe('string');

    // overallVerification initial state
    expect(need.overallVerification).toBe('UNKNOWN');
  });

  it('generates unique IDs for different needs', () => {
    const result1 = createNeedService(validInput({ title: 'Need 1' }));
    const result2 = createNeedService(validInput({ title: 'Need 2' }));

    expect(result1.need!.id).not.toBe(result2.need!.id);
  });

  it('initializes extensible fields as empty', () => {
    const result = createNeedService(validInput());
    const need = result.need!;

    expect(need.symptoms).toEqual([]);
    expect(need.evidence).toEqual([]);
    expect(need.affectedAreas).toEqual([]);
    expect(need.relatedNeedIds).toEqual([]);
    expect(need.constraints).toEqual([]);
    expect(need.owner).toBeNull();
    expect(need.source).toBeNull();
    expect(need.objectiveIds).toEqual([]);
  });
});

// ============================================================
// TEST 2 — VALIDATION
// ============================================================
describe('TEST 2 — Validation rejects invalid NEEDs', () => {
  beforeEach(() => {
    clearStorage();
  });

  it('rejects a need with empty title', () => {
    const input = validInput({ title: '' });
    const result = createNeedService(input);

    expect(result.success).toBe(false);
    expect(result.need).toBeUndefined();
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
    expect(result.errors!.some((e) => e.toLowerCase().includes('título'))).toBe(true);
  });

  it('rejects a need with empty description', () => {
    const input = validInput({ description: '' });
    const result = createNeedService(input);

    expect(result.success).toBe(false);
    expect(result.errors!.some((e) => e.toLowerCase().includes('descripción'))).toBe(true);
  });

  it('rejects a need with invalid family', () => {
    const input = validInput({ domain: 'F99' });
    const result = createNeedService(input);

    expect(result.success).toBe(false);
    expect(result.errors!.some((e) => e.toLowerCase().includes('familia'))).toBe(true);
  });

  it('rejects a need with invalid type', () => {
    const input = validInput({ type: 'INVALID_TYPE' as any });
    const result = createNeedService(input);

    expect(result.success).toBe(false);
    expect(result.errors!.some((e) => e.toLowerCase().includes('tipo'))).toBe(true);
  });

  it('does NOT silently create a valid object when validation fails', () => {
    const input = validInput({ title: '', description: '' });
    const result = createNeedService(input);

    expect(result.success).toBe(false);
    expect(result.need).toBeUndefined();

    // Verify nothing was persisted
    const allNeeds = getAllNeedsService();
    expect(allNeeds).toHaveLength(0);
  });

  it('validateNeedInput returns structured errors', () => {
    const input = validInput({ title: '', description: '', domain: 'INVALID' });
    const validation = validateNeedInput(input);

    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThanOrEqual(3);
  });
});

// ============================================================
// TEST 3 — TRUTH SEMANTICS
// ============================================================
describe('TEST 3 — A new NEED without evidence must be UNKNOWN', () => {
  beforeEach(() => {
    clearStorage();
  });

  it('overallVerification is UNKNOWN for a new need', () => {
    const result = createNeedService(validInput());
    expect(result.need!.overallVerification).toBe('UNKNOWN');
  });

  it('confidence is UNKNOWN for a new need', () => {
    const result = createNeedService(validInput());
    expect(result.need!.confidence).toBe('UNKNOWN');
  });

  it('overallVerification is NEVER SUPPORTED for a new need', () => {
    const result = createNeedService(validInput());
    expect(result.need!.overallVerification).not.toBe('SUPPORTED');
  });

  it('overallVerification is NEVER VERIFIED for a new need', () => {
    const result = createNeedService(validInput());
    expect(result.need!.overallVerification).not.toBe('VERIFIED');
  });

  it('evidence array is empty for a new need', () => {
    const result = createNeedService(validInput());
    expect(result.need!.evidence).toEqual([]);
  });
});

// ============================================================
// TEST 4 — PERSISTENCE (CREATE → STORE → READ)
// ============================================================
describe('TEST 4 — Persistence: CREATE → STORE → READ', () => {
  beforeEach(() => {
    clearStorage();
  });

  it('a created need can be retrieved from the list', () => {
    const input = validInput({ title: 'Persistent Need' });
    const created = createNeedService(input);
    expect(created.success).toBe(true);

    const allNeeds = getAllNeedsService();
    expect(allNeeds).toHaveLength(1);
    expect(allNeeds[0].title).toBe('Persistent Need');
  });

  it('persisted values are preserved exactly', () => {
    const input = validInput({
      title: 'Exact Values Test',
      description: 'Checking exact value preservation.',
      type: 'RISK',
      domain: 'F05',
      priority: 'HIGH',
    });
    createNeedService(input);

    const retrieved = getAllNeedsService()[0];

    expect(retrieved.title).toBe('Exact Values Test');
    expect(retrieved.description).toBe('Checking exact value preservation.');
    expect(retrieved.type).toBe('RISK');
    expect(retrieved.domain).toBe('F05');
    expect(retrieved.priority).toBe('HIGH');
    expect(retrieved.status).toBe('REGISTERED');
    expect(retrieved.overallVerification).toBe('UNKNOWN');
  });

  it('multiple needs persist independently', () => {
    createNeedService(validInput({ title: 'Need A' }));
    createNeedService(validInput({ title: 'Need B' }));
    createNeedService(validInput({ title: 'Need C' }));

    const allNeeds = getAllNeedsService();
    expect(allNeeds).toHaveLength(3);

    const titles = allNeeds.map((n: Need) => n.title).sort();
    expect(titles).toEqual(['Need A', 'Need B', 'Need C']);
  });
});

// ============================================================
// TEST 5 — RETRIEVAL BY ID
// ============================================================
describe('TEST 5 — Retrieval by ID', () => {
  beforeEach(() => {
    clearStorage();
  });

  it('getNeedService returns the correct need by ID', () => {
    const created = createNeedService(validInput({ title: 'Findable Need' }));
    const id = created.need!.id;

    const found = getNeedService(id);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(id);
    expect(found!.title).toBe('Findable Need');
  });

  it('returns null for non-existent ID', () => {
    const found = getNeedService('non-existent-id');
    expect(found).toBeNull();
  });

  it('retrieves the correct need among many', () => {
    const need1 = createNeedService(validInput({ title: 'First' }));
    createNeedService(validInput({ title: 'Second' }));
    const need3 = createNeedService(validInput({ title: 'Third' }));

    const found1 = getNeedService(need1.need!.id);
    const found3 = getNeedService(need3.need!.id);

    expect(found1!.title).toBe('First');
    expect(found3!.title).toBe('Third');
  });
});

// ============================================================
// TEST 6 — UPDATE
// ============================================================
describe('TEST 6 — Update preserves identity and changes data', () => {
  beforeEach(() => {
    clearStorage();
  });

  it('updates status and preserves identity', () => {
    const created = createNeedService(validInput());
    const originalId = created.need!.id;
    const originalCreatedAt = created.need!.createdAt;

    const updated = updateNeedStatusService(originalId, 'IN_DIAGNOSIS');

    expect(updated).not.toBeNull();
    expect(updated!.id).toBe(originalId); // identity preserved
    expect(updated!.status).toBe('IN_DIAGNOSIS');
    expect(updated!.createdAt).toBe(originalCreatedAt); // createdAt unchanged
    expect(updated!.title).toBe(created.need!.title); // other fields unchanged
  });

  it('updatedAt changes after update', () => {
    const created = createNeedService(validInput());
    const originalUpdatedAt = created.need!.updatedAt;

    // Small delay to ensure timestamp difference
    const updated = updateNeedStatusService(created.need!.id, 'IN_PROGRESS');

    expect(updated!.updatedAt).not.toBe(originalUpdatedAt);
    expect(new Date(updated!.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(originalUpdatedAt).getTime()
    );
  });

  it('does not invent or modify other fields', () => {
    const created = createNeedService(validInput({ title: 'Original Title' }));
    const original = created.need!;

    const updated = updateNeedStatusService(original.id, 'EVALUATED');

    expect(updated!.title).toBe(original.title);
    expect(updated!.description).toBe(original.description);
    expect(updated!.type).toBe(original.type);
    expect(updated!.domain).toBe(original.domain);
    expect(updated!.priority).toBe(original.priority);
    expect(updated!.organizationId).toBe(original.organizationId);
  });

  it('returns null for non-existent need', () => {
    const result = updateNeedStatusService('fake-id', 'IN_DIAGNOSIS');
    expect(result).toBeNull();
  });
});

// ============================================================
// TEST 7 — DELETE
// ============================================================
describe('TEST 7 — Delete removes a NEED', () => {
  beforeEach(() => {
    clearStorage();
  });

  it('deletes an existing need', () => {
    const created = createNeedService(validInput());
    const id = created.need!.id;

    expect(getAllNeedsService()).toHaveLength(1);

    const deleted = deleteNeedService(id);
    expect(deleted).toBe(true);
    expect(getAllNeedsService()).toHaveLength(0);
  });

  it('deleted need is no longer retrievable by ID', () => {
    const created = createNeedService(validInput());
    const id = created.need!.id;

    deleteNeedService(id);

    const found = getNeedService(id);
    expect(found).toBeNull();
  });

  it('returns false when deleting non-existent need', () => {
    const result = deleteNeedService('non-existent-id');
    expect(result).toBe(false);
  });

  it('only deletes the targeted need', () => {
    const need1 = createNeedService(validInput({ title: 'Keep' }));
    const need2 = createNeedService(validInput({ title: 'Remove' }));
    const need3 = createNeedService(validInput({ title: 'Also Keep' }));

    deleteNeedService(need2.need!.id);

    const remaining = getAllNeedsService();
    expect(remaining).toHaveLength(2);
    expect(remaining.map((n: Need) => n.title).sort()).toEqual(['Also Keep', 'Keep']);
    expect(getNeedService(need1.need!.id)).not.toBeNull();
    expect(getNeedService(need3.need!.id)).not.toBeNull();
  });
});
