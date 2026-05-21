import React, { useState, useEffect } from 'react';

// ── Shared input style ─────────────────────────────────────────────────────
const inputClass = "w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all";

import { Send, RefreshCw, Tv, Video } from 'lucide-react';

// ── Helper: YouTube embed URL ─────────────────────────────────────────────
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match  = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
};

// ── AcademicModules ────────────────────────────────────────────────────────
const AcademicModules = () => {
  // Form state
  const [title,           setTitle]           = useState('');
  const [description,     setDescription]     = useState('');
  const [videoUrl,        setVideoUrl]        = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');

  // Data state
  const [batches,         setBatches]         = useState([]);
  const [modules,         setModules]         = useState([]);

  // UI state
  const [isSubmitting,    setIsSubmitting]    = useState(false);
  const [statusMessage,   setStatusMessage]   = useState(null);
  const [isFetching,      setIsFetching]      = useState(false);

  // 1. Load batches for dropdown
  useEffect(() => {
    const loadBatches = async () => {
      try {
        const token = localStorage.getItem('token');
        const res   = await fetch('http://localhost:8080/api/v1/batch/get-all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setBatches(await res.json());
      } catch { console.warn('Could not load batches for dropdown.'); }
    };
    loadBatches();
  }, []);

  // 2. Fetch all modules
  const handleSyncFeed = async (e) => {
    if (e) e.preventDefault();
    setIsFetching(true);
    try {
      const token    = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/v1/lession/get-all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModules(response.ok ? await response.json() : []);
    } catch {
      setModules([]);
    } finally {
      setIsFetching(false);
    }
  };

  // Auto-load on mount
  useEffect(() => { handleSyncFeed(); }, []);

  // 3. Publish a new lesson
  const handlePublish = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const token    = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/v1/lession/save', {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          title, description, videoUrl,
          batchId: parseInt(selectedBatchId),
        }),
      });
      if (!response.ok) throw new Error('Failed to publish module. DTO mismatch likely.');
      setStatusMessage({ type: 'success', text: 'Module published successfully.' });
      setTitle(''); setDescription(''); setVideoUrl('');
      handleSyncFeed(null);
    } catch (error) {
      console.error(error);
      setStatusMessage({ type: 'error', text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Page header ──────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Academic Modules</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Publish study materials and embed video lectures for classroom cohorts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT: Publisher form ──────────────────────────── */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden h-fit">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-semibold text-slate-800 dark:text-white">Course Publisher</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Publish a new lesson module to a batch</p>
          </div>

          <div className="p-6 space-y-4">
            {/* Status banner */}
            {statusMessage && (
              <div className={`flex items-start gap-2.5 p-3.5 rounded-xl text-sm border ${
                statusMessage.type === 'error'
                  ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400'
                  : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
              }`}>
                <span className="font-semibold shrink-0">{statusMessage.type === 'error' ? 'Error:' : '✓'}</span>
                {statusMessage.text}
              </div>
            )}

            <form onSubmit={handlePublish} className="space-y-4">
              {/* Batch selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Target Cohort
                </label>
                <select
                  required
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className={`${inputClass} appearance-none`}
                >
                  <option value="" disabled>Select a classroom batch…</option>
                  {batches.map(batch => (
                    <option key={batch.id} value={batch.id}>
                      {batch.batchName} (ID: {batch.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Module Title
                </label>
                <input
                  type="text" required value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Chapter 1: System Architecture"
                  className={inputClass}
                />
              </div>

              {/* YouTube URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  YouTube URL <span className="text-slate-400 font-normal normal-case">(optional)</span>
                </label>
                <input
                  type="url" value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=…"
                  className={inputClass}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  required rows="3" value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Lesson overview and learning objectives…"
                  className={`${inputClass} resize-none`}
                />
              </div>

              <button
                type="submit" disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-sm shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 mt-2"
              >
                <Send size={15} />
                {isSubmitting ? 'Publishing…' : 'Publish Module'}
              </button>
            </form>
          </div>
        </div>

        {/* ── RIGHT: Lesson feed ─────────────────────────────── */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col" style={{ height: '700px' }}>
          {/* Feed header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Lesson Library</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{modules.length} modules published</p>
            </div>
            <button
              onClick={handleSyncFeed}
              disabled={isFetching}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all disabled:opacity-60"
            >
              <RefreshCw size={14} />
              {isFetching ? 'Syncing…' : 'Refresh'}
            </button>
          </div>

          {/* Feed content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {modules.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                <Tv className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-medium text-slate-400 dark:text-slate-500">No modules published yet</p>
                <p className="text-xs text-slate-300 dark:text-slate-600">Use the form on the left to publish your first lesson</p>
              </div>
            ) : (
              modules.map((mod) => {
                const embedUrl = getYouTubeEmbedUrl(mod.videoUrl);
                return (
                  <div
                    key={mod.id}
                    className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-800/40 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                  >
                    {/* ── Video area ── */}
                    {embedUrl ? (
                      <div className="aspect-video w-full bg-black">
                        <iframe
                          width="100%" height="100%"
                          src={embedUrl} title={mod.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <div className="text-center">
                          <Video className="w-8 h-8 mb-2 mx-auto text-slate-300 dark:text-slate-600" />
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">No video attached</p>
                        </div>
                      </div>
                    )}

                    {/* ── Module info ── */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <h4 className="font-semibold text-base text-slate-900 dark:text-white leading-snug">{mod.title}</h4>
                        {mod.batchId && (
                          <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                            Batch {mod.batchId}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                        {mod.description}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AcademicModules;