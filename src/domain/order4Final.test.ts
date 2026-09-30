/**
 * PRAXIA — Tests: Order 4 Final Verification (T158-T160)
 * 
 * T158 — End-to-end traceability integrity
 * T159 — Zero-assumption + readiness integration
 * T160 — Human authority + regression invariant
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createNeedService, getNeedService } from './need/needService';
import { createObjectiveService, getObjectiveService, createRelationService, getRelationsByNeedService } from './objective/objectiveService';
import { createMissionService, getMissionService, getMissionsForObjectiveService } from './mission/missionService';
import { createObjectiveMissionRelationService } from './mission/missionService';
import { createWorkPlanService, getWorkPlanService } from './workplan/workplanService';
import { createTaskService, getTaskService, evaluateTaskReadinessService } from './task/taskService';
import { getMissionExecutionTrace } from './traceability/traceabilityService';
import {
  createDataRequirement,
  getDataRequirementsByTaskId,
  updateDataRequirement,
  createHumanGate,
  getHumanGatesByEntity,
  updateHumanGate,
  createWorkPlanTaskRelation,
} from '../persistence/order4Stores';

function clearStorage() {
  localStorage.clear();
}

// ============================================================
// T158 — END-TO-END TRACEABILITY INTEGRITY
// ============================================================
describe('T158 — End-to-end traceability integrity', () => {
  beforeEach(clearStorage);

  it('reconstructs complete chain from persisted relations', () => {
    // Create NEED
    const need = createNeedService({
      organizationId: 'org_test',
      title: 'Need for traceability',
      description: 'Need description',
      type: 'PROBLEM',
      domain: 'F01',
      priority: 'HIGH',
    }).need!;

    // Create OBJECTIVE
    const objective = createObjectiveService({
      organizationId: 'org_test',
      title: 'Objective for traceability',
      description: 'Objective description',
      objectiveClass: 'SPECIFIC',
    }).objective!;

    // Create NEED ↔ OBJECTIVE relation
    createRelationService({
      needId: need.id,
      objectiveId: objective.id,
    });

    // Create MISSION
    const mission = createMissionService({
      organizationId: 'org_test',
      title: 'Mission for traceability',
      description: 'Mission description',
      missionType: 'ANALYSIS',
    }).mission!;

    // Create OBJECTIVE ↔ MISSION relation
    createObjectiveMissionRelationService({
      organizationId: 'org_test',
      objectiveId: objective.id,
      missionId: mission.id,
    });

    // Create WORK PLAN
    const workPlan = createWorkPlanService({
      organizationId: 'org_test',
      missionId: mission.id,
      title: 'WorkPlan for traceability',
      description: 'WorkPlan description',
    });

    // Create TASK
    const task = createTaskService({
      organizationId: 'org_test',
      title: 'Task for traceability',
      description: 'Task description',
      taskType: 'ANALYSIS',
      purpose: 'Purpose',
      expectedOutput: 'Output',
    });

    // Create WORKPLAN ↔ TASK relation
    createWorkPlanTaskRelation({
      organizationId: 'org_test',
      workPlanId: workPlan.id,
      taskId: task.id,
      sequence: 1,
    });

    // Verify traceability reconstruction
    const trace = getMissionExecutionTrace(mission.id);

    expect(trace.missionId).toBe(mission.id);
    expect(trace.currentWorkPlan).not.toBeNull();
    expect(trace.currentWorkPlan?.id).toBe(workPlan.id);
    expect(trace.tasks).toHaveLength(1);
    expect(trace.tasks[0].id).toBe(task.id);

    // Verify deprecated arrays are NOT required
    expect(trace.currentWorkPlan?.taskIds).toEqual([]); // Deprecated, not used
  });
});

// ============================================================
// T159 — ZERO-ASSUMPTION + READINESS INTEGRATION
// ============================================================
describe('T159 — Zero-assumption + readiness integration', () => {
  beforeEach(clearStorage);

  it('UNKNOWN data requirement blocks task readiness', () => {
    const task = createTaskService({
      organizationId: 'org_test',
      title: 'Task with data requirement',
      description: 'Task description',
      taskType: 'ANALYSIS',
      purpose: 'Purpose',
      expectedOutput: 'Output',
      successCriteria: [{ id: '1', description: 'Done', measurementStatus: 'NOT_MEASURED' }],
    });

    // Create blocking data requirement
    const dr = createDataRequirement({
      organizationId: 'org_test',
      taskId: task.id,
      name: 'Financial Data',
      description: 'Q4 financial statements',
      purpose: 'Analyze performance',
      dataCategory: 'FINANCIAL',
      required: true,
      blockingIfMissing: true,
    });

    // Verify UNKNOWN ≠ AVAILABLE
    expect(dr.availabilityStatus).toBe('UNKNOWN');
    expect(dr.availabilityStatus).not.toBe('AVAILABLE');

    // Verify task readiness is blocked
    const readinessBefore = evaluateTaskReadinessService(task.id);
    expect(readinessBefore.ready).toBe(false);
    expect(readinessBefore.blockingReasons.some(r => r.includes('data requirement'))).toBe(true);

    // Resolve the requirement legitimately
    const updatedDr = updateDataRequirement(dr.id, {
      availabilityStatus: 'AVAILABLE',
    });

    expect(updatedDr?.availabilityStatus).toBe('AVAILABLE');

    // Verify readiness recomputes deterministically
    const readinessAfter = evaluateTaskReadinessService(task.id);
    expect(readinessAfter.ready).toBe(true);
    expect(readinessAfter.blockingReasons).not.toContain(
      expect.stringContaining('data requirement')
    );
  });

  it('non-blocking data requirement does not block readiness', () => {
    const task = createTaskService({
      organizationId: 'org_test',
      title: 'Task with non-blocking data',
      description: 'Task description',
      taskType: 'ANALYSIS',
      purpose: 'Purpose',
      expectedOutput: 'Output',
      successCriteria: [{ id: '1', description: 'Done', measurementStatus: 'NOT_MEASURED' }],
    });

    // Create non-blocking data requirement
    createDataRequirement({
      organizationId: 'org_test',
      taskId: task.id,
      name: 'Optional Data',
      description: 'Optional data',
      purpose: 'Nice to have',
      dataCategory: 'OTHER',
      required: false,
      blockingIfMissing: false,
    });

    // Verify task readiness is not blocked by this
    const readiness = evaluateTaskReadinessService(task.id);
    expect(readiness.blockingReasons).not.toContain(
      expect.stringContaining('data requirement')
    );
  });
});

// ============================================================
// T160 — HUMAN AUTHORITY + REGRESSION INVARIANT
// ============================================================
describe('T160 — Human authority + regression invariant', () => {
  beforeEach(clearStorage);

  it('PENDING gate blocks task readiness', () => {
    const task = createTaskService({
      organizationId: 'org_test',
      title: 'Task requiring approval',
      description: 'Task description',
      taskType: 'ANALYSIS',
      purpose: 'Purpose',
      expectedOutput: 'Output',
      successCriteria: [{ id: '1', description: 'Done', measurementStatus: 'NOT_MEASURED' }],
      humanApprovalRequired: true,
    });

    // Create human gate
    const gate = createHumanGate({
      organizationId: 'org_test',
      entityType: 'TASK',
      entityId: task.id,
      gateType: 'APPROVAL',
      reason: 'Requires manager approval',
    });

    // Verify PENDING does not authorize
    expect(gate.status).toBe('PENDING');

    const readinessBefore = evaluateTaskReadinessService(task.id);
    expect(readinessBefore.ready).toBe(false);
    expect(readinessBefore.blockingReasons.some(r => r.includes('approval'))).toBe(true);

    // Verify no service automatically changes PENDING → APPROVED
    const gateStillPending = getHumanGatesByEntity('TASK', task.id)[0];
    expect(gateStillPending.status).toBe('PENDING');

    // Perform explicit human approval
    const approvedGate = updateHumanGate(gate.id, {
      status: 'APPROVED',
      resolvedAt: new Date().toISOString(),
    });

    expect(approvedGate?.status).toBe('APPROVED');
    expect(approvedGate?.resolvedAt).toBeTruthy();

    // Verify readiness recomputes
    const readinessAfter = evaluateTaskReadinessService(task.id);
    expect(readinessAfter.blockingReasons).not.toContain(
      expect.stringContaining('approval')
    );
  });

  it('human approval does not mutate unrelated relations', () => {
    // Create NEED
    const need = createNeedService({
      organizationId: 'org_test',
      title: 'Need',
      description: 'Need',
      type: 'PROBLEM',
      domain: 'F01',
      priority: 'HIGH',
    }).need!;

    // Create OBJECTIVE
    const objective = createObjectiveService({
      organizationId: 'org_test',
      title: 'Objective',
      description: 'Objective',
      objectiveClass: 'SPECIFIC',
    }).objective!;

    // Create NEED ↔ OBJECTIVE relation
    createRelationService({
      needId: need.id,
      objectiveId: objective.id,
    });

    // Create MISSION
    const mission = createMissionService({
      organizationId: 'org_test',
      title: 'Mission',
      description: 'Mission',
      missionType: 'ANALYSIS',
    }).mission!;

    // Create OBJECTIVE ↔ MISSION relation
    createObjectiveMissionRelationService({
      organizationId: 'org_test',
      objectiveId: objective.id,
      missionId: mission.id,
    });

    // Create TASK with human gate
    const task = createTaskService({
      organizationId: 'org_test',
      title: 'Task',
      description: 'Task',
      taskType: 'ANALYSIS',
      purpose: 'Purpose',
      expectedOutput: 'Output',
      successCriteria: [{ id: '1', description: 'Done', measurementStatus: 'NOT_MEASURED' }],
      humanApprovalRequired: true,
    });

    const gate = createHumanGate({
      organizationId: 'org_test',
      entityType: 'TASK',
      entityId: task.id,
      gateType: 'APPROVAL',
      reason: 'Test',
    });

    // Approve gate
    updateHumanGate(gate.id, {
      status: 'APPROVED',
      resolvedAt: new Date().toISOString(),
    });

    // Verify unrelated relations are NOT mutated
    const needStillExists = getNeedService(need.id);
    expect(needStillExists).not.toBeNull();

    const objectiveStillExists = getObjectiveService(objective.id);
    expect(objectiveStillExists).not.toBeNull();

    const missionStillExists = getMissionService(mission.id);
    expect(missionStillExists).not.toBeNull();

    // Verify relations still exist
    const needRelations = getRelationsByNeedService(need.id);
    expect(needRelations).toHaveLength(1);

    const objectiveRelations = getMissionsForObjectiveService(objective.id);
    expect(objectiveRelations).toHaveLength(1);
  });
});
