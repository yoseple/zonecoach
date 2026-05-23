import React, { useState } from 'react';
import type { Run } from '../types';
import { PhotoInput } from './PhotoInput';
import { X, Download, Type, Palette, Layout as LayoutIcon, Image as ImageIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { calculatePace, formatDuration } from '../utils/calculations';

interface Props {
  run: Run;
  onClose: () => void;
}

export const RunRecapBuilder: React.FC<Props> = ({ run, onClose }) => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [template, setTemplate] = useState<'minimal' | 'stats' | 'branded'>('stats');
  const [filter, setFilter] = useState<'none' | 'chrome' | 'mono' | 'fade'>('none');
  const [showStats, setShowStats] = useState(true);

  const handleExport = () => {
    // In a real app, use html2canvas or similar to export the preview
    alert('Recap generated! (Export functionality requires html2canvas integration)');
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-md flex flex-col md:items-center md:justify-center overflow-y-auto">
      <div className="bg-white w-full max-w-4xl min-h-screen md:min-h-0 md:rounded-[3rem] shadow-2xl flex flex-col md:flex-row overflow-hidden">
        
        {/* Preview Area (Left/Top) */}
        <div className="flex-1 bg-slate-100 p-6 flex items-center justify-center relative min-h-[400px]">
           <button 
             onClick={onClose}
             className="absolute top-6 left-6 z-20 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform md:hidden"
           >
              <X size={24} />
           </button>

           <div className={clsx(
             "relative w-full max-w-sm aspect-square bg-white shadow-2xl rounded-3xl overflow-hidden transition-all duration-500",
             filter === 'chrome' && 'sepia-[0.3] contrast-125',
             filter === 'mono' && 'grayscale',
             filter === 'fade' && 'brightness-110 saturate-[0.8]'
           )}>
              {photo ? (
                <img src={photo} alt="Recap" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center space-y-4">
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                      <ImageIcon size={32} />
                   </div>
                   <p className="text-xs font-black uppercase tracking-widest text-slate-300 leading-relaxed">Choose a photo to begin your recap</p>
                </div>
              )}

              {/* Stats Overlay */}
              {showStats && photo && (
                <div className={clsx(
                  "absolute inset-0 p-8 flex flex-col justify-end text-white",
                  template === 'branded' ? "bg-gradient-to-t from-blue-600/80 to-transparent" : "bg-gradient-to-t from-black/60 to-transparent"
                )}>
                   <div className="space-y-4 animate-in slide-in-from-bottom-4">
                      <div className="flex items-center space-x-2">
                         <div className="w-10 h-1 bg-blue-400 rounded-full" />
                         <span className="text-[10px] font-black uppercase tracking-widest">ZoneCoach Performance</span>
                      </div>
                      <h4 className="text-5xl font-black italic tracking-tighter leading-none">
                        {run.distance.toFixed(2)}<span className="text-xl ml-1">mi</span>
                      </h4>
                      <div className="flex space-x-6 text-[10px] font-black uppercase tracking-widest opacity-90">
                         <div className="flex flex-col">
                            <span className="text-blue-400 mb-1">Time</span>
                            <span>{formatDuration(run.duration)}</span>
                         </div>
                         <div className="flex flex-col">
                            <span className="text-blue-400 mb-1">Pace</span>
                            <span>{calculatePace(run.duration, run.distance)}/mi</span>
                         </div>
                         <div className="flex flex-col">
                            <span className="text-blue-400 mb-1">Date</span>
                            <span>{new Date(run.date).toLocaleDateString()}</span>
                         </div>
                      </div>
                   </div>
                </div>
              )}
           </div>
        </div>

        {/* Controls Area (Right/Bottom) */}
        <div className="w-full md:w-[400px] border-l border-slate-100 p-8 flex flex-col bg-white">
           <header className="hidden md:flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black italic tracking-tight">Recap Builder</h3>
              <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                 <X size={20} className="text-slate-400" />
              </button>
           </header>

           <div className="flex-1 space-y-10 overflow-y-auto pr-2 custom-scrollbar">
              {/* Photo Section */}
              <section className="space-y-4">
                 <div className="flex items-center space-x-2">
                    <Palette size={18} className="text-blue-500" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step 1: Background</h4>
                 </div>
                 <PhotoInput onPhotoSelected={setPhoto} onClear={() => setPhoto(null)} currentPhoto={photo} />
              </section>

              {/* Template Section */}
              <section className="space-y-4">
                 <div className="flex items-center space-x-2">
                    <LayoutIcon size={18} className="text-emerald-500" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step 2: Template</h4>
                 </div>
                 <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'minimal', label: 'Dark' },
                      { id: 'stats', label: 'Classic' },
                      { id: 'branded', label: 'Pro' }
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTemplate(t.id as any)}
                        className={clsx(
                          "py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                          template === t.id ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                 </div>
              </section>

              {/* Filter Section */}
              <section className="space-y-4">
                 <div className="flex items-center space-x-2">
                    <Palette size={18} className="text-purple-500" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step 3: Filter</h4>
                 </div>
                 <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    {['none', 'chrome', 'mono', 'fade'].map(f => (
                       <button
                         key={f}
                         onClick={() => setFilter(f as any)}
                         className={clsx(
                           "shrink-0 w-16 h-16 rounded-2xl border-2 overflow-hidden transition-all",
                           filter === f ? "border-blue-600 scale-110 shadow-lg shadow-blue-100" : "border-transparent opacity-60 grayscale hover:opacity-100"
                         )}
                       >
                          <div className={clsx(
                            "w-full h-full bg-slate-400",
                            f === 'chrome' && 'sepia-[0.3] contrast-125',
                            f === 'mono' && 'grayscale',
                            f === 'fade' && 'brightness-110 saturate-[0.8]'
                          )} />
                       </button>
                    ))}
                 </div>
              </section>

              {/* Toggles */}
              <section className="pt-4 border-t border-slate-50 space-y-4">
                 <button 
                   onClick={() => setShowStats(!showStats)}
                   className="flex items-center justify-between w-full p-4 bg-slate-50 rounded-2xl group"
                 >
                    <div className="flex items-center space-x-3">
                       <Type size={18} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                       <span className="text-xs font-black uppercase tracking-widest text-slate-700">Display Metrics</span>
                    </div>
                    <div className={clsx(
                      "w-10 h-6 rounded-full transition-colors relative flex items-center",
                      showStats ? "bg-blue-600" : "bg-slate-200"
                    )}>
                       <div className={clsx(
                         "w-4 h-4 bg-white rounded-full transition-transform",
                         showStats ? "translate-x-5" : "translate-x-1"
                       )} />
                    </div>
                 </button>
              </section>
           </div>

           <div className="mt-10 space-y-4">
              <button 
                onClick={handleExport}
                disabled={!photo}
                className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-3 shadow-2xl shadow-slate-200 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                 <Download size={18} />
                 <span>Save Image</span>
              </button>
              <button 
                onClick={onClose}
                className="w-full py-5 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-900 transition-colors"
              >
                 Back to Run
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
