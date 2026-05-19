import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/Login"; // Your clean dark UI login component
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import StudentControl from './pages/StudentControl';
import NoticeBoard from './pages/NoticeBoard';
import BatchSchedules from './pages/BatchSchedules';
import AcademicModules from './pages/AcademicModules';

// Simple placeholder view injection for testing layout
const DashboardOverview = () => <div className="text-slate-300 font-mono">⚡ Welcome to the Main Dashboard Core View. System status nominal.</div>;


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ACCESS CHANNELS */}
        <Route path="/" element={<Login />} />

        {/* PROTECTED CLIENT GATEWAYS (Requires valid token and Admin Authority) */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Nested Dashboard Sub-views mapping inside the Admin Layout Outlet */}
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardOverview />} />
          <Route path="students" element={<StudentControl />} />
          <Route path="notices" element={<NoticeBoard />} />
          <Route path="batches" element={<BatchSchedules />} />
          <Route path="academic" element={<AcademicModules />} />
        </Route>

        {/* WILDCARD FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;