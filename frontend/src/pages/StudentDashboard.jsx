import React, { useState } from 'react';

const StudentDashboard = () => {
  // --- Portal Sync State ---
  const [batchId, setBatchId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [isSynced, setIsSynced] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // --- Data State ---
  const [notices, setNotices] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  
  // --- Submission State ---
  const [activeUploadId, setActiveUploadId] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [submitStatus, setSubmitStatus] = useState(null);

  // Helper to extract YouTube ID
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  // 1. Sync Portal Data
  const handleSyncPortal = async (e) => {
    e.preventDefault();
    if (!batchId || !courseId) return;
    setIsFetching(true);

    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch specific Batch Notices
      const noticeRes = fetch(`http://localhost:8080/api/v1/notice/batch/${batchId}`, { headers });
      
      // Fetch specific Course Assignments
      const assignmentRes = fetch(`http://localhost:8080/api/v1/assignment/course/${courseId}`, { headers });
      
      // Fetch all Lessons (Filtering to batch if applicable locally)
      const lessonRes = fetch(`http://localhost:8080/api/v1/lession/get-all`, { headers });

      const [nRes, aRes, lRes] = await Promise.all([noticeRes, assignmentRes, lessonRes]);

      if (nRes.ok) setNotices(await nRes.json());
      if (aRes.ok) setAssignments(await aRes.json());
      if (lRes.ok) {
        const allLessons = await lRes.json();
        // Filter lessons to only show this batch's materials (if backend attached it)
        setLessons(allLessons.filter(l => !l.batchId || l.batchId === parseInt(batchId)));
      }

      setIsSynced(true);
    } catch (err) {
      console.error("Portal sync failed.", err);
    } finally {
      setIsFetching(false);
    }
  };

  // 2. Handle Assignment Submission
  const handleSubmitAssignment = async (e, assignmentId) => {
    e.preventDefault();
    setSubmitStatus({ id: assignmentId, status: 'submitting' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/v1/submission/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          assignmentId: assignmentId, 
          fileUrl: fileUrl 
        })
      });

      if (!response.ok) throw new Error('Submission rejected.');

      setSubmitStatus({ id: assignmentId, status: 'success' });
      setFileUrl('');
      setActiveUploadId(null);
      
      // Hide the success message after 3 seconds
      setTimeout(() => setSubmitStatus(null), 3000);

    } catch (error) {
      setSubmitStatus({ id: assignmentId, status: 'error' });
      setTimeout(() => setSubmitStatus(null), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Portal Header & Sync Target */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-100">Student Portal</h3>
          <p className="text-xs text-slate-400 mt-1">Access your learning materials, assignments, and secure comms.</p>
        </div>
        
        <form onSubmit={handleSyncPortal} className="flex gap-3 bg-slate-900 p-2 rounded-lg border border-slate-800">
          <input 
            type="number" required placeholder="Batch ID" value={batchId} onChange={(e) => setBatchId(e.target.value)}
            className="w-24 bg-slate-950 border border-slate-700 focus:border-indigo-500 text-slate-200 px-3 py-2 rounded text-xs font-mono outline-none"
          />
          <input 
            type="number" required placeholder="Course ID" value={courseId} onChange={(e) => setCourseId(e.target.value)}
            className="w-24 bg-slate-950 border border-slate-700 focus:border-indigo-500 text-slate-200 px-3 py-2 rounded text-xs font-mono outline-none"
          />
          <button type="submit" disabled={isFetching} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded text-xs font-bold tracking-wider uppercase transition-colors">
            {isFetching ? 'Syncing...' : 'Sync Data'}
          </button>
        </form>
      </div>

      {!isSynced ? (
        <div className="border border-dashed border-slate-800 rounded-xl p-24 flex items-center justify-center">
          <p className="text-sm font-mono text-slate-600 uppercase tracking-widest">Enter your identifiers to initialize portal sequence.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* LEFT COLUMN: Notices & Assignments */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Notices Panel */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                 <h4 className="text-sm font-mono text-emerald-400 uppercase tracking-wider">Secure Comms</h4>
              </div>
              <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
                {notices.length === 0 ? (
                  <p className="text-xs font-mono text-slate-600 text-center py-4">No active broadcasts.</p>
                ) : (
                  notices.map(notice => (
                    <div key={notice.id} className="bg-slate-900 border-l-2 border-emerald-500 p-3 rounded">
                      <h5 className="font-semibold text-slate-200 text-sm">{notice.title}</h5>
                      <p className="text-xs text-slate-400 mt-1">{notice.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Assignments Panel */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                 <h4 className="text-sm font-mono text-indigo-400 uppercase tracking-wider">Pending Tasks</h4>
              </div>
              <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                {assignments.length === 0 ? (
                  <p className="text-xs font-mono text-slate-600 text-center py-4">No pending assignments.</p>
                ) : (
                  assignments.map(task => (
                    <div key={task.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-semibold text-slate-200">{task.title}</h5>
                        <span className="text-[10px] font-mono text-rose-400 bg-rose-400/10 px-2 py-1 rounded border border-rose-400/20">
                          DUE: {new Date(task.deadline).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-4">{task.description}</p>
                      
                      {/* Submission Upload UI */}
                      {activeUploadId === task.id ? (
                        <form onSubmit={(e) => handleSubmitAssignment(e, task.id)} className="flex gap-2">
                          <input 
                            type="url" required placeholder="https://drive.google.com/..." 
                            value={fileUrl} onChange={(e) => setFileUrl(e.target.value)}
                            className="flex-1 bg-slate-950 border border-slate-700 text-slate-200 px-3 py-1.5 rounded text-xs outline-none focus:border-indigo-500"
                          />
                          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors">
                            UPLOAD
                          </button>
                        </form>
                      ) : (
                        <button 
                          onClick={() => setActiveUploadId(task.id)}
                          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded text-xs font-mono transition-colors"
                        >
                          {submitStatus?.id === task.id && submitStatus.status === 'success' ? '✅ SUBMITTED' : 'ATTACH FILE URL'}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Video Lessons */}
          <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <h4 className="text-sm font-mono text-slate-400 uppercase tracking-wider">Academic Modules</h4>
            </div>
            <div className="p-6 space-y-8 overflow-y-auto max-h-[850px]">
              {lessons.length === 0 ? (
                <p className="text-xs font-mono text-slate-600 text-center py-20 uppercase tracking-widest">No lessons available.</p>
              ) : (
                lessons.map(mod => {
                  const embedUrl = getYouTubeEmbedUrl(mod.videoUrl);
                  return (
                    <div key={mod.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                      {embedUrl ? (
                        <div className="aspect-video w-full bg-black border-b border-slate-800">
                          <iframe 
                            width="100%" height="100%" src={embedUrl} title={mod.title} frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
                          ></iframe>
                        </div>
                      ) : (
                        <div className="aspect-video w-full bg-slate-950 flex items-center justify-center text-slate-600 font-mono text-xs border-b border-slate-800">
                          [ NO MEDIA ATTACHED ]
                        </div>
                      )}
                      <div className="p-5">
                        <h5 className="font-bold text-lg text-slate-100">{mod.title}</h5>
                        <p className="text-sm text-slate-400 mt-2 whitespace-pre-wrap">{mod.description}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default StudentDashboard;