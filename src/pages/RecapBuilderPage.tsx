import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRunStore } from '../store/useRunStore';
import { RunRecapBuilder } from '../components/RunRecapBuilder';
import { ArrowLeft, Bug } from 'lucide-react';

export const RecapBuilderPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { runs } = useRunStore();
  const [showDebug, setShowDebug] = React.useState(false);
  
  const run = runs.find((r) => r.id === id);

  // Debug click listener
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (showDebug) {
        console.log('DEBUG: Clicked element:', e.target);
        console.log('DEBUG: Element styles:', window.getComputedStyle(e.target as Element));
      }
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [showDebug]);

  if (!run) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <p className="text-slate-500 font-bold mb-4">Run not found</p>
        <button 
          onClick={() => navigate('/history')}
          className="px-6 py-2 bg-slate-900 text-white rounded-xl"
        >
          Back to History
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0F172A] z-[100] flex flex-col overflow-hidden select-none">
      {/* PART 1: Unified Clean Header */}
      <header className="shrink-0 h-16 border-b border-white/5 px-6 flex items-center justify-between bg-slate-900/50 backdrop-blur-xl z-50">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(`/run/${run.id}`)}
            className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors flex items-center space-x-2 pointer-events-auto"
          >
            <ArrowLeft size={24} />
            <span className="hidden sm:inline text-xs font-black uppercase tracking-widest">Back to Run</span>
          </button>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Recap Builder</span>
          <span className="text-xs font-black italic tracking-tight text-white">{run.distance.toFixed(2)}mi Activity</span>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowDebug(!showDebug)}
            className={`p-2 rounded-lg transition-colors pointer-events-auto ${showDebug ? 'text-rose-500 bg-rose-500/10' : 'text-slate-500'}`}
          >
            <Bug size={20} />
          </button>
        </div>
      </header>

      {/* PART 2: Focused Content Area */}
      <main className="flex-1 overflow-hidden relative z-10">
        <RunRecapBuilder run={run} onClose={() => navigate(`/run/${run.id}`)} showDebug={showDebug} />
      </main>
    </div>
  );
};
