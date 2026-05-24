import React, { useState, useRef } from 'react';
import type { Run } from '../types';
import { PhotoInput } from './PhotoInput';
import { 
  X, 
  Download, 
} from 'lucide-react';
import { clsx } from 'clsx';
import { calculatePace, formatDuration } from '../utils/calculations';
import { saveRecapToDevice } from '../utils/imageExport';

interface Props {
  run: Run;
  onClose: () => void;
  showDebug?: boolean;
}

type Format = '1:1' | '9:16' | '16:9';
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
  const [filter, setFilter] = useState<Filter>('none');
  const [photoPos] = useState<PhotoPos>('center');
  const [showStats, setShowStats] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  
  const previewRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    console.log('Save button clicked');
    if (!photo) {
      alert("Add a photo before saving.");
      return;
    }
    if (!previewRef.current) return;

    setIsExporting(true);
    try {
      const config = FORMAT_CONFIG[format];
      const filename = `zonecoach-run-${run.date}-${run.distance.toFixed(2)}mi.png`;
      await saveRecapToDevice(previewRef.current, filename, {
        width: config.width,
        height: config.height
      });
    } catch (err: any) {
      console.error('Export failed:', err);
      alert(err.message || 'Could not save recap.');
    } finally {
      setIsExporting(false);
    }
  };

  const avgPace = calculatePace(run.duration, run.distance);

  return (
    <div className="bg-white min-h-screen pb-20 pointer-events-auto">
      {/* 1. Simple Header */}
      <div className="p-4 border-b flex justify-between items-center bg-white z-50">
        <h2 className="font-bold text-slate-900">Recap Editor</h2>
        <button 
          onClick={() => { console.log('Close clicked'); onClose(); }} 
          className="p-2 bg-slate-100 rounded-lg text-slate-600 active:bg-slate-200"
        >
          <X size={20} />
        </button>
      </div>

      {/* 2. Bare-bones Preview */}
      <div className="p-4 flex flex-col items-center bg-slate-50 border-b">
        <div 
          ref={previewRef}
          className="relative bg-black shadow-lg overflow-hidden flex-shrink-0"
          style={{
            width: '280px',
            height: format === '1:1' ? '280px' : format === '9:16' ? '497px' : '157px',
          }}
        >
          {photo ? (
            <img 
              src={photo} 
              alt="Recap" 
              className={clsx(
                "absolute inset-0 w-full h-full object-cover pointer-events-none",
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
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-700 font-bold">
               No Photo Selected
            </div>
          )}

          {showStats && photo && (
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-end p-4 text-white bg-gradient-to-t from-black/60 to-transparent">
               <p className="text-2xl font-black italic">{run.distance.toFixed(2)}mi</p>
               <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{avgPace} • {formatDuration(run.duration)}</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Direct Controls */}
      <div className="p-6 space-y-8 bg-white relative z-10">
        {/* Photo Input */}
        <section>
          <h4 className="text-xs font-black mb-3 uppercase tracking-wider text-slate-400">1. Select Photo</h4>
          <PhotoInput 
            onPhotoSelected={(url) => { console.log('Photo selected'); setPhoto(url); }} 
            onClear={() => { console.log('Photo cleared'); setPhoto(null); }} 
            currentPhoto={photo} 
          />
        </section>

        {photo && (
          <>
            {/* Format Selection */}
            <section>
              <h4 className="text-xs font-black mb-3 uppercase tracking-wider text-slate-400">2. Output Size</h4>
              <div className="flex gap-2">
                {(['1:1', '9:16', '16:9'] as Format[]).map(f => (
                  <button
                    key={f}
                    onClick={() => { console.log('Format set to:', f); setFormat(f); }}
                    className={clsx(
                      "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all",
                      format === f ? "border-slate-900 bg-slate-900 text-white shadow-md" : "border-slate-100 bg-white text-slate-400"
                    )}
                  >
                    {FORMAT_CONFIG[f].label}
                  </button>
                ))}
              </div>
            </section>

            {/* Filter Selection */}
            <section>
              <h4 className="text-xs font-black mb-3 uppercase tracking-wider text-slate-400">3. Apply Filter</h4>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {(['none', 'chrome', 'mono', 'fade', 'warm', 'cool', 'contrast', 'cinematic'] as Filter[]).map(f => (
                  <button 
                    key={f} 
                    onClick={() => { console.log('Filter set to:', f); setFilter(f); }}
                    className={clsx(
                      "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 whitespace-nowrap transition-all",
                      filter === f ? "border-blue-600 bg-blue-600 text-white shadow-md" : "border-slate-100 bg-white text-slate-400"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </section>

            {/* Stats Toggle */}
            <section>
               <button 
                 onClick={() => { console.log('Toggle stats clicked'); setShowStats(!showStats); }}
                 className="flex items-center justify-between w-full p-5 bg-slate-50 rounded-2xl active:bg-slate-100 transition-colors"
               >
                  <span className="text-xs font-black uppercase tracking-widest text-slate-700">Display Analytics</span>
                  <div className={clsx(
                    "w-10 h-5 rounded-full relative flex items-center p-1 transition-colors", 
                    showStats ? "bg-blue-600" : "bg-slate-300"
                  )}>
                    <div className={clsx(
                      "w-3 h-3 bg-white rounded-full transition-transform",
                      showStats ? "translate-x-5" : "translate-x-0"
                    )} />
                  </div>
               </button>
            </section>
          </>
        )}

        {/* 4. Save Button */}
        <button 
          onClick={handleExport}
          disabled={!photo || isExporting}
          className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center space-x-2 shadow-xl active:scale-[0.98] transition-all disabled:opacity-20"
        >
          {isExporting ? <span>Saving Recap...</span> : <><Download size={18} strokeWidth={3} /> <span>Save to Device</span></>}
        </button>
      </div>
    </div>
  );
};
