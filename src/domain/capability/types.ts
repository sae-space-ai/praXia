/**
 * PRAXIA — Domain: Capability
 * 
 * A Capability represents a reusable business capability vocabulary.
 * NOT an agent, tool, or person — it represents "what capability is needed/exists".
 */

// ============================================================
// CAPABILITY STATUS
// ============================================================
export type CapabilityStatus = 'ACTIVE' | 'INACTIVE';

// ============================================================
// CAPABILITY — Core entity
// ============================================================
export interface Capability {
  id: string;
  organizationId: string | null; // null for global product catalog
  
  code: string;
  name: string;
  description: string;
  
  category: string;
  status: CapabilityStatus;
  
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// CREATE CAPABILITY INPUT
// ============================================================
export interface CreateCapabilityInput {
  organizationId?: string | null;
  code: string;
  name: string;
  description: string;
  category: string;
  status?: CapabilityStatus;
}
