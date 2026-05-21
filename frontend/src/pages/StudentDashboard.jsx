import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Inline SVG Icons ───────────────────────────────────────────────────────
const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const ClipboardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
);
const BookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);
const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const UploadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);
const UndoIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
  </svg>
);

// ── Helper: decode JWT without a library ──────────────────────────────────
const parseJwt = (token) => {
  try { return JSON.parse(atob(token.split('.')[1])); }
  catch { return null; }
};

// ── Helper: YouTube embed URL ─────────────────────────────────────────────
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
};

// ── Reusable card-section header ──────────────────────────────────────────
const SectionHeader = ({ icon, title, count }) => (
  <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
    <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
      <span className="text-slate-400 dark:text-slate-500">{icon}</span>
      <h2 className="text-sm font-semibold">{title}</h2>
    </div>
    {count !== undefined && (
      <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{count}</span>
    )}
  </div>
);

// ── StudentDashboard ──────────────────────────────────────────────────────
const StudentDashboard = () => {
  const navigate = useNavigate();

  // Profile & UI state
  const [profile,       setProfile]       = useState(null);
  const [isLoading,     setIsLoading]     = useState(true);
  const [error,         setError]         = useState(null);

  // Data state
  const [notices,       setNotices]       = useState([]);
  const [lessons,       setLessons]       = useState([]);
  const [assignments,   setAssignments]   = useState([]);

  // Submission state
  const [submittedTaskIds, setSubmittedTaskIds] = useState(new Set());
  const [activeUploadId,   setActiveUploadId]   = useState(null);
  const [submitStatus,     setSubmitStatus]     = useState(null); // { id, status: 'submitting'|'retracting'|'success'|'error' }

  // ── Bootstrap ────────────────────────────────────────────────────────────
  useEffect(() => {
    const initializePortal = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/'); return; }

      try {
        const decodedToken = parseJwt(token);
        const userEmail = decodedToken?.sub;
        if (!userEmail) throw new Error('Invalid token payload.');

        const headers = { Authorization: `Bearer ${token}` };
        let studentRecord = null;

        // 1. Resolve student profile
        try {
          const allRes = await fetch('http://localhost:8080/api/v1/student/get-all', { headers });
          if (allRes.ok) {
            const allStudents = await allRes.json();
            studentRecord = allStudents.find(s => s.email === userEmail);
          }
        } catch { console.warn('Could not fetch registry.'); }

        if (!studentRecord) {
          studentRecord = { firstName: 'Student', batch: { id: 1 }, batchId: 1 };
        }
        setProfile(studentRecord);
        const currentBatchId = studentRecord.batch?.id || studentRecord.batchId;

        // 2. Parallel data fetch
        const noticeReq = currentBatchId
          ? fetch(`http://localhost:8080/api/v1/notice/batch/${currentBatchId}`, { headers })
          : Promise.resolve({ ok: true, json: () => [] });
        const [nRes, aRes, lRes, sRes] = await Promise.all([
          noticeReq,
          fetch('http://localhost:8080/api/v1/assignment/get-all', { headers }),
          fetch('http://localhost:8080/api/v1/lession/get-all',    { headers }),
          fetch('http://localhost:8080/api/v1/submission/get-all', { headers }),
        ]);

        if (nRes.ok) setNotices(await nRes.json());
        if (aRes.ok) setAssignments(await aRes.json());
        if (lRes.ok) {
          const allLessons = await lRes.json();
          setLessons(allLessons.filter(l => !l.batchId || l.batchId === currentBatchId));
        }
        if (sRes.ok) {
          const allSubs    = await sRes.json();
          const myIds      = allSubs
            .filter(sub => sub.student?.email === userEmail)
            .map(sub => sub.assignment?.id);
          setSubmittedTaskIds(new Set(myIds));
        }

      } catch (err) {
        console.error(err);
        setError('Failed to synchronize portal data. Please contact administration.');
      } finally {
        setIsLoading(false);
      }
    };
    initializePortal();
  }, [navigate]);

  // ── Submit assignment ─────────────────────────────────────────────────────
  const handleSubmitAssignment = async (e, assignmentId) => {
    e.preventDefault();
    const fileInput   = document.getElementById(`file-input-${assignmentId}`);
    const selectedFile = fileInput?.files[0];
    if (!selectedFile) { alert('Please select a file before submitting.'); return; }

    setSubmitStatus({ id: assignmentId, status: 'submitting' });
    const formData = new FormData();
    formData.append('assignmentId', assignmentId);
    formData.append('studentId',    profile?.id || 1);
    formData.append('file',         selectedFile);

    try {
      const token    = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/v1/submission/submit', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) throw new Error('Submission rejected.');
      setSubmittedTaskIds(prev => new Set(prev).add(assignmentId));
      setSubmitStatus({ id: assignmentId, status: 'success' });
      setActiveUploadId(null);
      setTimeout(() => setSubmitStatus(null), 3000);
    } catch {
      setSubmitStatus({ id: assignmentId, status: 'error' });
      setTimeout(() => setSubmitStatus(null), 3000);
    }
  };

  // ── Retract submission ────────────────────────────────────────────────────
  const handleRetractSubmission = async (assignmentId) => {
    if (!window.confirm('Retract your submission? You will be able to re-upload a new file.')) return;

    setSubmitStatus({ id: assignmentId, status: 'retracting' });
    try {
      const token    = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8080/api/v1/submission/remove/${assignmentId}/${profile?.id}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error('Retraction failed.');

      // Optimistically remove from local state → upload form reappears immediately
      setSubmittedTaskIds(prev => {
        const next = new Set(prev);
        next.delete(assignmentId);
        return next;
      });
      setSubmitStatus(null);
    } catch {
      setSubmitStatus({ id: assignmentId, status: 'error' });
      setTimeout(() => setSubmitStatus(null), 3000);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-200 dark:border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500">Loading your portal…</p>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 p-6 rounded-2xl max-w-md text-center shadow-sm">
          <p className="font-semibold mb-1">Access Error</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 animate-fade-in">

        {/* ── Portal Header card ─────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/30">
              <span className="text-white font-bold text-base">
                {(profile?.firstName?.[0] ?? 'S').toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white">
                Welcome back, {profile?.firstName || 'Student'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Your learning portal is live and synchronized
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Cohort badge */}
            <div className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-center">
              <p className="text-[10px] font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">Cohort</p>
              <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300 font-mono leading-tight">
                {profile?.batch?.id || profile?.batchId || '—'}
              </p>
            </div>
            {/* Stats */}
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-center">
              <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Submitted</p>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 leading-tight">
                {submittedTaskIds.size}/{assignments.length}
              </p>
            </div>
            {/* Logout */}
            <button
              onClick={() => { localStorage.clear(); navigate('/'); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-500/30 transition-all"
            >
              <LogoutIcon />
              Sign Out
            </button>
          </div>
        </div>

        {/* ── Main grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT COLUMN ────────────────────────────────────────── */}
          <div className="lg:col-span-1 space-y-5">

            {/* Notices card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <SectionHeader icon={<BellIcon />} title="Announcements" count={`${notices.length} notices`} />
              <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
                {notices.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">No announcements yet</p>
                    <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">Check back later for updates</p>
                  </div>
                ) : (
                  notices.map(notice => (
                    <div key={notice.id} className="flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="w-0.5 rounded-full bg-indigo-500 shrink-0 self-stretch" />
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{notice.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{notice.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Assignments card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <SectionHeader icon={<ClipboardIcon />} title="Pending Tasks" count={`${assignments.length} tasks`} />
              <div className="p-4 space-y-3 max-h-[520px] overflow-y-auto">
                {assignments.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">No assignments yet</p>
                  </div>
                ) : (
                  assignments.map(task => {
                    const isSubmitted  = submittedTaskIds.has(task.id);
                    const isRetracting = submitStatus?.id === task.id && submitStatus?.status === 'retracting';
                    const isUploading  = submitStatus?.id === task.id && submitStatus?.status === 'submitting';
                    const isActive     = activeUploadId === task.id;

                    return (
                      <div
                        key={task.id}
                        className={[
                          'rounded-xl border p-4 transition-all',
                          isSubmitted
                            ? 'bg-emerald-50/60 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700',
                        ].join(' ')}
                      >
                        {/* Task header */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h3 className={`text-sm font-semibold leading-snug ${isSubmitted ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                            {task.title}
                          </h3>
                          {isSubmitted ? (
                            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                              <CheckIcon /> Done
                            </span>
                          ) : (
                            <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
                              Due {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{task.description}</p>

                        {/* ── Action area ─── */}
                        {isSubmitted ? (
                          /* Submitted state: green confirmation + retract button */
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckIcon />
                              Submission secured
                            </div>
                            <button
                              onClick={() => handleRetractSubmission(task.id)}
                              disabled={isRetracting}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20 disabled:opacity-50 transition-all"
                              title="Retract your submission and re-upload"
                            >
                              <UndoIcon />
                              {isRetracting ? 'Retracting…' : 'Retract'}
                            </button>
                          </div>
                        ) : isActive ? (
                          /* Upload form */
                          <form onSubmit={(e) => handleSubmitAssignment(e, task.id)} className="space-y-2">
                            <label className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 cursor-pointer transition-colors bg-white dark:bg-slate-900">
                              <UploadIcon />
                              <span className="text-xs text-slate-500 dark:text-slate-400">Click to choose file</span>
                              <input
                                type="file"
                                id={`file-input-${task.id}`}
                                required
                                className="sr-only"
                              />
                            </label>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setActiveUploadId(null)}
                                className="flex-1 py-2 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={isUploading}
                                className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition-all shadow-sm shadow-indigo-500/30"
                              >
                                {isUploading ? 'Uploading…' : 'Upload File'}
                              </button>
                            </div>
                          </form>
                        ) : (
                          /* Default CTA */
                          <button
                            onClick={() => setActiveUploadId(task.id)}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all"
                          >
                            <UploadIcon />
                            Submit Assignment
                          </button>
                        )}

                        {/* Error feedback */}
                        {submitStatus?.id === task.id && submitStatus?.status === 'error' && (
                          <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-2 text-center font-medium">
                            Action failed — please try again.
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Lessons ─────────────────────────────── */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
            <SectionHeader icon={<BookIcon />} title="Academic Modules" count={`${lessons.length} lessons`} />

            <div className="flex-1 overflow-y-auto p-5 space-y-6 max-h-[860px]">
              {lessons.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-2">
                  <div className="text-4xl text-slate-200 dark:text-slate-700">📚</div>
                  <p className="text-sm font-medium text-slate-400 dark:text-slate-500">No lessons available yet</p>
                  <p className="text-xs text-slate-300 dark:text-slate-600">Your instructor will publish modules soon</p>
                </div>
              ) : (
                lessons.map(mod => {
                  const embedUrl = getYouTubeEmbedUrl(mod.videoUrl);
                  return (
                    <div key={mod.id} className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-800/40 hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                      {/* Video */}
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
                            <div className="text-3xl mb-1 text-slate-300 dark:text-slate-600">🎬</div>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">No video attached</p>
                          </div>
                        </div>
                      )}
                      {/* Info */}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3 mb-1.5">
                          <h3 className="font-semibold text-slate-900 dark:text-white leading-snug">{mod.title}</h3>
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
    </div>
  );
};

export default StudentDashboard;