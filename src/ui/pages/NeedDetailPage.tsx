/**
 * PRAXIA — UI Page: Need Detail
 * 
 * Shows full detail of a single NEED.
 * Clearly indicates verification state.
 * Does NOT show fake metrics, savings, or AI confidence.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Need, NeedStatus } from '../../domain/need/types';
import type { NeedObjectiveRelation } from '../../domain/objective/relations';
import { getNeedService, deleteNeedService, updateNeedStatusService } from '../../domain/need/needService';
import { getFamilyById } from '../../domain/need/families';
import { getNeedTypeLabel } from '../../domain/need/needTypes';
import { getVerificationLabel, getVerificationColor } from '../../domain/need/verification';
import { getRelationsByNeedService } from '../../domain/objective/objectiveService';
import { getObjectiveService } from '../../domain/objective/objectiveService';
import { STATUS_LABELS, getStatusLabel, getPriorityLabel } from '../constants';

export default function NeedDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [need, setNeed] = useState<Need | null>(null);
  const [relatedObjectives, setRelatedObjectives] = useState<NeedObjectiveRelation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const found = getNeedService(id);
    setNeed(found);
    if (found) {
      setRelatedObjectives(getRelationsByNeedService(id));
    }
    setLoading(false);
  }, [id]);

  const getObjectiveTitle = (objectiveId: string): string => {
    const obj = getObjectiveService(objectiveId);
    return obj ? obj.title : `${objectiveId.substring(0, 8)}…`;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">Cargando...</p>
      </div>
    );
  }

  if (!need) {
    return (
      <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Necesidad no encontrada</h3>
        <p className="text-sm text-slate-500 mb-4">
          La necesidad solicitada no existe o ha sido eliminada.
        </p>
        <Link to="/" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          ← Volver al listado
        </Link>
      </div>
    );
  }

  const family = getFamilyById(need.domain);
  const typeLabel = getNeedTypeLabel(need.type);
  const verificationLabel = getVerificationLabel(need.overallVerification);
  const verificationColor = getVerificationColor(need.overallVerification);
  const statusLabel = getStatusLabel(need.status);
  const priorityLabel = getPriorityLabel(need.priority);

  const handleDelete = () => {
    if (window.confirm('¿Está seguro de que desea eliminar esta necesidad? Esta acción no se puede deshacer.')) {
      deleteNeedService(need.id);
      navigate('/');
    }
  };

  const handleStatusChange = (newStatus: string) => {
    const updated = updateNeedStatusService(need.id, newStatus as NeedStatus);
    if (updated) {
      setNeed(updated);
    }
  };

  /**
   * Get a short display label for a related need.
   * If the related need exists in storage, show its title.
   * Otherwise show the ID (truncated) as a fallback.
   */
  const getRelatedNeedLabel = (relatedId: string): string => {
    const related = getNeedService(relatedId);
    if (related) {
      return related.title;
    }
    // Fallback: truncated ID (NOT fake data, just the identifier)
    return `${relatedId.substring(0, 8)}…`;
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back link */}
      <button
        onClick={() => navigate('/')}
        className="text-sm text-slate-500 hover:text-slate-700 mb-6 inline-flex items-center gap-1 transition-colors"
      >
        ← Volver al listado
      </button>

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
              {typeLabel}
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

        <h2 className="text-xl font-bold text-slate-900 mb-3">{need.title}</h2>
        
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-6">
          {need.description}
        </p>

        {/* Meta grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Familia</p>
            <p className="text-sm font-medium text-slate-900">
              {family ? family.code : 'Desconocida'}
            </p>
            {family && (
              <p className="text-xs text-slate-500">{family.name}</p>
            )}
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Estado</p>
            <p className="text-sm font-medium text-slate-900">{statusLabel}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Prioridad</p>
            <p className="text-sm font-medium text-slate-900">{priorityLabel}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Verificación</p>
            <p className={`text-sm font-medium ${verificationColor}`}>{verificationLabel}</p>
          </div>
        </div>

        {/* Dates */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-6">
          <p className="text-xs text-slate-400">
            Creada: {new Date(need.createdAt).toLocaleString('es-ES')}
          </p>
          <p className="text-xs text-slate-400">
            Actualizada: {new Date(need.updatedAt).toLocaleString('es-ES')}
          </p>
        </div>
      </div>

      {/* Actions: Create Objective from this NEED */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Transformar en Objetivo</h3>
        <p className="text-xs text-slate-500 mb-3">
          Genere una propuesta de objetivo desde esta necesidad. La propuesta no se guardará
          automáticamente: deberá revisarla y confirmarla manualmente.
        </p>
        <Link
          to={`/objectives/new?fromNeed=${need.id}`}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Crear objetivo desde esta NEED →
        </Link>
      </div>

      {/* Status Management */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Gestión de Estado</h3>
        <div className="flex items-center gap-2 flex-wrap">
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <button
              key={value}
              onClick={() => handleStatusChange(value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                need.status === value
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Extensible Fields */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Información Adicional</h3>
        
        <div className="space-y-4">
          {/* Symptoms */}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Síntomas</p>
            {need.symptoms.length > 0 ? (
              <ul className="space-y-1">
                {need.symptoms.map((s) => (
                  <li key={s.id} className="text-sm text-slate-700">• {s.description}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 italic">No registrado — NOT_ASSESSED</p>
            )}
          </div>

          {/* Evidence */}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Evidencia</p>
            {need.evidence.length > 0 ? (
              <ul className="space-y-1">
                {need.evidence.map((e) => (
                  <li key={e.id} className="text-sm text-slate-700">• {e.description}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 italic">No registrado — UNKNOWN</p>
            )}
          </div>

          {/* Affected Areas */}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Áreas afectadas</p>
            {need.affectedAreas.length > 0 ? (
              <ul className="space-y-1">
                {need.affectedAreas.map((a) => (
                  <li key={a.id} className="text-sm text-slate-700">• {a.name}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 italic">No registrado — NOT_ASSESSED</p>
            )}
          </div>

          {/* Constraints */}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Restricciones</p>
            {need.constraints.length > 0 ? (
              <ul className="space-y-1">
                {need.constraints.map((c, i) => (
                  <li key={i} className="text-sm text-slate-700">• {c}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 italic">No registrado — NOT_ASSESSED</p>
            )}
          </div>

          {/* Owner */}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Responsable</p>
            <p className="text-sm text-slate-400 italic">
              {need.owner ?? 'No asignado — UNKNOWN'}
            </p>
          </div>

          {/* Source */}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Fuente</p>
            <p className="text-sm text-slate-400 italic">
              {need.source ?? 'No registrada — UNKNOWN'}
            </p>
          </div>

          {/* Related Needs */}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Necesidades relacionadas</p>
            {need.relatedNeedIds.length > 0 ? (
              <ul className="space-y-1">
                {need.relatedNeedIds.map((rid) => (
                  <li key={rid} className="text-sm text-slate-700">
                    <Link to={`/needs/${rid}`} className="text-indigo-600 hover:text-indigo-700">
                      → {getRelatedNeedLabel(rid)}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 italic">No hay relaciones registradas</p>
            )}
          </div>

          {/* Objectives — using NeedObjectiveRelation as SOURCE OF TRUTH */}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Objetivos asociados (SOURCE OF TRUTH)</p>
            {relatedObjectives.length > 0 ? (
              <ul className="space-y-1">
                {relatedObjectives.map((rel) => (
                  <li key={rel.id} className="text-sm text-slate-700">
                    <Link to={`/objectives/${rel.objectiveId}`} className="text-indigo-600 hover:text-indigo-700">
                      → {getObjectiveTitle(rel.objectiveId)}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 italic">No hay objetivos asociados todavía</p>
            )}
          </div>
        </div>
      </div>

      {/* Verification Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-xs text-slate-500">
          <strong>Estado de verificación:</strong> Esta necesidad tiene verificación &ldquo;{verificationLabel}&rdquo;.
          Ningún dato se considerará verificado hasta que exista evidencia suficiente.
          PRAXIA nunca convierte automáticamente una hipótesis en hecho.
        </p>
      </div>
    </div>
  );
}
