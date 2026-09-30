/**
 * PRAXIA — UI Page: WorkPlan Detail
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { WorkPlan } from '../../domain/workplan/types';
import { getWorkPlanById } from '../../persistence/workPlanStore';
import { getMissionById } from '../../persistence/missionStore';
import { getWorkPlanTaskRelationsByWorkPlanId } from '../../persistence/order4Stores';
import { getTaskById } from '../../persistence/taskStore';
import { evaluateWorkPlanReadinessService } from '../../domain/task/taskService';
import type { WorkPlanReadinessResult } from '../../domain/task/types';

export default function WorkPlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workPlan, setWorkPlan] = useState<WorkPlan | null>(null);
  const [readiness, setReadiness] = useState<WorkPlanReadinessResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const wp = getWorkPlanById(id);
    setWorkPlan(wp);
    if (wp) {
      const readinessResult = evaluateWorkPlanReadinessService(id);
      setReadiness(readinessResult);
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center">Cargando...</div>;
  }

  if (!workPlan) {
    return (
      <div className="p-8 text-center py-16">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Work Plan no encontrado</h3>
        <Link to="/workplans" className="text-sm text-indigo-600 hover:text-indigo-700">
          ← Volver al listado
        </Link>
      </div>
    );
  }

  const mission = getMissionById(workPlan.missionId);
  const relations = getWorkPlanTaskRelationsByWorkPlanId(workPlan.id);
  const tasks = relations
    .map((r) => getTaskById(r.taskId))
    .filter((t) => t !== null);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Back link */}
      <button
        onClick={() => navigate('/workplans')}
        className="text-sm text-slate-500 hover:text-slate-700 mb-6 inline-flex items-center gap-1"
      >
        ← Volver al listado
      </button>

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
              Versión {workPlan.version}
            </span>
            {workPlan.isCurrentVersion && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                CURRENT
              </span>
            )}
            {workPlan.planningStatus === 'SUPERSEDED' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                SUPERSEDED
              </span>
            )}
          </div>
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-3">{workPlan.title}</h2>
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-6">
          {workPlan.description}
        </p>

        {/* Meta grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Misión</p>
            <p className="text-sm font-medium text-slate-900">
              {mission ? (
                <Link to={`/missions/${mission.id}`} className="text-indigo-600 hover:text-indigo-700">
                  {mission.title}
                </Link>
              ) : (
                'Desconocida'
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Estado</p>
            <p className="text-sm font-medium text-slate-900">{workPlan.planningStatus}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Verificación</p>
            <p className="text-sm font-medium text-slate-900">{workPlan.verificationStatus}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Tasks</p>
            <p className="text-sm font-medium text-slate-900">{tasks.length}</p>
          </div>
        </div>
      </div>

      {/* Readiness */}
      {readiness && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Readiness</h3>
          <div className="flex items-center gap-3 mb-4">
            {readiness.ready ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                ✓ READY
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
                ✗ BLOCKED
              </span>
            )}
          </div>

          {readiness.blockingReasons.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Bloqueos</p>
              <ul className="space-y-1">
                {readiness.blockingReasons.map((reason, i) => (
                  <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {readiness.warnings.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Advertencias</p>
              <ul className="space-y-1">
                {readiness.warnings.map((warning, i) => (
                  <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Tasks */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Tasks ({tasks.length})</h3>
        {tasks.length > 0 ? (
          <div className="space-y-2">
            {relations.map((rel, index) => {
              const task = getTaskById(rel.taskId);
              if (!task) return null;
              return (
                <Link
                  key={rel.id}
                  to={`/tasks/${task.id}`}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400">{index + 1}.</span>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{task.title}</p>
                      <p className="text-xs text-slate-500">{task.taskType}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">{task.operationalStatus}</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">No hay tasks asignadas</p>
        )}
      </div>

      {/* Dates */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="flex items-center gap-6 text-xs text-slate-500">
          <p>Creado: {new Date(workPlan.createdAt).toLocaleString('es-ES')}</p>
          <p>Actualizado: {new Date(workPlan.updatedAt).toLocaleString('es-ES')}</p>
        </div>
      </div>
    </div>
  );
}
