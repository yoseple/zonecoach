import React, { useState } from 'react';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';

interface Props {
  status: 'ready' | 'tracking' | 'paused';
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
  onDiscard: () => void;
}

export const LiveRunControls: React.FC<Props> = ({ 
  status, 
  onStart, 
  onPause, 
  onResume, 
  onEnd,
  onDiscard 
}) => {
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);

  if (showConfirmEnd) {
    return (
      <div className="flex flex-col space-y-4 w-full px-6 animate-in slide-in-from-bottom-4">
        <p className="text-center text-sm font-black uppercase tracking-widest text-slate-400">Finish activity?</p>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowConfirmEnd(false)}
            className="flex-1 py-6 bg-slate-100 text-slate-900 rounded-[2.5rem] font-black uppercase tracking-widest text-xs"
          >
            Go Back
          </button>
          <button 
            onClick={onEnd}
            className="flex-1 py-6 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100"
          >
            End Run
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center space-x-8 w-full">
      {status === 'ready' && (
        <button 
          onClick={onStart}
          className="w-24 h-24 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl shadow-slate-200 active:scale-90 transition-transform"
        >
          <Play size={40} fill="currentColor" />
        </button>
      )}

      {status === 'tracking' && (
        <>
          <button 
            onClick={onDiscard}
            className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          >
            <RotateCcw size={24} />
          </button>
          <button 
            onClick={onPause}
            className="w-24 h-24 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl shadow-slate-200 active:scale-90 transition-transform"
          >
            <Pause size={40} fill="currentColor" />
          </button>
          <div className="w-16 h-16" /> {/* Spacer */}
        </>
      )}

      {status === 'paused' && (
        <>
          <button 
            onClick={onDiscard}
            className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          >
            <RotateCcw size={24} />
          </button>
          <button 
            onClick={onResume}
            className="w-24 h-24 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-100 active:scale-90 transition-transform"
          >
            <Play size={40} fill="currentColor" />
          </button>
          <button 
            onClick={() => setShowConfirmEnd(true)}
            className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center active:scale-90 transition-transform border-2 border-rose-100"
          >
            <Square size={24} fill="currentColor" />
          </button>
        </>
      )}
    </div>
  );
};
