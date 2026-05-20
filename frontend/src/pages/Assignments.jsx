import React, { useState, useEffect } from 'react';

const Assignments = () => {
  // --- Form State ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [courseId, setCourseId] = useState('');

  // --- UI & Data State ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [isFetchingSubs, setIsFetchingSubs] = useState(false);

  // 1. Fetch all existing assignments on load
  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8080/api/v1/assignment/get-all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setAssignments(await res.json());
    } catch (err) {
      console.warn("Could not load assignments.", err);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // 2. Handle Issuing a New Assignment
  const handleIssueAssignment = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const token = localStorage.getItem('token');
      
      // Java LocalDateTime strictly requires the seconds. HTML datetime-local omits them.
      // We append ':00' to ensure Spring Boot parses it correctly.
      const formattedDeadline = deadline.length === 16 ? `${deadline}:00` : deadline;

      const response = await fetch('http://localhost:8080/api/v1/assignment/save', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          title: title, 
          description: description, 
          deadline: formattedDeadline,
          courseId: parseInt(courseId) // Matching his DTO perfectly
        })
      });

      if (!response.ok) throw new Error('Failed to issue assignment to database.');

      setStatusMessage({ type: 'success', text: 'ASSIGNMENT ISSUED: Task is live for students.' });
      setTitle('');
      setDescription('');
      setDeadline('');
      setCourseId('');
      
      fetchAssignments();

    } catch (error) {
      console.error(error);
      setStatusMessage({ type: 'error', text: `[ ISSUE_FAILED ] ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. View Submissions for a specific assignment
  const handleViewSubmissions = async (assignment) => {
    setActiveAssignment(assignment);
    setIsFetchingSubs(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/v1/submission/assignment/${assignment.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setSubmissions(await response.json());
      } else {
        setSubmissions([]);
      }
    } catch (error) {
      setSubmissions([]);
    } finally {
      setIsFetchingSubs(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-100">Assignments & Submissions</h3>
        <p className="text-xs text-slate-400 mt-1">Issue course tasks and monitor student upload compliance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT PANEL: ASSIGNMENT CREATOR */}
        <div className="lg:col-span-1 bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-2xl h-fit">
          <h4 className="text-sm font-mono text-emerald-400 uppercase tracking-wider mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            Task Issuer
          </h4>

          {statusMessage && (
            <div className={`p-3 rounded-lg text-xs font-mono mb-6 border ${statusMessage.type === 'error' ? 'bg-rose-950/40 border-rose-900/60 text-rose-400' : 'bg-emerald-950/40 border-emerald-900/60 text-emerald-400'}`}>
              {statusMessage.text}
            </div>
          )}

          <form onSubmit={handleIssueAssignment} className="space-y-4">
            
            <div>
              <label className="text-xs font-mono text-slate-500 mb-1 block">COURSE ID TARGET</label>
              <input 
                type="number" 
                required
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                placeholder="e.g., 1"
                className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 text-slate-200 p-2.5 rounded-lg text-sm font-mono outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-500 mb-1 block">ASSIGNMENT TITLE</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Build a REST API"
                className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 text-slate-200 p-2.5 rounded-lg text-sm outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-500 mb-1 block">DEADLINE (DATE & TIME)</label>
              <input 
                type="datetime-local" 
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 text-slate-200 p-2.5 rounded-lg text-sm font-mono outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-500 mb-1 block">TASK INSTRUCTIONS</label>
              <textarea 
                required
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Upload your PDF containing..."
                className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 text-slate-200 p-2.5 rounded-lg text-sm outline-none transition-colors resize-none"
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg text-xs font-bold font-mono tracking-widest uppercase transition-colors mt-2 ${
                isSubmitting ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              {isSubmitting ? 'Transmitting...' : 'Issue Assignment'}
            </button>
          </form>
        </div>

        {/* RIGHT PANEL: DUAL WORKFLOW (Assignments -> Submissions) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Assignments Grid */}
          <div className="border border-slate-800 bg-slate-950 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[350px]">
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center sticky top-0">
               <h4 className="text-sm font-mono text-slate-400 uppercase tracking-wider">Active Assignments</h4>
               <button onClick={fetchAssignments} className="text-xs font-mono text-emerald-500 hover:text-emerald-400">
                 [ SYNC TASKS ]
               </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-3">
              {assignments.length === 0 ? (
                <div className="text-center text-xs font-mono text-slate-600 py-10 uppercase tracking-widest">No Active Assignments.</div>
              ) : (
                assignments.map(task => (
                  <div key={task.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex justify-between items-center hover:border-slate-700 transition-colors">
                    <div>
                      <h5 className="font-semibold text-slate-200">{task.title}</h5>
                      <div className="flex gap-4 mt-1">
                        <span className="text-xs text-slate-500 font-mono">COURSE ID: {task.courseId || 'N/A'}</span>
                        <span className="text-xs text-rose-400 font-mono">DUE: {new Date(task.deadline).toLocaleString()}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleViewSubmissions(task)}
                      className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-lg text-xs font-mono hover:bg-emerald-500 hover:text-slate-900 transition-colors"
                    >
                      VIEW SUBMISSIONS
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Submissions Viewer (Only shows when an assignment is clicked) */}
          {activeAssignment && (
            <div className="border border-slate-800 bg-slate-950 rounded-xl overflow-hidden shadow-2xl animate-fade-in">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                <h4 className="text-sm font-mono text-emerald-400 uppercase tracking-wider">
                  Submissions: <span className="text-slate-300">{activeAssignment.title}</span>
                </h4>
              </div>
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm text-slate-300">
                  <thead className="bg-slate-900 text-xs font-mono uppercase text-slate-500 tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-4">Submission ID</th>
                      <th className="p-4">File Link</th>
                      <th className="p-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {isFetchingSubs ? (
                      <tr><td colSpan="3" className="p-8 text-center text-xs font-mono text-slate-500 animate-pulse">Querying database...</td></tr>
                    ) : submissions.length === 0 ? (
                      <tr><td colSpan="3" className="p-8 text-center text-xs font-mono text-slate-600 uppercase tracking-widest">NO SUBMISSIONS YET.</td></tr>
                    ) : (
                      submissions.map(sub => (
                        <tr key={sub.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="p-4 font-mono text-slate-500 text-xs">#{sub.id}</td>
                          <td className="p-4 font-mono text-emerald-400 truncate max-w-[200px]">
                            <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {sub.fileUrl || '[ NO URL PROVIDED ]'}
                            </a>
                          </td>
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                              UPLOADED
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Assignments;