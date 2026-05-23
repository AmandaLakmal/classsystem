import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Bell, 
  BookOpen, 
  ClipboardList, 
  Layers, 
  Sun, 
  Moon, 
  LogOut, 
  Wifi,
  BarChart2,
  Settings,
  CreditCard
} from 'lucide-react';
import ChatWidget from '../components/ChatWidget';

const navItems = [
  { to: '/admin/dashboard',   label: 'Dashboard',        icon: <LayoutDashboard size={18} /> },
  { to: '/admin/students',    label: 'Students',         icon: <Users size={18} /> },
  { to: '/admin/notices',     label: 'Notice Board',     icon: <Bell size={18} /> },
  { to: '/admin/academic',    label: 'Academics',        icon: <BookOpen size={18} /> },
  { to: '/admin/assignments', label: 'Assignments',      icon: <ClipboardList size={18} /> },
  { to: '/admin/batches',     label: 'Batch Schedules',  icon: <Layers size={18} /> },
  { to: '/admin/analytics',   label: 'Analytics',        icon: <BarChart2 size={18} /> },
  { to: '/admin/billing',     label: 'Billing',          icon: <CreditCard size={18} /> },
];

const AdminLayout = ({ theme, toggleTheme }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profilePhoto, setProfilePhoto] = useState('');
  const [userName, setUserName]         = useState('Super Admin');
  const [userReg, setUserReg]           = useState('SYS-999');

  // Fetch the current user's profile on mount and whenever localStorage changes
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('http://localhost:8080/api/v1/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.profilePhotoUrl) setProfilePhoto(`http://localhost:8080${data.profilePhotoUrl}`);
          if (data.name) setUserName(data.name);
          if (data.studentRegId) setUserReg(data.studentRegId);
        }
      } catch (e) {
        // Silently fail — fall back to initials
      }
    };
    fetchProfile();

    // Also listen for photo updates from the Settings page via localStorage
    const onStorage = (e) => {
      if (e.key === 'profilePhotoUrl' && e.newValue) {
        setProfilePhoto(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  // Derive current page title from nav items
  const currentPage = navItems.find(n => isActive(n.to))?.label
    ?? (isActive('/admin/settings') ? 'Settings' : 'Console');

  const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

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
        <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-700/60 space-y-2">
          {/* Settings link */}
          <Link
            to="/admin/settings"
            className={[
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
              isActive('/admin/settings')
                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200',
            ].join(' ')}
          >
            <Settings size={16} className="text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400 shrink-0" />
            <span>Settings</span>
          </Link>

          {/* User info */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
              {profilePhoto
                ? <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                : <span className="text-white text-xs font-bold">{initials}</span>
              }
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{userName}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{userReg}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-500/30 transition-all duration-150"
          >
            <LogOut size={16} />
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
              <Wifi size={14} />
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
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              <span className="text-xs font-semibold">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>

            {/* Profile avatar in topbar */}
            <Link to="/admin/settings" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-2 ring-transparent group-hover:ring-indigo-400 transition-all">
                {profilePhoto
                  ? <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  : <span className="text-white text-xs font-bold">{initials}</span>
                }
              </div>
            </Link>
          </div>
        </header>

        {/* Content viewport */}
        <main className="flex-1 overflow-y-auto p-8 transition-colors duration-300">
          <Outlet />
        </main>
      </div>

      {/* ── Global floating chat widget ─────────────────────────────── */}
      <ChatWidget />
    </div>
  );
};

export default AdminLayout;