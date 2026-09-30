/**
 * PRAXIA — UI: Application Shell Layout
 * 
 * Sidebar + main content area
 */

import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function AppShellLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const isActive = (path: string) => location.pathname === path;
  const isActivePrefix = (prefix: string) => location.pathname.startsWith(prefix);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">PRAXIA</h1>
              <p className="text-xs text-slate-500">Inteligencia Empresarial</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {/* Dashboard */}
          <Link
            to="/"
            className={`flex items-center px-6 py-2 text-sm font-medium transition-colors ${
              isActive('/')
                ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Dashboard
          </Link>

          {/* Needs */}
          <div className="mt-4">
            <button
              onClick={() => toggleSection('needs')}
              className="w-full flex items-center justify-between px-6 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide hover:text-slate-600"
            >
              <span>Necesidades</span>
              <span className={`transform transition-transform ${collapsed.needs ? '' : 'rotate-180'}`}>
                ▼
              </span>
            </button>
            {!collapsed.needs && (
              <div className="mt-1">
                <Link
                  to="/needs"
                  className={`block px-6 py-2 text-sm transition-colors ${
                    isActivePrefix('/needs')
                      ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Todas
                </Link>
                <Link
                  to="/needs/new"
                  className={`block px-6 py-2 text-sm transition-colors ${
                    isActive('/needs/new')
                      ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  + Nueva
                </Link>
              </div>
            )}
          </div>

          {/* Objectives */}
          <div className="mt-4">
            <button
              onClick={() => toggleSection('objectives')}
              className="w-full flex items-center justify-between px-6 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide hover:text-slate-600"
            >
              <span>Objetivos</span>
              <span className={`transform transition-transform ${collapsed.objectives ? '' : 'rotate-180'}`}>
                ▼
              </span>
            </button>
            {!collapsed.objectives && (
              <div className="mt-1">
                <Link
                  to="/objectives"
                  className={`block px-6 py-2 text-sm transition-colors ${
                    isActivePrefix('/objectives')
                      ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Todos
                </Link>
                <Link
                  to="/objectives/new"
                  className={`block px-6 py-2 text-sm transition-colors ${
                    isActive('/objectives/new')
                      ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  + Nuevo
                </Link>
              </div>
            )}
          </div>

          {/* Missions */}
          <div className="mt-4">
            <button
              onClick={() => toggleSection('missions')}
              className="w-full flex items-center justify-between px-6 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide hover:text-slate-600"
            >
              <span>Misiones</span>
              <span className={`transform transition-transform ${collapsed.missions ? '' : 'rotate-180'}`}>
                ▼
              </span>
            </button>
            {!collapsed.missions && (
              <div className="mt-1">
                <Link
                  to="/missions"
                  className={`block px-6 py-2 text-sm transition-colors ${
                    isActivePrefix('/missions')
                      ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Todas
                </Link>
                <Link
                  to="/missions/new"
                  className={`block px-6 py-2 text-sm transition-colors ${
                    isActive('/missions/new')
                      ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  + Nueva
                </Link>
              </div>
            )}
          </div>

          {/* Planning */}
          <div className="mt-4">
            <button
              onClick={() => toggleSection('planning')}
              className="w-full flex items-center justify-between px-6 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide hover:text-slate-600"
            >
              <span>Planificación</span>
              <span className={`transform transition-transform ${collapsed.planning ? '' : 'rotate-180'}`}>
                ▼
              </span>
            </button>
            {!collapsed.planning && (
              <div className="mt-1">
                <Link
                  to="/workplans"
                  className={`block px-6 py-2 text-sm transition-colors ${
                    isActivePrefix('/workplans')
                      ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Work Plans
                </Link>
              </div>
            )}
          </div>

          {/* Work */}
          <div className="mt-4">
            <button
              onClick={() => toggleSection('work')}
              className="w-full flex items-center justify-between px-6 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide hover:text-slate-600"
            >
              <span>Trabajo</span>
              <span className={`transform transition-transform ${collapsed.work ? '' : 'rotate-180'}`}>
                ▼
              </span>
            </button>
            {!collapsed.work && (
              <div className="mt-1">
                <Link
                  to="/tasks"
                  className={`block px-6 py-2 text-sm transition-colors ${
                    isActivePrefix('/tasks')
                      ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Tasks
                </Link>
                <Link
                  to="/tasks/new"
                  className={`block px-6 py-2 text-sm transition-colors ${
                    isActive('/tasks/new')
                      ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  + Nueva
                </Link>
              </div>
            )}
          </div>

          {/* Capabilities */}
          <div className="mt-4">
            <button
              onClick={() => toggleSection('capabilities')}
              className="w-full flex items-center justify-between px-6 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide hover:text-slate-600"
            >
              <span>Capacidades</span>
              <span className={`transform transition-transform ${collapsed.capabilities ? '' : 'rotate-180'}`}>
                ▼
              </span>
            </button>
            {!collapsed.capabilities && (
              <div className="mt-1">
                <Link
                  to="/capabilities"
                  className={`block px-6 py-2 text-sm transition-colors ${
                    isActivePrefix('/capabilities')
                      ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Catálogo
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4">
          <p className="text-xs text-slate-400 text-center">
            PRAXIA v0.4.0
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
