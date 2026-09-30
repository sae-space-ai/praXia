/**
 * PRAXIA — UI: ObjectiveCard
 *
 * Displays a single OBJECTIVE in the list view.
 * Shows: class, operationalStatus, verificationStatus, baseline/target state.
 */

import { Link } from 'react-router-dom';
import type { Objective } from '../../domain/objective/types';
import { getObjectiveClassLabel } from '../../domain/objective/catalogs';
import { getOperationalStatusLabel } from '../../domain/objective/catalogs';
import { getVerificationLabel, getVerificationColor } from '../../domain/need/verification';
import { getBaselineStateLabel, getTargetStateLabel } from '../../domain/objective/catalogs';

interface ObjectiveCardProps {
  objective: Objective;
}

const CLASS_STYLES: Record<string, string> = {
  GENERAL: 'bg-purple-50 text-purple-700 border-purple-200',
  THEMATIC: 'bg-blue-50 text-blue-700 border-blue-200',
  SPECIFIC: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export default function ObjectiveCard({ objective }: ObjectiveCardProps) {
  const classLabel = getObjectiveClassLabel(objective.objectiveClass);
  const operationalLabel = getOperationalStatusLabel(objective.operationalStatus);
  const verificationLabel = getVerificationLabel(objective.verificationStatus);
  const verificationColor = getVerificationColor(objective.verificationStatus);
  const baselineLabel = getBaselineStateLabel(objective.baseline.state);
  const targetLabel = getTargetStateLabel(objective.target.state);
  const classStyle = CLASS_STYLES[objective.objectiveClass] ?? CLASS_STYLES['SPECIFIC'];

  return (
    <Link
      to={`/objectives/${objective.id}`}
      className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all duration-200 group"
    >
      {/* Top row: Class + Verification */}
      <div className="flex items-start justify-between mb-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${classStyle}`}>
          {classLabel}
        </span>
        <span className={`text-xs font-medium ${verificationColor}`}>
          {verificationLabel}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-slate-900 mb-1 group-hover:text-indigo-700 transition-colors line-clamp-2">
        {objective.title}
      </h3>

      {/* Description preview */}
      <p className="text-sm text-slate-500 mb-4 line-clamp-2">
        {objective.description}
      </p>

      {/* Meta row */}
      <div className="flex items-center flex-wrap gap-2">
        {/* Operational Status */}
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          {operationalLabel}
        </span>

        {/* Baseline */}
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
          Baseline: {baselineLabel}
        </span>

        {/* Target */}
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
          Target: {targetLabel}
        </span>
      </div>

      {/* Date */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          Creado: {new Date(objective.createdAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </p>
      </div>
    </Link>
  );
}
