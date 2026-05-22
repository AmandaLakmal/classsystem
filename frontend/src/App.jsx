import React, { useState, useEffect } from 'react';
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
import AnalyticsDashboard from './pages/AnalyticsDashboard';

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    // NOTE: We intentionally do NOT apply 'dark' to <html>.
    // Our @custom-variant dark scopes dark mode to the .dark wrapper <div>
    // below, which is the single source of truth for Tailwind v4.
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    /*
      THE DARK MODE SCOPE ROOT
      Tailwind v4 dark variant is defined as: (&:is(.dark *))
      So this wrapper div with class="dark" makes ALL child elements
      respond to dark: prefixed utilities. This is intentional and correct.
    */
    <div
      id="app-root"
      className={`${theme === 'dark' ? 'dark' : ''} min-h-screen w-full font-sans bg-slate-50 dark:bg-[#020617] transition-colors duration-300`}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />

          {/* Student Portal */}
          <Route path="/student" element={
            <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200 transition-colors duration-300">
              <StudentDashboard theme={theme} toggleTheme={toggleTheme} />
            </div>
          } />

          {/* Admin Gateway */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <AdminLayout theme={theme} toggleTheme={toggleTheme} />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<StudentControl />} />
            <Route path="notices" element={<NoticeBoard />} />
            <Route path="batches" element={<BatchSchedules />} />
            <Route path="academic" element={<AcademicModules />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="analytics"   element={<AnalyticsDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;