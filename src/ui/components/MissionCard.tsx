/**
 * PRAXIA — UI: MissionCard
 *
 * Displays a single MISSION in the list view.
 * Shows: missionType, operationalStatus, verificationStatus, related objectives.
 */

import { Link } from 'react-router-dom';
import type { Mission } from '../../domain/mission/types';
import { getMissionTypeLabel, getMissionOperationalStatusLabel } from '../../domain/mission/catalogs';
import { getVerificationLabel, getVerificationColor } from '../../domain/need/verification';
import { getMissionsForObjectiveService } from '../../domain/mission/missionService';

interface MissionCardProps {
  mission: Mission;
}

const TYPE_STYLES: Record<string, string> = {
  DIAGNOSTIC: 'bg-blue-50 text-blue-700 border-blue-200',
  RESEARCH: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  ANALYSIS: 'bg-purple-50 text-purple-700 border-purple-200',
  DESIGN: 'bg-pink-50 text-pink-700 border-pink-200',
  OPTIMIZATION: 'bg-green-50 text-green-700 border-green-200',
  COMPLIANCE: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  TRANSFORMATION: 'bg-orange-50 text-orange-700 border-orange-200',
  IMPLEMENTATION: 'bg-red-50 text-red-700 border-red-200',
  MONITORING: 'bg-teal-50 text-teal-700 border-teal-200',
  OTHER: 'bg-slate-50 text-slate-700 border-slate-200',
};

export default function MissionCard({ mission }: MissionCardProps) {
  const typeLabel = getMissionTypeLabel(mission.missionType);
  const operationalLabel = getMissionOperationalStatusLabel(mission.operationalStatus);
  const verificationLabel = getVerificationLabel(mission.verificationStatus);
  const verificationColor = getVerificationColor(mission.verificationStatus);
  const typeStyle = TYPE_STYLES[mission.missionType] ?? TYPE_STYLES['OTHER'];

  return (
    <Link
      to={`/missions/${mission.id}`}
      className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all duration-200 group"
    >
      {/* Top row: Type + Verification */}
      <div className="flex items-start justify-between mb-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${typeStyle}`}>
          {typeLabel}
        </span>
        <span className={`text-xs font-medium ${verificationColor}`}>
          {verificationLabel}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-slate-900 mb-1 group-hover:text-indigo-700 transition-colors line-clamp-2">
        {mission.title}
      </h3>

      {/* Description preview */}
      <p className="text-sm text-slate-500 mb-4 line-clamp-2">
        {mission.description}
      </p>

      {/* Meta row */}
      <div className="flex items-center flex-wrap gap-2">
        {/* Operational Status */}
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          {operationalLabel}
        </span>
      </div>

      {/* Date */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          Creada: {new Date(mission.createdAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </p>
      </div>
    </Link>
  );
}
