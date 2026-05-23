import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, ChevronRight, MousePointerClick, Pencil, Trash2, X, Check } from 'lucide-react';

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

const FormField = ({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
  </div>
);

const inputClass = "w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all";

const StatusBanner = ({ msg }) => !msg ? null : (
  <div className={`flex items-start gap-2.5 p-3.5 rounded-xl text-sm border ${
    msg.type === 'error'
      ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400'
      : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
  }`}>
    <span className="font-semibold shrink-0">{msg.type === 'error' ? 'Error:' : <Check size={14}/>}</span>
    {msg.text}
  </div>
);

const EMPTY_FORM = { courseId: '', title: '', deadline: '', description: '' };

const Assignments = () => {
  const navigate = useNavigate();
  const [assignments,      setAssignments]      = useState([]);
  const [courses,          setCourses]          = useState([]);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [submissions,      setSubmissions]      = useState([]);
  const [isLoading,        setIsLoading]        = useState(true);
  const [isLoadingSubs,    setIsLoadingSubs]    = useState(false);
  const [isSubmitting,     setIsSubmitting]     = useState(false);
  const [formData,         setFormData]         = useState(EMPTY_FORM);
  const [editingId,        setEditingId]        = useState(null);
  const [deletingId,       setDeletingId]       = useState(null);
  const [statusMsg,        setStatusMsg]        = useState(null);

  const token       = () => localStorage.getItem('token');
  const authHeaders = { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' };

  const fetchAssignments = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8080/api/v1/assignment/get-all', { headers: authHeaders });
      if (res.ok) setAssignments(await res.json());
    } catch (err) { console.error('Failed to sync assignments:', err); }
  }, []);

  useEffect(() => {
    const init = async () => {
      const tk = localStorage.getItem('token');
      if (!tk) { navigate('/'); return; }
      try {
        const [aRes, cRes] = await Promise.all([
          fetch('http://localhost:8080/api/v1/assignment/get-all', { headers: authHeaders }),
          fetch('http://localhost:8080/api/v1/course/get-all',     { headers: authHeaders }),
        ]);
        if (aRes.ok) setAssignments(await aRes.json());
        if (cRes.ok) setCourses(await cRes.json());
      } catch (err) { console.error(err); }
      finally { setIsLoading(false); }
    };
    init();
  }, [navigate]);

  const showStatus = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleViewSubmissions = async (task) => {
    setActiveAssignment(task);
    setSubmissions([]);
    setIsLoadingSubs(true);
    try {
      const res = await fetch(`http://localhost:8080/api/v1/submission/assignment/${task.id}`, { headers: authHeaders });
      if (res.ok) setSubmissions(await res.json());
    } catch (err) { console.error('Failed to fetch submissions:', err); }
    finally       { setIsLoadingSubs(false); }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const body = {
        title:       formData.title,
        description: formData.description,
        deadline:    formData.deadline,
        courseId:    formData.courseId ? parseInt(formData.courseId) : null,
      };
      const url    = editingId ? `http://localhost:8080/api/v1/assignment/update/${editingId}` : 'http://localhost:8080/api/v1/assignment/save';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(await res.text());
      showStatus('success', editingId ? 'Assignment updated.' : 'Assignment issued.');
      setFormData(EMPTY_FORM);
      setEditingId(null);
      await fetchAssignments();
    } catch (err) {
      showStatus('error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (task) => {
    // Format deadline for datetime-local input (ISO 8601 local)
    const deadlineLocal = task.deadline
      ? new Date(task.deadline).toISOString().slice(0, 16)
      : '';
    setFormData({
      courseId:    task.courseId    ? String(task.courseId)    : (task.course?.id ? String(task.course.id) : ''),
      title:       task.title       || '',
      deadline:    deadlineLocal,
      description: task.description || '',
    });
    setEditingId(task.id);
    setDeletingId(null);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/assignment/delete/${id}`, {
        method: 'DELETE', headers: authHeaders,
      });
      if (!res.ok) throw new Error('Delete failed.');
      setAssignments(prev => prev.filter(a => a.id !== id));
      if (activeAssignment?.id === id) { setActiveAssignment(null); setSubmissions([]); }
      showStatus('success', 'Assignment deleted.');
    } catch (err) {
      showStatus('error', err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const cancelEdit = () => { setFormData(EMPTY_FORM); setEditingId(null); };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-60 gap-3">
      <div className="w-8 h-8 border-2 border-slate-200 dark:border-slate-700 border-t-emerald-500 rounded-full animate-spin" />
      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Loading assignments…</p>
    </div>
  );

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT: Form ──────────────────────────────────────────── */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden h-fit">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-sm font-semibold text-slate-800 dark:text-white">
                  {editingId ? 'Edit Assignment' : 'New Assignment'}
                </h2>
              </div>
              {editingId && (
                <button onClick={cancelEdit} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {editingId ? 'Update this assignment' : 'Issue a task to a subject cohort'}
            </p>
          </div>

          <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
            <StatusBanner msg={statusMsg} />

            {/* Subject Dropdown */}
            <FormField label="Subject">
              <select value={formData.courseId} onChange={e => setFormData({ ...formData, courseId: e.target.value })}
                className={`${inputClass} appearance-none`}>
                <option value="">No specific subject</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.courseName}</option>)}
              </select>
            </FormField>

            <FormField label="Assignment Title">
              <input type="text" required value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Build a REST API" className={inputClass} />
            </FormField>

            <FormField label="Deadline">
              <input type="datetime-local" required value={formData.deadline}
                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                className={inputClass} />
            </FormField>

            <FormField label="Instructions">
              <textarea rows="4" required value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the task requirements…"
                className={`${inputClass} resize-none`} />
            </FormField>

            <div className="flex flex-col sm:flex-row gap-2">
              {editingId && (
                <button type="button" onClick={cancelEdit}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  Cancel
                </button>
              )}
              <button type="submit" disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-sm shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 mt-2">
                <Plus size={15} />
                {isSubmitting ? (editingId ? 'Saving…' : 'Issuing…') : (editingId ? 'Save Changes' : 'Issue Assignment')}
              </button>
            </div>
          </form>
        </div>

        {/* ── RIGHT: Data views ────────────────────────────────────── */}
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
              ) : assignments.map(task => {
                const active       = activeAssignment?.id === task.id;
                const isEditing    = editingId === task.id;
                const courseName   = courses.find(c => c.id === (task.courseId || task.course?.id))?.courseName;
                return (
                  <div key={task.id}
                    className={`flex items-center gap-4 px-6 py-4 transition-colors ${isEditing ? 'bg-indigo-50/60 dark:bg-indigo-500/5' : active ? 'bg-slate-50 dark:bg-slate-800/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-sm font-semibold truncate ${active ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                          {task.title}
                        </p>
                        {courseName && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20">
                            {courseName}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-medium text-rose-500 dark:text-rose-400 mt-0.5 inline-block">
                        Due {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Edit */}
                      <button onClick={() => handleEdit(task)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors" title="Edit">
                        <Pencil size={14} />
                      </button>
                      {/* Delete */}
                      {deletingId === task.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(task.id)}
                            className="px-2 py-1 rounded-lg text-[11px] font-bold text-white bg-rose-500 hover:bg-rose-600 transition-colors">
                            Confirm
                          </button>
                          <button onClick={() => setDeletingId(null)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setDeletingId(task.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      )}
                      {/* Submissions drill-down */}
                      <button onClick={() => handleViewSubmissions(task)}
                        className={['flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                          active ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700',
                        ].join(' ')}>
                        Submissions <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submissions drill-down panel */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden min-h-[240px]">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                {activeAssignment
                  ? <><span className="text-slate-500 dark:text-slate-400 font-normal">Submissions for </span>{activeAssignment.title}</>
                  : 'Submissions'
                }
              </h3>
              {activeAssignment && <span className="text-xs text-slate-400 dark:text-slate-500">{submissions.length} records</span>}
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
                        <th key={h} className={`px-6 py-3.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${i === 2 ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {submissions.length === 0 ? (
                      <tr><td colSpan="3" className="px-6 py-12 text-center">
                        <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">No submissions yet</p>
                      </td></tr>
                    ) : submissions.map(sub => (
                      <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{sub.student?.firstName || `ID: ${sub.student?.id}`}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-mono">{sub.student?.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <a href={`http://localhost:8080${sub.fileUrl}`} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">
                            <FileText size={13} /> View File
                          </a>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {sub.grade !== null ? <GradedBadge score={sub.grade} /> : <PendingBadge />}
                        </td>
                      </tr>
                    ))}
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