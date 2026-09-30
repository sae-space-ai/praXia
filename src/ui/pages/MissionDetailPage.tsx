/**
 * PRAXIA — UI Page: Mission Detail
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Mission, MissionOperationalStatus } from '../../domain/mission/types';
import type { ObjectiveMissionRelation } from '../../domain/mission/relations';
import {
  getMissionService,
  deleteMissionService,
  updateMissionOperationalStatusService,
  getObjectivesForMissionService,
  deleteObjectiveMissionRelationService,
} from '../../domain/mission/missionService';
import {
  getMissionTypeLabel,
  getMissionOperationalStatusLabel,
  getAssumptionStatusLabel,
  getDependencyStatusLabel,
  getMeasurementStatusLabel,
  getExpectedOutcomeStateLabel,
  MISSION_OPERATIONAL_STATUSES,
} from '../../domain/mission/catalogs';
import { getVerificationLabel, getVerificationColor } from '../../domain/need/verification';
import { getTimeHorizonLabel } from '../../domain/objective/catalogs';
import { getObjectiveService } from '../../domain/objective/objectiveService';

export default function MissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [mission, setMission] = useState<Mission | null>(null);
  const [relations, setRelations] = useState<ObjectiveMissionRelation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const found = getMissionService(id);
    setMission(found);
    if (found) {
      setRelations(getObjectivesForMissionService(id));
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

  if (!mission) {
    return (
      <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Misión no encontrada</h3>
        <p className="text-sm text-slate-500 mb-4">
          La misión solicitada no existe o ha sido eliminada.
        </p>
        <Link to="/missions" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
          ← Volver al listado
        </Link>
      </div>
    );
  }

  const typeLabel = getMissionTypeLabel(mission.missionType);
  const operationalLabel = getMissionOperationalStatusLabel(mission.operationalStatus);
  const verificationLabel = getVerificationLabel(mission.verificationStatus);
  const verificationColor = getVerificationColor(mission.verificationStatus);
  const timeHorizonLabel = getTimeHorizonLabel(mission.timeHorizon);
  const outcomeStateLabel = getExpectedOutcomeStateLabel(mission.expectedOutcome.state);

  const handleDelete = () => {
    if (window.confirm('¿Está seguro de que desea eliminar esta misión? Esta acción no se puede deshacer.')) {
      deleteMissionService(mission.id);
      navigate('/missions');
    }
  };

  const handleStatusChange = (newStatus: string) => {
    const updated = updateMissionOperationalStatusService(
      mission.id,
      newStatus as MissionOperationalStatus
    );
    if (updated) {
      setMission(updated);
    }
  };

  const handleDeleteRelation = (relationId: string) => {
    if (window.confirm('¿Eliminar esta relación? El objetivo y la misión no se eliminarán.')) {
      deleteObjectiveMissionRelationService(relationId);
      setRelations(getObjectivesForMissionService(mission.id));
    }
  };

  const getObjectiveTitle = (objectiveId: string): string => {
    const obj = getObjectiveService(objectiveId);
    return obj ? obj.title : `${objectiveId.substring(0, 8)}…`;
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back link */}
      <button
        onClick={() => navigate('/missions')}
        className="text-sm text-slate-500 hover:text-slate-700 mb-6 inline-flex items-center gap-1 transition-colors"
      >
        ← Volver al listado
      </button>

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
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

        <h2 className="text-xl font-bold text-slate-900 mb-3">{mission.title}</h2>

        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-6">
          {mission.description}
        </p>

        {/* Meta grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Tipo</p>
            <p className="text-sm font-medium text-slate-900">{typeLabel}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Estado operativo</p>
            <p className="text-sm font-medium text-slate-900">{operationalLabel}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Horizonte</p>
            <p className="text-sm font-medium text-slate-900">{timeHorizonLabel}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Resultado esperado</p>
            <p className="text-sm font-medium text-slate-900">{outcomeStateLabel}</p>
          </div>
        </div>

        {/* Dates */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-6">
          <p className="text-xs text-slate-400">
            Creada: {new Date(mission.createdAt).toLocaleString('es-ES')}
          </p>
          <p className="text-xs text-slate-400">
            Actualizada: {new Date(mission.updatedAt).toLocaleString('es-ES')}
          </p>
        </div>
      </div>

      {/* Operational Status Management */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Estado Operativo</h3>
        <div className="flex items-center gap-2 flex-wrap">
          {MISSION_OPERATIONAL_STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => handleStatusChange(s.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                mission.operationalStatus === s.value
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          <strong>Nota:</strong> COMPLETED no implica VERIFIED. La verificación requiere evidencia.
        </p>
      </div>

      {/* Scope */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Alcance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Incluido</p>
            {mission.scope.included.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-slate-700 space-y-0.5">
                {mission.scope.included.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 italic">No definido</p>
            )}
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Excluido</p>
            {mission.scope.excluded.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-slate-700 space-y-0.5">
                {mission.scope.excluded.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 italic">No definido</p>
            )}
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Notas</p>
            {mission.scope.notes.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-slate-700 space-y-0.5">
                {mission.scope.notes.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 italic">No definido</p>
            )}
          </div>
        </div>
      </div>

      {/* Expected Outcome */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Resultado Esperado</h3>
        <p className="text-xs text-slate-500 mb-2">
          Esto representa lo que se ESPERA obtener, NO lo que se ha conseguido.
        </p>
        {mission.expectedOutcome.description ? (
          <p className="text-sm text-slate-700">{mission.expectedOutcome.description}</p>
        ) : (
          <p className="text-sm text-slate-400 italic">No definido</p>
        )}
      </div>

      {/* Constraints */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Restricciones</h3>
        {mission.constraints.length > 0 ? (
          <ul className="list-disc list-inside text-sm text-slate-700 space-y-0.5">
            {mission.constraints.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400 italic">No hay restricciones registradas</p>
        )}
      </div>

      {/* Assumptions */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Suposiciones</h3>
        <p className="text-xs text-slate-500 mb-2">
          Las suposiciones NO son hechos. Deben probarse explícitamente.
        </p>
        {mission.assumptions.length > 0 ? (
          <ul className="space-y-1">
            {mission.assumptions.map((a) => (
              <li key={a.id} className="flex items-start gap-2 text-sm">
                <span className="text-slate-700 flex-1">{a.statement || '(sin enunciado)'}</span>
                <span className="text-xs text-slate-500">{getAssumptionStatusLabel(a.status)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400 italic">No hay suposiciones registradas</p>
        )}
      </div>

      {/* Dependencies */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Dependencias</h3>
        {mission.dependencies.length > 0 ? (
          <ul className="space-y-1">
            {mission.dependencies.map((d) => (
              <li key={d.id} className="flex items-start gap-2 text-sm">
                <span className="text-slate-700 flex-1">{d.description || '(sin descripción)'}</span>
                <span className="text-xs text-slate-500">{getDependencyStatusLabel(d.status)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400 italic">No hay dependencias registradas</p>
        )}
      </div>

      {/* Success Criteria */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Criterios de Éxito</h3>
        {mission.successCriteria.length > 0 ? (
          <ul className="space-y-1">
            {mission.successCriteria.map((c) => (
              <li key={c.id} className="flex items-start gap-2 text-sm">
                <span className="text-slate-700 flex-1">{c.description || '(sin descripción)'}</span>
                <span className="text-xs text-slate-500">
                  {getMeasurementStatusLabel(c.measurementStatus)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400 italic">No hay criterios de éxito registrados</p>
        )}
      </div>

      {/* Related OBJECTIVEs */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Objetivos Relacionados</h3>
        {relations.length > 0 ? (
          <ul className="space-y-2">
            {relations.map((rel) => (
              <li key={rel.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <Link
                  to={`/objectives/${rel.objectiveId}`}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  {getObjectiveTitle(rel.objectiveId)}
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
            No hay objetivos relacionados.
          </p>
        )}
      </div>

      {/* Evaluation */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Evaluación</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Progreso</p>
            <p className="text-sm text-slate-500 italic">NOT_MEASURED</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Criterios</p>
            <p className="text-sm text-slate-500 italic">NOT_MEASURED</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Contribución</p>
            <p className="text-sm text-slate-500 italic">NOT_MEASURED</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          La evaluación no se calcula automáticamente. Requiere medición explícita.
        </p>
      </div>

      {/* Verification Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-xs text-slate-500">
          <strong>Estado de verificación:</strong> Esta misión tiene verificación &ldquo;{verificationLabel}&rdquo;.
          Ningún dato se considerará verificado hasta que exista evidencia suficiente.
          COMPLETED no implica VERIFIED.
        </p>
      </div>
    </div>
  );
}
