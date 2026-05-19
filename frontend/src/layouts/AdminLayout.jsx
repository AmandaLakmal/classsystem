import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); // Wipe the JWT token
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans">
      {/* SIDEBAR COMPONENT */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between p-6">
        <div>
          {/* Client Branding Wrapper (Placeholder) */}
          <div className="mb-8 px-2">
            <h1 className="text-xl font-bold tracking-wider text-emerald-400 font-mono">LMS // CORE</h1>
            <p className="text-xs text-slate-500 mt-1">Agency Scaffolding v1.0</p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            <Link to="/admin/dashboard" className="flex items-center space-x-3 px-4 py-2.5 rounded-lg bg-slate-900 text-emerald-400 border border-slate-800 hover:bg-slate-900 transition-all">
              <span>📊</span> <span>Dashboard Overview</span>
            </Link>
            <Link to="/admin/students" className="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-all">
              <span>👨‍🎓</span> <span>Student Control</span>
            </Link>
            <Link to="/admin/notices" className="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-all">
                <span>📡</span> <span>Notice Board</span>
            </Link>
            <Link to="/admin/batches" className="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-all">
              <span>📅</span> <span>Batch Schedules</span>
            </Link>
          </nav>
        </div>

        {/* System User Footer */}
        <div className="border-t border-slate-800 pt-4">
          <div className="flex items-center justify-between px-2 mb-4">
            <div>
              <p className="text-sm font-medium text-slate-300">Super Admin</p>
              <p className="text-xs text-emerald-500 font-mono">SYS-999</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/50 rounded-lg text-sm font-medium transition-all"
          >
            TERMINATE SESSION
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top bar header */}
        <header className="h-16 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold tracking-wide text-slate-200">Management Console</h2>
          <div className="flex items-center space-x-2 text-xs font-mono bg-slate-900 px-3 py-1.5 rounded-md border border-slate-800 text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>API: UPSTREAM_OK</span>
          </div>
        </header>

        {/* Dynamic Inner Content Window */}
        <div className="p-8 flex-1 overflow-y-auto bg-gradient-to-b from-slate-950 to-slate-900">
          <Outlet /> {/* This is where child views inject dynamically! */}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;