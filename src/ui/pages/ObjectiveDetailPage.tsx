/**
 * PRAXIA — UI Page: Objective Detail
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Objective, OperationalStatus } from '../../domain/objective/types';
import type { NeedObjectiveRelation } from '../../domain/objective/relations';
import {
  getObjectiveService,
  deleteObjectiveService,
  updateOperationalStatusService,
  getRelationsByObjectiveService,
  deleteRelationService,
} from '../../domain/objective/objectiveService';
import { getObjectiveClassLabel, getOperationalStatusLabel, getBaselineStateLabel, getTargetStateLabel } from '../../domain/objective/catalogs';
import { getVerificationLabel, getVerificationColor } from '../../domain/need/verification';
import { getNeedService } from '../../domain/need/needService';
import { OPERATIONAL_STATUSES } from '../../domain/objective/catalogs';

export default function ObjectiveDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [objective, setObjective] = useState<Objective | null>(null);
  const [relations, setRelations] = useState<NeedObjectiveRelation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const found = getObjectiveService(id);
    setObjective(found);
    if (found) {
      setRelations(getRelationsByObjectiveService(id));
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">Cargando...</p>
      </div>
    );
  }

  if (!objective) {
    return (
      <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Objetivo no encontrado</h3>
        <p className="text-sm text-slate-500 mb-4">
          El objetivo solicitado no existe o ha sido eliminado.
        </p>
        <Link to="/objectives" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          ← Volver al listado
        </Link>
      </div>
    );
  }

  const classLabel = getObjectiveClassLabel(objective.objectiveClass);
  const operationalLabel = getOperationalStatusLabel(objective.operationalStatus);
  const verificationLabel = getVerificationLabel(objective.verificationStatus);
  const verificationColor = getVerificationColor(objective.verificationStatus);
  const baselineLabel = getBaselineStateLabel(objective.baseline.state);
  const targetLabel = getTargetStateLabel(objective.target.state);

  const handleDelete = () => {
    if (window.confirm('¿Está seguro de que desea eliminar este objetivo? Esta acción no se puede deshacer.')) {
      deleteObjectiveService(objective.id);
      navigate('/objectives');
    }
  };

  const handleStatusChange = (newStatus: string) => {
    const updated = updateOperationalStatusService(objective.id, newStatus as OperationalStatus);
    if (updated) {
      setObjective(updated);
    }
  };

  const handleDeleteRelation = (relationId: string) => {
    if (window.confirm('¿Eliminar esta relación? El objetivo y la necesidad no se eliminarán.')) {
      deleteRelationService(relationId);
      setRelations(getRelationsByObjectiveService(objective.id));
    }
  };

  const getNeedTitle = (needId: string): string => {
    const need = getNeedService(needId);
    return need ? need.title : `${needId.substring(0, 8)}…`;
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back link */}
      <button
        onClick={() => navigate('/objectives')}
        className="text-sm text-slate-500 hover:text-slate-700 mb-6 inline-flex items-center gap-1 transition-colors"
      >
        ← Volver al listado
      </button>

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
              {classLabel}
            </span>
            <span className={`text-xs font-semibold ${verificationColor}`}>
              {verificationLabel}
            </span>
          </div>
          <button
            onClick={handleDelete}
            className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
          >
            Eliminar
          </button>
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-3">{objective.title}</h2>
        
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-6">
          {objective.description}
        </p>

        {/* Meta grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Clase</p>
            <p className="text-sm font-medium text-slate-900">{classLabel}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Estado operativo</p>
            <p className="text-sm font-medium text-slate-900">{operationalLabel}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Baseline</p>
            <p className="text-sm font-medium text-slate-900">{baselineLabel}</p>
            {objective.baseline.state === 'KNOWN' && objective.baseline.value !== null && (
              <p className="text-xs text-slate-500">
                {objective.baseline.value} {objective.baseline.unit ?? ''}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Target</p>
            <p className="text-sm font-medium text-slate-900">{targetLabel}</p>
            {objective.target.state === 'DEFINED' && objective.target.value !== null && (
              <p className="text-xs text-slate-500">
                {objective.target.value} {objective.target.unit ?? ''}
              </p>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-6">
          <p className="text-xs text-slate-400">
            Creado: {new Date(objective.createdAt).toLocaleString('es-ES')}
          </p>
          <p className="text-xs text-slate-400">
            Actualizado: {new Date(objective.updatedAt).toLocaleString('es-ES')}
          </p>
        </div>
      </div>

      {/* Operational Status Management */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Estado Operativo</h3>
        <div className="flex items-center gap-2 flex-wrap">
          {OPERATIONAL_STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => handleStatusChange(s.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                objective.operationalStatus === s.value
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Related NEEDs */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">NEEDs Relacionadas</h3>
        {relations.length > 0 ? (
          <ul className="space-y-2">
            {relations.map((rel) => (
              <li key={rel.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <Link
                  to={`/needs/${rel.needId}`}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  {getNeedTitle(rel.needId)}
                </Link>
                <button
                  onClick={() => handleDeleteRelation(rel.id)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Eliminar relación
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400 italic">
            No hay NEEDs relacionadas. Puede crear una relación desde el detalle de una NEED.
          </p>
        )}
      </div>

      {/* Verification Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-xs text-slate-500">
          <strong>Estado de verificación:</strong> Este objetivo tiene verificación &ldquo;{verificationLabel}&rdquo;.
          Ningún dato se considerará verificado hasta que exista evidencia suficiente.
        </p>
      </div>
    </div>
  );
}
