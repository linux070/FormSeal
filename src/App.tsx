import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { ToastContainer } from '@/components/ToastContainer';
import { LandingPage } from '@/pages/LandingPage';
import { BuilderPage } from '@/pages/BuilderPage';
import { FormViewPage } from '@/pages/FormViewPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { TemplatesPage } from '@/pages/TemplatesPage';

function AppContent() {
  return (
    <div className="min-h-[100dvh] flex flex-col relative">
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/builder" element={<BuilderPage />} />
        <Route path="/f/:blobId" element={<FormViewPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
      </Routes>
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
