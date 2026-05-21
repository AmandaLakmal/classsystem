import React, { useState, useEffect } from 'react';

const inputClass = "w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all";

import { RefreshCw, Plus, Building2 } from 'lucide-react';

const BatchSchedules = () => {
  const [year,          setYear]          = useState('');
  const [batchName,     setBatchName]     = useState('');
  const [locationId,    setLocationId]    = useState('');
  const [batches,       setBatches]       = useState([]);
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [isLoading,     setIsLoading]     = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);

  const fetchBatches = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/v1/batch/get-all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setBatches(await response.json());
      } else {
        throw new Error('Endpoint mapping missing or unauthorized.');
      }
    } catch (err) {
      console.warn('Backend fetch failed. Displaying empty registry.', err);
      setBatches([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchBatches(); }, []);

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/v1/batch/save', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year, batchName, isActive: true,
          locationId: locationId ? parseInt(locationId) : null,
        }),
      });
      if (!response.ok) throw new Error('Failed to initialize classroom batch in database.');
      setStatusMessage({ type: 'success', text: 'Classroom batch created successfully.' });
      setYear(''); setBatchName(''); setLocationId('');
      fetchBatches();
    } catch (error) {
      console.error(error);
      setStatusMessage({ type: 'error', text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Batch Schedules</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage active classroom environments and cohort assignments
          </p>
        </div>
        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{batches.length}</span> Active Cohorts
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: Create Batch Form ───────────────────────────── */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden h-fit">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-white">New Cohort</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Initialize a new classroom batch</p>
          </div>

          <div className="p-6 space-y-4">
            {statusMessage && (
              <div className={`flex items-start gap-2.5 p-3.5 rounded-xl text-sm border ${
                statusMessage.type === 'error'
                  ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400'
                  : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
              }`}>
                <span className="font-semibold shrink-0">{statusMessage.type === 'error' ? 'Error:' : '✓'}</span>
                {statusMessage.text}
              </div>
            )}

            <form onSubmit={handleCreateBatch} className="space-y-4">
              {[
                { label: 'Academic Year', value: year, set: setYear, placeholder: 'e.g. 2026', type: 'text', required: true },
                { label: 'Cohort / Batch Name', value: batchName, set: setBatchName, placeholder: 'e.g. GURU-A', type: 'text', required: true },
                { label: 'Location ID', value: locationId, set: setLocationId, placeholder: 'e.g. 1 (optional)', type: 'text', required: false },
              ].map(({ label, value, set, placeholder, type, required }) => (
                <div key={label}>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    {label}
                  </label>
                  <input
                    type={type} required={required} value={value}
                    onChange={(e) => set(e.target.value)}
                    placeholder={placeholder} className={inputClass}
                  />
                </div>
              ))}

              <button
                type="submit" disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-sm shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 mt-2"
              >
                <Plus size={15} />
                {isSubmitting ? 'Creating…' : 'Create Batch'}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: Batch Registry Table ───────────────────────── */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Cohort Registry</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">All registered classroom batches</p>
            </div>
            <button
              onClick={fetchBatches}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                  {['ID', 'Academic Year', 'Batch Name', 'Location', 'Status'].map((h, i) => (
                    <th key={h} className={`px-6 py-3.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${i === 4 ? 'text-center' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-slate-200 dark:border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
                        <p className="text-xs text-slate-400 dark:text-slate-500">Loading batches…</p>
                      </div>
                    </td>
                  </tr>
                ) : batches.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <Building2 className="w-10 h-10 mb-3 mx-auto text-slate-300 dark:text-slate-700" />
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No batches found</p>
                      <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">Create your first cohort using the form on the left</p>
                    </td>
                  </tr>
                ) : (
                  batches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">#{batch.id}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                        {batch.year || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                          {batch.batchName || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {batch.locationId || '—'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {batch.isActive !== false ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Inactive
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchSchedules;