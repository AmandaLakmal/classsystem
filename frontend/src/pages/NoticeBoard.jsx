import React, { useState } from 'react';

const NoticeBoard = () => {
  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [batchId, setBatchId] = useState('');
  
  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Mocked Notices (Until we wire up the Batch selector)
  const recentNotices = [
    { id: 1, title: "System Maintenance", content: "LMS Core will be down for 15 minutes at midnight.", date: "2026-05-18", batchId: "SYS-ALL" },
    { id: 2, title: "Assignment Upload", content: "Please ensure your PDFs are under 5MB.", date: "2026-05-17", batchId: "GURU-2026" }
  ];

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const token = localStorage.getItem('token');
      
      // Guessing the save endpoint based on his PDF conventions
      const response = await fetch('http://localhost:8080/api/v1/notice/save', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          title: title, 
          content: content, 
          batchId: batchId // Assuming his API expects the ID to link to the classroom
        })
      });

      if (!response.ok) {
        throw new Error('Failed to broadcast notice. Check endpoint mapping.');
      }

      setStatusMessage({ type: 'success', text: 'TRANSMISSION SUCCESSFUL: Notice broadcasted to batch.' });
      setTitle('');
      setContent('');
      setBatchId('');

    } catch (error) {
      console.error(error);
      setStatusMessage({ type: 'error', text: `[ TRANSMISSION_FAILED ] ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div>
        <h3 className="text-xl font-bold text-slate-100">Comms & Notice Board</h3>
        <p className="text-xs text-slate-400 mt-1">Broadcast encrypted announcements to specific classroom batches</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT PANEL: BROADCAST FORM */}
        <div className="lg:col-span-1 bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-2xl">
          <h4 className="text-sm font-mono text-emerald-400 uppercase tracking-wider mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            New Transmission
          </h4>

          {statusMessage && (
            <div className={`p-3 rounded-lg text-xs font-mono mb-6 border ${statusMessage.type === 'error' ? 'bg-rose-950/40 border-rose-900/60 text-rose-400' : 'bg-emerald-950/40 border-emerald-900/60 text-emerald-400'}`}>
              {statusMessage.text}
            </div>
          )}

          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-slate-500 mb-1 block">TARGET BATCH ID</label>
              <input 
                type="text" 
                required
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                placeholder="e.g., 1 (Database ID)"
                className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 text-slate-200 p-2.5 rounded-lg text-sm font-mono outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-500 mb-1 block">NOTICE TITLE</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Header protocol..."
                className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 text-slate-200 p-2.5 rounded-lg text-sm outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-500 mb-1 block">PAYLOAD (CONTENT)</label>
              <textarea 
                required
                rows="4"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter transmission payload here..."
                className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 text-slate-200 p-2.5 rounded-lg text-sm outline-none transition-colors resize-none"
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg text-xs font-bold font-mono tracking-widest uppercase transition-colors ${
                isSubmitting ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              {isSubmitting ? 'Transmitting...' : 'Broadcast Notice'}
            </button>
          </form>
        </div>

        {/* RIGHT PANEL: RECENT NOTICES */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-2xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-sm font-mono text-slate-400 uppercase tracking-wider">Active Broadcasts</h4>
            <span className="text-xs font-mono text-slate-500 border border-slate-700 px-2 py-1 rounded bg-slate-900">
              Mock Data Mode
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4">
            {recentNotices.map(notice => (
              <div key={notice.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-semibold text-slate-200">{notice.title}</h5>
                  <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                    BATCH: {notice.batchId}
                  </span>
                </div>
                <p className="text-sm text-slate-400">{notice.content}</p>
                <div className="mt-3 text-[10px] font-mono text-slate-600">
                  TIMESTAMP: {notice.date}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default NoticeBoard;