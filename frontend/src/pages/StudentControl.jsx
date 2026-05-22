import React, { useState, useEffect } from 'react';
import { GraduationCap } from 'lucide-react';

const inputClass = "w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all";

// ── Subject badge pill ────────────────────────────────────────────────────────
const SubjectBadge = ({ name }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
    {name}
  </span>
);

const StudentControl = () => {
  const [students,     setStudents]     = useState([]);
  const [enrollments,  setEnrollments]  = useState([]); // all enrollments
  const [courses,      setCourses]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [search,       setSearch]       = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token   = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

        const [stuRes, enrollRes, courseRes] = await Promise.all([
          fetch('http://localhost:8080/api/v1/student/get-all',    { headers }),
          fetch('http://localhost:8080/api/v1/enrolment/get-all',  { headers }),
          fetch('http://localhost:8080/api/v1/course/get-all',     { headers }),
        ]);

        if (!stuRes.ok) throw new Error(`Server returned status ${stuRes.status}`);
        setStudents(await stuRes.json());

        // Enrollment & course data are nice-to-have — fail gracefully
        if (enrollRes.ok) setEnrollments(await enrollRes.json());
        if (courseRes.ok) setCourses(await courseRes.json());

      } catch (err) {
        console.error('Data fetch exception:', err);
        setError('Failed to retrieve student roster. Verify upstream connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Build a lookup: studentId → [courseName, …]
  const subjectsByStudent = React.useMemo(() => {
    const map = {};
    enrollments.forEach(e => {
      if (!e.student?.id) return;
      const sid = e.student.id;
      if (!map[sid]) map[sid] = [];
      const course = courses.find(c => c.id === (e.course?.id || e.courseId));
      const name   = course?.courseName || e.course?.courseName || `Course #${e.course?.id || e.courseId}`;
      if (!map[sid].includes(name)) map[sid].push(name);
    });
    return map;
  }, [enrollments, courses]);

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.firstName?.toLowerCase().includes(q) ||
      s.lastName?.toLowerCase().includes(q)  ||
      s.email?.toLowerCase().includes(q)     ||
      s.studentRegId?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Students</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage enrolled students and their subject enrolments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-semibold">
            {students.length} Enrolled
          </div>
          <input
            type="text" placeholder="Search students…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputClass} max-w-[220px]`}
          />
        </div>
      </div>

      {/* ── Error ─────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-sm">
          <span className="font-semibold shrink-0">Error:</span>
          <span>{error}</span>
        </div>
      )}

      {/* ── Loading ──────────────────────────────────────────────── */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-60 gap-3">
          <div className="w-8 h-8 border-2 border-slate-200 dark:border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Loading student registry…</p>
        </div>
      )}

      {/* ── Table ───────────────────────────────────────────────── */}
      {!loading && !error && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                  {['Reg ID', 'Full Name', 'Email', 'Contact', 'Subjects', 'Status'].map((h, i) => (
                    <th key={h} className={`px-6 py-3.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${i === 5 ? 'text-center' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                      <GraduationCap className="w-10 h-10 mb-3 mx-auto text-slate-300 dark:text-slate-700" />
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {search ? 'No students match your search' : 'No students enrolled yet'}
                      </p>
                    </td>
                  </tr>
                ) : filtered.map((student) => {
                  const subjects = subjectsByStudent[student.id] || [];
                  return (
                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      {/* Reg ID */}
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-md">
                          {student.studentRegId || 'N/A'}
                        </span>
                      </td>
                      {/* Name */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{`${student.firstName} ${student.lastName}`}</p>
                      </td>
                      {/* Email */}
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-mono">{student.email}</td>
                      {/* Contact */}
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-mono">{student.contactNumber || '—'}</td>
                      {/* Subjects */}
                      <td className="px-6 py-4">
                        {subjects.length === 0 ? (
                          <span className="text-xs text-slate-300 dark:text-slate-600 italic">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {subjects.map(name => <SubjectBadge key={name} name={name} />)}
                          </div>
                        )}
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        {student.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />Inactive
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentControl;