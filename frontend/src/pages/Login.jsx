import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, ArrowRight, Loader2, Sparkles, Lock, LineChart, GraduationCap } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState('login');
  
  // Role: 'student' | 'admin'
  const [role, setRole] = useState('student');

  // Form states
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  
  // Register-specific fields
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');

  // UI States
  const [error,     setError]     = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPass,  setShowPass]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (mode === 'register' && role === 'admin') {
      setError('Staff and Admin accounts must be provisioned by IT. Please contact support.');
      setIsLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        const response = await fetch('http://localhost:8080/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (!response.ok) throw new Error('Invalid credentials. Please try again.');

        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);

        if (data.role === 'ROLE_ADMIN' || data.role === 'SUPER_ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/student');
        }
      } else {
        // Register Student
        const response = await fetch('http://localhost:8080/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            firstName, 
            lastName, 
            email, 
            password,
            contactNumber: '', 
            address: '', 
            instituteName: '', 
            batchId: 1 // Default to Batch 1 for demo
          }),
        });
        
        if (!response.ok) throw new Error('Registration failed. Email may already be in use.');
        
        // Auto-login after register
        setMode('login');
        setError('');
        alert('Account created successfully! Please sign in.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all";

  return (
    <div className="min-h-screen flex font-sans">
      {/* ── LEFT: Brand Panel ─────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col items-center justify-center p-16 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-[-80px] left-[-80px] w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] right-[-60px] w-80 h-80 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-500/40">
            <GraduationCap className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-4">ZeroState</h1>
          <p className="text-slate-400 text-base leading-relaxed mb-12">
            A modern learning management platform engineered for clarity, speed, and absolute control.
          </p>

          <div className="space-y-4 text-left">
            {[
              { icon: <Sparkles className="w-5 h-5" />, label: 'Real-time grade sync' },
              { icon: <Lock className="w-5 h-5" />, label: 'Enterprise-grade security' },
              { icon: <LineChart className="w-5 h-5" />, label: 'Live submission analytics' },
            ].map(({ icon, label }, i) => (
              <div key={i} className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  {icon}
                </div>
                <span className="text-slate-200 text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Auth Gateway ──────────────────────────────────── */}
      <div className="flex-1 bg-white dark:bg-[#020617] flex flex-col justify-center items-center p-6 sm:p-12 transition-colors duration-300">
        <div className="w-full max-w-[420px]">
          
          {/* Mobile Header */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
              <GraduationCap className="text-white w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">ZeroState</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {mode === 'login' ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
              {mode === 'login' 
                ? 'Enter your credentials to access your portal.' 
                : 'Enter your details to register as a student.'}
            </p>
          </div>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                role === 'student' 
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' 
                  : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <User className={role === 'student' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'} />
              <span className="text-sm font-semibold">Student</span>
            </button>
            
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                role === 'admin' 
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' 
                  : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Shield className={role === 'admin' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'} />
              <span className="text-sm font-semibold">Staff / Admin</span>
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl mb-6 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-sm">
              <span className="font-semibold shrink-0">Error:</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">First Name</label>
                  <input required value={firstName} onChange={e => setFirstName(e.target.value)} type="text" placeholder="Jane" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Last Name</label>
                  <input required value={lastName} onChange={e => setLastName(e.target.value)} type="text" placeholder="Doe" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
              <input required value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@domain.com" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Password</label>
                {mode === 'login' && (
                  <a href="#" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">Forgot?</a>
                )}
              </div>
              <div className="relative">
                <input required value={password} onChange={e => setPassword(e.target.value)} type={showPass ? 'text' : 'password'} placeholder="••••••••" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 text-xs font-medium">
                  {showPass ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0 mt-4"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {mode === 'login' ? 'Sign In to Portal' : 'Create Account'}
              {!isLoading && <ArrowRight className="w-4 h-4 ml-1" />}
            </button>
          </form>

          {/* Toggle Mode */}
          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} 
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
            >
              {mode === 'login' ? 'Register now' : 'Sign in instead'}
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}