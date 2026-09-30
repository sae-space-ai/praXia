/**
 * PRAXIA — UI Page: Create Objective
 */

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { CreateObjectiveInput, ProposedObjective } from '../../domain/objective/types';
import { createObjectiveService } from '../../domain/objective/objectiveService';
import { resolveOrganizationId } from '../../domain/need/needService';
import { getNeedService } from '../../domain/need/needService';
import { proposeObjectiveFromNeed } from '../../domain/objective/proposal';
import ObjectiveForm from '../components/ObjectiveForm';

export default function CreateObjectivePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [proposal, setProposal] = useState<ProposedObjective | null>(null);

  const fromNeedId = searchParams.get('fromNeed');

  // If coming from a NEED, generate a proposal
  if (fromNeedId && !proposal) {
    const need = getNeedService(fromNeedId);
    if (need) {
      const proposed = proposeObjectiveFromNeed(need);
      setProposal(proposed);
    }
  }

  const handleSubmit = (input: CreateObjectiveInput) => {
    setIsSubmitting(true);
    setErrors([]);

    const orgId = resolveOrganizationId();
    const fullInput: CreateObjectiveInput = {
      ...input,
      organizationId: orgId,
    };

    const result = createObjectiveService(fullInput);

    if (result.success && result.objective) {
      navigate(`/objectives/${result.objective.id}`);
    } else {
      setErrors(result.errors ?? ['Error desconocido al crear el objetivo.']);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (fromNeedId) {
      navigate(`/needs/${fromNeedId}`);
    } else {
      navigate('/objectives');
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
        {proposal ? 'Revisar Propuesta de Objetivo' : 'Crear Objetivo'}
      </h2>
      <p className="mt-1 text-sm text-slate-500 mb-6">
        {proposal
          ? 'Revise y ajuste la propuesta generada desde la NEED. Puede modificar cualquier campo antes de guardar.'
          : 'Cree un nuevo objetivo empresarial.'}
      </p>

      {/* Proposal info */}
      {proposal && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900 mb-2">
            Propuesta generada desde NEED: {proposal.sourceNeedId.substring(0, 8)}…
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
        <ObjectiveForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          initialData={
            proposal
              ? {
                  id: '',
                  organizationId: proposal.input.organizationId,
                  title: proposal.input.title,
                  description: proposal.input.description,
                  objectiveClass: proposal.input.objectiveClass,
                  parentObjectiveId: proposal.input.parentObjectiveId ?? null,
                  baseline: {
                    state: proposal.input.baseline?.state ?? 'UNKNOWN',
                    value: proposal.input.baseline?.value ?? null,
                    unit: proposal.input.baseline?.unit ?? null,
                    referenceDate: proposal.input.baseline?.referenceDate ?? null,
                  },
                  target: {
                    state: proposal.input.target?.state ?? 'UNDEFINED',
                    value: proposal.input.target?.value ?? null,
                    unit: proposal.input.target?.unit ?? null,
                    deadline: proposal.input.target?.deadline ?? null,
                  },
                  kpis: [],
                  timeHorizon: proposal.input.timeHorizon ?? 'UNDEFINED',
                  constraints: [],
                  verificationStatus: 'UNKNOWN',
                  operationalStatus: 'DRAFT',
                  evaluation: {
                    executionProgress: 'NOT_MEASURED',
                    evidenceCoverage: 'NOT_MEASURED',
                    objectiveAttainment: 'NOT_MEASURED',
                  },
                  createdAt: proposal.createdAt,
                  updatedAt: proposal.createdAt,
                  missionIds: [],
                  taskIds: [],
                  evidenceIds: [],
                  decisionIds: [],
                  resultIds: [],
                }
              : null
          }
        />
      </div>
    </div>
  );
}
