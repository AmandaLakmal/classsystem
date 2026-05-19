import React, { useState, useEffect } from 'react';

const AcademicModules = () => {
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  
  // Data State
  const [batches, setBatches] = useState([]);
  const [modules, setModules] = useState([]);
  
  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  // Helper function to safely extract YouTube Video IDs
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  // 1. Fetch available Batches for the Dropdown on load
  useEffect(() => {
    const loadBatches = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8080/api/v1/batch/get-all', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setBatches(await res.json());
      } catch (err) {
        console.warn("Could not load batches for dropdown.");
      }
    };
    loadBatches();
  }, []);

  // 2. Handle Publishing a New Lesson Module
  const handlePublish = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const token = localStorage.getItem('token');
      
      // FIXED ENDPOINT: Using his exact "lession" mapping
      const response = await fetch('http://localhost:8080/api/v1/lession/save', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          title: title, 
          description: description, 
          videoUrl: videoUrl,
          batchId: parseInt(selectedBatchId) 
        })
      });

      if (!response.ok) throw new Error('Failed to publish module. DTO mismatch likely.');

      setStatusMessage({ type: 'success', text: 'MODULE PUBLISHED: Course material is now live.' });
      setTitle('');
      setDescription('');
      setVideoUrl('');
      
      // Auto-refresh the feed after publishing
      handleSyncFeed(new Event('submit'));

    } catch (error) {
      console.error(error);
      setStatusMessage({ type: 'error', text: `[ PUBLISH_FAILED ] ${error.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Fetch All Modules
  const handleSyncFeed = async (e) => {
    if(e) e.preventDefault();
    setIsFetching(true);

    try {
      const token = localStorage.getItem('token');
      // FIXED ENDPOINT: Using his "get-all" route
      const response = await fetch(`http://localhost:8080/api/v1/lession/get-all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setModules(await response.json());
      } else {
        setModules([]);
      }
    } catch (error) {
      setModules([]);
    } finally {
      setIsFetching(false);
    }
  };

  // Auto-load feed on mount
  useEffect(() => {
    handleSyncFeed();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-100">Academic & Lessons</h3>
        <p className="text-xs text-slate-400 mt-1">Publish study materials and embed video lectures for classroom cohorts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT PANEL: PUBLISHER FORM */}
        <div className="lg:col-span-1 bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-2xl h-fit">
          <h4 className="text-sm font-mono text-emerald-400 uppercase tracking-wider mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            Course Publisher
          </h4>

          {statusMessage && (
            <div className={`p-3 rounded-lg text-xs font-mono mb-6 border ${statusMessage.type === 'error' ? 'bg-rose-950/40 border-rose-900/60 text-rose-400' : 'bg-emerald-950/40 border-emerald-900/60 text-emerald-400'}`}>
              {statusMessage.text}
            </div>
          )}

          <form onSubmit={handlePublish} className="space-y-4">
            
            <div>
              <label className="text-xs font-mono text-slate-500 mb-1 block">TARGET COHORT</label>
              <select 
                required
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 text-slate-200 p-2.5 rounded-lg text-sm outline-none transition-colors appearance-none"
              >
                <option value="" disabled>Select a Classroom Batch...</option>
                {batches.map(batch => (
                  <option key={batch.id} value={batch.id}>
                    {batch.batchName} (ID: {batch.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-500 mb-1 block">MODULE TITLE</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Chapter 1: System Architecture"
                className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 text-slate-200 p-2.5 rounded-lg text-sm outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-500 mb-1 block">YOUTUBE URL</label>
              <input 
                type="url" 
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 text-slate-200 p-2.5 rounded-lg text-sm font-mono outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-mono text-slate-500 mb-1 block">MODULE DESCRIPTION</label>
              <textarea 
                required
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Lesson overview..."
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
              {isSubmitting ? 'Publishing...' : 'Publish Module'}
            </button>
          </form>
        </div>

        {/* RIGHT PANEL: MEDIA FEED */}
        <div className="lg:col-span-2 border border-slate-800 bg-slate-950 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[700px]">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
             <h4 className="text-sm font-mono text-slate-400 uppercase tracking-wider">Global Lesson Database</h4>
             
             <button onClick={handleSyncFeed} disabled={isFetching} className="text-xs font-mono bg-slate-900 text-emerald-400 px-4 py-1.5 rounded-lg border border-slate-700 hover:border-emerald-500 transition-colors">
               {isFetching ? 'SYNCING...' : 'FORCE SYNC FEED'}
             </button>
          </div>
          
          <div className="p-6 overflow-y-auto space-y-8">
            {modules.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs font-mono text-slate-600 uppercase tracking-widest border border-dashed border-slate-800 rounded-lg py-32">
                NO LESSONS PUBLISHED.
              </div>
            ) : (
              modules.map((mod) => {
                const embedUrl = getYouTubeEmbedUrl(mod.videoUrl);
                return (
                  <div key={mod.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    {/* YouTube Embed Area */}
                    {embedUrl ? (
                      <div className="aspect-video w-full bg-black border-b border-slate-800">
                        <iframe 
                          width="100%" 
                          height="100%" 
                          src={embedUrl} 
                          title={mod.title}
                          frameBorder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                        ></iframe>
                      </div>
                    ) : (
                      <div className="aspect-video w-full bg-slate-950 flex items-center justify-center text-slate-600 font-mono text-xs border-b border-slate-800">
                        [ NO MEDIA ATTACHED ]
                      </div>
                    )}
                    
                    {/* Module Content */}
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-bold text-lg text-slate-100">{mod.title}</h5>
                        {mod.batchId && (
                          <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                            BATCH: {mod.batchId}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 whitespace-pre-wrap">{mod.description}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AcademicModules;