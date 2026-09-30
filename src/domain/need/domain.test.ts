/**
 * PRAXIA — Tests: Domain Catalogs
 * 
 * TEST 8 — FAMILIES
 * TEST 9 — NEED TYPES
 * TEST 10 — VERIFICATION STATES
 */

import { describe, it, expect } from 'vitest';
import { FAMILIES, getFamilyById, isValidFamilyId, type Family } from './families';
import { NEED_TYPES, getNeedTypeLabel, type NeedTypeDefinition } from './needTypes';
import { VERIFICATION_STATES, getVerificationLabel, type VerificationStateDefinition } from './verification';
import type { NeedType, VerificationState } from './types';

// ============================================================
// TEST 8 — FAMILIES
// ============================================================
describe('TEST 8 — Families F01–F09', () => {
  it('F01–F09 are present', () => {
    const expectedIds = ['F01', 'F02', 'F03', 'F04', 'F05', 'F06', 'F07', 'F08', 'F09'];
    expect(FAMILIES).toHaveLength(9);
    expectedIds.forEach((id) => {
      expect(getFamilyById(id)).toBeDefined();
      expect(isValidFamilyId(id)).toBe(true);
    });
  });

  it('F10 is NOT implemented yet', () => {
    expect(getFamilyById('F10')).toBeUndefined();
    expect(isValidFamilyId('F10')).toBe(false);
  });

  it('each family has required fields', () => {
    FAMILIES.forEach((f: Family) => {
      expect(f.id).toBeTruthy();
      expect(f.code).toBeTruthy();
      expect(f.name).toBeTruthy();
      expect(f.description).toBeTruthy();
    });
  });
});

// ============================================================
// TEST 9 — NEED TYPES
// ============================================================
describe('TEST 9 — Need Types (10 authorized)', () => {
  const EXPECTED_TYPES: NeedType[] = [
    'PROBLEM',
    'NEED',
    'OPPORTUNITY',
    'RISK',
    'OBLIGATION',
    'DECISION',
    'TRANSFORMATION',
    'INCIDENT',
    'UNCERTAINTY',
    'AMBITION',
  ];

  it('exactly 10 types are defined', () => {
    expect(NEED_TYPES).toHaveLength(10);
  });

  it('all 10 authorized types are present', () => {
    const definedValues = NEED_TYPES.map((t: NeedTypeDefinition) => t.value);
    EXPECTED_TYPES.forEach((type) => {
      expect(definedValues).toContain(type);
    });
  });

  it('no unauthorized types exist', () => {
    const definedValues = NEED_TYPES.map((t: NeedTypeDefinition) => t.value);
    expect(definedValues).toHaveLength(10);
    expect(new Set(definedValues).size).toBe(10);
  });

  it('each type has a human-readable label', () => {
    EXPECTED_TYPES.forEach((type) => {
      const label = getNeedTypeLabel(type);
      expect(label).toBeTruthy();
      expect(label).not.toBe(type);
    });
  });
});

// ============================================================
// TEST 10 — VERIFICATION STATES
// ============================================================
describe('TEST 10 — Verification States', () => {
  const EXPECTED_STATES: VerificationState[] = [
    'UNKNOWN',
    'HYPOTHESIS',
    'SUPPORTED',
    'VERIFIED',
  ];

  it('exactly 4 verification states are defined', () => {
    expect(VERIFICATION_STATES).toHaveLength(4);
  });

  it('all 4 states are present', () => {
    const definedValues = VERIFICATION_STATES.map((s: VerificationStateDefinition) => s.value);
    EXPECTED_STATES.forEach((state) => {
      expect(definedValues).toContain(state);
    });
  });

  it('each state has a label', () => {
    EXPECTED_STATES.forEach((state) => {
      const label = getVerificationLabel(state);
      expect(label).toBeTruthy();
    });
  });

  it('no automatic conversion between states exists', () => {
    const states = VERIFICATION_STATES.map((s: VerificationStateDefinition) => s.value);
    expect(states).toEqual(EXPECTED_STATES);
    expect(new Set(states).size).toBe(4);
  });
});
