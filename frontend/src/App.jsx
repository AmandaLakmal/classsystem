import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/Login"; 
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import StudentControl from './pages/StudentControl';
import NoticeBoard from './pages/NoticeBoard';
import BatchSchedules from './pages/BatchSchedules';
import AcademicModules from './pages/AcademicModules';
import Assignments from './pages/Assignments';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ACCESS CHANNELS */}
        <Route path="/" element={<Login />} />

        {/* 1. MOVED: STUDENT PORTAL IS NOW A TOP-LEVEL SIBLING */}
        <Route path="/student" element={
          <div className="min-h-screen bg-[#020617] text-slate-200 p-6">
            <StudentDashboard />
          </div>
        } />

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
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="students" element={<StudentControl />} />
          <Route path="notices" element={<NoticeBoard />} />
          <Route path="batches" element={<BatchSchedules />} />
          <Route path="academic" element={<AcademicModules />} />
          <Route path="assignments" element={<Assignments />} />
        </Route>

        {/* WILDCARD FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;