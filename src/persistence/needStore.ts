/**
 * PRAXIA — Persistence: Need Store
 * 
 * LocalStorage-based persistence for NEED entities.
 * This layer is designed to be replaceable with a backend API later.
 * 
 * IMPORTANT: This is local development persistence only.
 * No data here should be confused with production data.
 */

import type { Need, CreateNeedInput, NeedStatus } from '../domain/need/types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'praxia_needs';
const ORG_KEY = 'praxia_organization';

// Default organization ID for single-org mode
// In the future this will come from authentication
const DEFAULT_ORG_ID = 'org_default';

/**
 * Get all needs from storage.
 */
export function getAllNeeds(): Need[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Need[];
  } catch {
    console.error('[PRAXIA] Error reading needs from storage');
    return [];
  }
}

/**
 * Get a single need by ID.
 */
export function getNeedById(id: string): Need | null {
  const needs = getAllNeeds();
  return needs.find((n) => n.id === id) ?? null;
}

/**
 * Create a new need.
 */
export function createNeed(input: CreateNeedInput): Need {
  const now = new Date().toISOString();
  const need: Need = {
    id: uuidv4(),
    organizationId: input.organizationId || DEFAULT_ORG_ID,
    title: input.title,
    description: input.description,
    type: input.type,
    domain: input.domain,
    status: 'REGISTERED',
    priority: input.priority,
    overallVerification: 'UNKNOWN',
    createdAt: now,
    updatedAt: now,
    symptoms: [],
    evidence: [],
    affectedAreas: [],
    relatedNeedIds: [],
    constraints: [],
    owner: null,
    source: null,
    confidence: 'UNKNOWN',
    objectiveIds: [], // Prepared for future many-to-many with Objectives
  };

  const needs = getAllNeeds();
  needs.push(need);
  saveNeeds(needs);
  return need;
}

/**
 * Update an existing need.
 * Only updates fields that are provided (partial update).
 */
export function updateNeed(id: string, updates: Partial<Need>): Need | null {
  const needs = getAllNeeds();
  const index = needs.findIndex((n) => n.id === id);
  if (index === -1) return null;

  needs[index] = {
    ...needs[index],
    ...updates,
    id: needs[index].id, // Never allow ID change
    organizationId: needs[index].organizationId, // Never allow org change
    createdAt: needs[index].createdAt, // Never allow creation date change
    updatedAt: new Date().toISOString(),
  };

  saveNeeds(needs);
  return needs[index];
}

/**
 * Delete a need by ID.
 */
export function deleteNeed(id: string): boolean {
  const needs = getAllNeeds();
  const filtered = needs.filter((n) => n.id !== id);
  if (filtered.length === needs.length) return false;
  saveNeeds(filtered);
  return true;
}

/**
 * Get needs filtered by domain (family).
 */
export function getNeedsByDomain(domain: string): Need[] {
  return getAllNeeds().filter((n) => n.domain === domain);
}

/**
 * Get needs filtered by type.
 */
export function getNeedsByType(type: string): Need[] {
  return getAllNeeds().filter((n) => n.type === type);
}

/**
 * Get needs filtered by status.
 */
export function getNeedsByStatus(status: NeedStatus): Need[] {
  return getAllNeeds().filter((n) => n.status === status);
}

/**
 * Save needs array to storage.
 */
function saveNeeds(needs: Need[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(needs));
  } catch {
    console.error('[PRAXIA] Error saving needs to storage');
  }
}

/**
 * Get or create the default organization.
 */
export function getOrganizationId(): string {
  let orgId = localStorage.getItem(ORG_KEY);
  if (!orgId) {
    orgId = DEFAULT_ORG_ID;
    localStorage.setItem(ORG_KEY, orgId);
  }
  return orgId;
}
