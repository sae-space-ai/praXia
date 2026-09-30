/**
 * PRAXIA — Domain: Objective Catalogs
 *
 * Catalogs for objective classification and lifecycle.
 */

import type {
  ObjectiveClass,
  OperationalStatus,
  TimeHorizon,
  MeasurementStatus,
  BaselineState,
  TargetState,
} from './types';

// ============================================================
// OBJECTIVE CLASS
// ============================================================
export const OBJECTIVE_CLASSES: { value: ObjectiveClass; label: string; description: string }[] = [
  {
    value: 'GENERAL',
    label: 'General',
    description: 'Objetivo estratégico de alto nivel. Puede no tener padre.',
  },
  {
    value: 'THEMATIC',
    label: 'Temático',
    description: 'Objetivo intermedio vinculado a un General.',
  },
  {
    value: 'SPECIFIC',
    label: 'Específico',
    description: 'Objetivo operativo vinculado a un Temático.',
  },
];

export function getObjectiveClassLabel(value: ObjectiveClass): string {
  return OBJECTIVE_CLASSES.find((c) => c.value === value)?.label ?? value;
}

// ============================================================
// OPERATIONAL STATUS
// ============================================================
export const OPERATIONAL_STATUSES: { value: OperationalStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'PROPOSED', label: 'Propuesto' },
  { value: 'APPROVED', label: 'Aprobado' },
  { value: 'ACTIVE', label: 'Activo' },
  { value: 'PAUSED', label: 'Pausado' },
  { value: 'COMPLETED', label: 'Completado' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

export function getOperationalStatusLabel(value: OperationalStatus): string {
  return OPERATIONAL_STATUSES.find((s) => s.value === value)?.label ?? value;
}

// ============================================================
// TIME HORIZON
// ============================================================
export const TIME_HORIZONS: { value: TimeHorizon; label: string }[] = [
  { value: 'SHORT_TERM', label: 'Corto plazo' },
  { value: 'MEDIUM_TERM', label: 'Medio plazo' },
  { value: 'LONG_TERM', label: 'Largo plazo' },
  { value: 'UNDEFINED', label: 'No definido' },
];

export function getTimeHorizonLabel(value: TimeHorizon): string {
  return TIME_HORIZONS.find((h) => h.value === value)?.label ?? value;
}

// ============================================================
// BASELINE STATE
// ============================================================
export const BASELINE_STATES: { value: BaselineState; label: string }[] = [
  { value: 'KNOWN', label: 'Conocido' },
  { value: 'UNKNOWN', label: 'Desconocido' },
  { value: 'INTERNAL_DATA_REQUIRED', label: 'Datos internos requeridos' },
];

export function getBaselineStateLabel(value: BaselineState): string {
  return BASELINE_STATES.find((s) => s.value === value)?.label ?? value;
}

// ============================================================
// TARGET STATE
// ============================================================
export const TARGET_STATES: { value: TargetState; label: string }[] = [
  { value: 'DEFINED', label: 'Definido' },
  { value: 'UNDEFINED', label: 'No definido' },
  { value: 'INTERNAL_DATA_REQUIRED', label: 'Datos internos requeridos' },
];

export function getTargetStateLabel(value: TargetState): string {
  return TARGET_STATES.find((s) => s.value === value)?.label ?? value;
}

// ============================================================
// MEASUREMENT STATUS (KPI)
// ============================================================
export const MEASUREMENT_STATUSES: { value: MeasurementStatus; label: string }[] = [
  { value: 'NOT_MEASURED', label: 'No medido' },
  { value: 'IN_PROGRESS', label: 'En progreso' },
  { value: 'MEASURED', label: 'Medido' },
  { value: 'VERIFIED', label: 'Verificado' },
];

export function getMeasurementStatusLabel(value: MeasurementStatus): string {
  return MEASUREMENT_STATUSES.find((s) => s.value === value)?.label ?? value;
}
