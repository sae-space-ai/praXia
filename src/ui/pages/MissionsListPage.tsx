/**
 * PRAXIA — UI Page: Missions List
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { Mission, MissionType, MissionOperationalStatus } from '../../domain/mission/types';
import { getAllMissionsService } from '../../domain/mission/missionService';
import { MISSION_TYPES, MISSION_OPERATIONAL_STATUSES } from '../../domain/mission/catalogs';
import MissionCard from '../components/MissionCard';

export default function MissionsListPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const location = useLocation();

  useEffect(() => {
    setMissions(getAllMissionsService());
  }, [location.key]);

  const filtered = missions.filter((m) => {
    if (filterType !== 'ALL' && m.missionType !== filterType) return false;
    if (filterStatus !== 'ALL' && m.operationalStatus !== filterStatus) return false;
    return true;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Misiones</h2>
            <p className="mt-1 text-sm text-slate-500">
              Unidades estructuradas de trabajo para contribuir a objetivos definidos.
            </p>
          </div>
          <Link
            to="/missions/new"
            className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            + Nueva Misión
          </Link>
        </div>
      </div>

      {/* Filters */}
      {missions.length > 0 && (
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Filtrar:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Todos los tipos</option>
            {MISSION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Todos los estados</option>
            {MISSION_OPERATIONAL_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-400 ml-auto">
            {filtered.length} de {missions.length} misiones
          </span>
        </div>
      )}

      {/* Missions Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((mission) => (
            <MissionCard key={mission.id} mission={mission} />
          ))}
        </div>
      ) : missions.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No hay misiones registradas
          </h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Comience creando una misión desde un objetivo o directamente.
          </p>
          <Link
            to="/missions/new"
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Crear primera misión
          </Link>
        </div>
      ) : (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
          <p className="text-sm text-slate-500">
            No hay misiones que coincidan con los filtros.
          </p>
        </div>
      )}
    </div>
  );
}
