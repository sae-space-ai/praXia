/**
 * PRAXIA — UI Page: Capabilities List
 */

import { useState, useEffect } from 'react';
import { getAllCapabilities } from '../../persistence/order4Stores';
import type { Capability } from '../../domain/capability/types';

export default function CapabilitiesListPage() {
  const [capabilities, setCapabilities] = useState<Capability[]>([]);

  useEffect(() => {
    setCapabilities(getAllCapabilities());
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Capacidades</h1>
        <p className="text-sm text-slate-500 mt-1">
          Catálogo de capacidades empresariales reutilizables.
        </p>
      </div>

      {capabilities.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No hay capacidades registradas
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            El catálogo de capacidades está vacío. Las capacidades representan lo que la organización puede hacer o necesita.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {capabilities.map((cap) => (
            <div
              key={cap.id}
              className="bg-white border border-slate-200 rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {cap.code}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  cap.status === 'ACTIVE'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {cap.status}
                </span>
              </div>

              <h3 className="text-base font-semibold text-slate-900 mb-1">
                {cap.name}
              </h3>

              <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                {cap.description}
              </p>

              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-400">
                  Categoría: {cap.category}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
