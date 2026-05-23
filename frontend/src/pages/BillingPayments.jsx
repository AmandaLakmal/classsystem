import React, { useState, useEffect } from 'react';
import {
  CreditCard, Search, Plus, Filter, MoreVertical,
  CheckCircle, Clock, FileText, AlertCircle, TrendingUp
} from 'lucide-react';
import axios from 'axios';

const API = 'http://localhost:8080/api/v1';

// ── Shared components ────────────────────────────────────────────────────────

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
      {trend && (
        <p className="text-xs font-medium text-emerald-500 mt-2 flex items-center gap-1">
          <TrendingUp size={12} /> {trend}
        </p>
      )}
    </div>
    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
      <Icon size={20} className="text-indigo-600 dark:text-indigo-400" />
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const BillingPayments = () => {
  const token = localStorage.getItem('token');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [newPayment, setNewPayment] = useState({
    studentId: '',
    courseId: '',
    amount: '',
    month: new Date().toISOString().slice(0, 7), // YYYY-MM
    dueDate: '',
    notes: ''
  });

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [payRes, stuRes, crsRes] = await Promise.all([
        axios.get(`${API}/payment/get-all`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/student/get-all`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/course/get-all`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }))
      ]);
      setPayments(payRes.data);
      setStudents(stuRes.data);
      setCourses(crsRes.data || []);
    } catch (err) {
      console.error('Failed to load billing data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Handle Mark as Paid
  const handleMarkPaid = async (paymentId) => {
    try {
      await axios.put(`${API}/payment/update-status/${paymentId}?status=PAID`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData(); // Refresh to get the new PAID status and date
    } catch (err) {
      alert('Failed to update status');
    }
  };

  // Handle Create Payment Record
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/payment/save`, {
        ...newPayment,
        courseId: newPayment.courseId || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert('Failed to create payment record');
    }
  };

  // Derived metrics
  const totalCollected = payments.filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingCount = payments.filter(p => p.status === 'PENDING').length;

  // Filtering
  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.studentName.toLowerCase().includes(search.toLowerCase()) ||
                          (p.studentRegId && p.studentRegId.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Billing & Payments</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage tuition fees, track payments, and send receipts.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-indigo-500/30"
        >
          <Plus size={18} /> Record Fee
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Collected" value={`LKR ${totalCollected.toLocaleString()}`} icon={CreditCard} trend="+12% from last month" />
        <StatCard title="Pending Payments" value={pendingCount} icon={Clock} />
        <StatCard title="Total Records" value={payments.length} icon={FileText} />
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'PENDING', 'PAID', 'OVERDUE'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === status 
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Student</th>
                <th className="px-6 py-4 font-semibold">Month / Course</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Due Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">Loading payments...</td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">No payment records found.</td>
                </tr>
              ) : (
                filteredPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900 dark:text-white">{payment.studentName}</p>
                      <p className="text-xs text-slate-500 font-mono">{payment.studentRegId}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900 dark:text-white">{payment.month}</p>
                      <p className="text-xs text-slate-500">{payment.courseName || 'General Tuition'}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      LKR {payment.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {payment.dueDate}
                    </td>
                    <td className="px-6 py-4">
                      {payment.status === 'PAID' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                          <CheckCircle size={12} /> Paid
                        </span>
                      )}
                      {payment.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                          <Clock size={12} /> Pending
                        </span>
                      )}
                      {payment.status === 'OVERDUE' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
                          <AlertCircle size={12} /> Overdue
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {payment.status !== 'PAID' && (
                        <button
                          onClick={() => handleMarkPaid(payment.id)}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          Mark as Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-slide-in">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Record Fee Payment</h3>
              <p className="text-sm text-slate-500 mt-1">Create a new fee record. Triggers an SMS reminder if pending.</p>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Student</label>
                <select 
                  required
                  value={newPayment.studentId}
                  onChange={e => setNewPayment({...newPayment, studentId: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">Select Student...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.studentRegId})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Amount (LKR)</label>
                  <input
                    type="number"
                    required
                    value={newPayment.amount}
                    onChange={e => setNewPayment({...newPayment, amount: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Month</label>
                  <input
                    type="month"
                    required
                    value={newPayment.month}
                    onChange={e => setNewPayment({...newPayment, month: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={newPayment.dueDate}
                  onChange={e => setNewPayment({...newPayment, dueDate: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPayments;
