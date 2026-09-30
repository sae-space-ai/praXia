/**
 * PRAXIA — UI Page: Create Need
 * 
 * Form to register a new NEED.
 * No pre-filled fake data.
 */

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { CreateNeedInput } from '../../domain/need/types';
import { createNeedService, resolveOrganizationId } from '../../domain/need/needService';
import NeedForm from '../components/NeedForm';

export default function CreateNeedPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const mode = searchParams.get('mode');

  const getModeDescription = () => {
    switch (mode) {
      case 'known':
        return 'Registrar un problema o necesidad ya identificado.';
      case 'symptoms':
        return 'Registrar síntomas observados. La causa se determinará durante el diagnóstico.';
      case 'discovery':
        return 'Indicar que la organización quiere descubrir problemas u oportunidades.';
      default:
        return 'Registrar un nuevo problema, necesidad u oportunidad de la organización.';
    }
  };

  const handleSubmit = (input: CreateNeedInput) => {
    setIsSubmitting(true);
    setErrors([]);

    // Resolve organization ID through service layer
    const orgId = resolveOrganizationId();
    const fullInput: CreateNeedInput = {
      ...input,
      organizationId: orgId,
    };

    const result = createNeedService(fullInput);

    if (result.success && result.need) {
      navigate(`/needs/${result.need.id}`);
    } else {
      setErrors(result.errors ?? ['Error desconocido al crear la necesidad.']);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="text-sm text-slate-500 hover:text-slate-700 mb-4 inline-flex items-center gap-1 transition-colors"
        >
          ← Volver al listado
        </button>
        <h2 className="text-2xl font-bold text-slate-900">Registrar Necesidad</h2>
        <p className="mt-1 text-sm text-slate-500">
          {getModeDescription()}
        </p>
      </div>

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
        <NeedForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
