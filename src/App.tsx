/**
 * PRAXIA — Main Application Entry Point
 * 
 * Plataforma de Inteligencia Empresarial
 * Order 2: Objectives Engine
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './ui/components/Layout';
import NeedsListPage from './ui/pages/NeedsListPage';
import CreateNeedPage from './ui/pages/CreateNeedPage';
import NeedDetailPage from './ui/pages/NeedDetailPage';
import ObjectivesListPage from './ui/pages/ObjectivesListPage';
import CreateObjectivePage from './ui/pages/CreateObjectivePage';
import ObjectiveDetailPage from './ui/pages/ObjectiveDetailPage';
import MissionsListPage from './ui/pages/MissionsListPage';
import CreateMissionPage from './ui/pages/CreateMissionPage';
import MissionDetailPage from './ui/pages/MissionDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* NEEDs */}
          <Route path="/" element={<NeedsListPage />} />
          <Route path="/needs/new" element={<CreateNeedPage />} />
          <Route path="/needs/:id" element={<NeedDetailPage />} />
          
          {/* OBJECTIVEs */}
          <Route path="/objectives" element={<ObjectivesListPage />} />
          <Route path="/objectives/new" element={<CreateObjectivePage />} />
          <Route path="/objectives/:id" element={<ObjectiveDetailPage />} />
          
          {/* MISSIONs */}
          <Route path="/missions" element={<MissionsListPage />} />
          <Route path="/missions/new" element={<CreateMissionPage />} />
          <Route path="/missions/:id" element={<MissionDetailPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
