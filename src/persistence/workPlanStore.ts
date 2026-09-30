/**
 * PRAXIA — Persistence: WorkPlan Store
 */

import type { WorkPlan, CreateWorkPlanInput } from '../domain/workplan/types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'praxia_work_plans';

export function getAllWorkPlans(): WorkPlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WorkPlan[];
  } catch {
    console.error('[PRAXIA] Error reading work plans from storage');
    return [];
  }
}

export function getWorkPlanById(id: string): WorkPlan | null {
  return getAllWorkPlans().find((wp) => wp.id === id) ?? null;
}

export function getWorkPlansByMissionId(missionId: string): WorkPlan[] {
  return getAllWorkPlans().filter((wp) => wp.missionId === missionId);
}

export function getCurrentWorkPlanByMissionId(missionId: string): WorkPlan | null {
  return (
    getAllWorkPlans().find(
      (wp) => wp.missionId === missionId && wp.isCurrentVersion
    ) ?? null
  );
}

export function createWorkPlan(input: CreateWorkPlanInput): WorkPlan {
  const existingVersions = getWorkPlansByMissionId(input.missionId);
  const maxVersion = existingVersions.reduce((max, wp) => Math.max(max, wp.version), 0);
  
  // Mark all existing versions as not current
  existingVersions.forEach((wp) => {
    if (wp.isCurrentVersion) {
      updateWorkPlan(wp.id, { isCurrentVersion: false, planningStatus: 'SUPERSEDED' });
    }
  });
  
  const now = new Date().toISOString();
  const workPlan: WorkPlan = {
    id: uuidv4(),
    organizationId: input.organizationId,
    missionId: input.missionId,
    title: input.title,
    description: input.description,
    planningStatus: 'DRAFT',
    verificationStatus: 'UNKNOWN',
    version: maxVersion + 1,
    isCurrentVersion: true,
    createdAt: now,
    updatedAt: now,
    taskIds: [],
  };
  
  const workPlans = getAllWorkPlans();
  workPlans.push(workPlan);
  saveWorkPlans(workPlans);
  return workPlan;
}

export function updateWorkPlan(id: string, updates: Partial<WorkPlan>): WorkPlan | null {
  const workPlans = getAllWorkPlans();
  const index = workPlans.findIndex((wp) => wp.id === id);
  if (index === -1) return null;
  
  workPlans[index] = {
    ...workPlans[index],
    ...updates,
    id: workPlans[index].id,
    organizationId: workPlans[index].organizationId,
    missionId: workPlans[index].missionId,
    createdAt: workPlans[index].createdAt,
    updatedAt: new Date().toISOString(),
  };
  
  saveWorkPlans(workPlans);
  return workPlans[index];
}

export function deleteWorkPlan(id: string): boolean {
  const workPlans = getAllWorkPlans();
  const filtered = workPlans.filter((wp) => wp.id !== id);
  if (filtered.length === workPlans.length) return false;
  saveWorkPlans(filtered);
  return true;
}

function saveWorkPlans(workPlans: WorkPlan[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workPlans));
  } catch {
    console.error('[PRAXIA] Error saving work plans to storage');
  }
}
