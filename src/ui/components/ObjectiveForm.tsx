/**
 * PRAXIA — UI: ObjectiveForm
 *
 * Form for creating/editing an OBJECTIVE.
 * No fake data. No pre-filled values from thin air.
 */

import { useState, FormEvent, useEffect } from 'react';
import type {
  CreateObjectiveInput,
  ObjectiveClass,
  TimeHorizon,
  BaselineState,
  TargetState,
  Objective,
} from '../../domain/objective/types';
import { OBJECTIVE_CLASSES, TIME_HORIZONS, BASELINE_STATES, TARGET_STATES } from '../../domain/objective/catalogs';
import { getAllObjectivesService } from '../../domain/objective/objectiveService';

interface ObjectiveFormProps {
  onSubmit: (input: CreateObjectiveInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  initialData?: Objective | null;
}

export default function ObjectiveForm({
  onSubmit,
  onCancel,
  isSubmitting,
  initialData,
}: ObjectiveFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [objectiveClass, setObjectiveClass] = useState<ObjectiveClass>(
    initialData?.objectiveClass ?? 'SPECIFIC'
  );
  const [parentObjectiveId, setParentObjectiveId] = useState<string>(
    initialData?.parentObjectiveId ?? ''
  );
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>(
    initialData?.timeHorizon ?? 'UNDEFINED'
  );
  const [baselineState, setBaselineState] = useState<BaselineState>(
    initialData?.baseline.state ?? 'UNKNOWN'
  );
  const [baselineValue, setBaselineValue] = useState<string>(
    initialData?.baseline.value?.toString() ?? ''
  );
  const [baselineUnit, setBaselineUnit] = useState(initialData?.baseline.unit ?? '');
  const [targetState, setTargetState] = useState<TargetState>(
    initialData?.target.state ?? 'UNDEFINED'
  );
  const [targetValue, setTargetValue] = useState<string>(
    initialData?.target.value?.toString() ?? ''
  );
  const [targetUnit, setTargetUnit] = useState(initialData?.target.unit ?? '');
  const [targetDeadline, setTargetDeadline] = useState(initialData?.target.deadline ?? '');
  const [availableObjectives, setAvailableObjectives] = useState<
    { id: string; title: string; objectiveClass: ObjectiveClass }[]
  >([]);

  useEffect(() => {
    // Load available parent objectives (exclude self if editing)
    const all = getAllObjectivesService();
    const filtered = all.filter((o) => o.id !== initialData?.id);
    setAvailableObjectives(
      filtered.map((o) => ({
        id: o.id,
        title: o.title,
        objectiveClass: o.objectiveClass,
      }))
    );
  }, [initialData?.id]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const input: CreateObjectiveInput = {
      organizationId: '', // Will be resolved by the page
      title: title.trim(),
      description: description.trim(),
      objectiveClass,
      parentObjectiveId: parentObjectiveId || null,
      timeHorizon,
      baseline: {
        state: baselineState,
        value: baselineState === 'KNOWN' && baselineValue ? parseFloat(baselineValue) : null,
        unit: baselineUnit || null,
        referenceDate: null,
      },
      target: {
        state: targetState,
        value: targetState === 'DEFINED' && targetValue ? parseFloat(targetValue) : null,
        unit: targetUnit || null,
        deadline: targetDeadline || null,
      },
      constraints: [],
      kpis: [],
    };

    onSubmit(input);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="obj-title" className="block text-sm font-medium text-slate-700 mb-1.5">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          id="obj-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Describa el objetivo de forma clara y evaluable"
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          required
          maxLength={300}
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="obj-description" className="block text-sm font-medium text-slate-700 mb-1.5">
          Descripción <span className="text-red-500">*</span>
        </label>
        <textarea
          id="obj-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describa el objetivo con detalle: qué se quiere conseguir, por qué, y qué lo hace evaluable."
          rows={4}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-y"
          required
          maxLength={5000}
        />
      </div>

      {/* Class + Parent row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="obj-class" className="block text-sm font-medium text-slate-700 mb-1.5">
            Clase
          </label>
          <select
            id="obj-class"
            value={objectiveClass}
            onChange={(e) => setObjectiveClass(e.target.value as ObjectiveClass)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
          >
            {OBJECTIVE_CLASSES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="obj-parent" className="block text-sm font-medium text-slate-700 mb-1.5">
            Objetivo padre
          </label>
          <select
            id="obj-parent"
            value={parentObjectiveId}
            onChange={(e) => setParentObjectiveId(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
          >
            <option value="">— Sin padre —</option>
            {availableObjectives.map((o) => (
              <option key={o.id} value={o.id}>
                [{o.objectiveClass}] {o.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Time Horizon */}
      <div>
        <label htmlFor="obj-horizon" className="block text-sm font-medium text-slate-700 mb-1.5">
          Horizonte temporal
        </label>
        <select
          id="obj-horizon"
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

      {/* Baseline */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Baseline (situación actual)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Estado</label>
            <select
              value={baselineState}
              onChange={(e) => setBaselineState(e.target.value as BaselineState)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
            >
              {BASELINE_STATES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Valor</label>
            <input
              type="number"
              value={baselineValue}
              onChange={(e) => setBaselineValue(e.target.value)}
              disabled={baselineState !== 'KNOWN'}
              placeholder="Solo si es conocido"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm disabled:bg-slate-100 disabled:text-slate-400"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Unidad</label>
            <input
              type="text"
              value={baselineUnit}
              onChange={(e) => setBaselineUnit(e.target.value)}
              placeholder="EUR, %, unidades..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            />
          </div>
        </div>
      </div>

      {/* Target */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Target (resultado esperado)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Estado</label>
            <select
              value={targetState}
              onChange={(e) => setTargetState(e.target.value as TargetState)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
            >
              {TARGET_STATES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Valor</label>
            <input
              type="number"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              disabled={targetState !== 'DEFINED'}
              placeholder="Solo si está definido"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm disabled:bg-slate-100 disabled:text-slate-400"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Unidad</label>
            <input
              type="text"
              value={targetUnit}
              onChange={(e) => setTargetUnit(e.target.value)}
              placeholder="EUR, %, unidades..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Fecha límite</label>
            <input
              type="date"
              value={targetDeadline}
              onChange={(e) => setTargetDeadline(e.target.value)}
              disabled={targetState !== 'DEFINED'}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm disabled:bg-slate-100 disabled:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Info notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-xs text-amber-800">
          <strong>Nota:</strong> PRAXIA no inventa valores. Si no conoce el baseline o target,
          déjelos como "Desconocido" o "No definido". Los porcentajes, importes y fechas
          solo deben introducirse si son datos reales de la organización.
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
          {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear Objetivo'}
        </button>
      </div>
    </form>
  );
}
