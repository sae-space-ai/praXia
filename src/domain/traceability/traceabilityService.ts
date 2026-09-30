/**
 * PRAXIA — Domain: Traceability Service
 * 
 * Reconstructs execution trace from persisted relations only.
 * No invention, no gap-filling.
 */

import type { MissionExecutionTrace } from '../task/types';
import type { WorkPlan } from '../workplan/types';
import type { Task, DataRequirement, HumanGate, TaskDependencyRelation } from '../task/types';
import * as workPlanStore from '../../persistence/workPlanStore';
import * as taskStore from '../../persistence/taskStore';
import * as relStore from '../../persistence/order4Stores';
import { getMissionById } from '../../persistence/missionStore';

/**
 * Get complete execution trace for a mission.
 * Returns ONLY persisted relations. No invention.
 */
export function getMissionExecutionTrace(missionId: string): MissionExecutionTrace {
  const mission = getMissionById(missionId);
  if (!mission) {
    throw new Error(`Mission ${missionId} not found`);
  }
  
  const currentWorkPlan = workPlanStore.getCurrentWorkPlanByMissionId(missionId);
  
  let tasks: Task[] = [];
  let dependencies: TaskDependencyRelation[] = [];
  let dataRequirements: DataRequirement[] = [];
  let humanGates: HumanGate[] = [];
  const capabilityIds = new Set<string>();
  
  if (currentWorkPlan) {
    const relations = relStore.getWorkPlanTaskRelationsByWorkPlanId(currentWorkPlan.id);
    
    // Get tasks in sequence order
    tasks = relations
      .sort((a, b) => a.sequence - b.sequence)
      .map((r) => taskStore.getTaskById(r.taskId))
      .filter((t): t is Task => t !== null);
    
    // Collect all related data for each task
    for (const task of tasks) {
      // Dependencies
      const deps = relStore.getTaskDependenciesBySuccessorId(task.id);
      dependencies.push(...deps);
      
      // Data requirements
      const dataReqs = relStore.getDataRequirementsByTaskId(task.id);
      dataRequirements.push(...dataReqs);
      
      // Human gates
      const gates = relStore.getHumanGatesByEntity('TASK', task.id);
      humanGates.push(...gates);
      
      // Capabilities
      const capReqs = relStore.getTaskCapabilityRequirementsByTaskId(task.id);
      capReqs.forEach((r) => capabilityIds.add(r.capabilityId));
    }
  }
  
  return {
    missionId,
    currentWorkPlan,
    tasks,
    capabilities: Array.from(capabilityIds),
    dataRequirements,
    humanGates,
    dependencies,
  };
}

/**
 * Get partial trace (works even if some relations are missing)
 */
export function getPartialTrace(missionId: string): Partial<MissionExecutionTrace> {
  try {
    return getMissionExecutionTrace(missionId);
  } catch {
    // Return empty structure if mission doesn't exist
    return {
      missionId,
      currentWorkPlan: null,
      tasks: [],
      capabilities: [],
      dataRequirements: [],
      humanGates: [],
      dependencies: [],
    };
  }
}
