/**
 * PRAXIA — Tests: Order 4 Completion (T101-T160)
 * 
 * Tests for Capability, DataRequirement, HumanGate, Traceability, Proposal
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAllCapabilities,
  getCapabilityById,
  createCapability,
  updateCapability,
  deleteCapability,
  getAllDataRequirements,
  createDataRequirement,
  getDataRequirementsByTaskId,
  getAllHumanGates,
  createHumanGate,
  getHumanGatesByEntity,
  updateHumanGate,
} from '../persistence/order4Stores';
import { getAllWorkPlans } from '../persistence/workPlanStore';
import { createTaskService, getTaskService } from './task/taskService';
import { createMissionService } from './mission/missionService';
import { proposeWorkPlanFromMission } from './proposal/proposalService';
import { getMissionExecutionTrace } from './traceability/traceabilityService';

function clearStorage() {
  localStorage.clear();
}

// ============================================================
// T106-T115: CAPABILITY
// ============================================================
describe('T106 — Create valid Capability', () => {
  beforeEach(clearStorage);
  
  it('creates a capability with required fields', () => {
    const cap = createCapability({
      code: 'FINANCIAL_ANALYSIS',
      name: 'Financial Analysis',
      description: 'Ability to analyze financial data',
      category: 'Analysis',
    });
    
    expect(cap.id).toBeTruthy();
    expect(cap.code).toBe('FINANCIAL_ANALYSIS');
    expect(cap.status).toBe('ACTIVE');
  });
});

describe('T107 — Capability active/inactive', () => {
  beforeEach(clearStorage);
  
  it('can mark capability as inactive', () => {
    const cap = createCapability({
      code: 'TEST',
      name: 'Test',
      description: 'Test capability',
      category: 'Test',
    });
    
    const updated = updateCapability(cap.id, { status: 'INACTIVE' });
    expect(updated?.status).toBe('INACTIVE');
  });
});

// ============================================================
// T126-T135: DATA REQUIREMENTS
// ============================================================
describe('T126 — Create DataRequirement', () => {
  beforeEach(clearStorage);
  
  it('creates a data requirement for a task', () => {
    const task = createTaskService({
      organizationId: 'org_test',
      title: 'Task',
      description: 'Task',
      taskType: 'ANALYSIS',
      purpose: 'Purpose',
      expectedOutput: 'Output',
    });
    
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
    
    expect(dr.id).toBeTruthy();
    expect(dr.availabilityStatus).toBe('UNKNOWN');
    expect(dr.blockingIfMissing).toBe(true);
  });
});

describe('T127 — UNKNOWN ≠ AVAILABLE', () => {
  beforeEach(clearStorage);
  
  it('default availability is UNKNOWN, not AVAILABLE', () => {
    const task = createTaskService({
      organizationId: 'org_test',
      title: 'Task',
      description: 'Task',
      taskType: 'ANALYSIS',
      purpose: 'Purpose',
      expectedOutput: 'Output',
    });
    
    const dr = createDataRequirement({
      organizationId: 'org_test',
      taskId: task.id,
      name: 'Data',
      description: 'Data',
      purpose: 'Purpose',
      dataCategory: 'OTHER',
    });
    
    expect(dr.availabilityStatus).toBe('UNKNOWN');
    expect(dr.availabilityStatus).not.toBe('AVAILABLE');
  });
});

// ============================================================
// T136-T145: HUMAN GATES
// ============================================================
describe('T136 — Create HumanGate', () => {
  beforeEach(clearStorage);
  
  it('creates a human gate for a task', () => {
    const task = createTaskService({
      organizationId: 'org_test',
      title: 'Task',
      description: 'Task',
      taskType: 'ANALYSIS',
      purpose: 'Purpose',
      expectedOutput: 'Output',
      humanApprovalRequired: true,
    });
    
    const gate = createHumanGate({
      organizationId: 'org_test',
      entityType: 'TASK',
      entityId: task.id,
      gateType: 'APPROVAL',
      reason: 'Requires manager approval',
    });
    
    expect(gate.id).toBeTruthy();
    expect(gate.status).toBe('PENDING');
    expect(gate.resolvedAt).toBeNull();
  });
});

describe('T137 — No auto-approval', () => {
  beforeEach(clearStorage);
  
  it('gate remains PENDING until explicitly approved', () => {
    const task = createTaskService({
      organizationId: 'org_test',
      title: 'Task',
      description: 'Task',
      taskType: 'ANALYSIS',
      purpose: 'Purpose',
      expectedOutput: 'Output',
    });
    
    const gate = createHumanGate({
      organizationId: 'org_test',
      entityType: 'TASK',
      entityId: task.id,
      gateType: 'APPROVAL',
      reason: 'Test',
    });
    
    // Gate should be PENDING
    expect(gate.status).toBe('PENDING');
    
    // Explicit approval
    const approved = updateHumanGate(gate.id, {
      status: 'APPROVED',
      resolvedAt: new Date().toISOString(),
    });
    
    expect(approved?.status).toBe('APPROVED');
    expect(approved?.resolvedAt).toBeTruthy();
  });
});

// ============================================================
// T146-T160: TRACEABILITY & PROPOSAL
// ============================================================
describe('T153 — Traceability reconstructs from persisted relations', () => {
  beforeEach(clearStorage);
  
  it('reconstructs trace from existing relations only', () => {
    const mission = createMissionService({
      organizationId: 'org_test',
      title: 'Mission',
      description: 'Mission',
      missionType: 'ANALYSIS',
    }).mission!;
    
    const trace = getMissionExecutionTrace(mission.id);
    
    expect(trace.missionId).toBe(mission.id);
    expect(trace.currentWorkPlan).toBeNull(); // No work plan yet
    expect(trace.tasks).toEqual([]);
    expect(trace.capabilities).toEqual([]);
  });
});

describe('T154 — Traceability works with partial data', () => {
  beforeEach(clearStorage);
  
  it('handles missing relations gracefully', () => {
    const trace = getMissionExecutionTrace('non-existent-id');
    
    // Should throw or return empty structure
    expect(trace).toBeDefined();
  });
});

describe('T155 — Proposal does not invent data', () => {
  beforeEach(clearStorage);
  
  it('proposeWorkPlanFromMission uses only existing data', () => {
    const mission = createMissionService({
      organizationId: 'org_test',
      title: 'Mission',
      description: 'Mission description',
      missionType: 'ANALYSIS',
    }).mission!;
    
    const proposal = proposeWorkPlanFromMission(mission.id);
    
    expect(proposal.workPlanInput).toBeDefined();
    expect(proposal.missingInformation.length).toBeGreaterThan(0);
    expect(proposal.assumptionsExplicitlyDeclared.length).toBeGreaterThan(0);
  });
});

describe('T156 — Proposal reports missing information', () => {
  beforeEach(clearStorage);
  
  it('identifies what is missing', () => {
    const mission = createMissionService({
      organizationId: 'org_test',
      title: 'Mission',
      description: '',
      missionType: 'ANALYSIS',
    }).mission!;
    
    const proposal = proposeWorkPlanFromMission(mission.id);
    
    expect(proposal.missingInformation).toContain(
      'No hay objetivos relacionados con esta misión. Se requieren objetivos para proponer tareas.'
    );
  });
});

describe('T157 — Proposal requires human review', () => {
  beforeEach(clearStorage);
  
  it('does not persist automatically', () => {
    const mission = createMissionService({
      organizationId: 'org_test',
      title: 'Mission',
      description: 'Mission',
      missionType: 'ANALYSIS',
    }).mission!;
    
    proposeWorkPlanFromMission(mission.id);
    
    // No work plan should have been created
    expect(getAllWorkPlans()).toHaveLength(0);
  });
});
