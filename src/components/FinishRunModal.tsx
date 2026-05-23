import React from 'react';
import { X, Check, Save, RotateCcw, AlertCircle } from 'lucide-react';
import { formatDuration } from '../utils/calculations';

interface Props {
  isOpen: boolean;
  distance: number;
  time: number;
  pace: string;
  onLog: (notes: string) => void;
  onContinue: () => void;
  onDiscard: () => void;
}

export const FinishRunModal: React.FC<Props> = ({ 
  isOpen, 
  distance, 
  time, 
  pace, 
  onLog, 
  onContinue, 
  onDiscard 
}) => {
  const [notes, setNotes] = React.useState('');
  const [showDiscardConfirm, setShowDiscardConfirm] = React.useState(false);

  if (!isOpen) return null;

  if (showDiscardConfirm) {
    return (
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowDiscardConfirm(false)} />
        <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 relative z-10 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
             <AlertCircle size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Discard activity?</h3>
            <p className="text-slate-500 font-bold text-sm leading-relaxed">This action cannot be undone. Your route and metrics will be permanently deleted.</p>
          </div>
          <div className="flex flex-col gap-3 pt-4">
             <button onClick={onDiscard} className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-rose-100">Yes, Discard</button>
             <button onClick={() => setShowDiscardConfirm(false)} className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs">No, Go Back</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onContinue} />
      
      <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative z-10 flex flex-col max-h-[90vh]">
        <header className="p-8 border-b border-slate-50 flex items-center justify-between shrink-0">
           <h3 className="text-2xl font-black italic tracking-tight">Finish your run?</h3>
           <button onClick={onContinue} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
              <X size={24} className="text-slate-400" />
           </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
           {/* Summary Grid */}
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-6 rounded-3xl text-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Distance</p>
                 <p className="text-3xl font-black italic text-slate-900 tracking-tighter">{distance.toFixed(2)}<span className="text-xs ml-1 uppercase">mi</span></p>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl text-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Time</p>
                 <p className="text-3xl font-black italic text-slate-900 tracking-tighter">{formatDuration(time)}</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl text-center col-span-2">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Average Pace</p>
                 <p className="text-3xl font-black italic text-blue-600 tracking-tighter">{pace}<span className="text-xs ml-1 uppercase">/mi</span></p>
              </div>
           </div>

           {/* Notes */}
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Activity Notes</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did you feel? Any highlights?"
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-3xl p-6 outline-none font-bold text-slate-700 transition-all resize-none min-h-[120px]"
              />
           </div>
        </div>

        <footer className="p-8 border-t border-slate-50 space-y-4 shrink-0 bg-white rounded-b-[3rem]">
           <button 
             onClick={() => onLog(notes)}
             className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-3 shadow-2xl shadow-slate-200 hover:bg-blue-600 transition-all active:scale-[0.98]"
           >
              <Save size={18} />
              <span>Log Activity</span>
           </button>
           
           <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={onContinue}
                className="py-4 bg-slate-50 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center space-x-2"
              >
                 <Check size={14} strokeWidth={3} />
                 <span>Resume</span>
              </button>
              <button 
                onClick={() => setShowDiscardConfirm(true)}
                className="py-4 bg-rose-50 text-rose-500 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center space-x-2"
              >
                 <RotateCcw size={14} strokeWidth={3} />
                 <span>Discard</span>
              </button>
           </div>
        </footer>
      </div>
    </div>
  );
};
