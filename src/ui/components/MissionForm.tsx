/**
 * PRAXIA — UI: MissionForm
 *
 * Form for creating/editing a MISSION.
 * No fake data. No pre-filled values from thin air.
 */

import { useState, FormEvent } from 'react';
import type {
  CreateMissionInput,
  MissionType,
  MissionScope,
  ExpectedOutcomeState,
  Assumption,
  AssumptionStatus,
  Dependency,
  DependencyStatus,
  SuccessCriterion,
  MeasurementStatus,
} from '../../domain/mission/types';
import type { TimeHorizon } from '../../domain/objective/types';
import {
  MISSION_TYPES,
  ASSUMPTION_STATUSES,
  DEPENDENCY_STATUSES,
  MEASUREMENT_STATUSES,
  EXPECTED_OUTCOME_STATES,
} from '../../domain/mission/catalogs';
import { TIME_HORIZONS } from '../../domain/objective/catalogs';
import { v4 as uuidv4 } from 'uuid';

interface MissionFormProps {
  onSubmit: (input: CreateMissionInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  initialData?: Partial<CreateMissionInput> | null;
}

export default function MissionForm({
  onSubmit,
  onCancel,
  isSubmitting,
  initialData,
}: MissionFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [missionType, setMissionType] = useState<MissionType>(
    initialData?.missionType ?? 'ANALYSIS'
  );
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>(
    initialData?.timeHorizon ?? 'UNDEFINED'
  );

  // Scope
  const [scopeIncluded, setScopeIncluded] = useState<string>(
    initialData?.scope?.included?.join('\n') ?? ''
  );
  const [scopeExcluded, setScopeExcluded] = useState<string>(
    initialData?.scope?.excluded?.join('\n') ?? ''
  );
  const [scopeNotes, setScopeNotes] = useState<string>(
    initialData?.scope?.notes?.join('\n') ?? ''
  );

  // Expected outcome
  const [outcomeDescription, setOutcomeDescription] = useState<string>(
    initialData?.expectedOutcome?.description ?? ''
  );
  const [outcomeState, setOutcomeState] = useState<ExpectedOutcomeState>(
    initialData?.expectedOutcome?.state ?? 'UNDEFINED'
  );

  // Constraints
  const [constraintsText, setConstraintsText] = useState<string>(
    initialData?.constraints?.join('\n') ?? ''
  );

  // Assumptions
  const [assumptions, setAssumptions] = useState<Assumption[]>(
    initialData?.assumptions ?? []
  );

  // Dependencies
  const [dependencies, setDependencies] = useState<Dependency[]>(
    initialData?.dependencies ?? []
  );

  // Success criteria
  const [successCriteria, setSuccessCriteria] = useState<SuccessCriterion[]>(
    initialData?.successCriteria ?? []
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const scope: MissionScope = {
      included: scopeIncluded
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      excluded: scopeExcluded
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      notes: scopeNotes
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    const constraints = constraintsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const input: CreateMissionInput = {
      organizationId: '', // Will be resolved by the page
      title: title.trim(),
      description: description.trim(),
      missionType,
      scope,
      expectedOutcome: {
        description: outcomeDescription || null,
        state: outcomeState,
      },
      timeHorizon,
      constraints,
      assumptions,
      dependencies,
      successCriteria,
    };

    onSubmit(input);
  };

  const addAssumption = () => {
    setAssumptions([
      ...assumptions,
      { id: uuidv4(), statement: '', status: 'UNTESTED' },
    ]);
  };

  const updateAssumption = (id: string, field: keyof Assumption, value: string) => {
    setAssumptions(
      assumptions.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const removeAssumption = (id: string) => {
    setAssumptions(assumptions.filter((a) => a.id !== id));
  };

  const addDependency = () => {
    setDependencies([
      ...dependencies,
      { id: uuidv4(), description: '', status: 'UNKNOWN' },
    ]);
  };

  const updateDependency = (id: string, field: keyof Dependency, value: string) => {
    setDependencies(
      dependencies.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  const removeDependency = (id: string) => {
    setDependencies(dependencies.filter((d) => d.id !== id));
  };

  const addSuccessCriterion = () => {
    setSuccessCriteria([
      ...successCriteria,
      { id: uuidv4(), description: '', measurementStatus: 'NOT_MEASURED' },
    ]);
  };

  const updateSuccessCriterion = (
    id: string,
    field: keyof SuccessCriterion,
    value: string
  ) => {
    setSuccessCriteria(
      successCriteria.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const removeSuccessCriterion = (id: string) => {
    setSuccessCriteria(successCriteria.filter((c) => c.id !== id));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="mission-title" className="block text-sm font-medium text-slate-700 mb-1.5">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          id="mission-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Describa brevemente la misión"
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          required
          maxLength={300}
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="mission-description" className="block text-sm font-medium text-slate-700 mb-1.5">
          Descripción <span className="text-red-500">*</span>
        </label>
        <textarea
          id="mission-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describa con detalle el propósito de la misión."
          rows={4}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-y"
          required
          maxLength={5000}
        />
      </div>

      {/* Mission Type + Time Horizon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="mission-type" className="block text-sm font-medium text-slate-700 mb-1.5">
            Tipo de misión
          </label>
          <select
            id="mission-type"
            value={missionType}
            onChange={(e) => setMissionType(e.target.value as MissionType)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
          >
            {MISSION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="mission-horizon" className="block text-sm font-medium text-slate-700 mb-1.5">
            Horizonte temporal
          </label>
          <select
            id="mission-horizon"
            value={timeHorizon}
            onChange={(e) => setTimeHorizon(e.target.value as TimeHorizon)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
          >
            {TIME_HORIZONS.map((h) => (
              <option key={h.value} value={h.value}>
                {h.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scope */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Alcance</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Incluido (una línea por elemento)</label>
            <textarea
              value={scopeIncluded}
              onChange={(e) => setScopeIncluded(e.target.value)}
              rows={3}
              placeholder="Qué está dentro del alcance de la misión"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Excluido (una línea por elemento)</label>
            <textarea
              value={scopeExcluded}
              onChange={(e) => setScopeExcluded(e.target.value)}
              rows={3}
              placeholder="Qué está explícitamente fuera del alcance"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Notas (una línea por nota)</label>
            <textarea
              value={scopeNotes}
              onChange={(e) => setScopeNotes(e.target.value)}
              rows={2}
              placeholder="Notas adicionales sobre el alcance"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            />
          </div>
        </div>
      </div>

      {/* Expected Outcome */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Resultado Esperado</h4>
        <p className="text-xs text-slate-500 mb-3">
          Esto representa lo que se ESPERA obtener, NO lo que se ha conseguido.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs text-slate-500 mb-1">Descripción</label>
            <input
              type="text"
              value={outcomeDescription}
              onChange={(e) => setOutcomeDescription(e.target.value)}
              placeholder="Descripción del resultado esperado"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Estado</label>
            <select
              value={outcomeState}
              onChange={(e) => setOutcomeState(e.target.value as ExpectedOutcomeState)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
            >
              {EXPECTED_OUTCOME_STATES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Constraints */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Restricciones conocidas (una por línea)
        </label>
        <textarea
          value={constraintsText}
          onChange={(e) => setConstraintsText(e.target.value)}
          rows={3}
          placeholder="Presupuesto, tiempo, regulación, recursos, tecnología..."
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-y"
        />
      </div>

      {/* Assumptions */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-900">Suposiciones</h4>
          <button
            type="button"
            onClick={addAssumption}
            className="text-xs text-amber-700 hover:text-amber-900 font-medium"
          >
            + Añadir
          </button>
        </div>
        <p className="text-xs text-amber-800 mb-3">
          Las suposiciones NO son hechos. Deben probarse explícitamente.
        </p>
        {assumptions.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No hay suposiciones registradas</p>
        ) : (
          <div className="space-y-2">
            {assumptions.map((a) => (
              <div key={a.id} className="flex items-start gap-2">
                <input
                  type="text"
                  value={a.statement}
                  onChange={(e) => updateAssumption(a.id, 'statement', e.target.value)}
                  placeholder="Enunciado de la suposición"
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded-md text-sm"
                />
                <select
                  value={a.status}
                  onChange={(e) => updateAssumption(a.id, 'status', e.target.value)}
                  className="px-2 py-1.5 border border-slate-300 rounded-md text-xs bg-white"
                >
                  {ASSUMPTION_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeAssumption(a.id)}
                  className="text-xs text-red-500 hover:text-red-700 px-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dependencies */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-900">Dependencias</h4>
          <button
            type="button"
            onClick={addDependency}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium"
          >
            + Añadir
          </button>
        </div>
        {dependencies.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No hay dependencias registradas</p>
        ) : (
          <div className="space-y-2">
            {dependencies.map((d) => (
              <div key={d.id} className="flex items-start gap-2">
                <input
                  type="text"
                  value={d.description}
                  onChange={(e) => updateDependency(d.id, 'description', e.target.value)}
                  placeholder="Descripción de la dependencia"
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded-md text-sm"
                />
                <select
                  value={d.status}
                  onChange={(e) => updateDependency(d.id, 'status', e.target.value)}
                  className="px-2 py-1.5 border border-slate-300 rounded-md text-xs bg-white"
                >
                  {DEPENDENCY_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeDependency(d.id)}
                  className="text-xs text-red-500 hover:text-red-700 px-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Success Criteria */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-900">Criterios de Éxito</h4>
          <button
            type="button"
            onClick={addSuccessCriterion}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-medium"
          >
            + Añadir
          </button>
        </div>
        {successCriteria.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No hay criterios de éxito registrados</p>
        ) : (
          <div className="space-y-2">
            {successCriteria.map((c) => (
              <div key={c.id} className="flex items-start gap-2">
                <input
                  type="text"
                  value={c.description}
                  onChange={(e) => updateSuccessCriterion(c.id, 'description', e.target.value)}
                  placeholder="Descripción del criterio"
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded-md text-sm"
                />
                <select
                  value={c.measurementStatus}
                  onChange={(e) =>
                    updateSuccessCriterion(c.id, 'measurementStatus', e.target.value)
                  }
                  className="px-2 py-1.5 border border-slate-300 rounded-md text-xs bg-white"
                >
                  {MEASUREMENT_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeSuccessCriterion(c.id)}
                  className="text-xs text-red-500 hover:text-red-700 px-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-xs text-amber-800">
          <strong>Nota:</strong> PRAXIA no inventa datos. Los campos vacíos permanecerán como
          UNKNOWN, UNDEFINED o NOT_MEASURED. La misión se creará con estado DRAFT y verificación
          UNKNOWN hasta que exista evidencia suficiente.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Guardando...' : 'Crear Misión'}
        </button>
      </div>
    </form>
  );
}
