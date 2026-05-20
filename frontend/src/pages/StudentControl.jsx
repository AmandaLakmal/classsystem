import React, { useState, useEffect } from 'react';

const StudentControl = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
  const fetchStudents = async () => {
    try {
      // 1. Grab the token from local storage
      const token = localStorage.getItem('token');
      
      // 2. Attach it to the Authorization header
      const response = await fetch('http://localhost:8080/api/v1/student/get-all', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      setStudents(data);
      
    } catch (error) {
      console.error("Data fetch exception:", error);
        setError('Failed to retrieve student roster. Verify upstream connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-100">Student Control Registry</h3>
          <p className="text-xs text-slate-400 mt-1">Real-time synchronization with primary database core</p>
        </div>
        <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-mono">
          Total Records: {students.length}
        </div>
      </div>

      {/* Conditional Rendering Blocks */}
      {loading && (
        <div className="text-center py-12 text-sm font-mono text-slate-500 animate-pulse">
          🔍 Querying database registries...
        </div>
      )}

      {error && (
        <div className="bg-rose-950/40 border border-rose-900/60 text-rose-400 p-4 rounded-lg text-xs font-mono uppercase">
          [ DATA_FETCH_ERROR ] {error}
        </div>
      )}

      {/* Data Presentation Grid */}
      {!loading && !error && (
        <div className="border border-slate-800 bg-slate-950 rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm text-slate-300">
              <thead className="bg-slate-900 text-xs font-mono uppercase text-slate-400 tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Reg ID</th>
                  <th className="p-4">Full Name</th>
                  <th className="p-4">Email Channel</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-xs font-mono text-slate-500">
                      NO RECORDS FOUND. DATABASE FLUSHED OR EMPTY.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4 font-mono text-emerald-400 font-semibold">{student.studentRegId || 'N/A'}</td>
                      <td className="p-4 font-medium text-slate-200">{`${student.firstName} ${student.lastName}`}</td>
                      <td className="p-4 text-slate-400 font-mono text-xs">{student.email}</td>
                      <td className="p-4 text-slate-400 font-mono text-xs">{student.contactNumber || '—'}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          student.isActive 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                            : 'bg-slate-800 border-slate-700 text-slate-500'
                        }`}>
                          {student.isActive ? 'Active' : 'Inactive'}
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
  );
};

export default StudentControl;