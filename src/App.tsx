/**
 * PRAXIA — Main Application Entry Point
 * 
 * Application Shell with sidebar navigation
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShellLayout from './ui/layouts/AppShellLayout';
import NeedsListPage from './ui/pages/NeedsListPage';
import CreateNeedPage from './ui/pages/CreateNeedPage';
import NeedDetailPage from './ui/pages/NeedDetailPage';
import ObjectivesListPage from './ui/pages/ObjectivesListPage';
import CreateObjectivePage from './ui/pages/CreateObjectivePage';
import ObjectiveDetailPage from './ui/pages/ObjectiveDetailPage';
import MissionsListPage from './ui/pages/MissionsListPage';
import CreateMissionPage from './ui/pages/CreateMissionPage';
import MissionDetailPage from './ui/pages/MissionDetailPage';
import WorkPlansListPage from './ui/pages/WorkPlansListPage';
import WorkPlanDetailPage from './ui/pages/WorkPlanDetailPage';
import TasksListPage from './ui/pages/TasksListPage';
import TaskDetailPage from './ui/pages/TaskDetailPage';
import CapabilitiesListPage from './ui/pages/CapabilitiesListPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShellLayout />}>
          {/* Dashboard */}
          <Route path="/" element={<NeedsListPage />} />
          
          {/* Needs */}
          <Route path="/needs" element={<NeedsListPage />} />
          <Route path="/needs/new" element={<CreateNeedPage />} />
          <Route path="/needs/:id" element={<NeedDetailPage />} />
          
          {/* Objectives */}
          <Route path="/objectives" element={<ObjectivesListPage />} />
          <Route path="/objectives/new" element={<CreateObjectivePage />} />
          <Route path="/objectives/:id" element={<ObjectiveDetailPage />} />
          
          {/* Missions */}
          <Route path="/missions" element={<MissionsListPage />} />
          <Route path="/missions/new" element={<CreateMissionPage />} />
          <Route path="/missions/:id" element={<MissionDetailPage />} />
          
          {/* WorkPlans */}
          <Route path="/workplans" element={<WorkPlansListPage />} />
          <Route path="/workplans/:id" element={<WorkPlanDetailPage />} />
          
          {/* Tasks */}
          <Route path="/tasks" element={<TasksListPage />} />
          <Route path="/tasks/new" element={<div className="p-8">Task creation - Coming soon</div>} />
          <Route path="/tasks/:id" element={<TaskDetailPage />} />
          
          {/* Capabilities */}
          <Route path="/capabilities" element={<CapabilitiesListPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
