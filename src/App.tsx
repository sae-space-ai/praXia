/**
 * PRAXIA — Main Application Entry Point
 * 
 * Plataforma de Inteligencia Empresarial
 * Orden 1: Fundacional
 * 
 * Architecture:
 * - Domain layer: src/domain/
 * - Persistence layer: src/persistence/
 * - UI layer: src/ui/
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './ui/components/Layout';
import NeedsListPage from './ui/pages/NeedsListPage';
import CreateNeedPage from './ui/pages/CreateNeedPage';
import NeedDetailPage from './ui/pages/NeedDetailPage';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<NeedsListPage />} />
          <Route path="/needs/new" element={<CreateNeedPage />} />
          <Route path="/needs/:id" element={<NeedDetailPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
