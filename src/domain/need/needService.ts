/**
 * PRAXIA — Domain: Need Service
 * 
 * Business logic layer for NEED operations.
 * Separated from persistence and UI.
 */

import type { Need, CreateNeedInput, NeedType, NeedStatus, NeedPriority } from './types';
import { isValidFamilyId } from './families';
import * as store from '../../persistence/needStore';

// ============================================================
// VALIDATION
// ============================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const VALID_NEED_TYPES: NeedType[] = [
  'PROBLEM', 'NEED', 'OPPORTUNITY', 'RISK', 'OBLIGATION',
  'DECISION', 'TRANSFORMATION', 'INCIDENT', 'UNCERTAINTY', 'AMBITION',
];

const VALID_STATUSES: NeedStatus[] = [
  'DRAFT', 'REGISTERED', 'IN_DIAGNOSIS', 'OBJECTIVES_DEFINED',
  'IN_PROGRESS', 'EVALUATED', 'CLOSED', 'ARCHIVED',
];

const VALID_PRIORITIES: NeedPriority[] = [
  'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NOT_ASSESSED',
];

export function validateNeedInput(input: CreateNeedInput): ValidationResult {
  const errors: string[] = [];

  if (!input.title || input.title.trim().length === 0) {
    errors.push('El título es obligatorio.');
  }

  if (!input.description || input.description.trim().length === 0) {
    errors.push('La descripción es obligatoria.');
  }

  if (!VALID_NEED_TYPES.includes(input.type)) {
    errors.push(`Tipo inválido: ${input.type}`);
  }

  if (!isValidFamilyId(input.domain)) {
    errors.push(`Familia inválida: ${input.domain}. Debe ser F01–F09.`);
  }

  if (!VALID_PRIORITIES.includes(input.priority)) {
    errors.push(`Prioridad inválida: ${input.priority}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================
// SERVICE METHODS
// ============================================================

export function createNeedService(input: CreateNeedInput): { success: boolean; need?: Need; errors?: string[] } {
  const validation = validateNeedInput(input);
  if (!validation.valid) {
    return { success: false, errors: validation.errors };
  }

  const need = store.createNeed(input);
  return { success: true, need };
}

export function getAllNeedsService(): Need[] {
  return store.getAllNeeds();
}

export function getNeedService(id: string): Need | null {
  return store.getNeedById(id);
}

export function deleteNeedService(id: string): boolean {
  return store.deleteNeed(id);
}

export function updateNeedStatusService(id: string, status: NeedStatus): Need | null {
  if (!VALID_STATUSES.includes(status)) {
    console.error(`[PRAXIA] Invalid status: ${status}`);
    return null;
  }
  return store.updateNeed(id, { status });
}
