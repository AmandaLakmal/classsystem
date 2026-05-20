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
  
  // NEW: State to track permanently submitted tasks
  const [submittedTaskIds, setSubmittedTaskIds] = useState(new Set());
  
  // --- Submission State ---
  const [activeUploadId, setActiveUploadId] = useState(null);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Helper: Extract YouTube ID
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const parseJwt = (token) => {
    try { return JSON.parse(atob(token.split('.')[1])); } 
    catch (e) { return null; }
  };

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

        // 1. Fetch Profile
        try {
          const allRes = await fetch(`http://localhost:8080/api/v1/student/get-all`, { headers });
          if (allRes.ok) {
            const allStudents = await allRes.json();
            studentRecord = allStudents.find(s => s.email === userEmail);
          }
        } catch (e) { console.warn("Could not fetch registry."); }

        if (!studentRecord) {
          studentRecord = { firstName: "Student", batch: { id: 1 }, batchId: 1 };
        }
        setProfile(studentRecord);
        const currentBatchId = studentRecord.batch?.id || studentRecord.batchId;

        // 2. Fetch Targeted Data (Now includes their submission history!)
        const noticeReq = currentBatchId 
          ? fetch(`http://localhost:8080/api/v1/notice/batch/${currentBatchId}`, { headers })
          : Promise.resolve({ ok: true, json: () => [] });
        const assignmentReq = fetch(`http://localhost:8080/api/v1/assignment/get-all`, { headers });
        const lessonReq = fetch(`http://localhost:8080/api/v1/lession/get-all`, { headers });
        const submissionReq = fetch(`http://localhost:8080/api/v1/submission/get-all`, { headers });

        const [nRes, aRes, lRes, sRes] = await Promise.all([noticeReq, assignmentReq, lessonReq, submissionReq]);

        if (nRes.ok) setNotices(await nRes.json());
        if (aRes.ok) setAssignments(await aRes.json());
        if (lRes.ok) {
          const allLessons = await lRes.json();
          setLessons(allLessons.filter(l => !l.batchId || l.batchId === currentBatchId));
        }
        
        // NEW: Filter submissions to find ONLY this student's completed work
        if (sRes.ok) {
            const allSubs = await sRes.json();
            const myCompletedIds = allSubs
                .filter(sub => sub.student?.email === userEmail)
                .map(sub => sub.assignment?.id);
            setSubmittedTaskIds(new Set(myCompletedIds));
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

  const handleSubmitAssignment = async (e, assignmentId) => {
    e.preventDefault();
    
    const fileInput = document.getElementById(`file-input-${assignmentId}`);
    const selectedFile = fileInput?.files[0];
    
    if (!selectedFile) {
      alert("Please select a file before launching upload sequence.");
      return;
    }

    setSubmitStatus({ id: assignmentId, status: 'submitting' });

    const formData = new FormData();
    formData.append("assignmentId", assignmentId);
    formData.append("studentId", profile?.id || 1); 
    formData.append("file", selectedFile);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/v1/submission/submit', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) throw new Error('Submission rejected.');

      // NEW: Permanently lock this task in the UI immediately after success
      setSubmittedTaskIds(prev => new Set(prev).add(assignmentId));
      
      setSubmitStatus({ id: assignmentId, status: 'success' });
      setActiveUploadId(null);
      setTimeout(() => setSubmitStatus(null), 3000);

    } catch (error) {
      setSubmitStatus({ id: assignmentId, status: 'error' });
      setTimeout(() => setSubmitStatus(null), 3000);
    }
  };

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      
      {/* Portal Header */}
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
                assignments.map(task => {
                  const isAlreadySubmitted = submittedTaskIds.has(task.id);

                  return (
                    <div key={task.id} className={`bg-slate-900 border rounded-lg p-4 transition-all ${isAlreadySubmitted ? 'border-emerald-900/50 opacity-75' : 'border-slate-800'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h5 className={`font-semibold ${isAlreadySubmitted ? 'text-emerald-400' : 'text-slate-200'}`}>{task.title}</h5>
                        <span className={`text-[10px] font-mono px-2 py-1 rounded border ${isAlreadySubmitted ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-rose-400 bg-rose-400/10 border-rose-400/20'}`}>
                          {isAlreadySubmitted ? 'COMPLETED' : `DUE: ${new Date(task.deadline).toLocaleDateString()}`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-4">{task.description}</p>
                      
                      {/* NEW: Render Logic prevents re-uploading */}
                      {isAlreadySubmitted ? (
                        <div className="w-full bg-emerald-950/30 text-emerald-500 py-2 rounded text-xs font-mono text-center border border-emerald-900/30">
                          TRANSMISSION SECURED
                        </div>
                      ) : activeUploadId === task.id ? (
                        <form onSubmit={(e) => handleSubmitAssignment(e, task.id)} className="flex flex-col gap-2">
                          <input 
                            type="file" 
                            id={`file-input-${task.id}`}
                            required 
                            className="w-full text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 file:cursor-pointer"
                          />
                          <div className="flex gap-2 justify-end">
                            <button 
                              type="button" 
                              onClick={() => setActiveUploadId(null)}
                              className="text-slate-400 hover:text-slate-200 text-xs px-2 transition-colors"
                            >
                              Cancel
                            </button>
                            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded text-xs font-bold transition-colors">
                              {submitStatus?.id === task.id && submitStatus.status === 'submitting' ? 'UPLOADING...' : 'UPLOAD FILE'}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button 
                          onClick={() => setActiveUploadId(task.id)}
                          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded text-xs font-mono transition-colors"
                        >
                          SUBMIT ASSIGNMENT
                        </button>
                      )}
                    </div>
                  );
                })
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