/**
 * PRAXIA — UI Page: Needs List
 * 
 * Displays all registered NEEDs.
 * The first question the platform asks: "¿Qué problemas o necesidades quiere resolver?"
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Need } from '../../domain/need/types';
import { getAllNeedsService } from '../../domain/need/needService';
import { FAMILIES } from '../../domain/need/families';
import NeedCard from '../components/NeedCard';

export default function NeedsListPage() {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [filterDomain, setFilterDomain] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    setNeeds(getAllNeedsService());
  }, []);

  const filteredNeeds = needs.filter((n) => {
    if (filterDomain !== 'ALL' && n.domain !== filterDomain) return false;
    if (filterStatus !== 'ALL' && n.status !== filterStatus) return false;
    return true;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Necesidades y Problemas</h2>
            <p className="mt-1 text-sm text-slate-500">
              ¿Qué problemas o necesidades quiere resolver su organización?
            </p>
          </div>
          <Link
            to="/needs/new"
            className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            + Registrar Necesidad
          </Link>
        </div>

        {/* Quick entry options */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to="/needs/new?mode=known"
            className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 text-sm">📋</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Problema conocido</p>
              <p className="text-xs text-slate-500">Registrar un problema identificado</p>
            </div>
          </Link>
          <Link
            to="/needs/new?mode=symptoms"
            className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all"
          >
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-amber-600 text-sm">🔍</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Síntomas sin causa</p>
              <p className="text-xs text-slate-500">Existen síntomas pero se desconoce la causa</p>
            </div>
          </Link>
          <Link
            to="/needs/new?mode=discovery"
            className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all"
          >
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-emerald-600 text-sm">💡</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Descubrir problemas</p>
              <p className="text-xs text-slate-500">Explorar problemas u oportunidades</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Filters */}
      {needs.length > 0 && (
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Filtrar:</span>
          <select
            value={filterDomain}
            onChange={(e) => setFilterDomain(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Todas las familias</option>
            {FAMILIES.map((f) => (
              <option key={f.id} value={f.id}>
                {f.code} — {f.name}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Todos los estados</option>
            <option value="DRAFT">Borrador</option>
            <option value="REGISTERED">Registrada</option>
            <option value="IN_DIAGNOSIS">En diagnóstico</option>
            <option value="OBJECTIVES_DEFINED">Objetivos definidos</option>
            <option value="IN_PROGRESS">En progreso</option>
            <option value="EVALUATED">Evaluada</option>
            <option value="CLOSED">Cerrada</option>
            <option value="ARCHIVED">Archivada</option>
          </select>
          <span className="text-xs text-slate-400 ml-auto">
            {filteredNeeds.length} de {needs.length} necesidades
          </span>
        </div>
      )}

      {/* Needs Grid */}
      {filteredNeeds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNeeds.map((need) => (
            <NeedCard key={need.id} need={need} />
          ))}
        </div>
      ) : needs.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📝</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No hay necesidades registradas
          </h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Comience registrando un problema, necesidad u oportunidad real de su organización.
            PRAXIA le ayudará a transformarla en objetivos, misiones y resultados verificables.
          </p>
          <Link
            to="/needs/new"
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Registrar primera necesidad
          </Link>
        </div>
      ) : (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
          <p className="text-sm text-slate-500">
            No hay necesidades que coincidan con los filtros seleccionados.
          </p>
        </div>
      )}
    </div>
  );
}
