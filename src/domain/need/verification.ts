/**
 * PRAXIA — Domain: Verification Semantics
 * 
 * PRAXIA never converts a hypothesis into a fact automatically.
 * These states define the truth level of any claim in the system.
 */

import type { VerificationState } from './types';

export interface VerificationStateDefinition {
  value: VerificationState;
  label: string;
  description: string;
  color: string; // Tailwind color class
}

export const VERIFICATION_STATES: VerificationStateDefinition[] = [
  {
    value: 'UNKNOWN',
    label: 'Desconocido',
    description: 'No hay información disponible para determinar la verdad.',
    color: 'text-gray-500',
  },
  {
    value: 'HYPOTHESIS',
    label: 'Hipótesis',
    description: 'Suposición que requiere verificación. NO es un hecho.',
    color: 'text-amber-500',
  },
  {
    value: 'SUPPORTED',
    label: 'Sostenido',
    description: 'Existe evidencia que apoya esta afirmación, pero no está verificada al 100%.',
    color: 'text-blue-500',
  },
  {
    value: 'VERIFIED',
    label: 'Verificado',
    description: 'Confirmado con evidencia suficiente. Es un hecho.',
    color: 'text-emerald-500',
  },
];

export function getVerificationLabel(state: VerificationState): string {
  return VERIFICATION_STATES.find((s) => s.value === state)?.label ?? state;
}

export function getVerificationColor(state: VerificationState): string {
  return VERIFICATION_STATES.find((s) => s.value === state)?.color ?? 'text-gray-500';
}
