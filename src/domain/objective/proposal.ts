/**
 * PRAXIA — Domain: NEED → OBJECTIVE Proposal
 *
 * Converts a NEED into a PROPOSED OBJECTIVE.
 *
 * RULES:
 *   - Uses ONLY data available in the NEED.
 *   - NEVER invents baseline, target, KPI values, or dates.
 *   - Identifies missing information explicitly.
 *   - Returns a proposal that REQUIRES human review before persistence.
 *   - Does NOT auto-save or auto-approve.
 */

import type { Need } from '../need/types';
import type {
  CreateObjectiveInput,
  ProposedObjective,
  ObjectiveClass,
  Baseline,
  Target,
  TimeHorizon,
} from './types';
import { getNeedTypeLabel } from '../need/needTypes';

/**
 * Propose an objective from a NEED.
 *
 * The proposal uses only information present in the NEED.
 * Fields that cannot be derived are left in their UNKNOWN/UNDEFINED state.
 * Missing information is reported explicitly.
 */
export function proposeObjectiveFromNeed(need: Need): ProposedObjective {
  const missingInformation: string[] = [];

  // Title: derive from NEED title, prefixed by type
  const typeLabel = getNeedTypeLabel(need.type);
  const title = `[Propuesta desde ${need.type}] ${need.title}`;

  // Description: reuse NEED description as starting point
  const description = need.description;

  // Objective class: default to SPECIFIC for a single NEED proposal.
  // The human can promote it to THEMATIC or GENERAL during review.
  const objectiveClass: ObjectiveClass = 'SPECIFIC';

  // Parent: unknown at proposal time
  const parentObjectiveId: string | null = null;
  missingInformation.push(
    'No se ha identificado un objetivo padre. Debe asignarse manualmente durante la revisión.'
  );

  // Baseline: UNKNOWN — we never invent a value
  const baseline: Baseline = {
    state: 'UNKNOWN',
    value: null,
    unit: null,
    referenceDate: null,
  };
  missingInformation.push(
    'Baseline desconocida. Se requiere medición o dato interno para establecerla.'
  );

  // Target: UNDEFINED — we never invent a value
  const target: Target = {
    state: 'UNDEFINED',
    value: null,
    unit: null,
    deadline: null,
  };
  missingInformation.push(
    'Target no definido. No se han inventado porcentajes, importes ni fechas.'
  );

  // Time horizon: UNDEFINED — we never invent a deadline
  const timeHorizon: TimeHorizon = 'UNDEFINED';
  missingInformation.push(
    'Horizonte temporal no definido. Debe establecerse durante la revisión.'
  );

  // Constraints: none invented
  const constraints: string[] = [];

  // KPIs: none invented
  const kpis: CreateObjectiveInput['kpis'] = [];
  missingInformation.push(
    'No se han propuesto KPIs cuantitativos. Deben definirse con datos reales.'
  );

  // Additional missing info based on NEED content
  if (!need.owner) {
    missingInformation.push('La NEED no tiene responsable asignado.');
  }
  if (need.evidence.length === 0) {
    missingInformation.push('La NEED no tiene evidencia registrada.');
  }
  if (need.affectedAreas.length === 0) {
    missingInformation.push('La NEED no tiene áreas afectadas identificadas.');
  }

  const input: CreateObjectiveInput = {
    organizationId: need.organizationId,
    title,
    description,
    objectiveClass,
    parentObjectiveId,
    baseline,
    target,
    timeHorizon,
    constraints,
    kpis,
  };

  return {
    sourceNeedId: need.id,
    input,
    missingInformation,
    createdAt: new Date().toISOString(),
  };
}
