import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, ChevronRight, MousePointerClick } from 'lucide-react';

// ── Status Badges ──────────────────────────────────────────────────────────
const GradedBadge = ({ score }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
    Graded · {score}%
  </span>
);
const PendingBadge = () => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
    Pending
  </span>
);

// ── Form Input + Label component ───────────────────────────────────────────
const FormField = ({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
      {label}
    </label>
    {children}
  </div>
);

const inputClass = "w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all";

// ── Assignments ────────────────────────────────────────────────────────────
const Assignments = () => {
  const navigate = useNavigate();
  const [assignments,      setAssignments]      = useState([]);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [submissions,      setSubmissions]      = useState([]);
  const [isLoading,        setIsLoading]        = useState(true);
  const [isLoadingSubs,    setIsLoadingSubs]    = useState(false);
  const [formData,         setFormData]         = useState({ courseId: '', title: '', deadline: '', description: '' });

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/'); return; }
      try {
        const res = await fetch('http://localhost:8080/api/v1/assignment/get-all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setAssignments(await res.json());
      } catch (err) {
        console.error('Failed to sync assignments:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleViewSubmissions = async (task) => {
    setActiveAssignment(task);
    setSubmissions([]);
    setIsLoadingSubs(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/v1/submission/assignment/${task.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setSubmissions(await res.json());
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
    } finally {
      setIsLoadingSubs(false);
    }
  };

  const handleIssueAssignment = (e) => {
    e.preventDefault();
    alert('Task Issuer ready — wire up POST /api/v1/assignment/create to activate.');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-60 gap-3">
        <div className="w-8 h-8 border-2 border-slate-200 dark:border-slate-700 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Loading assignments…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Assignments</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Issue course tasks and monitor student submissions</p>
        </div>
        <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded-xl text-xs font-semibold">
          {assignments.length} Active Tasks
        </div>
      </div>

      {/* ── Two-column layout ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: Task Issuer Form ──────────────────────────────── */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden h-fit">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-semibold text-slate-800 dark:text-white">New Assignment</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Issue a task to a course cohort</p>
          </div>

          <form onSubmit={handleIssueAssignment} className="p-6 space-y-4">
            <FormField label="Course ID">
              <input type="number" required value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                placeholder="e.g. 1" className={inputClass} />
            </FormField>

            <FormField label="Assignment Title">
              <input type="text" required value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Build a REST API" className={inputClass} />
            </FormField>

            <FormField label="Deadline">
              <input type="datetime-local" required value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className={inputClass} />
            </FormField>

            <FormField label="Instructions">
              <textarea rows="4" required value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the task requirements…"
                className={`${inputClass} resize-none`} />
            </FormField>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 mt-2"
            >
              <Plus size={15} />
              Issue Assignment
            </button>
          </form>
        </div>

        {/* RIGHT: Data views ──────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Active Assignments list */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Active Assignments</h3>
              <span className="text-xs text-slate-400 dark:text-slate-500">{assignments.length} tasks</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
              {assignments.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">No assignments found</p>
                  <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">Create one using the form on the left</p>
                </div>
              ) : (
                assignments.map((task) => {
                  const active = activeAssignment?.id === task.id;
                  return (
                    <div key={task.id} className={`flex items-center gap-4 px-6 py-4 transition-colors ${active ? 'bg-indigo-50 dark:bg-indigo-500/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${active ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            Course #{task.course?.id || task.courseId || '—'}
                          </span>
                          <span className="text-xs font-medium text-rose-500 dark:text-rose-400">
                            Due {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewSubmissions(task)}
                        className={[
                          'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                          active
                            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700',
                        ].join(' ')}
                      >
                        Submissions
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Submissions drill-down */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden min-h-[240px]">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                {activeAssignment
                  ? <><span className="text-slate-500 dark:text-slate-400 font-normal">Submissions for </span>{activeAssignment.title}</>
                  : 'Submissions'
                }
              </h3>
              {activeAssignment && (
                <span className="text-xs text-slate-400 dark:text-slate-500">{submissions.length} records</span>
              )}
            </div>

            {!activeAssignment ? (
              <div className="flex items-center justify-center h-44">
                <div className="text-center">
                  <MousePointerClick className="w-10 h-10 mb-2 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">Select an assignment above</p>
                </div>
              </div>
            ) : isLoadingSubs ? (
              <div className="flex items-center justify-center h-44">
                <div className="w-6 h-6 border-2 border-slate-200 dark:border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                      {['Student', 'File', 'Status'].map((h, i) => (
                        <th key={h} className={`px-6 py-3.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${i === 2 ? 'text-right' : 'text-left'}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {submissions.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-6 py-12 text-center">
                          <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">No submissions yet</p>
                        </td>
                      </tr>
                    ) : (
                      submissions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                              {sub.student?.firstName || `ID: ${sub.student?.id}`}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-mono">{sub.student?.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <a
                              href={`http://localhost:8080${sub.fileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                            >
                              <FileText size={13} />
                              View File
                            </a>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {sub.grade !== null ? <GradedBadge score={sub.grade} /> : <PendingBadge />}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assignments;