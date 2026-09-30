/**
 * PRAXIA — UI Page: WorkPlans List
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getAllWorkPlans } from '../../persistence/workPlanStore';
import { getMissionById } from '../../persistence/missionStore';
import type { WorkPlan } from '../../domain/workplan/types';

export default function WorkPlansListPage() {
  const [workPlans, setWorkPlans] = useState<WorkPlan[]>([]);
  const location = useLocation();

  useEffect(() => {
    setWorkPlans(getAllWorkPlans());
  }, [location.key]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Work Plans</h1>
        <p className="text-sm text-slate-500 mt-1">
          Planes de trabajo para misiones empresariales.
        </p>
      </div>

      {workPlans.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📋</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No hay Work Plans registrados
          </h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Cree un Work Plan desde el detalle de una Misión.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workPlans.map((wp) => {
            const mission = getMissionById(wp.missionId);
            return (
              <Link
                key={wp.id}
                to={`/workplans/${wp.id}`}
                className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                    v{wp.version}
                  </span>
                  {wp.isCurrentVersion && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      CURRENT
                    </span>
                  )}
                </div>

                <h3 className="text-base font-semibold text-slate-900 mb-1 line-clamp-2">
                  {wp.title}
                </h3>

                <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                  {wp.description}
                </p>

                <div className="flex items-center flex-wrap gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    {wp.planningStatus}
                  </span>
                  {mission && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                      Misión: {mission.title.substring(0, 20)}...
                    </span>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-400">
                    Creado: {new Date(wp.createdAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
