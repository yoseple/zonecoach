import React, { useState, useRef, useEffect } from 'react';
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
  RotateCcw,
  Share2,
  Maximize2
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
  const [isExporting, setIsExporting] = useState(false);
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Restore scroll on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleExport = async () => {
    if (!previewRef.current || !photo) return;
    setIsExporting(true);
    try {
      // Small delay to ensure rendering is complete
      await new Promise(r => setTimeout(r, 100));
      
      const dataUrl = await htmlToImage.toPng(previewRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        cacheBust: true,
      });
      
      const link = document.createElement('a');
      link.download = `zonecoach-run-${run.date}-${run.distance.toFixed(2)}mi.png`;
      link.href = dataUrl;
      link.click();
      
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
      setIsExporting(false);
    }
  };

  const RecapPreview = ({ isLarge = false }: { isLarge?: boolean }) => (
    <div 
      ref={isLarge ? null : previewRef}
      className={clsx(
        "relative bg-white shadow-2xl overflow-hidden transition-all duration-500 z-10",
        format === '1:1' ? (isLarge ? 'aspect-square w-full max-w-lg' : 'aspect-square w-full max-w-md') : 
        format === '9:16' ? (isLarge ? 'aspect-[9/16] h-[80vh]' : 'aspect-[9/16] h-[500px] md:h-[600px]') : 
        (isLarge ? 'aspect-[16/9] w-full max-w-2xl' : 'aspect-[16/9] w-full max-w-lg'),
        "rounded-3xl",
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
         <img src={photo} alt="Recap" className="w-full h-full object-cover pointer-events-none" />
       ) : (
         <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center space-y-4 bg-white">
            <ImageIcon size={32} className="text-slate-200" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Preview Area</p>
         </div>
       )}

       {showStats && photo && (
         <div className="absolute inset-0 pointer-events-none z-20">
            <div className={clsx(
              "absolute inset-0 transition-opacity duration-500",
              template === 'minimal' ? "bg-black/20" :
              template === 'apple-fitness' ? "bg-gradient-to-br from-black/60 via-transparent to-black/60" :
              template === 'branded' ? "bg-gradient-to-t from-blue-900/80 to-transparent" :
              "bg-gradient-to-t from-black/70 via-transparent to-transparent"
            )} />

            {template === 'stats' && (
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end text-white">
                 <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                       <div className="w-6 h-0.5 bg-blue-500 rounded-full" />
                       <span className="text-[8px] font-black uppercase tracking-widest">ZoneCoach Performance</span>
                    </div>
                    <h4 className="text-5xl font-black italic tracking-tighter leading-none">
                      {run.distance.toFixed(2)}<span className="text-xl ml-1">mi</span>
                    </h4>
                    <div className="flex space-x-6 text-[8px] font-black uppercase tracking-[0.2em] opacity-80">
                       <div><p className="text-blue-400 mb-0.5">Time</p><p>{formatDuration(run.duration)}</p></div>
                       <div><p className="text-blue-400 mb-0.5">Pace</p><p>{calculatePace(run.duration, run.distance)}</p></div>
                       <div><p className="text-blue-400 mb-0.5">Date</p><p>{new Date(run.date).toLocaleDateString()}</p></div>
                    </div>
                 </div>
              </div>
            )}

            {template === 'apple-fitness' && (
              <div className="absolute inset-0 p-10 flex flex-col items-center justify-center text-center space-y-6 text-white">
                 <div className="w-14 h-14 rounded-full border-4 border-rose-500 flex items-center justify-center">
                    <ActivityIcon className="text-rose-500" size={28} />
                 </div>
                 <div className="space-y-1">
                    <p className="text-4xl font-black italic tracking-tighter">{run.distance.toFixed(2)} MI</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Total Distance</p>
                 </div>
                 <div className="grid grid-cols-2 gap-x-10 gap-y-2 pt-4">
                    <div className="text-left"><p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Pace</p><p className="text-md font-black">{calculatePace(run.duration, run.distance)}</p></div>
                    <div className="text-right"><p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Time</p><p className="text-md font-black">{formatDuration(run.duration)}</p></div>
                 </div>
              </div>
            )}

            {template === 'route-focus' && (
              <div className="absolute inset-0 p-8 flex flex-col items-center justify-center">
                 <div className="w-full h-full max-w-[85%] max-h-[85%] opacity-90 drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                    {run.routePoints && <RouteSvgOverlay points={run.routePoints} size={500} />}
                 </div>
                 <div className="absolute bottom-8 left-8 text-white text-left">
                    <p className="text-3xl font-black italic tracking-tighter leading-none">{run.distance.toFixed(2)}</p>
                    <p className="text-[7px] font-black uppercase tracking-[0.2em] text-blue-400">Miles Captured</p>
                 </div>
              </div>
            )}
         </div>
       )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col overflow-y-auto">
      {/* Header Bar */}
      <header className="sticky top-0 z-[60] h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 flex items-center justify-between shrink-0">
         <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
               <Palette size={18} />
            </div>
            <h3 className="text-xl font-black italic tracking-tight text-slate-900">Recap Builder</h3>
         </div>
         <button 
           onClick={onClose}
           className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:text-slate-900 active:scale-90 transition-all"
         >
            <X size={20} strokeWidth={3} />
         </button>
      </header>

      {/* Main Content Flow */}
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-10 pb-40">
           
           {/* Preview Column (Sticky on Desktop) */}
           <div className="md:col-span-7 p-4 sm:p-8 md:sticky md:top-16 h-fit flex flex-col items-center justify-center bg-slate-50/50 md:bg-transparent">
              <div className="relative group">
                 <RecapPreview />
                 {photo && (
                    <button 
                      onClick={() => {
                        setFullscreenPreview(true);
                        document.body.style.overflow = 'hidden';
                      }}
                      className="absolute top-4 right-4 z-30 w-10 h-10 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                       <Maximize2 size={18} className="text-slate-900" />
                    </button>
                 )}
              </div>
              <p className="mt-6 text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 md:hidden">Scroll down to customize</p>
           </div>

           {/* Controls Column */}
           <div className="md:col-span-5 p-6 sm:p-8 space-y-12">
              {/* Step 1: Background */}
              <section className="space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                       <ImageIcon size={18} className="text-blue-500" />
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step 1: Background</h4>
                    </div>
                    {photo && (
                       <button onClick={() => setPhoto(null)} className="text-[8px] font-black uppercase text-rose-500 tracking-widest flex items-center space-x-1 active:scale-95">
                          <RotateCcw size={10} />
                          <span>Clear Photo</span>
                       </button>
                    )}
                 </div>
                 <PhotoInput onPhotoSelected={setPhoto} onClear={() => setPhoto(null)} currentPhoto={photo} />
              </section>

              {/* Step 2: Format */}
              <section className="space-y-4">
                 <div className="flex items-center space-x-2">
                    <Minimize2 size={18} className="text-amber-500" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step 2: Format</h4>
                 </div>
                 <div className="grid grid-cols-3 gap-3">
                    {(['1:1', '9:16', '16:9'] as Format[]).map(f => (
                      <button
                        key={f}
                        onClick={() => setFormat(f)}
                        className={clsx(
                          "py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 active:scale-95",
                          format === f ? "bg-slate-900 border-slate-900 text-white shadow-xl" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                        )}
                      >
                        {f === '1:1' ? 'Square' : f === '9:16' ? 'Story' : 'Wide'}
                      </button>
                    ))}
                 </div>
              </section>

              {/* Step 3: Template */}
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
                          "py-4 px-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 truncate active:scale-95",
                          template === t ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                        )}
                      >
                        {t.replace('-', ' ')}
                      </button>
                    ))}
                 </div>
              </section>

              {/* Step 4: Filter */}
              <section className="space-y-4">
                 <div className="flex items-center space-x-2">
                    <Palette size={18} className="text-purple-500" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step 4: Filter</h4>
                 </div>
                 <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
                    {(['none', 'chrome', 'mono', 'fade', 'warm', 'cool', 'contrast', 'cinematic'] as Filter[]).map(f => (
                       <button
                         key={f}
                         onClick={() => setFilter(f)}
                         className="shrink-0 flex flex-col items-center space-y-2 group"
                       >
                          <div className={clsx(
                            "w-16 h-16 rounded-2xl border-2 overflow-hidden transition-all active:scale-90",
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

              {/* Step 5: Toggles */}
              <section>
                 <button 
                   onClick={() => setShowStats(!showStats)}
                   className="flex items-center justify-between w-full p-6 bg-slate-50 rounded-3xl group transition-colors hover:bg-slate-100 active:scale-[0.98]"
                 >
                    <div className="flex items-center space-x-3 text-slate-900">
                       <Type size={18} className="text-slate-400" />
                       <span className="text-xs font-black uppercase tracking-widest italic">Display Analytics</span>
                    </div>
                    <div className={clsx(
                      "w-10 h-6 rounded-full transition-colors relative flex items-center p-1",
                      showStats ? "bg-blue-600" : "bg-slate-200"
                    )}>
                       <div className={clsx(
                         "w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                         showStats ? "translate-x-4" : "translate-x-0"
                       )} />
                    </div>
                 </button>
              </section>
           </div>
        </div>
      </div>

      {/* Mobile Sticky Save Bar */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-white/95 backdrop-blur-xl border-t border-slate-100 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
         <div className="max-w-md mx-auto flex gap-4">
           <button 
             onClick={handleExport}
             disabled={!photo || isExporting}
             className="flex-1 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center space-x-3 shadow-2xl shadow-slate-200 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed group"
           >
              {isExporting ? (
                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                 <>
                    <Download size={20} className="group-hover:-translate-y-1 transition-transform" strokeWidth={3} />
                    <span>Save Assignment Report</span>
                 </>
              )}
           </button>
           {photo && (
              <button 
                onClick={handleExport} 
                className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-lg active:scale-90 transition-transform"
              >
                 <Share2 size={24} />
              </button>
           )}
         </div>
      </div>

      {/* Fullscreen Preview Modal */}
      {fullscreenPreview && (
        <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col animate-in fade-in duration-300">
           <header className="h-16 flex items-center justify-between px-6 shrink-0">
              <span className="text-white text-[10px] font-black uppercase tracking-widest">Inspection View</span>
              <button 
                onClick={() => {
                  setFullscreenPreview(false);
                  document.body.style.overflow = 'auto';
                }}
                className="w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                 <X size={20} strokeWidth={3} />
              </button>
           </header>
           <div className="flex-1 p-6 flex items-center justify-center overflow-y-auto">
              <RecapPreview isLarge />
           </div>
           <footer className="p-8 shrink-0">
              <button 
                onClick={handleExport}
                className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-500/20 active:scale-95 transition-all"
              >
                 Confirm & Export
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
