/**
 * PRAXIA — UI: NeedForm
 * 
 * Form for creating a new NEED.
 * No fake data. No pre-filled values.
 * The user must provide real information.
 */

import { useState, FormEvent } from 'react';
import type { CreateNeedInput, NeedType, NeedPriority } from '../../domain/need/types';
import { FAMILIES } from '../../domain/need/families';
import { NEED_TYPES } from '../../domain/need/needTypes';

interface NeedFormProps {
  onSubmit: (input: CreateNeedInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const PRIORITY_OPTIONS: { value: NeedPriority; label: string }[] = [
  { value: 'NOT_ASSESSED', label: 'No evaluada' },
  { value: 'LOW', label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'CRITICAL', label: 'Crítica' },
];

export default function NeedForm({ onSubmit, onCancel, isSubmitting }: NeedFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<NeedType>('PROBLEM');
  const [domain, setDomain] = useState('F01');
  const [priority, setPriority] = useState<NeedPriority>('NOT_ASSESSED');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const input: CreateNeedInput = {
      organizationId: '', // Will be resolved by the service
      title: title.trim(),
      description: description.trim(),
      type,
      domain,
      priority,
    };

    onSubmit(input);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="need-title" className="block text-sm font-medium text-slate-700 mb-1.5">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          id="need-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Describe brevemente el problema o necesidad"
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          required
          maxLength={200}
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="need-description" className="block text-sm font-medium text-slate-700 mb-1.5">
          Descripción <span className="text-red-500">*</span>
        </label>
        <textarea
          id="need-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe con detalle la situación, el contexto y por qué es relevante para la organización."
          rows={5}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-y"
          required
          maxLength={5000}
        />
        <p className="mt-1 text-xs text-slate-400">
          Sé específico. Evita suposiciones. Describe hechos observables.
        </p>
      </div>

      {/* Type + Domain row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Type */}
        <div>
          <label htmlFor="need-type" className="block text-sm font-medium text-slate-700 mb-1.5">
            Tipo
          </label>
          <select
            id="need-type"
            value={type}
            onChange={(e) => setType(e.target.value as NeedType)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
          >
            {NEED_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Domain (Family) */}
        <div>
          <label htmlFor="need-domain" className="block text-sm font-medium text-slate-700 mb-1.5">
            Familia / Dominio
          </label>
          <select
            id="need-domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
          >
            {FAMILIES.map((f) => (
              <option key={f.id} value={f.id}>
                {f.code} — {f.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Priority */}
      <div>
        <label htmlFor="need-priority" className="block text-sm font-medium text-slate-700 mb-1.5">
          Prioridad
        </label>
        <select
          id="need-priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as NeedPriority)}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
        >
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-slate-400">
          Si no estás seguro, selecciona "No evaluada". La prioridad se revisará durante el diagnóstico.
        </p>
      </div>

      {/* Info notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-xs text-amber-800">
          <strong>Nota:</strong> Al registrar esta necesidad, su estado de verificación será "Desconocido".
          Ningún dato se considerará verificado hasta que exista evidencia suficiente.
          Los campos no completados permanecerán como UNKNOWN o NOT_ASSESSED.
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
          {isSubmitting ? 'Registrando...' : 'Registrar Necesidad'}
        </button>
      </div>
    </form>
  );
}
