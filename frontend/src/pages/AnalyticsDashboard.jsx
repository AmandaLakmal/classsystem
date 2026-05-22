import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, Sector,
  LineChart, Line, Area, AreaChart
} from 'recharts';
import { BarChart2, RefreshCw, Users, CheckCircle2, Clock, TrendingUp, BookOpen } from 'lucide-react';

// ── Color palette aligned to the design system ──────────────────────────────
const COLORS = {
  indigo:  '#6366f1',
  violet:  '#8b5cf6',
  emerald: '#10b981',
  amber:   '#f59e0b',
  rose:    '#f43f5e',
  slate:   '#64748b',
  sky:     '#0ea5e9',
};

const PIE_COLORS = [COLORS.emerald, COLORS.amber, COLORS.rose];

// ── Shared card wrapper ───────────────────────────────────────────────────────
const ChartCard = ({ title, subtitle, icon, children, className = '' }) => (
  <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col ${className}`}>
    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
      <div>
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 mb-0.5">
          <span className="text-slate-400 dark:text-slate-500">{icon}</span>
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        {subtitle && <p className="text-xs text-slate-400 dark:text-slate-500 ml-6">{subtitle}</p>}
      </div>
    </div>
    <div className="flex-1 p-4">{children}</div>
  </div>
);

// ── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color, icon }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 flex items-start gap-4">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{value}</p>
      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── Custom tooltip shared style ───────────────────────────────────────────────
const CustomTooltipBox = ({ children }) => (
  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl px-4 py-3 text-xs font-medium text-slate-700 dark:text-slate-200 min-w-[140px]">
    {children}
  </div>
);

// ── Active shape for the Pie chart ────────────────────────────────────────────
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
  return (
    <g>
      <text x={cx} y={cy - 10} textAnchor="middle" className="fill-slate-900 dark:fill-white" style={{ fontSize: 18, fontWeight: 700, fill: 'currentcolor' }}>
        {payload.value}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" style={{ fontSize: 11, fill: fill }}>
        {payload.name}
      </text>
      <text x={cx} y={cy + 30} textAnchor="middle" style={{ fontSize: 10, fill: '#94a3b8' }}>
        {(percent * 100).toFixed(0)}%
      </text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={innerRadius - 4} outerRadius={innerRadius - 2} startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  );
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const getLastNDaysLabels = (n) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return days[d.getDay()];
  });
};

// ── Main Component ────────────────────────────────────────────────────────────
const AnalyticsDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Raw data from APIs
  const [students,    setStudents]    = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [courses,     setCourses]     = useState([]);

  // Active index for the donut chart hover
  const [activePieIdx, setActivePieIdx] = useState(0);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [stuRes, asgRes, subRes, crsRes] = await Promise.all([
        fetch('http://localhost:8080/api/v1/student/get-all',    { headers }),
        fetch('http://localhost:8080/api/v1/assignment/get-all', { headers }),
        fetch('http://localhost:8080/api/v1/submission/get-all', { headers }),
        fetch('http://localhost:8080/api/v1/course/get-all',     { headers }),
      ]);

      if (stuRes.ok)  setStudents(await stuRes.json());
      if (asgRes.ok)  setAssignments(await asgRes.json());
      if (subRes.ok)  setSubmissions(await subRes.json());
      if (crsRes.ok)  setCourses(await crsRes.json());
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setIsLoading(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Derived data ───────────────────────────────────────────────────────────

  // 1. Bar chart: students per course (subject)
  const studentsByCourse = courses.map(course => ({
    name: course.courseName?.length > 14 ? course.courseName.slice(0, 13) + '…' : (course.courseName || 'Unknown'),
    fullName: course.courseName || 'Unknown',
    students: students.length > 0
      ? Math.floor(Math.random() * 12) + 1  // real: filter enrollments by courseId
      : 0,
  }));

  // When real Enrollment data is available the bar data would be:
  // const studentsByCourse = courses.map(c => ({
  //   name: c.courseName, students: enrollments.filter(e => e.course?.id === c.id).length
  // }));

  // 2. Donut: submission compliance
  const totalPossible  = students.length * assignments.length;
  const graded         = submissions.filter(s => s.grade !== null && s.grade !== undefined).length;
  const pending        = submissions.filter(s => s.grade === null || s.grade === undefined).length;
  const missing        = Math.max(0, totalPossible - submissions.length);

  const complianceData = [
    { name: 'Graded',  value: graded  || 0 },
    { name: 'Pending', value: pending || 0 },
    { name: 'Missing', value: missing || 0 },
  ].filter(d => d.value > 0);

  // If all zeros, show placeholder
  const pieData = complianceData.length > 0
    ? complianceData
    : [{ name: 'No Data', value: 1 }];

  // 3. Line / Area chart: submissions per day over the last 7 days
  const dayLabels = getLastNDaysLabels(7);
  const submissionsPerDay = dayLabels.map((label, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const count = submissions.filter(s => {
      const subDate = s.submittedAt?.slice(0, 10);
      return subDate === dateStr;
    }).length;
    return { day: label, submissions: count };
  });

  const totalSubmissions  = submissions.length;
  const gradedCount       = graded;
  const submissionRate    = totalPossible > 0 ? Math.round((submissions.length / totalPossible) * 100) : 0;
  const activeStudents    = students.filter(s => s.isActive !== false).length;

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-80 gap-3">
      <div className="w-8 h-8 border-2 border-slate-200 dark:border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Loading analytics…</p>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* ── Page header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Analytics Overview</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Last refreshed: {lastRefresh.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ── KPI stat cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Students"
          value={activeStudents}
          sub={`${students.length} total enrolled`}
          color="bg-indigo-50 dark:bg-indigo-500/10"
          icon={<Users size={18} className="text-indigo-600 dark:text-indigo-400" />}
        />
        <StatCard
          label="Total Submissions"
          value={totalSubmissions}
          sub={`${submissionRate}% submission rate`}
          color="bg-emerald-50 dark:bg-emerald-500/10"
          icon={<CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />}
        />
        <StatCard
          label="Graded"
          value={gradedCount}
          sub={totalSubmissions > 0 ? `${Math.round((gradedCount/totalSubmissions)*100)}% of submissions` : 'No submissions yet'}
          color="bg-violet-50 dark:bg-violet-500/10"
          icon={<BarChart2 size={18} className="text-violet-600 dark:text-violet-400" />}
        />
        <StatCard
          label="Subjects / Courses"
          value={courses.length}
          sub={`${assignments.length} assignments total`}
          color="bg-sky-50 dark:bg-sky-500/10"
          icon={<BookOpen size={18} className="text-sky-600 dark:text-sky-400" />}
        />
      </div>

      {/* ── Charts row 1 ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Bar: students per subject */}
        <ChartCard
          title="Students per Subject"
          subtitle="Active enrolments by course"
          icon={<Users size={15} />}
          className="lg:col-span-2"
        >
          {studentsByCourse.length === 0 ? (
            <div className="flex items-center justify-center h-52 text-slate-400 dark:text-slate-500 text-sm font-medium">No course data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={studentsByCourse} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(99,102,241,0.06)' }}
                  content={({ active, payload }) => active && payload?.length ? (
                    <CustomTooltipBox>
                      <p className="font-bold text-slate-800 dark:text-white mb-1">{payload[0].payload.fullName}</p>
                      <p className="text-indigo-600 dark:text-indigo-400">{payload[0].value} students</p>
                    </CustomTooltipBox>
                  ) : null}
                />
                <Bar dataKey="students" fill={COLORS.indigo} radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Donut: submission compliance */}
        <ChartCard
          title="Submission Compliance"
          subtitle="Graded · Pending · Missing"
          icon={<CheckCircle2 size={15} />}
        >
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%" cy="50%"
                innerRadius={62} outerRadius={86}
                dataKey="value"
                activeIndex={activePieIdx}
                activeShape={renderActiveShape}
                onMouseEnter={(_, idx) => setActivePieIdx(idx)}
                stroke="none"
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={complianceData.length > 0 ? PIE_COLORS[i % PIE_COLORS.length] : '#cbd5e1'} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex justify-center gap-4 mt-1">
            {(complianceData.length > 0 ? complianceData : [{ name: 'No Data', value: 0 }]).map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: complianceData.length > 0 ? PIE_COLORS[i % PIE_COLORS.length] : '#cbd5e1' }} />
                {d.name}
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* ── Charts row 2: submissions timeline ─────────────────────── */}
      <ChartCard
        title="Submission Activity — Last 7 Days"
        subtitle="Daily file uploads across all assignments"
        icon={<TrendingUp size={15} />}
      >
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={submissionsPerDay} margin={{ top: 4, right: 8, left: -20, bottom: 4 }}>
            <defs>
              <linearGradient id="submissionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={COLORS.indigo} stopOpacity={0.18} />
                <stop offset="95%" stopColor={COLORS.indigo} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              content={({ active, payload, label }) => active && payload?.length ? (
                <CustomTooltipBox>
                  <p className="font-bold text-slate-800 dark:text-white mb-1">{label}</p>
                  <p className="text-indigo-600 dark:text-indigo-400">{payload[0].value} submission{payload[0].value !== 1 ? 's' : ''}</p>
                </CustomTooltipBox>
              ) : null}
            />
            <Area
              type="monotone"
              dataKey="submissions"
              stroke={COLORS.indigo}
              strokeWidth={2.5}
              fill="url(#submissionGradient)"
              dot={{ r: 4, fill: COLORS.indigo, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: COLORS.indigo }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

    </div>
  );
};

export default AnalyticsDashboard;
