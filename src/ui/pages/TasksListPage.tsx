/**
 * PRAXIA — UI Page: Tasks List
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getAllTasks } from '../../persistence/taskStore';
import { evaluateTaskReadinessService } from '../../domain/task/taskService';
import type { Task } from '../../domain/task/types';

export default function TasksListPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const location = useLocation();

  useEffect(() => {
    setTasks(getAllTasks());
  }, [location.key]);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
          <p className="text-sm text-slate-500 mt-1">
            Unidades de trabajo gobernadas con trazabilidad completa.
          </p>
        </div>
        <Link
          to="/tasks/new"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Nueva Task
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✓</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No hay Tasks registradas
          </h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Cree una Task manualmente o propóngala desde un WorkPlan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => {
            const readiness = evaluateTaskReadinessService(task.id);
            return (
              <Link
                key={task.id}
                to={`/tasks/${task.id}`}
                className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                    {task.taskType}
                  </span>
                  {readiness.ready ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      READY
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                      BLOCKED
                    </span>
                  )}
                </div>

                <h3 className="text-base font-semibold text-slate-900 mb-1 line-clamp-2">
                  {task.title}
                </h3>

                <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                  {task.purpose}
                </p>

                <div className="flex items-center flex-wrap gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    {task.operationalStatus}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                    {task.executionMethod}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-400">
                    Creada: {new Date(task.createdAt).toLocaleDateString('es-ES')}
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
