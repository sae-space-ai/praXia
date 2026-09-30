/**
 * PRAXIA — UI Page: Task Detail
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Task, TaskReadinessResult } from '../../domain/task/types';
import { getTaskById } from '../../persistence/taskStore';
import { evaluateTaskReadinessService } from '../../domain/task/taskService';
import {
  getTaskCapabilityRequirementsByTaskId,
  getDataRequirementsByTaskId,
  getTaskDependenciesBySuccessorId,
  getHumanGatesByEntity,
  getCapabilityById,
} from '../../persistence/order4Stores';

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [readiness, setReadiness] = useState<TaskReadinessResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const t = getTaskById(id);
    setTask(t);
    if (t) {
      const readinessResult = evaluateTaskReadinessService(id);
      setReadiness(readinessResult);
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center">Cargando...</div>;
  }

  if (!task) {
    return (
      <div className="p-8 text-center py-16">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Task no encontrada</h3>
        <Link to="/tasks" className="text-sm text-indigo-600 hover:text-indigo-700">
          ← Volver al listado
        </Link>
      </div>
    );
  }

  const capReqs = getTaskCapabilityRequirementsByTaskId(task.id);
  const dataReqs = getDataRequirementsByTaskId(task.id);
  const dependencies = getTaskDependenciesBySuccessorId(task.id);
  const humanGates = getHumanGatesByEntity('TASK', task.id);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Back link */}
      <button
        onClick={() => navigate('/tasks')}
        className="text-sm text-slate-500 hover:text-slate-700 mb-6 inline-flex items-center gap-1"
      >
        ← Volver al listado
      </button>

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
              {task.taskType}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              {task.operationalStatus}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
              {task.verificationStatus}
            </span>
          </div>
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-3">{task.title}</h2>
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-4">
          {task.description}
        </p>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Propósito</p>
            <p className="text-sm text-slate-700">{task.purpose || 'No definido'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Output Esperado</p>
            <p className="text-sm text-slate-700">{task.expectedOutput || 'No definido'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Método de Ejecución</p>
            <p className="text-sm text-slate-700">{task.executionMethod}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Prioridad</p>
            <p className="text-sm text-slate-700">{task.priority}</p>
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

      {/* Capabilities */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Capacidades Requeridas</h3>
        {capReqs.length > 0 ? (
          <ul className="space-y-2">
            {capReqs.map((req) => {
              const cap = getCapabilityById(req.capabilityId);
              return (
                <li key={req.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {cap ? cap.name : req.capabilityId}
                    </p>
                    <p className="text-xs text-slate-500">
                      Nivel: {req.requirementLevel} {req.isMandatory && '(Obligatorio)'}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-slate-400 italic">No hay capacidades definidas</p>
        )}
      </div>

      {/* Data Requirements */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Data Requirements</h3>
        {dataReqs.length > 0 ? (
          <ul className="space-y-2">
            {dataReqs.map((req) => (
              <li key={req.id} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{req.name}</p>
                    <p className="text-xs text-slate-500">{req.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{req.availabilityStatus}</span>
                    {req.blockingIfMissing && (
                      <span className="text-xs text-red-600 font-medium">BLOCKING</span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400 italic">No hay data requirements definidos</p>
        )}
      </div>

      {/* Dependencies */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Dependencias</h3>
        {dependencies.length > 0 ? (
          <ul className="space-y-2">
            {dependencies.map((dep) => {
              const predTask = getTaskById(dep.predecessorTaskId);
              return (
                <li key={dep.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <Link
                    to={`/tasks/${dep.predecessorTaskId}`}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    {predTask ? predTask.title : dep.predecessorTaskId}
                  </Link>
                  <span className="text-xs text-slate-500">{dep.dependencyType}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-slate-400 italic">No hay dependencias</p>
        )}
      </div>

      {/* Human Gates */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Human Gates</h3>
        {humanGates.length > 0 ? (
          <ul className="space-y-2">
            {humanGates.map((gate) => (
              <li key={gate.id} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{gate.gateType}</p>
                    <p className="text-xs text-slate-500">{gate.reason}</p>
                  </div>
                  <span className={`text-xs font-medium ${
                    gate.status === 'APPROVED' ? 'text-green-600' :
                    gate.status === 'REJECTED' ? 'text-red-600' :
                    'text-amber-600'
                  }`}>
                    {gate.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400 italic">No hay human gates</p>
        )}
      </div>

      {/* Success Criteria */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Criterios de Éxito</h3>
        {task.successCriteria.length > 0 ? (
          <ul className="space-y-2">
            {task.successCriteria.map((criterion) => (
              <li key={criterion.id} className="p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-700">{criterion.description}</p>
                <p className="text-xs text-slate-500 mt-1">{criterion.measurementStatus}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400 italic">No hay criterios de éxito definidos</p>
        )}
      </div>

      {/* Constraints & Assumptions */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Restricciones y Suposiciones</h3>
        
        <div className="mb-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Restricciones</p>
          {task.constraints.length > 0 ? (
            <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
              {task.constraints.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400 italic">No hay restricciones</p>
          )}
        </div>

        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Suposiciones</p>
          {task.assumptions.length > 0 ? (
            <ul className="space-y-2">
              {task.assumptions.map((a) => (
                <li key={a.id} className="p-2 bg-amber-50 rounded text-sm">
                  <p className="text-slate-700">{a.statement}</p>
                  <p className="text-xs text-amber-700 mt-1">Estado: {a.status}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400 italic">No hay suposiciones</p>
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="flex items-center gap-6 text-xs text-slate-500">
          <p>Creada: {new Date(task.createdAt).toLocaleString('es-ES')}</p>
          <p>Actualizada: {new Date(task.updatedAt).toLocaleString('es-ES')}</p>
        </div>
      </div>
    </div>
  );
}
