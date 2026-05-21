import React, { useState } from 'react';

const inputClass = "w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all";

const SendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

const NoticeBoard = () => {
  const [title,         setTitle]         = useState('');
  const [content,       setContent]       = useState('');
  const [batchId,       setBatchId]       = useState('');
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const [liveNotices,   setLiveNotices]   = useState([]);
  const [searchBatchId, setSearchBatchId] = useState('');
  const [isFetching,    setIsFetching]    = useState(false);
  const [feedStatus,    setFeedStatus]    = useState('Enter a Batch ID to load notices.');

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/v1/notice/save', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, content,
          batchId: batchId.trim() === '' ? null : parseInt(batchId),
        }),
      });
      if (!response.ok) throw new Error('Failed to broadcast notice. Check endpoint mapping.');
      setStatusMessage({ type: 'success', text: 'Notice broadcasted successfully.' });
      setTitle(''); setContent(''); setBatchId('');
    } catch (error) {
      console.error(error);
      setStatusMessage({ type: 'error', text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSyncFeed = async (e) => {
    e.preventDefault();
    if (!searchBatchId) return;
    setIsFetching(true);
    setFeedStatus('Loading…');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/v1/notice/batch/${searchBatchId}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch feed.');
      const data = await response.json();
      setLiveNotices(data);
      setFeedStatus(data.length === 0 ? 'No notices found for this batch.' : '');
    } catch (error) {
      console.error(error);
      setFeedStatus('Failed to sync. Verify backend connection.');
      setLiveNotices([]);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Notice Board</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Broadcast announcements to specific classroom batches
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: Broadcast Form ──────────────────────────────── */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden h-fit">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-semibold text-slate-800 dark:text-white">New Broadcast</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Send a notice to a batch or globally</p>
          </div>

          <div className="p-6 space-y-4">
            {/* Status message */}
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

            <form onSubmit={handleBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Target Batch ID <span className="text-slate-400 font-normal normal-case">(optional)</span>
                </label>
                <input type="text" value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  placeholder="Leave blank for global broadcast"
                  className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Notice Title
                </label>
                <input type="text" required value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Upcoming exam schedule"
                  className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Content
                </label>
                <textarea required rows="4" value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your announcement here…"
                  className={`${inputClass} resize-none`}
                />
              </div>
              <button
                type="submit" disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-sm shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <SendIcon />
                {isSubmitting ? 'Broadcasting…' : 'Broadcast Notice'}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: Live Feed ───────────────────────────────────── */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-[560px]">
          {/* Feed header with sync control */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Active Broadcasts</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{liveNotices.length} notices loaded</p>
            </div>
            <form onSubmit={handleSyncFeed} className="flex items-center gap-2">
              <input
                type="text" placeholder="Batch ID"
                value={searchBatchId}
                onChange={(e) => setSearchBatchId(e.target.value)}
                className="w-24 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <button
                type="submit" disabled={isFetching}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all disabled:opacity-60"
              >
                <RefreshIcon />
                {isFetching ? 'Syncing…' : 'Sync'}
              </button>
            </form>
          </div>

          {/* Feed content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {liveNotices.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-center">
                <div className="text-4xl text-slate-200 dark:text-slate-700">📢</div>
                <p className="text-sm font-medium text-slate-400 dark:text-slate-500">{feedStatus}</p>
              </div>
            ) : (
              liveNotices.map((notice, index) => (
                <div
                  key={notice.id || index}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{notice.title}</h4>
                    <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                      {notice.batchId ? `Batch ${notice.batchId}` : 'Global'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{notice.content}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-600 mt-3 font-mono">
                    {new Date(notice.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeBoard;