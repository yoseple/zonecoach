import React, { useState, useRef } from 'react';
import type { Run } from '../types';
import { PhotoInput } from './PhotoInput';
import { 
  X, 
  Download, 
  Type, 
  Palette, 
  Layout as LayoutIcon, 
  Image as ImageIcon,
  Minimize2,
  RotateCcw
} from 'lucide-react';
import { clsx } from 'clsx';
import { calculatePace, formatDuration } from '../utils/calculations';
import { RouteSvgOverlay } from './RouteSvgOverlay';
import * as htmlToImage from 'html-to-image';

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
  const [isExporting, setIsSaving] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (!previewRef.current || !photo) return;
    setIsSaving(true);
    try {
      const dataUrl = await htmlToImage.toPng(previewRef.current, {
        quality: 0.95,
        pixelRatio: 2, // High resolution
      });
      const link = document.createElement('a');
      link.download = `zonecoach-run-${run.date}-${run.distance.toFixed(2)}mi.png`;
      link.href = dataUrl;
      link.click();
      
      // Attempt to share if supported
      if (navigator.share) {
         try {
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const file = new File([blob], `run-${run.id}.png`, { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
               await navigator.share({
                  files: [file],
                  title: 'ZoneCoach Run Recap',
                  text: `Check out my ${run.distance.toFixed(2)}mi run!`,
               });
            }
         } catch (shareErr) {
            console.log('Share skipped or failed', shareErr);
         }
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to save image. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/80 backdrop-blur-md flex flex-col md:items-center md:justify-center overflow-y-auto pb-10">
      <div className="bg-white w-full max-w-5xl min-h-screen md:min-h-0 md:rounded-[3rem] shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Preview Area (Left/Top) */}
        <div className="flex-1 bg-slate-50 p-6 md:p-10 flex items-center justify-center relative min-h-[500px]">
           <button 
             onClick={onClose}
             className="absolute top-6 left-6 z-20 w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform md:hidden"
           >
              <X size={20} className="text-slate-900" />
           </button>

           <div 
             ref={previewRef}
             className={clsx(
               "relative bg-white shadow-2xl overflow-hidden transition-all duration-500",
               format === '1:1' ? 'aspect-square w-full max-w-md rounded-3xl' : 
               format === '9:16' ? 'aspect-[9/16] h-[600px] rounded-3xl' : 
               'aspect-[16/9] w-full max-w-lg rounded-3xl',
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
                <img src={photo} alt="Recap" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center space-y-4 bg-white">
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                      <ImageIcon size={32} />
                   </div>
                   <p className="text-xs font-black uppercase tracking-widest text-slate-300 leading-relaxed">Capture a moment to build your assignment report</p>
                </div>
              )}

              {/* Template Layers */}
              {showStats && photo && (
                <>
                   {/* Gradient Underlays based on template */}
                   <div className={clsx(
                     "absolute inset-0 transition-opacity duration-500",
                     template === 'minimal' ? "bg-black/20" :
                     template === 'apple-fitness' ? "bg-gradient-to-br from-black/60 via-transparent to-black/60" :
                     template === 'branded' ? "bg-gradient-to-t from-blue-900/80 to-transparent" :
                     "bg-gradient-to-t from-black/70 via-transparent to-transparent"
                   )} />

                   {/* Template: Stats (Classic) */}
                   {template === 'stats' && (
                     <div className="absolute inset-0 p-8 flex flex-col justify-end text-white animate-in slide-in-from-bottom-4">
                        <div className="space-y-4">
                           <div className="flex items-center space-x-2">
                              <div className="w-8 h-1 bg-blue-500 rounded-full" />
                              <span className="text-[10px] font-black uppercase tracking-widest">ZoneCoach Analysis</span>
                           </div>
                           <h4 className="text-6xl font-black italic tracking-tighter leading-none italic">
                             {run.distance.toFixed(2)}<span className="text-2xl ml-1">mi</span>
                           </h4>
                           <div className="flex space-x-8 text-[9px] font-black uppercase tracking-[0.2em] opacity-80">
                              <div><p className="text-blue-400 mb-1">Time</p><p>{formatDuration(run.duration)}</p></div>
                              <div><p className="text-blue-400 mb-1">Pace</p><p>{calculatePace(run.duration, run.distance)}</p></div>
                              <div><p className="text-blue-400 mb-1">Date</p><p>{new Date(run.date).toLocaleDateString()}</p></div>
                           </div>
                        </div>
                     </div>
                   )}

                   {/* Template: Apple Fitness Style */}
                   {template === 'apple-fitness' && (
                     <div className="absolute inset-0 p-10 flex flex-col items-center justify-center text-center space-y-6 text-white animate-in zoom-in-95">
                        <div className="w-16 h-16 rounded-full border-4 border-rose-500 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.5)]">
                           <ActivityIcon className="text-rose-500" size={32} />
                        </div>
                        <div className="space-y-1">
                           <p className="text-5xl font-black italic tracking-tighter italic">{run.distance.toFixed(2)} MI</p>
                           <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-300">Total Distance</p>
                        </div>
                        <div className="grid grid-cols-2 gap-x-12 gap-y-2 pt-4">
                           <div className="text-left"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Pace</p><p className="text-lg font-black">{calculatePace(run.duration, run.distance)}</p></div>
                           <div className="text-right"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Time</p><p className="text-lg font-black">{formatDuration(run.duration)}</p></div>
                        </div>
                     </div>
                   )}

                   {/* Template: Route Focus */}
                   {template === 'route-focus' && (
                     <div className="absolute inset-0 p-12 flex flex-col items-center justify-center animate-in fade-in duration-1000">
                        <div className="w-full h-full max-w-[80%] max-h-[80%] opacity-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                           {run.routePoints && <RouteSvgOverlay points={run.routePoints} size={500} />}
                        </div>
                        <div className="absolute bottom-10 left-10 text-white text-left">
                           <p className="text-4xl font-black italic tracking-tighter italic leading-none">{run.distance.toFixed(2)}</p>
                           <p className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-400">Miles Captured</p>
                        </div>
                     </div>
                   )}
                </>
              )}
           </div>
           
           <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-2">
              <span className={clsx("w-2 h-2 rounded-full", format === '1:1' ? "bg-blue-600" : "bg-slate-200")} />
              <span className={clsx("w-2 h-2 rounded-full", format === '9:16' ? "bg-blue-600" : "bg-slate-200")} />
              <span className={clsx("w-2 h-2 rounded-full", format === '16:9' ? "bg-blue-600" : "bg-slate-200")} />
           </div>
        </div>

        {/* Controls Area (Right/Bottom) */}
        <div className="w-full md:w-[450px] border-l border-slate-100 p-8 flex flex-col bg-white">
           <header className="hidden md:flex items-center justify-between mb-8 shrink-0">
              <h3 className="text-2xl font-black italic tracking-tight">Recap Builder</h3>
              <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                 <X size={20} className="text-slate-400" />
              </button>
           </header>

           <div className="flex-1 space-y-10 overflow-y-auto pr-2 custom-scrollbar pb-10">
              {/* Photo Input */}
              <section className="space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                       <ImageIcon size={18} className="text-blue-500" />
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step 1: Background</h4>
                    </div>
                    {photo && (
                       <button onClick={() => setPhoto(null)} className="text-[8px] font-black uppercase text-rose-500 tracking-widest flex items-center space-x-1">
                          <RotateCcw size={10} />
                          <span>Reset</span>
                       </button>
                    )}
                 </div>
                 <PhotoInput onPhotoSelected={setPhoto} onClear={() => setPhoto(null)} currentPhoto={photo} />
              </section>

              {/* Format Selection */}
              <section className="space-y-4">
                 <div className="flex items-center space-x-2">
                    <Minimize2 size={18} className="text-amber-500" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step 2: Format</h4>
                 </div>
                 <div className="flex gap-3">
                    {(['1:1', '9:16', '16:9'] as Format[]).map(f => (
                      <button
                        key={f}
                        onClick={() => setFormat(f)}
                        className={clsx(
                          "flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                          format === f ? "bg-slate-900 border-slate-900 text-white shadow-xl" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                        )}
                      >
                        {f === '1:1' ? 'Square' : f === '9:16' ? 'Story' : 'Wide'}
                      </button>
                    ))}
                 </div>
              </section>

              {/* Template Selection */}
              <section className="space-y-4">
                 <div className="flex items-center space-x-2">
                    <LayoutIcon size={18} className="text-emerald-500" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step 3: Template</h4>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    {(['stats', 'minimal', 'apple-fitness', 'route-focus', 'branded'] as Template[]).map(t => (
                      <button
                        key={t}
                        onClick={() => setTemplate(t)}
                        className={clsx(
                          "py-4 px-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 truncate",
                          template === t ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                        )}
                      >
                        {t.replace('-', ' ')}
                      </button>
                    ))}
                 </div>
              </section>

              {/* Filter Selection */}
              <section className="space-y-4">
                 <div className="flex items-center space-x-2">
                    <Palette size={18} className="text-purple-500" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step 4: Filter</h4>
                 </div>
                 <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    {(['none', 'chrome', 'mono', 'fade', 'warm', 'cool', 'contrast', 'cinematic'] as Filter[]).map(f => (
                       <button
                         key={f}
                         onClick={() => setFilter(f)}
                         className="shrink-0 flex flex-col items-center space-y-2 group"
                       >
                          <div className={clsx(
                            "w-16 h-16 rounded-2xl border-2 overflow-hidden transition-all",
                            filter === f ? "border-blue-600 scale-110 shadow-lg" : "border-slate-50 group-hover:border-slate-200"
                          )}>
                             <div className={clsx(
                               "w-full h-full bg-slate-400",
                               f === 'chrome' && 'sepia-[0.3] contrast-125',
                               f === 'mono' && 'grayscale',
                               f === 'fade' && 'brightness-110 saturate-[0.8]',
                               f === 'warm' && 'sepia-[0.2] saturate-125 hue-rotate-15',
                               f === 'cool' && 'saturate-110 hue-rotate-[-15deg] brightness-105',
                               f === 'contrast' && 'contrast-150 brightness-90',
                               f === 'cinematic' && 'brightness-75 contrast-125 saturate-150'
                             )} />
                          </div>
                          <span className={clsx("text-[8px] font-black uppercase tracking-tighter transition-colors", filter === f ? "text-blue-600" : "text-slate-400")}>{f}</span>
                       </button>
                    ))}
                 </div>
              </section>

              {/* Metrics Toggle */}
              <button 
                onClick={() => setShowStats(!showStats)}
                className="flex items-center justify-between w-full p-6 bg-slate-50 rounded-3xl group transition-colors hover:bg-slate-100"
              >
                 <div className="flex items-center space-x-3 text-slate-900">
                    <Type size={18} className="text-slate-400" />
                    <span className="text-xs font-black uppercase tracking-widest italic">Display Analytics</span>
                 </div>
                 <div className={clsx(
                   "w-10 h-6 rounded-full transition-colors relative flex items-center",
                   showStats ? "bg-blue-600" : "bg-slate-200"
                 )}>
                    <div className={clsx(
                      "w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                      showStats ? "translate-x-5" : "translate-x-1"
                    )} />
                 </div>
              </button>
           </div>

           <div className="mt-8 space-y-4 shrink-0">
              <button 
                onClick={handleExport}
                disabled={!photo || isExporting}
                className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center space-x-3 shadow-2xl shadow-slate-200 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed group"
              >
                 {isExporting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                 ) : (
                    <>
                       <Download size={20} className="group-hover:-translate-y-1 transition-transform" strokeWidth={3} />
                       <span>Save & Share</span>
                    </>
                 )}
              </button>
              <p className="text-[8px] text-slate-400 font-bold text-center uppercase tracking-widest px-4">
                 Generated image will be saved to your device and ready for sharing.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

const ActivityIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
);
