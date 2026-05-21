import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [error,     setError]     = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPass,  setShowPass]  = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8080/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error('Invalid credentials. Please try again.');

      const data = await response.json();
      console.log(data);
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);

      if (data.role === 'ROLE_ADMIN' || data.role === 'SUPER_ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    /* Full-page split: left brand panel + right form */
    <div className="min-h-screen flex font-sans">

      {/* ── LEFT: Brand Panel ─────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col items-center justify-center p-16 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-sm text-center">
          {/* Logo */}
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/40">
            <span className="text-white font-bold text-xl font-mono">LMS</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-3">ZeroState</h1>
          <p className="text-slate-400 text-base leading-relaxed mb-10">
            A modern learning management platform engineered for clarity, speed, and control.
          </p>

          {/* Feature highlights */}
          {[
            { icon: '⚡', label: 'Real-time grade sync' },
            { icon: '🔐', label: 'JWT-secured access' },
            { icon: '📊', label: 'Live submission dashboard' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-3 text-left mb-3">
              <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-base">{icon}</div>
              <span className="text-slate-300 text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Login Form ──────────────────────────────────── */}
      <div className="flex-1 bg-slate-50 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile brand header */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-500/30">
              <span className="text-white font-bold text-xs font-mono">LMS</span>
            </div>
            <span className="text-xl font-bold text-slate-900">ZeroState</span>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
              <p className="text-slate-500 text-sm mt-1">Sign in to your admin account</p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl mb-5 bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  id="email" type="email" required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@zerostatelabs.tech"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password" type={showPass ? 'text' : 'password'} required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-3 pr-11 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showPass ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 mt-2"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing in…
                  </span>
                ) : 'Sign In'}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400 mt-6">
            ZeroState LMS · Engineered for excellence
          </p>
        </div>
      </div>
    </div>
  );
}