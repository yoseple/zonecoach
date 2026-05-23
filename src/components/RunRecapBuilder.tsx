import React, { useState, useRef, useEffect } from 'react';
import type { Run } from '../types';
import { PhotoInput } from './PhotoInput';
import { 
  X, 
  Download, 
  Type, 
  Image as ImageIcon,
  Maximize2,
  Bug,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Maximize,
} from 'lucide-react';
import { clsx } from 'clsx';
import { calculatePace, formatDuration, getFastestSplit } from '../utils/calculations';
import { RouteSvgOverlay } from './RouteSvgOverlay';
import { saveRecapToDevice } from '../utils/imageExport';

interface Props {
  run: Run;
  onClose: () => void;
}

type Format = '1:1' | '9:16' | '16:9';
type Template = 'strava-classic' | 'apple-fitness' | 'minimal' | 'route-focus';
type Filter = 'none' | 'chrome' | 'mono' | 'fade' | 'warm' | 'cool' | 'contrast' | 'cinematic';
type PhotoPos = 'center' | 'top' | 'bottom' | 'left' | 'right';

const FORMAT_CONFIG = {
  '1:1': { width: 1080, height: 1080, label: 'Square', aspect: '1/1' },
  '9:16': { width: 1080, height: 1920, label: 'Story', aspect: '9/16' },
  '16:9': { width: 1200, height: 675, label: 'Landscape', aspect: '16/9' }
};

