/**
 * PRAXIA — Domain: Mission Catalogs
 *
 * Catalogs for mission classification and lifecycle.
 */

import type {
  MissionType,
  MissionOperationalStatus,
  AssumptionStatus,
  DependencyStatus,
  MeasurementStatus,
  ExpectedOutcomeState,
} from './types';

// ============================================================
// MISSION TYPE
// ============================================================
export const MISSION_TYPES: { value: MissionType; label: string; description: string }[] = [
  {
    value: 'DIAGNOSTIC',
    label: 'Diagnóstico',
    description: 'Comprender situación, síntomas o causas.',
  },
  {
    value: 'RESEARCH',
    label: 'Investigación',
    description: 'Adquirir conocimiento o evidencia necesaria.',
  },
  {
    value: 'ANALYSIS',
    label: 'Análisis',
    description: 'Examinar datos, alternativas o relaciones.',
  },
  {
    value: 'DESIGN',
    label: 'Diseño',
    description: 'Diseñar solución, proceso, arquitectura o intervención.',
  },
  {
    value: 'OPTIMIZATION',
    label: 'Optimización',
    description: 'Mejorar una situación existente bajo restricciones.',
  },
  {
    value: 'COMPLIANCE',
    label: 'Cumplimiento',
    description: 'Evaluar o alcanzar conformidad con requisitos.',
  },
  {
    value: 'TRANSFORMATION',
    label: 'Transformación',
    description: 'Cambiar de un estado operativo a otro.',
  },
  {
    value: 'IMPLEMENTATION',
    label: 'Implementación',
    description: 'Materializar una intervención previamente definida.',
  },
  {
    value: 'MONITORING',
    label: 'Monitoreo',
    description: 'Observar evolución o condición a lo largo del tiempo.',
  },
  {
    value: 'OTHER',
    label: 'Otro',
    description: 'Sólo cuando ninguna categoría anterior sea adecuada.',
  },
];

export function getMissionTypeLabel(value: MissionType): string {
  return MISSION_TYPES.find((t) => t.value === value)?.label ?? value;
}

// ============================================================
// MISSION OPERATIONAL STATUS
// ============================================================
export const MISSION_OPERATIONAL_STATUSES: {
  value: MissionOperationalStatus;
  label: string;
}[] = [
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'PROPOSED', label: 'Propuesto' },
  { value: 'APPROVED', label: 'Aprobado' },
  { value: 'ACTIVE', label: 'Activo' },
  { value: 'PAUSED', label: 'Pausado' },
  { value: 'COMPLETED', label: 'Completado' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

export function getMissionOperationalStatusLabel(
  value: MissionOperationalStatus
): string {
  return (
    MISSION_OPERATIONAL_STATUSES.find((s) => s.value === value)?.label ?? value
  );
}

// ============================================================
// ASSUMPTION STATUS
// ============================================================
export const ASSUMPTION_STATUSES: { value: AssumptionStatus; label: string }[] = [
  { value: 'UNTESTED', label: 'No probada' },
  { value: 'SUPPORTED', label: 'Sostenida' },
  { value: 'REJECTED', label: 'Rechazada' },
  { value: 'UNKNOWN', label: 'Desconocida' },
];

export function getAssumptionStatusLabel(value: AssumptionStatus): string {
  return ASSUMPTION_STATUSES.find((s) => s.value === value)?.label ?? value;
}

// ============================================================
// DEPENDENCY STATUS
// ============================================================
export const DEPENDENCY_STATUSES: { value: DependencyStatus; label: string }[] = [
  { value: 'KNOWN', label: 'Conocida' },
  { value: 'UNKNOWN', label: 'Desconocida' },
  { value: 'RESOLVED', label: 'Resuelta' },
];

export function getDependencyStatusLabel(value: DependencyStatus): string {
  return DEPENDENCY_STATUSES.find((s) => s.value === value)?.label ?? value;
}

// ============================================================
// MEASUREMENT STATUS (Success Criterion)
// ============================================================
export const MEASUREMENT_STATUSES: { value: MeasurementStatus; label: string }[] = [
  { value: 'NOT_MEASURED', label: 'No medido' },
  { value: 'PARTIALLY_MEASURED', label: 'Parcialmente medido' },
  { value: 'MEASURED', label: 'Medido' },
];

export function getMeasurementStatusLabel(value: MeasurementStatus): string {
  return MEASUREMENT_STATUSES.find((s) => s.value === value)?.label ?? value;
}

// ============================================================
// EXPECTED OUTCOME STATE
// ============================================================
export const EXPECTED_OUTCOME_STATES: {
  value: ExpectedOutcomeState;
  label: string;
}[] = [
  { value: 'DEFINED', label: 'Definido' },
  { value: 'UNDEFINED', label: 'No definido' },
  { value: 'INTERNAL_DATA_REQUIRED', label: 'Datos internos requeridos' },
];

export function getExpectedOutcomeStateLabel(value: ExpectedOutcomeState): string {
  return EXPECTED_OUTCOME_STATES.find((s) => s.value === value)?.label ?? value;
}
