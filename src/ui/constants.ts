/**
 * PRAXIA — UI: Shared Constants
 * 
 * Shared label/style maps used across multiple components.
 * Avoids duplication between NeedCard and NeedDetailPage.
 */

import type { NeedStatus, NeedPriority } from '../domain/need/types';

// ============================================================
// STATUS LABELS
// ============================================================
export const STATUS_LABELS: Record<NeedStatus, string> = {
  DRAFT: 'Borrador',
  REGISTERED: 'Registrada',
  IN_DIAGNOSIS: 'En diagnóstico',
  OBJECTIVES_DEFINED: 'Objetivos definidos',
  IN_PROGRESS: 'En progreso',
  EVALUATED: 'Evaluada',
  CLOSED: 'Cerrada',
  ARCHIVED: 'Archivada',
};

export function getStatusLabel(status: NeedStatus): string {
  return STATUS_LABELS[status] ?? status;
}

// ============================================================
// PRIORITY LABELS
// ============================================================
export const PRIORITY_LABELS: Record<NeedPriority, string> = {
  CRITICAL: 'Crítica',
  HIGH: 'Alta',
  MEDIUM: 'Media',
  LOW: 'Baja',
  NOT_ASSESSED: 'No evaluada',
};

export function getPriorityLabel(priority: NeedPriority): string {
  return PRIORITY_LABELS[priority] ?? 'No evaluada';
}

// ============================================================
// PRIORITY STYLES (Tailwind classes)
// ============================================================
export const PRIORITY_STYLES: Record<NeedPriority, string> = {
  CRITICAL: 'bg-red-100 text-red-800 border-red-200',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  LOW: 'bg-green-100 text-green-800 border-green-200',
  NOT_ASSESSED: 'bg-slate-100 text-slate-600 border-slate-200',
};

export function getPriorityStyle(priority: NeedPriority): string {
  return PRIORITY_STYLES[priority] ?? PRIORITY_STYLES['NOT_ASSESSED'];
}
