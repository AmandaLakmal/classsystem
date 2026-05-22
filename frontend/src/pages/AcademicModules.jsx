import React, { useState, useEffect, useCallback } from 'react';
import { Send, RefreshCw, Tv, Video, Pencil, Trash2, X, Check } from 'lucide-react';

const inputClass = "w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all";

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
};

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

const EMPTY_FORM = { title: '', description: '', videoUrl: '', courseId: '' };

const AcademicModules = () => {
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [editingId,    setEditingId]    = useState(null);
  const [courses,      setCourses]      = useState([]);
  const [modules,      setModules]      = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg,    setStatusMsg]    = useState(null);
  const [isFetching,   setIsFetching]   = useState(false);
  const [deletingId,   setDeletingId]   = useState(null);

  const token       = () => localStorage.getItem('token');
  const authHeaders = { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    const loadData = async () => {
      try {
        const cRes = await fetch('http://localhost:8080/api/v1/course/get-all', { headers: authHeaders });
        if (cRes.ok) setCourses(await cRes.json());
      } catch { console.warn('Could not load courses.'); }
    };
    loadData();
    fetchModules();
  }, []);

  const fetchModules = useCallback(async () => {
    setIsFetching(true);
    try {
      const res = await fetch('http://localhost:8080/api/v1/lession/get-all', { headers: authHeaders });
      if (res.ok) setModules(await res.json());
    } catch { console.error('Failed to fetch modules.'); }
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
        title:       form.title,
        description: form.description,
        videoUrl:    form.videoUrl || null,
        courseId:    form.courseId ? parseInt(form.courseId) : null,
      };
      const url    = editingId ? `http://localhost:8080/api/v1/lession/update/${editingId}` : 'http://localhost:8080/api/v1/lession/save';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(await res.text());
      showStatus('success', editingId ? 'Module updated.' : 'Module published.');
      setForm(EMPTY_FORM);
      setEditingId(null);
      fetchModules();
    } catch (err) {
      showStatus('error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (mod) => {
    setForm({
      title:       mod.title       || '',
      description: mod.description || '',
      videoUrl:    mod.videoUrl    || '',
      courseId:    mod.courseId    ? String(mod.courseId) : '',
    });
    setEditingId(mod.id);
    setDeletingId(null);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/lession/delete/${id}`, {
        method: 'DELETE', headers: authHeaders,
      });
      if (!res.ok) throw new Error('Delete failed.');
      setModules(prev => prev.filter(m => m.id !== id));
      showStatus('success', 'Module removed.');
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
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Academic Modules</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Publish and manage video lectures and study materials per subject
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT: Publisher form ──────────────────────────────── */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden h-fit">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h2 className="text-sm font-semibold text-slate-800 dark:text-white">
                  {editingId ? 'Edit Module' : 'Course Publisher'}
                </h2>
              </div>
              {editingId && (
                <button onClick={cancelEdit} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {editingId ? 'Update this lesson module' : 'Publish a new lesson module to a subject'}
            </p>
          </div>

          <div className="p-6 space-y-4">
            <StatusBanner msg={statusMsg} />

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Subject (Course) dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Subject</label>
                <select value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })}
                  className={`${inputClass} appearance-none`}>
                  <option value="">No subject (global)</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.courseName}</option>)}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Module Title</label>
                <input type="text" required value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Chapter 1: System Architecture" className={inputClass} />
              </div>

              {/* YouTube URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  YouTube URL <span className="text-slate-400 font-normal normal-case">(optional)</span>
                </label>
                <input type="url" value={form.videoUrl}
                  onChange={e => setForm({ ...form, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=…" className={inputClass} />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
                <textarea required rows="3" value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Lesson overview and learning objectives…"
                  className={`${inputClass} resize-none`} />
              </div>

              <div className="flex gap-2">
                {editingId && (
                  <button type="button" onClick={cancelEdit}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    Cancel
                  </button>
                )}
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-sm shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 mt-2">
                  <Send size={15} />
                  {isSubmitting ? (editingId ? 'Saving…' : 'Publishing…') : (editingId ? 'Save Changes' : 'Publish Module')}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── RIGHT: Lesson feed ─────────────────────────────────── */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col" style={{ height: '720px' }}>
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Lesson Library</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{modules.length} modules published</p>
            </div>
            <button onClick={fetchModules} disabled={isFetching}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all disabled:opacity-60">
              <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
              {isFetching ? 'Syncing…' : 'Refresh'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {modules.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                <Tv className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-medium text-slate-400 dark:text-slate-500">No modules published yet</p>
                <p className="text-xs text-slate-300 dark:text-slate-600">Use the form to publish your first lesson</p>
              </div>
            ) : modules.map(mod => {
              const embedUrl = getYouTubeEmbedUrl(mod.videoUrl);
              const courseName = courses.find(c => c.id === mod.courseId)?.courseName;
              return (
                <div key={mod.id}
                  className={`rounded-xl border overflow-hidden transition-colors ${editingId === mod.id ? 'border-indigo-300 dark:border-indigo-500/40 shadow-sm shadow-indigo-500/10' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-200 dark:hover:border-slate-700'}`}>
                  {/* Video */}
                  {embedUrl ? (
                    <div className="aspect-video w-full bg-black">
                      <iframe width="100%" height="100%" src={embedUrl} title={mod.title} frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    </div>
                  ) : (
                    <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <div className="text-center">
                        <Video className="w-8 h-8 mb-2 mx-auto text-slate-300 dark:text-slate-600" />
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">No video attached</p>
                      </div>
                    </div>
                  )}

                  {/* Info + actions */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <h4 className="font-semibold text-base text-slate-900 dark:text-white leading-snug">{mod.title}</h4>
                      <div className="flex items-center gap-2 shrink-0">
                        {courseName && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20">
                            {courseName}
                          </span>
                        )}
                        {/* Edit */}
                        <button onClick={() => handleEdit(mod)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors" title="Edit">
                          <Pencil size={14} />
                        </button>
                        {/* Delete with confirm */}
                        {deletingId === mod.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(mod.id)}
                              className="px-2 py-1 rounded-lg text-[11px] font-bold text-white bg-rose-500 hover:bg-rose-600 transition-colors">
                              Confirm
                            </button>
                            <button onClick={() => setDeletingId(null)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setDeletingId(mod.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{mod.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicModules;