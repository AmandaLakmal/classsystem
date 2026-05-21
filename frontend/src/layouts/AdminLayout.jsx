import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

// ─── Inline SVG Icons ──────────────────────────────────────────────────────
const Icon = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>,
  students:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  notices:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  academic:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  assignments: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  batches:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  sun:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  moon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  logout: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  wifi: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
};

const navItems = [
  { to: '/admin/dashboard',   label: 'Dashboard',      icon: Icon.dashboard   },
  { to: '/admin/students',    label: 'Students',       icon: Icon.students    },
  { to: '/admin/notices',     label: 'Notice Board',   icon: Icon.notices     },
  { to: '/admin/academic',    label: 'Academics',      icon: Icon.academic    },
  { to: '/admin/assignments', label: 'Assignments',    icon: Icon.assignments },
  { to: '/admin/batches',     label: 'Batch Schedules',icon: Icon.batches     },
];

const AdminLayout = ({ theme, toggleTheme }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  // Derive current page title from nav items
  const currentPage = navItems.find(n => isActive(n.to))?.label ?? 'Console';

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#020617] font-sans transition-colors duration-300">

      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside className="w-64 shrink-0 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700/60 shadow-sm transition-colors duration-300">

        {/* Brand */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-500/30">
              <span className="text-white font-bold text-xs font-mono">LMS</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">ZeroState</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">Admin Console</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
            Navigation
          </p>
          {navItems.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                isActive(to)
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200',
              ].join(' ')}
            >
              <span className={[
                'transition-colors duration-150 shrink-0',
                isActive(to)
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400',
              ].join(' ')}>
                {icon}
              </span>
              <span className="truncate">{label}</span>
              {isActive(to) && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-700/60 space-y-3">
          {/* User info */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">SA</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">Super Admin</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">SYS-999</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-500/30 transition-all duration-150"
          >
            {Icon.logout}
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="h-16 shrink-0 flex items-center justify-between px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700/60 shadow-sm transition-colors duration-300">
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white">{currentPage}</h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">ZeroState Learning Management System</p>
          </div>

          <div className="flex items-center gap-3">
            {/* API Status */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {Icon.wifi}
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">API Online</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Theme Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all duration-150"
            >
              {theme === 'dark' ? Icon.sun : Icon.moon}
              <span className="text-xs font-semibold">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </header>

        {/* Content viewport */}
        <main className="flex-1 overflow-y-auto p-8 transition-colors duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;