export const RunRecapBuilder: React.FC<Props> = ({ run, onClose }) => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [format, setFormat] = useState<Format>('1:1');
  const [template, setTemplate] = useState<Template>('strava-classic');
  const [filter, setFilter] = useState<Filter>('none');
  const [photoPos, setPhotoPos] = useState<PhotoPos>('center');
  const [showStats, setShowStats] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleExport = async () => {
    if (!photo) {
      alert("Add a photo before saving.");
      return;
    }
    if (!previewRef.current) return;

    setIsExporting(true);
    setLastError(null);
    
    try {
      const config = FORMAT_CONFIG[format];
      const filename = `zonecoach-run-${run.date}-${run.distance.toFixed(2)}mi.png`;
      
      await saveRecapToDevice(previewRef.current, filename, {
        width: config.width,
        height: config.height
      });
    } catch (err: any) {
      console.error('Export failed:', err);
      setLastError(err.message || 'Unknown error');
      alert(err.message || 'Could not save recap. Try using the None filter or a smaller photo.');
    } finally {
      setIsExporting(false);
    }
  };

  const fastestSplit = getFastestSplit(run.splits);
  const avgPace = calculatePace(run.duration, run.distance);

  const RecapPreview = ({ isLarge = false }: { isLarge?: boolean }) => {
    const config = FORMAT_CONFIG[format];
    
    return (
      /* PART 9: Shell pattern to scale preview while keeping export card fixed internally */
      <div 
        className="recap-preview-shell w-full flex items-center justify-center p-4"
        style={{ 
           aspectRatio: config.aspect,
           maxHeight: isLarge ? 'none' : '60vh'
        }}
      >
        <div 
          ref={isLarge ? null : previewRef}
          className={clsx(
            "recap-export-card relative bg-black overflow-hidden shadow-2xl transition-all duration-500 z-10 select-none",
            !isLarge && "rounded-[2rem]",
            showDebug && "ring-8 ring-red-500 ring-inset"
          )}
          style={{
            width: `${config.width}px`,
            height: `${config.height}px`,
            // PART 2: Scale visuals for display, but capture the internal fixed size
            transform: isLarge ? 'none' : `scale(${Math.min(0.8, (window.innerWidth - 64) / config.width, (window.innerHeight * 0.5) / config.height)})`,
            transformOrigin: 'center center',
            flexShrink: 0
          }}
        >
          {/* Background Photo (PART 2: Real img tag, PART 3: data URL from state) */}
          {photo ? (
            <img 
              src={photo} 
              alt="Recap" 
              className={clsx(
                "absolute inset-0 w-full h-full object-cover transition-all duration-300",
                photoPos === 'top' && 'object-top',
                photoPos === 'bottom' && 'object-bottom',
                photoPos === 'center' && 'object-center',
                photoPos === 'left' && 'object-left',
                photoPos === 'right' && 'object-right',
                filter === 'chrome' && 'sepia-[0.3] contrast-125',
                filter === 'mono' && 'grayscale',
                filter === 'fade' && 'brightness-110 saturate-[0.8]',
                filter === 'warm' && 'sepia-[0.2] saturate-125 hue-rotate-15',
                filter === 'cool' && 'saturate-110 hue-rotate-[-15deg] brightness-105',
                filter === 'contrast' && 'contrast-150 brightness-90',
                filter === 'cinematic' && 'brightness-75 contrast-125 saturate-150'
              )} 
              crossOrigin="anonymous"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center space-y-4 bg-slate-900">
               <ImageIcon size={64} className="text-slate-800" />
               <p className="text-sm font-black uppercase tracking-[0.4em] text-slate-700">ZoneCoach</p>
            </div>
          )}

          {/* PART 6: Overlays inside card only */}
          {showStats && photo && (
            <div className="absolute inset-0 pointer-events-none z-20">
               
               {/* Template: Strava Classic */}
               {template === 'strava-classic' && (
                 <div className="absolute inset-0 flex flex-col justify-between p-12 text-white">
                    <div className="flex justify-between items-start">
                       <div className="space-y-1">
                          <h2 className="text-4xl font-black tracking-tight uppercase">Afternoon Run</h2>
                          <p className="text-xl font-bold opacity-60">{new Date(run.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                       </div>
                       <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Maximize size={24} className="text-white" />
                       </div>
                    </div>

                    <div className="space-y-10">
                       <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                       <div className="relative flex justify-between items-end">
                          <div className="space-y-2">
                             <p className="text-8xl font-black italic tracking-tighter leading-none">
                                {run.distance.toFixed(2)}<span className="text-3xl ml-2 uppercase not-italic opacity-60">mi</span>
                             </p>
                             <div className="flex space-x-12 pt-4">
                                <div className="space-y-1">
                                   <p className="text-xs font-black uppercase tracking-widest opacity-50">Time</p>
                                   <p className="text-2xl font-black">{formatDuration(run.duration)}</p>
                                </div>
                                <div className="space-y-1">
                                   <p className="text-xs font-black uppercase tracking-widest opacity-50">Avg Pace</p>
                                   <p className="text-2xl font-black">{avgPace}</p>
                                </div>
                                {fastestSplit && (
                                   <div className="space-y-1">
                                      <p className="text-xs font-black uppercase tracking-widest opacity-50">Fastest Mile</p>
                                      <p className="text-2xl font-black">{calculatePace(fastestSplit.time, 1)}</p>
                                   </div>
                                )}
                             </div>
                          </div>
                          <div className="w-48 h-48 opacity-90 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                             {run.routePoints && <RouteSvgOverlay points={run.routePoints} size={300} />}
                          </div>
                       </div>
                    </div>
                 </div>
               )}

               {/* Template: Apple Fitness Style */}
               {template === 'apple-fitness' && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-white bg-black/20">
                    <div className="w-24 h-24 rounded-full border-8 border-rose-500 flex items-center justify-center mb-8 shadow-2xl">
                       <Maximize size={48} className="text-rose-500" />
                    </div>
                    <div className="space-y-4">
                       <p className="text-7xl font-black italic tracking-tighter leading-none">{run.distance.toFixed(2)} MI</p>
                       <div className="h-1 w-24 bg-white/20 rounded-full mx-auto" />
                       <p className="text-xl font-black uppercase tracking-[0.4em] opacity-60">Total Distance</p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-20 pt-16">
                       <div className="text-left space-y-1">
                          <p className="text-xs font-black uppercase tracking-widest text-rose-400">Pace</p>
                          <p className="text-4xl font-black italic tracking-tighter leading-none">{avgPace}</p>
                       </div>
                       <div className="text-right space-y-1">
                          <p className="text-xs font-black uppercase tracking-widest text-rose-400">Time</p>
                          <p className="text-4xl font-black italic tracking-tighter leading-none">{formatDuration(run.duration)}</p>
                       </div>
                    </div>
                    <div className="absolute bottom-16 w-3/4 h-24 opacity-80">
                       {run.routePoints && <RouteSvgOverlay points={run.routePoints} size={400} />}
                    </div>
                 </div>
               )}

               {/* Template: Minimal */}
               {template === 'minimal' && (
                 <div className="absolute inset-0 flex flex-col justify-end p-12 text-white">
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="relative space-y-4">
                       <h4 className="text-8xl font-black italic tracking-tighter leading-none">{run.distance.toFixed(2)}</h4>
                       <div className="flex space-x-8 text-sm font-black uppercase tracking-[0.3em] opacity-80">
                          <span>{avgPace}</span>
                          <span>{formatDuration(run.duration)}</span>
                          <span>{new Date(run.date).toLocaleDateString()}</span>
                       </div>
                    </div>
                 </div>
               )}

               {/* Template: Route Focus */}
               {template === 'route-focus' && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-black/10">
                    <div className="w-full h-full max-w-[85%] max-h-[85%] opacity-100 drop-shadow-[0_0_30px_rgba(255,255,255,0.6)]">
                       {run.routePoints && <RouteSvgOverlay points={run.routePoints} size={800} />}
                    </div>
                    <div className="absolute bottom-12 left-12 text-white text-left drop-shadow-lg">
                       <p className="text-6xl font-black italic tracking-tighter leading-none mb-2">{run.distance.toFixed(2)}</p>
                       <p className="text-xs font-black uppercase tracking-[0.5em] text-blue-400">ZoneCoach Trail</p>
                    </div>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0F172A] flex flex-col overflow-hidden">
      <header className="h-16 px-6 flex items-center justify-between shrink-0 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl">
         <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
            <X size={24} strokeWidth={2.5} />
         </button>
         <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Recap Editor</span>
            <span className="text-xs font-black italic tracking-tight text-white">{run.distance.toFixed(2)} Mile Achievement</span>
         </div>
         <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowDebug(!showDebug)}
              className={clsx("p-2 rounded-lg transition-colors", showDebug ? "text-red-500 bg-red-500/10" : "text-slate-500")}
              title="Toggle Export Debug"
            >
               <Bug size={18} />
            </button>
            {photo && (
               <button 
                 onClick={() => setFullscreenPreview(true)}
                 className="p-2 text-white hover:bg-white/10 rounded-lg transition-all"
               >
                  <Maximize2 size={20} />
               </button>
            )}
         </div>
      </header>

      <div className="flex-1 overflow-y-auto flex flex-col bg-slate-950 no-scrollbar">
         {/* Scaling Preview Container */}
         <div className="flex-1 min-h-[50vh] flex items-center justify-center bg-[radial-gradient(circle_at_center,_#1e293b_0%,_#020617_100%)] relative">
            <RecapPreview />
         </div>

         {/* Control Panel */}
         <div className="bg-white rounded-t-[3rem] shadow-[0_-20px_60px_rgba(0,0,0,0.4)] p-8 space-y-12 pb-44">
            
            {/* PART 10: Debug Panel */}
            {showDebug && (
               <section className="p-4 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-[10px] space-y-2">
                  <h5 className="font-black text-rose-500 uppercase tracking-widest flex items-center space-x-2">
                    <Bug size={12} />
                    <span>Export Debugging</span>
                  </h5>
                  <div className="grid grid-cols-2 gap-2">
                    <div>Format: {format}</div>
                    <div>Target: {FORMAT_CONFIG[format].width}x{FORMAT_CONFIG[format].height}</div>
                    <div>Photo Loaded: {photo ? 'YES' : 'NO'}</div>
                    <div>Images: {previewRef.current?.querySelectorAll('img').length || 0}</div>
                    <div>Width: {previewRef.current?.offsetWidth}px</div>
                    <div>Height: {previewRef.current?.offsetHeight}px</div>
                    <div>Last Error: {lastError || 'None'}</div>
                  </div>
               </section>
            )}

            {!photo ? (
               <section className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">1. Select Photo</h4>
                  <PhotoInput onPhotoSelected={setPhoto} onClear={() => setPhoto(null)} currentPhoto={photo} />
               </section>
            ) : (
               <>
                  {/* Photo Position */}
                  <section className="space-y-4">
                     <div className="flex items-center justify-between px-2">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Frame Position</h4>
                        <button onClick={() => setPhoto(null)} className="text-[8px] font-black uppercase text-rose-500 tracking-widest">Replace</button>
                     </div>
                     <div className="flex gap-2 justify-center">
                        {(['top', 'center', 'bottom', 'left', 'right'] as PhotoPos[]).map(pos => (
                           <button 
                             key={pos}
                             onClick={() => setPhotoPos(pos)} 
                             className={clsx(
                               "p-4 rounded-xl border-2 transition-all", 
                               photoPos === pos ? "border-blue-600 bg-blue-50 text-blue-600" : "border-slate-100 text-slate-400"
                             )}
                           >
                              {pos === 'top' && <ChevronUp size={20} />}
                              {pos === 'center' && <Maximize size={20} />}
                              {pos === 'bottom' && <ChevronDown size={20} />}
                              {pos === 'left' && <ChevronLeft size={20} />}
                              {pos === 'right' && <ChevronRight size={20} />}
                           </button>
                        ))}
                     </div>
                  </section>

                  {/* Format */}
                  <section className="space-y-4">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Output Size</h4>
                     <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-2 px-2">
                        {(['1:1', '9:16', '16:9'] as Format[]).map(f => (
                           <button
                             key={f}
                             onClick={() => setFormat(f)}
                             className={clsx(
                               "shrink-0 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                               format === f ? "border-slate-900 bg-slate-900 text-white shadow-xl" : "border-slate-100 text-slate-400 bg-white"
                             )}
                           >
                              {FORMAT_CONFIG[f].label}
                           </button>
                        ))}
                     </div>
                  </section>

                  {/* Template */}
                  <section className="space-y-4">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Style Template</h4>
                     <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-2 px-2">
                        {(['strava-classic', 'apple-fitness', 'minimal', 'route-focus'] as Template[]).map(t => (
                           <button
                             key={t}
                             onClick={() => setTemplate(t)}
                             className={clsx(
                               "shrink-0 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                               template === t ? "border-blue-600 bg-blue-600 text-white shadow-xl" : "border-slate-100 text-slate-400 bg-white"
                             )}
                           >
                              {t.replace('-', ' ')}
                           </button>
                        ))}
                     </div>
                  </section>

                  {/* Filter */}
                  <section className="space-y-4">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Visual Filter</h4>
                     <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-2 px-2">
                        {(['none', 'chrome', 'mono', 'fade', 'warm', 'cool', 'contrast', 'cinematic'] as Filter[]).map(f => (
                           <button key={f} onClick={() => setFilter(f)} className="shrink-0 flex flex-col items-center space-y-2 group">
                              <div className={clsx(
                                "w-16 h-16 rounded-2xl border-2 overflow-hidden transition-all",
                                filter === f ? "border-blue-600 scale-110 shadow-lg" : "border-transparent"
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

                  {/* Stats Toggle */}
                  <section>
                     <button 
                       onClick={() => setShowStats(!showStats)}
                       className="flex items-center justify-between w-full p-6 bg-slate-50 rounded-[2.5rem] transition-colors"
                     >
                        <div className="flex items-center space-x-3 text-slate-900">
                           <Type size={18} className="text-slate-400" />
                           <span className="text-[11px] font-black uppercase tracking-widest italic">Overlay Graphics</span>
                        </div>
                        <div className={clsx(
                          "w-12 h-7 rounded-full transition-colors relative flex items-center p-1",
                          showStats ? "bg-blue-600" : "bg-slate-300"
                        )}>
                           <div className={clsx("w-5 h-5 bg-white rounded-full transition-all shadow-sm", showStats ? "translate-x-5" : "translate-x-0")} />
                        </div>
                     </button>
                  </section>
               </>
            )}
         </div>
      </div>

      {/* Footer Button Bar */}
      <footer className="fixed bottom-0 left-0 w-full p-6 bg-white/95 backdrop-blur-2xl border-t border-slate-100 z-[110] pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
         <div className="max-w-md mx-auto space-y-4">
            <button 
              onClick={handleExport}
              disabled={!photo || isExporting}
              className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center space-x-3 shadow-2xl disabled:opacity-20 active:scale-95 transition-all"
            >
               {isExporting ? (
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
               ) : (
                  <>
                     <Download size={20} strokeWidth={3} />
                     <span>Save to Device</span>
                  </>
               )}
            </button>
            <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest px-8 leading-relaxed">
               PNG Format • High-Res Output
            </p>
         </div>
      </footer>

      {/* Fullscreen High-Res Modal */}
      {fullscreenPreview && (
        <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col animate-in fade-in duration-300">
           <header className="h-16 flex items-center justify-between px-6 shrink-0 bg-black/20 backdrop-blur-md">
              <span className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Full Detail View</span>
              <button onClick={() => setFullscreenPreview(false)} className="p-2 text-white/50">
                 <X size={28} />
              </button>
           </header>
           <div className="flex-1 p-8 flex items-center justify-center overflow-auto bg-slate-900">
              <div className="min-w-fit min-h-fit shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                 <RecapPreview isLarge />
              </div>
           </div>
           <footer className="p-8 shrink-0 pb-[calc(2rem+env(safe-area-inset-bottom))] bg-black/40">
              <button 
                onClick={handleExport} 
                disabled={isExporting}
                className="w-full py-6 bg-blue-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl active:scale-95 transition-all flex items-center justify-center space-x-3"
              >
                 {isExporting ? <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" /> : <span>Confirm & Save PNG</span>}
              </button>
           </footer>
        </div>
      )}
    </div>
  );
};
