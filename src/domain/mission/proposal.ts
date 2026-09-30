/**
 * PRAXIA — Domain: OBJECTIVE → MISSION Proposal
 *
 * Converts an OBJECTIVE into a PROPOSED MISSION.
 *
 * RULES:
 *   - Uses ONLY data available in the OBJECTIVE.
 *   - NEVER invents baseline, target, KPI values, dates, budgets, etc.
 *   - Identifies missing information explicitly.
 *   - Returns a proposal that REQUIRES human review before persistence.
 *   - Does NOT auto-save or auto-approve.
 */

import type { Objective } from '../objective/types';
import type {
  CreateMissionInput,
  ProposedMission,
  MissionType,
  MissionScope,
  ExpectedOutcome,
} from './types';
import type { TimeHorizon } from '../objective/types';
import { getObjectiveClassLabel } from '../objective/catalogs';

/**
 * Propose a mission from an OBJECTIVE.
 *
 * The proposal uses only information present in the OBJECTIVE.
 * Fields that cannot be derived are left in their UNKNOWN/UNDEFINED state.
 * Missing information is reported explicitly.
 */
export function proposeMissionFromObjective(objective: Objective): ProposedMission {
  const missingInformation: string[] = [];

  // Title: derive from OBJECTIVE title
  const objectiveClassLabel = getObjectiveClassLabel(objective.objectiveClass);
  const title = `[Propuesta desde Objetivo ${objectiveClassLabel}] ${objective.title}`;

  // Description: reuse OBJECTIVE description as starting point
  const description = objective.description;

  // Mission type: default to ANALYSIS (most common for objectives)
  // The human can change it during review
  const missionType: MissionType = 'ANALYSIS';
  missingInformation.push(
    'Tipo de misión asignado por defecto (ANALYSIS). Debe revisarse y ajustarse según el propósito real.'
  );

  // Scope: we cannot derive scope from objective alone
  const scope: MissionScope = {
    included: [],
    excluded: [],
    notes: [],
  };
  missingInformation.push(
    'Alcance no definido. Debe especificarse qué está incluido y excluido de la misión.'
  );

  // Expected outcome: we cannot derive expected outcome from objective
  const expectedOutcome: ExpectedOutcome = {
    description: null,
    state: 'UNDEFINED',
  };
  missingInformation.push(
    'Resultado esperado no definido. No se han inventado resultados cuantitativos.'
  );

  // Time horizon: reuse from objective if available
  const timeHorizon: TimeHorizon = objective.timeHorizon ?? 'UNDEFINED';
  if (timeHorizon === 'UNDEFINED') {
    missingInformation.push(
      'Horizonte temporal no definido en el objetivo. Debe establecerse para la misión.'
    );
  }

  // Constraints: reuse from objective if available
  const constraints: string[] = objective.constraints ?? [];
  if (constraints.length === 0) {
    missingInformation.push(
      'No hay restricciones conocidas. Deben identificarse limitaciones de presupuesto, tiempo, recursos, etc.'
    );
  }

  // Assumptions: none invented
  const assumptions: CreateMissionInput['assumptions'] = [];
  missingInformation.push(
    'No se han inventado suposiciones. Deben documentarse explícitamente las hipótesis de trabajo.'
  );

  // Dependencies: none invented
  const dependencies: CreateMissionInput['dependencies'] = [];
  missingInformation.push(
    'No se han inventado dependencias. Deben identificarse dependencias de datos, recursos o decisiones.'
  );

  // Success criteria: none invented
  const successCriteria: CreateMissionInput['successCriteria'] = [];
  missingInformation.push(
    'No se han inventado criterios de éxito. Deben definirse criterios medibles y verificables.'
  );

  // Additional missing info based on OBJECTIVE content
  if (objective.baseline.state === 'UNKNOWN') {
    missingInformation.push('El objetivo no tiene baseline conocida. Esto puede afectar el alcance de la misión.');
  }

  if (objective.target.state === 'UNDEFINED') {
    missingInformation.push('El objetivo no tiene target definido. Esto puede dificultar la definición de criterios de éxito.');
  }

  if (objective.kpis.length === 0) {
    missingInformation.push('El objetivo no tiene KPIs definidos. La misión puede necesitar métricas específicas.');
  }

  const input: CreateMissionInput = {
    organizationId: objective.organizationId,
    title,
    description,
    missionType,
    scope,
    expectedOutcome,
    timeHorizon,
    constraints,
    assumptions,
    dependencies,
    successCriteria,
  };

  return {
    sourceObjectiveId: objective.id,
    input,
    missingInformation,
    createdAt: new Date().toISOString(),
  };
}
