import React, { useState, useEffect, useCallback } from 'react';
import { Send, RefreshCw, Megaphone, Pencil, Trash2, X, Check } from 'lucide-react';

const inputClass = "w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all";
const selectClass = `${inputClass} appearance-none`;

const EMPTY_FORM = { title: '', content: '', batchId: '', courseId: '' };

const StatusBanner = ({ msg }) => !msg ? null : (
  <div className={`flex items-start gap-2.5 p-3.5 rounded-xl text-sm border ${
    msg.type === 'error'
      ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400'
      : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
  }`}>
    <span className="font-semibold shrink-0">{msg.type === 'error' ? 'Error:' : <Check size={14} />}</span>
    {msg.text}
  </div>
);

const TargetBadge = ({ notice }) => {
  if (notice.courseId) return (
    <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20">
      {notice.courseName || `Subject #${notice.courseId}`}
    </span>
  );
  if (notice.batchId) return (
    <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
      Batch {notice.batchId}
    </span>
  );
  return (
    <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
      Global
    </span>
  );
};

const NoticeBoard = () => {
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [editingId,    setEditingId]    = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg,    setStatusMsg]    = useState(null);
  const [notices,      setNotices]      = useState([]);
  const [isFetching,   setIsFetching]   = useState(false);
  const [deletingId,   setDeletingId]   = useState(null); // confirm state
  const [batches,      setBatches]      = useState([]);
  const [courses,      setCourses]      = useState([]);

  const token = () => localStorage.getItem('token');
  const authHeaders = { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' };

  // Load dropdowns + notices on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [bRes, cRes] = await Promise.all([
          fetch('http://localhost:8080/api/v1/batch/get-all',  { headers: authHeaders }),
          fetch('http://localhost:8080/api/v1/course/get-all', { headers: authHeaders }),
        ]);
        if (bRes.ok) setBatches(await bRes.json());
        if (cRes.ok) setCourses(await cRes.json());
      } catch { console.warn('Could not load dropdowns.'); }
    };
    load();
    fetchNotices();
  }, []);

  const fetchNotices = useCallback(async () => {
    setIsFetching(true);
    try {
      const res = await fetch('http://localhost:8080/api/v1/notice/get-all', { headers: authHeaders });
      if (res.ok) setNotices(await res.json());
    } catch { console.error('Failed to fetch notices.'); }
    finally   { setIsFetching(false); }
  }, []);

  const showStatus = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const body = {
        title:    form.title,
        content:  form.content,
        batchId:  form.batchId  ? parseInt(form.batchId)  : null,
        courseId: form.courseId ? parseInt(form.courseId) : null,
      };
      const url    = editingId ? `http://localhost:8080/api/v1/notice/update/${editingId}` : 'http://localhost:8080/api/v1/notice/save';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(await res.text());
      showStatus('success', editingId ? 'Notice updated.' : 'Notice broadcasted.');
      setForm(EMPTY_FORM);
      setEditingId(null);
      fetchNotices();
    } catch (err) {
      showStatus('error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (notice) => {
    setForm({
      title:    notice.title   || '',
      content:  notice.content || '',
      batchId:  notice.batchId  ? String(notice.batchId)  : '',
      courseId: notice.courseId ? String(notice.courseId) : '',
    });
    setEditingId(notice.id);
    setDeletingId(null);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/notice/delete/${id}`, {
        method: 'DELETE', headers: authHeaders,
      });
      if (!res.ok) throw new Error('Delete failed.');
      setNotices(prev => prev.filter(n => n.id !== id));
      showStatus('success', 'Notice removed.');
    } catch (err) {
      showStatus('error', err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const cancelEdit = () => { setForm(EMPTY_FORM); setEditingId(null); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Notice Board</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Broadcast announcements globally, to a batch, or to a specific subject
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT: Form ─────────────────────────────────────────────── */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden h-fit">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-sm font-semibold text-slate-800 dark:text-white">
                  {editingId ? 'Edit Notice' : 'New Broadcast'}
                </h2>
              </div>
              {editingId && (
                <button onClick={cancelEdit} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Cancel edit">
                  <X size={14} />
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {editingId ? 'Update this announcement' : 'Target by batch, subject, or send globally'}
            </p>
          </div>

          <div className="p-6 space-y-4">
            <StatusBanner msg={statusMsg} />

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Target Batch */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Target Batch <span className="text-slate-400 font-normal normal-case">(optional)</span>
                </label>
                <select value={form.batchId} onChange={e => setForm({ ...form, batchId: e.target.value })} className={selectClass}>
                  <option value="">All batches (global)</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.batchName} (ID: {b.id})</option>)}
                </select>
              </div>

              {/* Target Subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Target Subject <span className="text-slate-400 font-normal normal-case">(optional)</span>
                </label>
                <select value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })} className={selectClass}>
                  <option value="">All subjects</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.courseName}</option>)}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Notice Title</label>
                <input type="text" required value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Upcoming exam schedule" className={inputClass} />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Content</label>
                <textarea required rows="4" value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  placeholder="Write your announcement here…"
                  className={`${inputClass} resize-none`} />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                {editingId && (
                  <button type="button" onClick={cancelEdit}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    Cancel
                  </button>
                )}
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-sm shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0">
                  <Send size={15} />
                  {isSubmitting ? (editingId ? 'Saving…' : 'Broadcasting…') : (editingId ? 'Save Changes' : 'Broadcast Notice')}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── RIGHT: Live feed ───────────────────────────────────────── */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-[620px]">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Active Broadcasts</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{notices.length} notices</p>
            </div>
            <button onClick={fetchNotices} disabled={isFetching}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all disabled:opacity-60">
              <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
              {isFetching ? 'Syncing…' : 'Refresh'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notices.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
                <Megaphone className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-medium text-slate-400 dark:text-slate-500">No notices yet — broadcast the first one!</p>
              </div>
            ) : notices.map(notice => (
              <div key={notice.id}
                className={`p-4 rounded-xl border transition-colors ${editingId === notice.id ? 'bg-indigo-50 dark:bg-indigo-500/5 border-indigo-200 dark:border-indigo-500/30' : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm leading-snug truncate">{notice.title}</h4>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <TargetBadge notice={notice} />
                    {/* Edit button */}
                    <button onClick={() => handleEdit(notice)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors" title="Edit">
                      <Pencil size={13} />
                    </button>
                    {/* Delete with inline confirm */}
                    {deletingId === notice.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(notice.id)}
                          className="px-2 py-1 rounded-lg text-[11px] font-bold text-white bg-rose-500 hover:bg-rose-600 transition-colors">
                          Confirm
                        </button>
                        <button onClick={() => setDeletingId(null)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setDeletingId(notice.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors" title="Delete">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{notice.content}</p>
                <p className="text-xs text-slate-400 dark:text-slate-600 mt-3 font-mono">
                  {notice.createdAt ? new Date(notice.createdAt).toLocaleString() : '—'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeBoard;