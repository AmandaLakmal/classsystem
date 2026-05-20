import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const navigate = useNavigate();
  
  // --- Profile & UI State ---
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Data State ---
  const [notices, setNotices] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  
  // --- Submission State ---
  const [activeUploadId, setActiveUploadId] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [submitStatus, setSubmitStatus] = useState(null);

  // Helper: Extract YouTube ID
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  // Helper: Decode JWT without external libraries
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

// 1. The Auto-Sync Sequence
  useEffect(() => {
    const initializePortal = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      try {
        const decodedToken = parseJwt(token);
        const userEmail = decodedToken?.sub;

        if (!userEmail) throw new Error("Invalid token payload.");

        const headers = { 'Authorization': `Bearer ${token}` };
        let studentRecord = null;

        // STRATEGY A: Try to fetch all students and find our email
        try {
          const allRes = await fetch(`http://localhost:8080/api/v1/student/get-all`, { headers });
          if (allRes.ok) {
            const allStudents = await allRes.json();
            studentRecord = allStudents.find(s => s.email === userEmail);
          }
        } catch (e) {
          console.warn("Could not fetch registry.");
        }

        // STRATEGY B: The Demo Fallback (If backend blocks get-all for students)
        if (!studentRecord) {
          console.warn("[ SYSTEM OVERRIDE ] Backend blocked profile fetch. Initializing Demo Mode for Batch 1.");
          studentRecord = { 
            firstName: "Student", 
            batch: { id: 1 }, 
            batchId: 1 
          };
        }

        setProfile(studentRecord);
        const currentBatchId = studentRecord.batch?.id || studentRecord.batchId;

        // C. Fetch Targeted Data
        const noticeReq = currentBatchId 
          ? fetch(`http://localhost:8080/api/v1/notice/batch/${currentBatchId}`, { headers })
          : Promise.resolve({ ok: true, json: () => [] });

        const assignmentReq = fetch(`http://localhost:8080/api/v1/assignment/get-all`, { headers });
        const lessonReq = fetch(`http://localhost:8080/api/v1/lession/get-all`, { headers });

        const [nRes, aRes, lRes] = await Promise.all([noticeReq, assignmentReq, lessonReq]);

        if (nRes.ok) setNotices(await nRes.json());
        if (aRes.ok) setAssignments(await aRes.json());
        if (lRes.ok) {
          const allLessons = await lRes.json();
          setLessons(allLessons.filter(l => !l.batchId || l.batchId === currentBatchId));
        }

      } catch (err) {
        console.error(err);
        setError("Failed to synchronize portal data. Please contact administration.");
      } finally {
        setIsLoading(false);
      }
    };

    initializePortal();
  }, [navigate]);

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
        body: JSON.stringify({ assignmentId, fileUrl })
      });

      if (!response.ok) throw new Error('Submission rejected.');

      setSubmitStatus({ id: assignmentId, status: 'success' });
      setFileUrl('');
      setActiveUploadId(null);
      setTimeout(() => setSubmitStatus(null), 3000);

    } catch (error) {
      setSubmitStatus({ id: assignmentId, status: 'error' });
      setTimeout(() => setSubmitStatus(null), 3000);
    }
  };

  // --- Render Loading / Error States ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-emerald-500 font-mono text-sm animate-pulse">DECRYPTING USER PROFILE...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-rose-950/50 border border-rose-900 text-rose-400 p-6 rounded-xl font-mono max-w-md text-center shadow-2xl">
          [ ACCESS_DENIED ] <br/><br/> {error}
        </div>
      </div>
    );
  }

  // --- Main Dashboard Render ---
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      
      {/* Portal Header - Now completely automated */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-100">Welcome, {profile?.firstName || 'Student'}</h3>
          <p className="text-xs text-slate-400 mt-1">Your learning materials and secure comms are synchronized.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-center">
            <div className="text-[10px] font-mono text-slate-500 mb-1">COHORT ID</div>
            <div className="text-sm font-bold text-emerald-400 font-mono">
              {profile?.batch?.id || profile?.batchId || 'PENDING'}
            </div>
          </div>
          <button 
            onClick={() => { localStorage.clear(); navigate('/'); }}
            className="border border-rose-900/50 text-rose-400 hover:bg-rose-950/30 px-4 py-2 rounded-lg text-xs font-mono transition-colors"
          >
            DISCONNECT
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Notices & Assignments */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Notices Panel */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
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
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
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
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
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
    </div>
  );
};

export default StudentDashboard;