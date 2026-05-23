import React, { useState, useRef, useEffect } from 'react';
import type { Run } from '../types';
import { PhotoInput } from './PhotoInput';
import { 
  X, 
  Download, 
  Type, 
  Image as ImageIcon,
  Maximize2
} from 'lucide-react';
import { clsx } from 'clsx';
import { calculatePace, formatDuration } from '../utils/calculations';
import { RouteSvgOverlay } from './RouteSvgOverlay';
import { saveRecapToDevice } from '../utils/imageExport';

interface Props {
  run: Run;
  onClose: () => void;
}

type Format = '1:1' | '9:16' | '16:9';
type Template = 'minimal' | 'stats' | 'branded' | 'route-focus' | 'apple-fitness';
type Filter = 'none' | 'chrome' | 'mono' | 'fade' | 'warm' | 'cool' | 'contrast' | 'cinematic';

export const RunRecapBuilder: React.FC<Props> = ({ run, onClose }) => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [format, setFormat] = useState<Format>('1:1');
  const [template, setTemplate] = useState<Template>('stats');
  const [filter, setFilter] = useState<Filter>('none');
  const [showStats, setShowStats] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Restore scroll on unmount
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleExport = async () => {
    if (!previewRef.current || !photo) return;
    setIsExporting(true);
    try {
      const filename = `zonecoach-run-${run.date}-${run.distance.toFixed(2)}mi.png`;
      await saveRecapToDevice(previewRef.current, filename);
    } catch (err: any) {
      console.error('Export failed:', err);
      alert(err.message || 'Failed to save recap image.');
    } finally {
      setIsExporting(false);
    }
  };

  const RecapPreview = ({ isLarge = false }: { isLarge?: boolean }) => (
    <div 
      ref={isLarge ? null : previewRef}
      className={clsx(
        "relative bg-slate-100 shadow-2xl overflow-hidden transition-all duration-500 z-10",
        format === '1:1' ? (isLarge ? 'aspect-square w-full max-w-lg' : 'aspect-square w-full max-w-md') : 
        format === '9:16' ? (isLarge ? 'aspect-[9/16] h-[75vh]' : 'aspect-[9/16] w-full max-w-[320px] sm:max-w-md mx-auto') : 
        (isLarge ? 'aspect-[16/9] w-full max-w-2xl' : 'aspect-[16/9] w-full max-w-lg'),
        !isLarge && "rounded-[2rem]",
        filter === 'chrome' && 'sepia-[0.3] contrast-125',
        filter === 'mono' && 'grayscale',
        filter === 'fade' && 'brightness-110 saturate-[0.8]',
        filter === 'warm' && 'sepia-[0.2] saturate-125 hue-rotate-15',
        filter === 'cool' && 'saturate-110 hue-rotate-[-15deg] brightness-105',
        filter === 'contrast' && 'contrast-150 brightness-90',
        filter === 'cinematic' && 'brightness-75 contrast-125 saturate-150'
      )}
    >
       {photo ? (
         <img 
           src={photo} 
           alt="Recap" 
           className="w-full h-full object-cover pointer-events-none" 
           crossOrigin="anonymous"
         />
       ) : (
         <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 shadow-sm">
               <ImageIcon size={32} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Photo Required</p>
         </div>
       )}

       {showStats && photo && (
         <div className="absolute inset-0 pointer-events-none z-20">
            <div className={clsx(
              "absolute inset-0 transition-opacity duration-500 pointer-events-none",
              template === 'minimal' ? "bg-black/10" :
              template === 'apple-fitness' ? "bg-gradient-to-br from-black/50 via-transparent to-black/50" :
              template === 'branded' ? "bg-gradient-to-t from-blue-900/60 to-transparent" :
              "bg-gradient-to-t from-black/60 via-transparent to-transparent"
            )} />

            {template === 'stats' && (
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end text-white pointer-events-none">
                 <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                       <div className="w-5 h-1 bg-blue-500 rounded-full" />
                       <span className="text-[7px] font-black uppercase tracking-[0.3em] opacity-80">ZoneCoach Activity</span>
                    </div>
                    <h4 className="text-5xl font-black italic tracking-tighter leading-none mb-1">
                      {run.distance.toFixed(2)}<span className="text-xl ml-1">mi</span>
                    </h4>
                    <div className="flex space-x-6 text-[7px] font-black uppercase tracking-[0.2em] opacity-70">
                       <div><p className="text-blue-400 mb-0.5">Time</p><p>{formatDuration(run.duration)}</p></div>
                       <div><p className="text-blue-400 mb-0.5">Pace</p><p>{calculatePace(run.duration, run.distance)}</p></div>
                       <div><p className="text-blue-400 mb-0.5">Date</p><p>{new Date(run.date).toLocaleDateString()}</p></div>
                    </div>
                 </div>
              </div>
            )}

            {template === 'apple-fitness' && (
              <div className="absolute inset-0 p-10 flex flex-col items-center justify-center text-center space-y-6 text-white pointer-events-none">
                 <div className="w-16 h-16 rounded-full border-4 border-rose-500 flex items-center justify-center">
                    <ActivityIcon className="text-rose-500" size={32} />
                 </div>
                 <div className="space-y-1">
                    <p className="text-4xl font-black italic tracking-tighter leading-none">{run.distance.toFixed(2)} MI</p>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">Total Distance</p>
                 </div>
                 <div className="grid grid-cols-2 gap-x-12 pt-4">
                    <div className="text-left"><p className="text-[6px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Pace</p><p className="text-lg font-black">{calculatePace(run.duration, run.distance)}</p></div>
                    <div className="text-right"><p className="text-[6px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Time</p><p className="text-lg font-black">{formatDuration(run.duration)}</p></div>
                 </div>
              </div>
            )}

            {template === 'route-focus' && (
              <div className="absolute inset-0 p-8 flex flex-col items-center justify-center pointer-events-none">
                 <div className="w-full h-full max-w-[80%] max-h-[80%] opacity-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    {run.routePoints && <RouteSvgOverlay points={run.routePoints} size={500} />}
                 </div>
                 <div className="absolute bottom-8 left-8 text-white text-left">
                    <p className="text-3xl font-black italic tracking-tighter leading-none">{run.distance.toFixed(2)}</p>
                    <p className="text-[7px] font-black uppercase tracking-[0.3em] text-blue-400">Miles Captured</p>
                 </div>
              </div>
            )}
         </div>
       )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col overflow-hidden">
      {/* Editor Header */}
      <header className="h-16 px-6 flex items-center justify-between shrink-0 border-b border-slate-50">
         <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
            <X size={24} strokeWidth={2.5} />
         </button>
         <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Editor</span>
            <span className="text-xs font-black italic tracking-tight text-slate-900">Final Assignment</span>
         </div>
         <div className="w-10 h-10 flex items-center justify-center">
            {photo && (
               <button 
                 onClick={() => setFullscreenPreview(true)}
                 className="p-2 text-slate-900"
               >
                  <Maximize2 size={20} />
               </button>
            )}
         </div>
      </header>

      {/* Viewport Area */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 flex flex-col">
         {/* Top Preview */}
         <div className="p-6 md:p-12 flex items-center justify-center shrink-0">
            <RecapPreview />
         </div>

         {/* Control Panel */}
         <div className="flex-1 bg-white rounded-t-[3rem] shadow-[0_-20px_40px_rgba(0,0,0,0.03)] p-8 space-y-10 pb-40">
            {/* 1. Photo Section */}
            {!photo && (
               <section className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">1. Add Background</h4>
                  <PhotoInput onPhotoSelected={setPhoto} onClear={() => setPhoto(null)} currentPhoto={photo} />
               </section>
            )}

            {photo && (
               <>
                  {/* Aspect Ratio */}
                  <section className="space-y-4">
                     <div className="flex items-center justify-between px-2">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Layout</h4>
                        <button onClick={() => setPhoto(null)} className="text-[8px] font-black uppercase text-rose-500 tracking-widest">Clear Photo</button>
                     </div>
                     <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-2 px-2">
                        {(['1:1', '9:16', '16:9'] as Format[]).map(f => (
                           <button
                             key={f}
                             onClick={() => setFormat(f)}
                             className={clsx(
                               "shrink-0 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                               format === f ? "bg-slate-900 text-white shadow-lg" : "bg-slate-50 text-slate-400"
                             )}
                           >
                              {f === '1:1' ? 'Square' : f === '9:16' ? 'Story' : 'Wide'}
                           </button>
                        ))}
                     </div>
                  </section>

                  {/* Template Style */}
                  <section className="space-y-4">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Overlay Style</h4>
                     <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-2 px-2">
                        {(['stats', 'minimal', 'apple-fitness', 'route-focus', 'branded'] as Template[]).map(t => (
                           <button
                             key={t}
                             onClick={() => setTemplate(t)}
                             className={clsx(
                               "shrink-0 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                               template === t ? "bg-blue-600 text-white shadow-lg" : "bg-slate-50 text-slate-400"
                             )}
                           >
                              {t.replace('-', ' ')}
                           </button>
                        ))}
                     </div>
                  </section>

                  {/* Color Filter */}
                  <section className="space-y-4">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Color Filter</h4>
                     <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-2 px-2">
                        {(['none', 'chrome', 'mono', 'fade', 'warm', 'cool', 'contrast', 'cinematic'] as Filter[]).map(f => (
                           <button key={f} onClick={() => setFilter(f)} className="shrink-0 flex flex-col items-center space-y-2 group">
                              <div className={clsx(
                                "w-14 h-14 rounded-2xl border-2 overflow-hidden transition-all",
                                filter === f ? "border-blue-600 scale-105 shadow-md" : "border-transparent"
                              )}>
                                 <div className={clsx(
                                   "w-full h-full bg-slate-300",
                                   f === 'chrome' && 'sepia-[0.3] contrast-125',
                                   f === 'mono' && 'grayscale',
                                   f === 'fade' && 'brightness-110 saturate-[0.8]',
                                   f === 'warm' && 'sepia-[0.2] saturate-125 hue-rotate-15',
                                   f === 'cool' && 'saturate-110 hue-rotate-[-15deg] brightness-105',
                                   f === 'contrast' && 'contrast-150 brightness-90',
                                   f === 'cinematic' && 'brightness-75 contrast-125 saturate-150'
                                 )} />
                              </div>
                              <span className={clsx("text-[8px] font-black uppercase tracking-tighter", filter === f ? "text-blue-600" : "text-slate-400")}>{f}</span>
                           </button>
                        ))}
                     </div>
                  </section>

                  {/* Display Toggle */}
                  <section>
                     <button 
                       onClick={() => setShowStats(!showStats)}
                       className="flex items-center justify-between w-full p-6 bg-slate-50 rounded-[2rem] transition-colors"
                     >
                        <div className="flex items-center space-x-3 text-slate-900">
                           <Type size={18} className="text-slate-400" />
                           <span className="text-[10px] font-black uppercase tracking-widest italic">Display Analytics</span>
                        </div>
                        <div className={clsx(
                          "w-10 h-6 rounded-full transition-colors relative flex items-center p-1",
                          showStats ? "bg-blue-600" : "bg-slate-200"
                        )}>
                           <div className={clsx("w-4 h-4 bg-white rounded-full transition-all", showStats ? "translate-x-4" : "translate-x-0")} />
                        </div>
                     </button>
                  </section>
               </>
            )}
         </div>
      </div>

      {/* Footer Save Bar */}
      <footer className="fixed bottom-0 left-0 w-full p-6 bg-white/95 backdrop-blur-xl border-t border-slate-50 z-[110] pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
         <div className="max-w-md mx-auto space-y-3">
            <button 
              onClick={handleExport}
              disabled={!photo || isExporting}
              className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center space-x-3 shadow-2xl disabled:opacity-10 active:scale-95 transition-all"
            >
               {isExporting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
               ) : (
                  <>
                     <Download size={18} strokeWidth={3} />
                     <span>Save to Device</span>
                  </>
               )}
            </button>
            <p className="text-[9px] font-bold text-slate-400 text-center uppercase tracking-widest px-4 leading-relaxed">
               Save the PNG first, then send it from your Photos or Files app.
            </p>
         </div>
      </footer>

      {/* Fullscreen Preview Modal */}
      {fullscreenPreview && (
        <div className="fixed inset-0 z-[200] bg-slate-900 flex flex-col">
           <header className="h-16 flex items-center justify-between px-6 shrink-0">
              <span className="text-white text-[10px] font-black uppercase tracking-widest">Inspection Mode</span>
              <button onClick={() => setFullscreenPreview(false)} className="p-2 text-white/50">
                 <X size={24} />
              </button>
           </header>
           <div className="flex-1 p-8 flex items-center justify-center">
              <RecapPreview isLarge />
           </div>
           <footer className="p-8 shrink-0 pb-[calc(2rem+env(safe-area-inset-bottom))]">
              <button onClick={handleExport} className="w-full py-6 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-[10px] shadow-2xl active:scale-95 transition-all">
                 Confirm & Save to Device
              </button>
           </footer>
        </div>
      )}
    </div>
  );
};

const ActivityIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
);
