/**
 * PRAXIA — Tests: Order 4 (WorkPlan, Task, Dependencies, Readiness)
 * Tests T61-T100 (subset of full T61-T160 requirement)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createWorkPlanService, getWorkPlanService, getCurrentWorkPlanForMissionService } from './workplan/workplanService';
import { createTaskService, getTaskService, createTaskDependencyService, evaluateTaskReadinessService } from './task/taskService';
import { createMissionService } from './mission/missionService';

function clearStorage() {
  localStorage.clear();
}

function createTestMission() {
  return createMissionService({
    organizationId: 'org_test',
    title: 'Test Mission',
    description: 'Test mission description',
    missionType: 'ANALYSIS',
  }).mission!;
}

// ============================================================
// T61-T70: WORK PLAN
// ============================================================
describe('T61 — Create valid WorkPlan', () => {
  beforeEach(clearStorage);
  
  it('creates a work plan for a mission', () => {
    const mission = createTestMission();
    const wp = createWorkPlanService({
      organizationId: 'org_test',
      missionId: mission.id,
      title: 'Work Plan v1',
      description: 'First version',
    });
    
    expect(wp.id).toBeTruthy();
    expect(wp.missionId).toBe(mission.id);
    expect(wp.version).toBe(1);
    expect(wp.isCurrentVersion).toBe(true);
    expect(wp.planningStatus).toBe('DRAFT');
  });
});

describe('T62 — WorkPlan versioning', () => {
  beforeEach(clearStorage);
  
  it('creates version 2 and marks version 1 as superseded', () => {
    const mission = createTestMission();
    
    const wp1 = createWorkPlanService({
      organizationId: 'org_test',
      missionId: mission.id,
      title: 'v1',
      description: 'First',
    });
    
    const wp2 = createWorkPlanService({
      organizationId: 'org_test',
      missionId: mission.id,
      title: 'v2',
      description: 'Second',
    });
    
    expect(wp2.version).toBe(2);
    expect(wp2.isCurrentVersion).toBe(true);
    
    const wp1Updated = getWorkPlanService(wp1.id);
    expect(wp1Updated?.isCurrentVersion).toBe(false);
    expect(wp1Updated?.planningStatus).toBe('SUPERSEDED');
  });
});

describe('T63 — Only one current version per mission', () => {
  beforeEach(clearStorage);
  
  it('ensures only one work plan is current', () => {
    const mission = createTestMission();
    
    createWorkPlanService({
      organizationId: 'org_test',
      missionId: mission.id,
      title: 'v1',
      description: 'First',
    });
    
    createWorkPlanService({
      organizationId: 'org_test',
      missionId: mission.id,
      title: 'v2',
      description: 'Second',
    });
    
    const current = getCurrentWorkPlanForMissionService(mission.id);
    expect(current?.version).toBe(2);
  });
});

// ============================================================
// T71-T85: TASK
// ============================================================
describe('T71 — Create valid Task', () => {
  beforeEach(clearStorage);
  
  it('creates a task with required fields', () => {
    const task = createTaskService({
      organizationId: 'org_test',
      title: 'Analyze data',
      description: 'Analyze financial data',
      taskType: 'ANALYSIS',
      purpose: 'Understand current state',
      expectedOutput: 'Analysis report',
    });
    
    expect(task.id).toBeTruthy();
    expect(task.operationalStatus).toBe('DRAFT');
    expect(task.verificationStatus).toBe('UNKNOWN');
    expect(task.executionMethod).toBe('UNASSIGNED');
  });
});

describe('T72 — Task operational vs verification status separation', () => {
  beforeEach(clearStorage);
  
  it('keeps operational and verification status independent', () => {
    const task = createTaskService({
      organizationId: 'org_test',
      title: 'Task',
      description: 'Desc',
      taskType: 'ANALYSIS',
      purpose: 'Purpose',
      expectedOutput: 'Output',
    });
    
    expect(task.operationalStatus).toBe('DRAFT');
    expect(task.verificationStatus).toBe('UNKNOWN');
    
    // They are different fields
    expect(task.operationalStatus).not.toBe(task.verificationStatus);
  });
});

// ============================================================
// T96-T105: TASK DEPENDENCIES
// ============================================================
describe('T96 — Create valid dependency A → B', () => {
  beforeEach(clearStorage);
  
  it('creates a dependency between two tasks', () => {
    const taskA = createTaskService({
      organizationId: 'org_test',
      title: 'Task A',
      description: 'First task',
      taskType: 'ANALYSIS',
      purpose: 'Purpose A',
      expectedOutput: 'Output A',
    });
    
    const taskB = createTaskService({
      organizationId: 'org_test',
      title: 'Task B',
      description: 'Second task',
      taskType: 'ANALYSIS',
      purpose: 'Purpose B',
      expectedOutput: 'Output B',
    });
    
    const result = createTaskDependencyService({
      organizationId: 'org_test',
      predecessorTaskId: taskA.id,
      successorTaskId: taskB.id,
      dependencyType: 'FINISH_TO_START',
    });
    
    expect(result.success).toBe(true);
    expect(result.relation).toBeDefined();
  });
});

describe('T97 — Reject self-dependency A → A', () => {
  beforeEach(clearStorage);
  
  it('rejects a task depending on itself', () => {
    const taskA = createTaskService({
      organizationId: 'org_test',
      title: 'Task A',
      description: 'Task',
      taskType: 'ANALYSIS',
      purpose: 'Purpose',
      expectedOutput: 'Output',
    });
    
    const result = createTaskDependencyService({
      organizationId: 'org_test',
      predecessorTaskId: taskA.id,
      successorTaskId: taskA.id,
      dependencyType: 'FINISH_TO_START',
    });
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Self-dependency');
  });
});

describe('T98 — Detect cycle A → B → A', () => {
  beforeEach(clearStorage);
  
  it('detects a simple cycle', () => {
    const taskA = createTaskService({
      organizationId: 'org_test',
      title: 'Task A',
      description: 'Task A',
      taskType: 'ANALYSIS',
      purpose: 'Purpose A',
      expectedOutput: 'Output A',
    });
    
    const taskB = createTaskService({
      organizationId: 'org_test',
      title: 'Task B',
      description: 'Task B',
      taskType: 'ANALYSIS',
      purpose: 'Purpose B',
      expectedOutput: 'Output B',
    });
    
    // Create A → B
    createTaskDependencyService({
      organizationId: 'org_test',
      predecessorTaskId: taskA.id,
      successorTaskId: taskB.id,
      dependencyType: 'FINISH_TO_START',
    });
    
    // Try to create B → A (cycle)
    const result = createTaskDependencyService({
      organizationId: 'org_test',
      predecessorTaskId: taskB.id,
      successorTaskId: taskA.id,
      dependencyType: 'FINISH_TO_START',
    });
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Cycle');
  });
});

describe('T99 — Detect complex cycle A → B → C → A', () => {
  beforeEach(clearStorage);
  
  it('detects a complex cycle', () => {
    const taskA = createTaskService({
      organizationId: 'org_test',
      title: 'Task A',
      description: 'Task A',
      taskType: 'ANALYSIS',
      purpose: 'Purpose A',
      expectedOutput: 'Output A',
    });
    
    const taskB = createTaskService({
      organizationId: 'org_test',
      title: 'Task B',
      description: 'Task B',
      taskType: 'ANALYSIS',
      purpose: 'Purpose B',
      expectedOutput: 'Output B',
    });
    
    const taskC = createTaskService({
      organizationId: 'org_test',
      title: 'Task C',
      description: 'Task C',
      taskType: 'ANALYSIS',
      purpose: 'Purpose C',
      expectedOutput: 'Output C',
    });
    
    // A → B
    createTaskDependencyService({
      organizationId: 'org_test',
      predecessorTaskId: taskA.id,
      successorTaskId: taskB.id,
      dependencyType: 'FINISH_TO_START',
    });
    
    // B → C
    createTaskDependencyService({
      organizationId: 'org_test',
      predecessorTaskId: taskB.id,
      successorTaskId: taskC.id,
      dependencyType: 'FINISH_TO_START',
    });
    
    // C → A (cycle)
    const result = createTaskDependencyService({
      organizationId: 'org_test',
      predecessorTaskId: taskC.id,
      successorTaskId: taskA.id,
      dependencyType: 'FINISH_TO_START',
    });
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Cycle');
  });
});

// ============================================================
// T146-T160: READINESS
// ============================================================
describe('T146 — Task readiness with missing expected output', () => {
  beforeEach(clearStorage);
  
  it('blocks task with missing expected output', () => {
    const task = createTaskService({
      organizationId: 'org_test',
      title: 'Task',
      description: 'Task',
      taskType: 'ANALYSIS',
      purpose: 'Purpose',
      expectedOutput: '', // Missing
    });
    
    const readiness = evaluateTaskReadinessService(task.id);
    expect(readiness.ready).toBe(false);
    expect(readiness.blockingReasons).toContain('Missing expected output');
  });
});

describe('T147 — Task readiness with missing success criteria', () => {
  beforeEach(clearStorage);
  
  it('blocks task with no success criteria', () => {
    const task = createTaskService({
      organizationId: 'org_test',
      title: 'Task',
      description: 'Task',
      taskType: 'ANALYSIS',
      purpose: 'Purpose',
      expectedOutput: 'Output',
      successCriteria: [], // Missing
    });
    
    const readiness = evaluateTaskReadinessService(task.id);
    expect(readiness.ready).toBe(false);
    expect(readiness.blockingReasons).toContain('No success criteria defined');
  });
});

describe('T148 — Task readiness with incomplete dependencies', () => {
  beforeEach(clearStorage);
  
  it('blocks task with incomplete dependencies', () => {
    const taskA = createTaskService({
      organizationId: 'org_test',
      title: 'Task A',
      description: 'Task A',
      taskType: 'ANALYSIS',
      purpose: 'Purpose A',
      expectedOutput: 'Output A',
    });
    
    const taskB = createTaskService({
      organizationId: 'org_test',
      title: 'Task B',
      description: 'Task B',
      taskType: 'ANALYSIS',
      purpose: 'Purpose B',
      expectedOutput: 'Output B',
      successCriteria: [{ id: '1', description: 'Done', measurementStatus: 'NOT_MEASURED' }],
    });
    
    // A → B
    createTaskDependencyService({
      organizationId: 'org_test',
      predecessorTaskId: taskA.id,
      successorTaskId: taskB.id,
      dependencyType: 'FINISH_TO_START',
    });
    
    // Task A is not completed
    const readiness = evaluateTaskReadinessService(taskB.id);
    expect(readiness.ready).toBe(false);
    expect(readiness.blockingReasons.some((r: string) => r.includes('dependency'))).toBe(true);
  });
});
