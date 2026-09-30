/**
 * PRAXIA — Domain: Proposal Service
 * 
 * Proposes WorkPlan from Mission using ONLY existing data.
 * Zero-Assumption Gate: no invention of data.
 */

import type { CreateWorkPlanInput } from '../workplan/types';
import type { CreateTaskInput, TaskType } from '../task/types';
import { getMissionById } from '../../persistence/missionStore';
import { getRelationsByObjectiveService, getObjectiveService } from '../objective/objectiveService';
import { getNeedService } from '../need/needService';

export interface ProposedWorkPlan {
  workPlanInput: CreateWorkPlanInput;
  taskProposals: CreateTaskInput[];
  missingInformation: string[];
  assumptionsExplicitlyDeclared: string[];
}

/**
 * Propose a WorkPlan from a Mission.
 * Uses ONLY existing data from Mission and related Objectives/Needs.
 * No invention of duration, costs, responsibilities, etc.
 */
export function proposeWorkPlanFromMission(missionId: string): ProposedWorkPlan {
  const mission = getMissionById(missionId);
  if (!mission) {
    throw new Error(`Mission ${missionId} not found`);
  }
  
  const missingInformation: string[] = [];
  const assumptionsExplicitlyDeclared: string[] = [];
  
  // WorkPlan input from Mission
  const workPlanInput: CreateWorkPlanInput = {
    organizationId: mission.organizationId,
    missionId: mission.id,
    title: `Plan de Trabajo para ${mission.title}`,
    description: mission.description || `Plan derivado de la misión: ${mission.title}`,
  };
  
  // Get related objectives
  const objectiveRelations = getRelationsByObjectiveService(mission.id);
  
  if (objectiveRelations.length === 0) {
    missingInformation.push(
      'No hay objetivos relacionados con esta misión. Se requieren objetivos para proponer tareas.'
    );
  }
  
  // Propose tasks based on objectives
  const taskProposals: CreateTaskInput[] = [];
  
  for (const rel of objectiveRelations) {
    // Get objective details
    const objectiveService = require('../objective/objectiveService');
    const objective = objectiveService.getObjectiveService(rel.objectiveId);
    
    if (!objective) continue;
    
    // Create task proposal from objective
    const taskProposal: CreateTaskInput = {
      organizationId: mission.organizationId,
      title: `Tarea para objetivo: ${objective.title}`,
      description: objective.description || `Tarea derivada del objetivo: ${objective.title}`,
      taskType: inferTaskTypeFromObjective(objective),
      purpose: objective.description || `Contribuir al objetivo: ${objective.title}`,
      expectedOutput: '', // UNKNOWN - must be defined by human
      executionMethod: 'UNASSIGNED', // Must be assigned by human
      priority: 'NOT_ASSESSED', // Must be assessed by human
      constraints: objective.constraints || [],
      successCriteria: [], // Must be defined by human
      humanApprovalRequired: false, // Must be decided by human
    };
    
    // Check what's missing
    if (!objective.description) {
      missingInformation.push(
        `El objetivo "${objective.title}" no tiene descripción. La tarea propuesta carece de contexto.`
      );
    }
    
    if (objective.baseline.state === 'UNKNOWN') {
      missingInformation.push(
        `El objetivo "${objective.title}" no tiene baseline conocida. No se puede medir progreso.`
      );
    }
    
    if (objective.target.state === 'UNDEFINED') {
      missingInformation.push(
        `El objetivo "${objective.title}" no tiene target definido. No se puede evaluar éxito.`
      );
    }
    
    taskProposals.push(taskProposal);
  }
  
  // Add general missing information
  if (mission.scope.included.length === 0) {
    missingInformation.push('La misión no tiene alcance definido (included).');
  }
  
  if (mission.scope.excluded.length === 0) {
    missingInformation.push('La misión no tiene exclusiones definidas.');
  }
  
  if (mission.expectedOutcome.state === 'UNDEFINED') {
    missingInformation.push('El resultado esperado de la misión no está definido.');
  }
  
  // Explicit assumptions
  assumptionsExplicitlyDeclared.push(
    'Se asume que cada objetivo relacionado requiere al menos una tarea.'
  );
  
  assumptionsExplicitlyDeclared.push(
    'Se asume que el tipo de tarea puede inferirse del tipo de objetivo (puede ser incorrecto).'
  );
  
  assumptionsExplicitlyDeclared.push(
    'Se asume que todas las tareas propuestas son necesarias (puede haber redundancia).'
  );
  
  return {
    workPlanInput,
    taskProposals,
    missingInformation,
    assumptionsExplicitlyDeclared,
  };
}

/**
 * Infer task type from objective (best effort, may be wrong)
 */
function inferTaskTypeFromObjective(objective: any): CreateTaskInput['taskType'] {
  const title = (objective.title || '').toLowerCase();
  const description = (objective.description || '').toLowerCase();
  const combined = `${title} ${description}`;
  
  if (combined.includes('analizar') || combined.includes('analysis')) {
    return 'ANALYSIS';
  }
  if (combined.includes('investigar') || combined.includes('research')) {
    return 'RESEARCH';
  }
  if (combined.includes('diseñar') || combined.includes('design')) {
    return 'DESIGN';
  }
  if (combined.includes('implementar') || combined.includes('implement')) {
    return 'IMPLEMENTATION_PREPARATION';
  }
  if (combined.includes('validar') || combined.includes('validat')) {
    return 'VALIDATION';
  }
  if (combined.includes('medir') || combined.includes('measur')) {
    return 'MEASUREMENT';
  }
  if (combined.includes('documentar') || combined.includes('document')) {
    return 'DOCUMENTATION';
  }
  if (combined.includes('revisar') || combined.includes('review')) {
    return 'REVIEW';
  }
  
  // Default to ANALYSIS as most common
  return 'ANALYSIS';
}
