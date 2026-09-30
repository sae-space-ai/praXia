/**
 * PRAXIA — UI Page: Objectives List
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { Objective, ObjectiveClass, OperationalStatus } from '../../domain/objective/types';
import { getAllObjectivesService } from '../../domain/objective/objectiveService';
import { OBJECTIVE_CLASSES, OPERATIONAL_STATUSES } from '../../domain/objective/catalogs';
import ObjectiveCard from '../components/ObjectiveCard';

export default function ObjectivesListPage() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const location = useLocation();

  useEffect(() => {
    setObjectives(getAllObjectivesService());
  }, [location.key]);

  const filtered = objectives.filter((o) => {
    if (filterClass !== 'ALL' && o.objectiveClass !== filterClass) return false;
    if (filterStatus !== 'ALL' && o.operationalStatus !== filterStatus) return false;
    return true;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Objetivos</h2>
            <p className="mt-1 text-sm text-slate-500">
              Objetivos empresariales estructurados, trazables y evaluables.
            </p>
          </div>
          <Link
            to="/objectives/new"
            className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            + Nuevo Objetivo
          </Link>
        </div>
      </div>

      {/* Filters */}
      {objectives.length > 0 && (
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Filtrar:</span>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Todas las clases</option>
            {OBJECTIVE_CLASSES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Todos los estados</option>
            {OPERATIONAL_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-400 ml-auto">
            {filtered.length} de {objectives.length} objetivos
          </span>
        </div>
      )}

      {/* Objectives Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((objective) => (
            <ObjectiveCard key={objective.id} objective={objective} />
          ))}
        </div>
      ) : objectives.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No hay objetivos registrados
          </h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Comience creando un objetivo desde una necesidad o directamente.
          </p>
          <Link
            to="/objectives/new"
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Crear primer objetivo
          </Link>
        </div>
      ) : (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
          <p className="text-sm text-slate-500">
            No hay objetivos que coincidan con los filtros.
          </p>
        </div>
      )}
    </div>
  );
}
