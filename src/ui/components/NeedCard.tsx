/**
 * PRAXIA — UI: NeedCard
 * 
 * Displays a single NEED in the list view.
 * Shows: type, family, status, priority, verification state.
 */

import { Link } from 'react-router-dom';
import type { Need } from '../../domain/need/types';
import { getFamilyById } from '../../domain/need/families';
import { getNeedTypeLabel } from '../../domain/need/needTypes';
import { getVerificationLabel, getVerificationColor } from '../../domain/need/verification';

interface NeedCardProps {
  need: Need;
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador',
  REGISTERED: 'Registrada',
  IN_DIAGNOSIS: 'En diagnóstico',
  OBJECTIVES_DEFINED: 'Objetivos definidos',
  IN_PROGRESS: 'En progreso',
  EVALUATED: 'Evaluada',
  CLOSED: 'Cerrada',
  ARCHIVED: 'Archivada',
};

const PRIORITY_STYLES: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-800 border-red-200',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  LOW: 'bg-green-100 text-green-800 border-green-200',
  NOT_ASSESSED: 'bg-slate-100 text-slate-600 border-slate-200',
};

const PRIORITY_LABELS: Record<string, string> = {
  CRITICAL: 'Crítica',
  HIGH: 'Alta',
  MEDIUM: 'Media',
  LOW: 'Baja',
  NOT_ASSESSED: 'No evaluada',
};

export default function NeedCard({ need }: NeedCardProps) {
  const family = getFamilyById(need.domain);
  const typeLabel = getNeedTypeLabel(need.type);
  const verificationLabel = getVerificationLabel(need.overallVerification);
  const verificationColor = getVerificationColor(need.overallVerification);
  const statusLabel = STATUS_LABELS[need.status] ?? need.status;
  const priorityStyle = PRIORITY_STYLES[need.priority] ?? PRIORITY_STYLES['NOT_ASSESSED'];
  const priorityLabel = PRIORITY_LABELS[need.priority] ?? 'No evaluada';

  return (
    <Link
      to={`/needs/${need.id}`}
      className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all duration-200 group"
    >
      {/* Top row: Type + Verification */}
      <div className="flex items-start justify-between mb-3">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
          {typeLabel}
        </span>
        <span className={`text-xs font-medium ${verificationColor}`}>
          {verificationLabel}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-slate-900 mb-1 group-hover:text-indigo-700 transition-colors line-clamp-2">
        {need.title}
      </h3>

      {/* Description preview */}
      <p className="text-sm text-slate-500 mb-4 line-clamp-2">
        {need.description}
      </p>

      {/* Meta row */}
      <div className="flex items-center flex-wrap gap-2">
        {/* Family */}
        {family && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
            {family.code} · {family.name}
          </span>
        )}

        {/* Status */}
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          {statusLabel}
        </span>

        {/* Priority */}
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${priorityStyle}`}>
          {priorityLabel}
        </span>
      </div>

      {/* Date */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          Creada: {new Date(need.createdAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </p>
      </div>
    </Link>
  );
}
