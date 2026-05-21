import { useNavigate } from 'react-router-dom';
import { Inbox } from 'lucide-react';

// ── Shared UI Primitives ───────────────────────────────────────────────────
const Spinner = ({ color = 'indigo' }) => (
  <div className="flex flex-col items-center justify-center h-60 gap-3">
    <div className={`w-8 h-8 border-3 border-slate-200 dark:border-slate-700 border-t-${color}-600 rounded-full animate-spin`} />
    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Loading data…</p>
  </div>
);

const StatusBadge = ({ graded, score }) => graded ? (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
    Graded · {score}%
  </span>
) : (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
    Pending Review
  </span>
);

// ── Grading Modal ──────────────────────────────────────────────────────────
const GradingModal = ({ submission, onClose, onSubmit, gradeInput, setGradeInput, feedbackInput, setFeedbackInput, isSubmitting }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm"
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Evaluate Submission</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {submission.student?.firstName} · {submission.assignment?.title}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors text-lg"
        >
          ×
        </button>
      </div>

      {/* Body */}
      <form onSubmit={onSubmit} className="p-6 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Final Score (%)
          </label>
          <input
            type="number" min="0" max="100" step="0.1" required
            value={gradeInput}
            onChange={(e) => setGradeInput(e.target.value)}
            placeholder="e.g. 85.5"
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
            Instructor Feedback
          </label>
          <textarea
            rows="4"
            value={feedbackInput}
            onChange={(e) => setFeedbackInput(e.target.value)}
            placeholder="Leave constructive feedback for the student…"
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit" disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-sm shadow-indigo-500/30"
          >
            {isSubmitting ? 'Saving…' : 'Commit Evaluation'}
          </button>
        </div>
      </form>
    </div>
  </div>
);

// ── AdminDashboard ─────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [submissions,      setSubmissions]      = useState([]);
  const [isLoading,        setIsLoading]        = useState(true);
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [gradeInput,       setGradeInput]       = useState('');
  const [feedbackInput,    setFeedbackInput]    = useState('');
  const [isSubmitting,     setIsSubmitting]     = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/'); return; }

    const fetchSubmissions = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/v1/submission/get-all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          data.sort((a, b) => (a.grade === null ? -1 : 1));
          setSubmissions(data);
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
    setGradeInput(sub.grade ?? '');
    setFeedbackInput(sub.feedback ?? '');
  };

  const submitGrade = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token   = localStorage.getItem('token');
      const payload = { grade: parseFloat(gradeInput), feedback: feedbackInput };
      const res = await fetch(
        `http://localhost:8080/api/v1/submission/grade/${activeSubmission.id}`,
        { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
      );
      if (!res.ok) throw new Error('Grading failed');
      setSubmissions(prev => prev.map(s => s.id === activeSubmission.id ? { ...s, ...payload } : s));
      setActiveSubmission(null);
    } catch {
      alert('Failed to sync grade with database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Spinner color="indigo" />;

  const pending = submissions.filter(s => s.grade === null).length;
  const graded  = submissions.length - pending;

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* ── Stats row ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Submissions', value: submissions.length, color: 'text-slate-900 dark:text-white', bg: 'bg-white dark:bg-slate-900' },
            { label: 'Pending Review',    value: pending,            color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
            { label: 'Graded',           value: graded,             color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl border border-slate-200 dark:border-slate-700 px-5 py-4 shadow-sm`}>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
              <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* ── Submissions table ──────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {/* Table header bar */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">Student Submissions</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Review and grade all submitted work</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                  {['Student', 'Assignment', 'Submitted', 'Status', 'Actions'].map((h, i) => (
                    <th key={h} className={`px-6 py-3.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${i === 4 ? 'text-right' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <Inbox className="w-10 h-10 mb-3 text-slate-300 dark:text-slate-700 mx-auto" />
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No submissions yet</p>
                      <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">Submissions will appear here once students upload their work.</p>
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{sub.student?.firstName}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-mono">{sub.student?.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{sub.assignment?.title}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {new Date(sub.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge graded={sub.grade !== null} score={sub.grade} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`http://localhost:8080${sub.fileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          >
                            View File
                          </a>
                          <button
                            onClick={() => handleOpenGrading(sub)}
                            className={[
                              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0',
                              sub.grade !== null
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/30',
                            ].join(' ')}
                          >
                            {sub.grade !== null ? 'Edit Grade' : 'Evaluate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {activeSubmission && (
        <GradingModal
          submission={activeSubmission}
          onClose={() => setActiveSubmission(null)}
          onSubmit={submitGrade}
          gradeInput={gradeInput}
          setGradeInput={setGradeInput}
          feedbackInput={feedbackInput}
          setFeedbackInput={setFeedbackInput}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  );
};

export default AdminDashboard;