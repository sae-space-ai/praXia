/**
 * PRAXIA — Domain: Need Type Catalog
 * 
 * Defines all valid types a NEED can have.
 */

import type { NeedType } from './types';

export interface NeedTypeDefinition {
  value: NeedType;
  label: string;
  description: string;
}

export const NEED_TYPES: NeedTypeDefinition[] = [
  {
    value: 'PROBLEM',
    label: 'Problema',
    description: 'Una situación que causa impacto negativo y requiere resolución.',
  },
  {
    value: 'NEED',
    label: 'Necesidad',
    description: 'Una carencia o requisito que la organización debe satisfacer.',
  },
  {
    value: 'OPPORTUNITY',
    label: 'Oportunidad',
    description: 'Una posibilidad de mejora o ventaja que puede aprovecharse.',
  },
  {
    value: 'RISK',
    label: 'Riesgo',
    description: 'Una amenaza potencial que puede materializarse con consecuencias negativas.',
  },
  {
    value: 'OBLIGATION',
    label: 'Obligación',
    description: 'Un requisito normativo, legal o contractual que debe cumplirse.',
  },
  {
    value: 'DECISION',
    label: 'Decisión',
    description: 'Una elección que debe tomarse entre alternativas.',
  },
  {
    value: 'TRANSFORMATION',
    label: 'Transformación',
    description: 'Un cambio estructural que la organización necesita realizar.',
  },
  {
    value: 'INCIDENT',
    label: 'Incidente',
    description: 'Un evento no planificado que requiere atención inmediata.',
  },
  {
    value: 'UNCERTAINTY',
    label: 'Incertidumbre',
    description: 'Una situación donde falta información para tomar decisiones.',
  },
  {
    value: 'AMBITION',
    label: 'Ambición',
    description: 'Un objetivo aspiracional que la organización desea alcanzar.',
  },
];

export function getNeedTypeLabel(value: NeedType): string {
  return NEED_TYPES.find((t) => t.value === value)?.label ?? value;
}
