import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRunStore } from '../store/useRunStore';
import { RunRecapBuilder } from '../components/RunRecapBuilder';
import { ArrowLeft } from 'lucide-react';

export const RecapBuilderPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { runs } = useRunStore();
  
  const run = runs.find((r) => r.id === id);

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
    <div className="fixed inset-0 bg-white z-[200] overflow-hidden flex flex-col">
      <div className="shrink-0 h-14 border-b border-slate-50 px-4 flex items-center">
        <button 
          onClick={() => navigate(`/run/${run.id}`)}
          className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors flex items-center space-x-2"
        >
          <ArrowLeft size={20} />
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Run</span>
        </button>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <RunRecapBuilder run={run} onClose={() => navigate(`/run/${run.id}`)} />
      </div>
    </div>
  );
};
