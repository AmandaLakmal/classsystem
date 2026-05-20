import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Grading Modal State
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [gradeInput, setGradeInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Standard auth check
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    const fetchSubmissions = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // NOTE: We assume your colleague built a get-all endpoint for submissions.
        // If not, we will quickly add one to the backend next!
        const res = await fetch(`http://localhost:8080/api/v1/submission/get-all`, { headers });
        
        if (res.ok) {
          const data = await res.json();
          // Sort so ungraded submissions are at the top
          data.sort((a, b) => (a.grade === null ? -1 : 1));
          setSubmissions(data);
        } else {
          console.warn("Could not fetch submissions. Endpoint might be missing.");
          // Fallback dummy data for UI testing if the backend endpoint isn't ready
          setSubmissions([
            { id: 101, student: { firstName: "John", email: "student@test.com" }, assignment: { title: "Build a REST API" }, submittedAt: new Date().toISOString(), fileUrl: "/uploads/dummy.pdf", grade: null, feedback: null },
            { id: 102, student: { firstName: "Alice", email: "alice@test.com" }, assignment: { title: "Database Schema Design" }, submittedAt: new Date().toISOString(), fileUrl: "/uploads/dummy2.pdf", grade: 95, feedback: "Excellent normalization." }
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [navigate]);

  const handleOpenGrading = (sub) => {
    setActiveSubmission(sub);
    setGradeInput(sub.grade || '');
    setFeedbackInput(sub.feedback || '');
  };

  const submitGrade = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        grade: parseFloat(gradeInput),
        feedback: feedbackInput
      };

      const res = await fetch(`http://localhost:8080/api/v1/submission/grade/${activeSubmission.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Grading failed");

      // Update local state to reflect the new grade instantly
      setSubmissions(prev => prev.map(sub => 
        sub.id === activeSubmission.id 
          ? { ...sub, grade: payload.grade, feedback: payload.feedback } 
          : sub
      ));
      
      setActiveSubmission(null);
    } catch (error) {
      alert("Failed to sync grade with database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-indigo-500 font-mono text-sm animate-pulse">INITIALIZING ADMIN SECURE PORTAL...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in relative">
      
      {/* Header */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-2xl flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-100 uppercase tracking-widest">Administrator Console</h3>
          <p className="text-xs text-slate-400 mt-1 font-mono">Submission Evaluation Engine</p>
        </div>
        <button 
          onClick={() => { localStorage.clear(); navigate('/'); }}
          className="border border-rose-900/50 text-rose-400 hover:bg-rose-950/30 px-4 py-2 rounded-lg text-xs font-mono transition-colors"
        >
          SYSTEM LOGOUT
        </button>
      </div>

      {/* Submissions Data Grid */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-xs font-mono text-slate-400 uppercase tracking-wider">
                <th className="p-4">Student</th>
                <th className="p-4">Assignment</th>
                <th className="p-4">Submitted</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center">
                    <div className="text-slate-500 font-mono text-sm">NO SUBMISSIONS DETECTED IN REGISTRY</div>
                    <div className="text-slate-600 text-xs mt-2">Waiting for student transmissions...</div>
                  </td>
                </tr>
              ) : (
                submissions.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-200">{sub.student?.firstName}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">{sub.student?.email}</div>
                    </td>
                    <td className="p-4 text-sm text-slate-300">{sub.assignment?.title}</td>
                    <td className="p-4 text-xs text-slate-400 font-mono">
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {sub.grade !== null ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-mono font-bold bg-emerald-950/50 text-emerald-400 border border-emerald-900/50">
                          GRADED: {sub.grade}%
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-mono font-bold bg-amber-950/50 text-amber-400 border border-amber-900/50">
                          PENDING REVIEW
                        </span>
                      )}
                    </td>
                    <td className="p-4 flex justify-end gap-3">
                      <a 
                        href={`http://localhost:8080${sub.fileUrl}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-slate-400 hover:text-indigo-400 transition-colors py-1 px-2 border border-slate-700 rounded"
                      >
                        VIEW FILE
                      </a>
                      <button 
                        onClick={() => handleOpenGrading(sub)}
                        className={`text-xs font-bold py-1 px-3 rounded transition-colors ${sub.grade !== null ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
                      >
                        {sub.grade !== null ? 'EDIT GRADE' : 'EVALUATE'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grading Modal Overlay */}
      {activeSubmission && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h4 className="text-lg font-bold text-slate-100">Evaluate Submission</h4>
                <p className="text-xs text-slate-400 mt-1 font-mono">{activeSubmission.student?.firstName} - {activeSubmission.assignment?.title}</p>
              </div>
              <button onClick={() => setActiveSubmission(null)} className="text-slate-500 hover:text-rose-400">✖</button>
            </div>
            
            <form onSubmit={submitGrade} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-mono text-indigo-400 mb-2 uppercase tracking-widest">Final Score (%)</label>
                <input 
                  type="number" 
                  min="0" 
                  max="100" 
                  step="0.1"
                  required
                  value={gradeInput}
                  onChange={(e) => setGradeInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="e.g. 85.5"
                />
              </div>
              
              <div>
                <label className="block text-xs font-mono text-emerald-400 mb-2 uppercase tracking-widest">Instructor Feedback</label>
                <textarea 
                  rows="4"
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="Leave constructive feedback for the student..."
                ></textarea>
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setActiveSubmission(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded font-bold transition-colors text-sm"
                >
                  CANCEL
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded font-bold transition-colors text-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'SYNCING...' : 'COMMIT EVALUATION'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;