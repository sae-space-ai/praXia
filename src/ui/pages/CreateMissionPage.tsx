/**
 * PRAXIA — UI Page: Create Mission
 */

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { CreateMissionInput, ProposedMission } from '../../domain/mission/types';
import { createMissionService, resolveOrganizationId } from '../../domain/mission/missionService';
import { getObjectiveService } from '../../domain/objective/objectiveService';
import { proposeMissionFromObjective } from '../../domain/mission/proposal';
import MissionForm from '../components/MissionForm';

export default function CreateMissionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [proposal, setProposal] = useState<ProposedMission | null>(null);

  const fromObjectiveId = searchParams.get('fromObjective');

  // If coming from an OBJECTIVE, generate a proposal
  if (fromObjectiveId && !proposal) {
    const objective = getObjectiveService(fromObjectiveId);
    if (objective) {
      const proposed = proposeMissionFromObjective(objective);
      setProposal(proposed);
    }
  }

  const handleSubmit = (input: CreateMissionInput) => {
    setIsSubmitting(true);
    setErrors([]);

    const orgId = resolveOrganizationId();
    const fullInput: CreateMissionInput = {
      ...input,
      organizationId: orgId,
    };

    const result = createMissionService(fullInput);

    if (result.success && result.mission) {
      navigate(`/missions/${result.mission.id}`);
    } else {
      setErrors(result.errors ?? ['Error desconocido al crear la misión.']);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (fromObjectiveId) {
      navigate(`/objectives/${fromObjectiveId}`);
    } else {
      navigate('/missions');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back link */}
      <button
        onClick={handleCancel}
        className="text-sm text-slate-500 hover:text-slate-700 mb-4 inline-flex items-center gap-1 transition-colors"
      >
        ← Volver
      </button>

      <h2 className="text-2xl font-bold text-slate-900 mb-1">
        {proposal ? 'Revisar Propuesta de Misión' : 'Crear Misión'}
      </h2>
      <p className="mt-1 text-sm text-slate-500 mb-6">
        {proposal
          ? 'Revise y ajuste la propuesta generada desde el objetivo. Puede modificar cualquier campo antes de guardar.'
          : 'Cree una nueva misión empresarial.'}
      </p>

      {/* Proposal info */}
      {proposal && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900 mb-2">
            Propuesta generada desde OBJECTIVE: {proposal.sourceObjectiveId.substring(0, 8)}…
          </p>
          {proposal.missingInformation.length > 0 && (
            <div>
              <p className="text-xs font-medium text-blue-800 mb-1">
                Información faltante que debe completarse:
              </p>
              <ul className="list-disc list-inside text-xs text-blue-700 space-y-0.5">
                {proposal.missingInformation.map((info, i) => (
                  <li key={i}>{info}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-medium text-red-800 mb-1">Errores de validación:</p>
          <ul className="list-disc list-inside text-sm text-red-700">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Form */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <MissionForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          initialData={proposal?.input ?? null}
        />
      </div>
    </div>
  );
}
