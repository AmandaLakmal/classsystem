import React, { useState, useEffect, useMemo } from 'react';
import { 
  GraduationCap, BookOpen, Search, Mail, Phone, MapPin, 
  ShieldCheck, AlertCircle, Users, Briefcase
} from 'lucide-react';
import axios from 'axios';

const API = 'http://localhost:8080/api/v1';
const token = localStorage.getItem('token');
const headers = { Authorization: `Bearer ${token}` };

// ── Shared components ────────────────────────────────────────────────────────

const SubjectBadge = ({ name }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
    {name}
  </span>
);

const RoleBadge = ({ role }) => {
  const isSuper = role === 'ROLE_SUPERADMIN' || role === 'ROLE_ADMIN';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
      isSuper 
        ? 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' 
        : 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
    } border`}>
      {isSuper && <ShieldCheck size={10} />}
      {role.replace('ROLE_', '')}
    </span>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const StudentControl = () => {
  const [activeTab, setActiveTab] = useState('STUDENTS'); // STUDENTS | INSTRUCTORS
  const [search, setSearch] = useState('');
  
  // Data state
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [stuRes, insRes, enrRes, crsRes] = await Promise.all([
          axios.get(`${API}/student/get-all`, { headers }),
          axios.get(`${API}/instructor/get-all`, { headers }).catch(() => ({ data: [] })),
          axios.get(`${API}/enrolment/get-all`, { headers }).catch(() => ({ data: [] })),
          axios.get(`${API}/course/get-all`, { headers }).catch(() => ({ data: [] }))
        ]);
        setStudents(stuRes.data || []);
        setInstructors(insRes.data || []);
        setEnrollments(enrRes.data || []);
        setCourses(crsRes.data || []);
      } catch (err) {
        console.error('Failed to load user data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Map enrollments to students
  const subjectsByStudent = useMemo(() => {
    const map = {};
    enrollments.forEach(e => {
      if (!e.student?.id) return;
      const sid = e.student.id;
      if (!map[sid]) map[sid] = [];
      const course = courses.find(c => c.id === (e.course?.id || e.courseId));
      const name = course?.courseName || e.course?.courseName || `Course #${e.course?.id || e.courseId}`;
      if (!map[sid].includes(name)) map[sid].push(name);
    });
    return map;
  }, [enrollments, courses]);

  // Filtering
  const q = search.toLowerCase();
  
  const filteredStudents = students.filter(s => 
    s.firstName?.toLowerCase().includes(q) || 
    s.lastName?.toLowerCase().includes(q) || 
    s.email?.toLowerCase().includes(q) || 
    s.studentRegId?.toLowerCase().includes(q)
  );

  const filteredInstructors = instructors.filter(i => 
    i.name?.toLowerCase().includes(q) || 
    i.email?.toLowerCase().includes(q) || 
    i.subject?.toLowerCase().includes(q)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* ── Header & Tabs ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Super Admin overview of all registered Students and Instructors.</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('STUDENTS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'STUDENTS' 
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Users size={16} /> Students ({students.length})
          </button>
          <button
            onClick={() => setActiveTab('INSTRUCTORS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'INSTRUCTORS' 
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Briefcase size={16} /> Instructors ({instructors.length})
          </button>
        </div>
      </div>

      {/* ── Search Bar ────────────────────────────────────────────────── */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder={`Search ${activeTab.toLowerCase()} by name or email...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
        />
      </div>

      {/* ── Data Grids ────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-8 h-8 border-2 border-slate-200 dark:border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-xs font-medium text-slate-500">Loading user registry...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[800px]">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
                {activeTab === 'STUDENTS' ? (
                  <tr>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Enrolled Subjects</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-6 py-4">Instructor</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Specialization</th>
                    <th className="px-6 py-4">Privileges</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {/* STUDENTS VIEW */}
                {activeTab === 'STUDENTS' && (
                  filteredStudents.length === 0 ? (
                    <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-500">No students found.</td></tr>
                  ) : filteredStudents.map(student => {
                    const subjects = subjectsByStudent[student.id] || [];
                    return (
                      <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                              {student.profilePhotoUrl ? (
                                <img src={`http://localhost:8080${student.profilePhotoUrl}`} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="font-bold text-slate-500 dark:text-slate-400 text-xs">{student.firstName[0]}{student.lastName[0]}</span>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{student.firstName} {student.lastName}</p>
                              <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded inline-block mt-1">
                                {student.studentRegId || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 space-y-1">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs"><Mail size={12}/> {student.email}</div>
                          {student.contactNumber && <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs"><Phone size={12}/> {student.contactNumber}</div>}
                          {student.emergencyContact && <div className="flex items-center gap-2 text-rose-500 text-xs" title="Emergency Contact"><AlertCircle size={12}/> {student.emergencyContact}</div>}
                        </td>
                        <td className="px-6 py-4">
                          {subjects.length === 0 ? <span className="text-slate-400 italic text-xs">No enrollments</span> : (
                            <div className="flex flex-wrap gap-1">
                              {subjects.map(s => <SubjectBadge key={s} name={s} />)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold ${
                            student.isActive 
                              ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400' 
                              : 'text-slate-500 bg-slate-100 dark:bg-slate-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${student.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            {student.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}

                {/* INSTRUCTORS VIEW */}
                {activeTab === 'INSTRUCTORS' && (
                  filteredInstructors.length === 0 ? (
                    <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-500">No instructors found.</td></tr>
                  ) : filteredInstructors.map(instructor => (
                    <tr key={instructor.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                            {instructor.profilePhotoUrl ? (
                              <img src={`http://localhost:8080${instructor.profilePhotoUrl}`} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-bold text-slate-500 dark:text-slate-400 text-xs">{instructor.name[0]}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{instructor.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Joined recently</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs"><Mail size={12}/> {instructor.email}</div>
                        {instructor.contactNumber && <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs"><Phone size={12}/> {instructor.contactNumber}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <BookOpen size={14} className="text-indigo-500" />
                          {instructor.subject || 'Unassigned'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <RoleBadge role={instructor.role} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentControl;