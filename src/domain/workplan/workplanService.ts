/**
 * PRAXIA — Domain: WorkPlan Service
 */

import type { WorkPlan, CreateWorkPlanInput, WorkPlanTaskRelation, CreateWorkPlanTaskRelationInput } from './types';
import * as store from '../../persistence/workPlanStore';
import * as relStore from '../../persistence/order4Stores';
import { getMissionById } from '../../persistence/missionStore';

export function createWorkPlanService(input: CreateWorkPlanInput): WorkPlan {
  // Validate mission exists
  const mission = getMissionById(input.missionId);
  if (!mission) {
    throw new Error(`Mission ${input.missionId} not found`);
  }
  return store.createWorkPlan(input);
}

export function getWorkPlanService(id: string): WorkPlan | null {
  return store.getWorkPlanById(id);
}

export function getCurrentWorkPlanForMissionService(missionId: string): WorkPlan | null {
  return store.getCurrentWorkPlanByMissionId(missionId);
}

export function getWorkPlanHistoryForMissionService(missionId: string): WorkPlan[] {
  return store.getWorkPlansByMissionId(missionId);
}

export function updateWorkPlanService(id: string, updates: Partial<WorkPlan>): WorkPlan | null {
  return store.updateWorkPlan(id, updates);
}

export function deleteWorkPlanService(id: string): boolean {
  relStore.deleteWorkPlanTaskRelationsByWorkPlanId(id);
  return store.deleteWorkPlan(id);
}

export function createWorkPlanTaskRelationService(
  input: CreateWorkPlanTaskRelationInput
): { success: boolean; relation?: WorkPlanTaskRelation; error?: string } {
  const workPlan = store.getWorkPlanById(input.workPlanId);
  if (!workPlan) {
    return { success: false, error: 'WorkPlan not found' };
  }
  
  const relation = relStore.createWorkPlanTaskRelation(input);
  return { success: true, relation };
}

export function getTasksForWorkPlanService(workPlanId: string): WorkPlanTaskRelation[] {
  return relStore.getWorkPlanTaskRelationsByWorkPlanId(workPlanId);
}
