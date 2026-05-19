import React, { useState, useEffect } from 'react';

const BatchSchedules = () => {
  // 1. UPDATED FORM STATE (Matches BatchSaveDTO exactly)
  const [year, setYear] = useState('');
  const [batchName, setBatchName] = useState('');
  const [locationId, setLocationId] = useState('');
  
  // UI & Data State
  const [batches, setBatches] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);

  const fetchBatches = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/v1/batch/get-all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setBatches(data);
      } else {
        throw new Error('Endpoint mapping missing or unauthorized.');
      }
    } catch (err) {
      console.warn("Backend fetch failed. Displaying empty registry.", err);
      setBatches([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:8080/api/v1/batch/save', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        // 2. UPDATED PAYLOAD (Perfectly matches BatchSaveDTO)
        body: JSON.stringify({ 
          year: year, 
          batchName: batchName,
          isActive: true,
          locationId: locationId ? parseInt(locationId) : null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to initialize classroom batch in database.');
      }

      setStatusMessage({ type: 'success', text: 'CLASSROOM INITIALIZED: Cohort successfully registered.' });
      setYear('');
      setBatchName('');
      setLocationId('');
      
      fetchBatches();

    } catch (error) {
      console.error(error);
      setStatusMessage({ type: 'error', text: `[ INITIALIZATION_FAILED ] ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-100">Batch & Cohort Schedules</h3>
          <p className="text-xs text-slate-400 mt-1">Manage active classroom environments and course assignments</p>
        </div>
        <div className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg text-xs font-mono">
          Active Cohorts: <span className="text-emerald-400 font-bold">{batches.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT PANEL: BATCH CREATOR FORM */}
        <div className="lg:col-span-1 bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-2xl h-fit">
          <h4 className="text-sm font-mono text-emerald-400 uppercase tracking-wider mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            Initialize New Cohort
          </h4>

          {statusMessage && (
            <div className={`p-3 rounded-lg text-xs font-mono mb-6 border ${statusMessage.type === 'error' ? 'bg-rose-950/40 border-rose-900/60 text-rose-400' : 'bg-emerald-950/40 border-emerald-900/60 text-emerald-400'}`}>
              {statusMessage.text}
            </div>
          )}

          <form onSubmit={handleCreateBatch} className="space-y-4">
            {/* 3. UPDATED INPUTS TO MATCH DTO */}
            <div>
              <label className="text-xs font-mono text-slate-500 mb-1 block">ACADEMIC YEAR</label>
              <input 
                type="text" 
                required
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g., 2026"
                className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 text-slate-200 p-2.5 rounded-lg text-sm font-mono outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-500 mb-1 block">COHORT / BATCH NAME</label>
              <input 
                type="text" 
                required
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                placeholder="e.g., GURU-A"
                className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 text-slate-200 p-2.5 rounded-lg text-sm outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-500 mb-1 block">LOCATION ID (Optional)</label>
              <input 
                type="text" 
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                placeholder="e.g., 1"
                className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 text-slate-200 p-2.5 rounded-lg text-sm font-mono outline-none transition-colors"
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg text-xs font-bold font-mono tracking-widest uppercase transition-colors mt-2 ${
                isSubmitting ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              {isSubmitting ? 'INITIALIZING...' : 'Create Classroom Batch'}
            </button>
          </form>
        </div>

        {/* RIGHT PANEL: BATCH REGISTRY GRID */}
        <div className="lg:col-span-2 border border-slate-800 bg-slate-950 rounded-xl overflow-hidden shadow-2xl flex flex-col">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
             <h4 className="text-sm font-mono text-slate-400 uppercase tracking-wider">Cohort Database</h4>
             <button onClick={fetchBatches} className="text-xs font-mono text-emerald-500 hover:text-emerald-400">
               [ FORCE SYNC ]
             </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm text-slate-300">
              <thead className="bg-slate-900 text-xs font-mono uppercase text-slate-500 tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">DB ID</th>
                  <th className="p-4">Academic Year</th>
                  <th className="p-4">Batch Name</th>
                  <th className="p-4">Location ID</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-xs font-mono text-slate-500 animate-pulse">
                      Querying database registries...
                    </td>
                  </tr>
                ) : batches.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-xs font-mono text-slate-600 uppercase tracking-widest border-t border-dashed border-slate-800">
                      NO ACTIVE COHORTS. INITIALIZE A BATCH TO BEGIN.
                    </td>
                  </tr>
                ) : (
                  batches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4 font-mono text-slate-500 text-xs">#{batch.id}</td>
                      <td className="p-4 font-medium text-slate-200">{batch.year || '—'}</td>
                      <td className="p-4 font-mono text-emerald-400 font-semibold">{batch.batchName || '—'}</td>
                      <td className="p-4 text-slate-400 text-xs">{batch.locationId || '—'}</td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                          {batch.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
                        </span>
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