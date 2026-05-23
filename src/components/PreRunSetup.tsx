import React, { useState } from 'react';
import type { RunType, CoachingSettings } from '../types';
import { 
  Play, 
  ChevronRight, 
  ChevronLeft, 
  Volume2, 
  Zap, 
  Info
} from 'lucide-react';
import { clsx } from 'clsx';
import { GpsAccuracyBadge } from './GpsAccuracyBadge';

interface Props {
  onStart: (type: RunType, pace: { min: string; max: string }, coach: CoachingSettings) => void;
  gpsAccuracy: number | null;
  initialType?: RunType;
}

const RUN_TYPES: RunType[] = [
  'Free Run', 
  'Easy Run', 
  'Zone 2 Run', 
  'Tempo Run', 
  'Interval Run', 
  'Long Run', 
  'Race Pace'
];

const PACE_PRESETS = [
  { label: '8:00 - 8:30', min: '8:00', max: '8:30' },
  { label: '9:00 - 9:30', min: '9:00', max: '9:30' },
  { label: '10:00 - 11:00', min: '10:00', max: '11:00' },
  { label: '11:00 - 12:00', min: '11:00', max: '12:00' },
];

export const PreRunSetup: React.FC<Props> = ({ onStart, gpsAccuracy, initialType }) => {
  const [step, setStep] = useState(1);
  const [runType, setRunType] = useState<RunType>(initialType || 'Free Run');
  const [targetMinPace, setTargetMinPace] = useState('');
  const [targetMaxPace, setTargetMaxPace] = useState('');
  const [coachSettings, setCoachSettings] = useState<CoachingSettings>({
    enabled: true,
    paceAlerts: true,
    mileAnnouncements: true,
    goalAnnouncements: true,
    voiceRate: 1,
    voicePitch: 1,
    cooldownSeconds: 75,
    keepScreenAwake: true
  });

  const isGPSReady = gpsAccuracy !== null && gpsAccuracy <= 20;

  const handleStart = () => {
    onStart(runType, { min: targetMinPace, max: targetMaxPace }, coachSettings);
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex items-center justify-between">
         <div className="space-y-1">
            <h2 className="text-3xl font-black italic tracking-tighter text-slate-900">Mission Setup</h2>
            <div className="flex items-center space-x-2">
               <div className={clsx("w-2 h-2 rounded-full", isGPSReady ? "bg-emerald-500" : "bg-amber-500 animate-pulse")} />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {isGPSReady ? 'Signal Locked' : 'Awaiting Satellite'}
               </span>
            </div>
         </div>
         <div className="flex flex-col items-end">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-300">Phase</p>
            <p className="text-xl font-black italic text-blue-600">{step} <span className="text-[10px] text-slate-300">/ 3</span></p>
         </div>
      </header>

      {/* Step 1: Mode */}
      {step === 1 && (
        <section className="space-y-6 animate-in fade-in duration-500">
           <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full -mr-16 -mt-16 blur-3xl opacity-30" />
              <div className="relative z-10 space-y-2">
                 <h3 className="text-2xl font-black italic">Select Run Mode</h3>
                 <p className="text-slate-400 text-sm font-medium italic leading-relaxed">Choose your assignment profile for targeted coaching.</p>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-3">
              {RUN_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setRunType(t)}
                  className={clsx(
                    "py-5 px-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all border-2",
                    runType === t ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                  )}
                >
                  {t}
                </button>
              ))}
           </div>
           
           <button 
             onClick={() => setStep(2)}
             className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center space-x-3 shadow-xl active:scale-95 transition-all"
           >
              <span>Next Configuration</span>
              <ChevronRight size={16} strokeWidth={3} />
           </button>
        </section>
      )}

      {/* Step 2: Pace */}
      {step === 2 && (
        <section className="space-y-6 animate-in slide-in-from-right-4 duration-500">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-2">
              <h3 className="text-2xl font-black italic text-slate-900">Target Pace</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed italic">Optional: Set your target range for live audio correction.</p>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 px-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fastest (/mi)</label>
                 <input 
                   placeholder="e.g. 9:00" 
                   value={targetMinPace}
                   onChange={e => setTargetMinPace(e.target.value)}
                   className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-black text-slate-700 text-center border-2 border-transparent focus:border-blue-100 transition-all"
                 />
              </div>
              <div className="space-y-2 px-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Slowest (/mi)</label>
                 <input 
                   placeholder="e.g. 10:00" 
                   value={targetMaxPace}
                   onChange={e => setTargetMaxPace(e.target.value)}
                   className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-black text-slate-700 text-center border-2 border-transparent focus:border-blue-100 transition-all"
                 />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-3">
              {PACE_PRESETS.map(p => (
                <button
                  key={p.label}
                  onClick={() => { setTargetMinPace(p.min); setTargetMaxPace(p.max); }}
                  className="py-4 bg-slate-50 rounded-2xl text-[9px] font-black uppercase text-slate-500 hover:bg-slate-100 transition-colors border border-slate-100"
                >
                  {p.label}
                </button>
              ))}
           </div>

           <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="p-6 bg-slate-100 text-slate-400 rounded-2xl hover:text-slate-600 transition-colors"><ChevronLeft size={20} strokeWidth={3} /></button>
              <button 
                onClick={() => setStep(3)}
                className="flex-1 py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center space-x-3 shadow-xl active:scale-95 transition-all"
              >
                 <span>Coaching Settings</span>
                 <ChevronRight size={16} strokeWidth={3} />
              </button>
           </div>
        </section>
      )}

      {/* Step 3: Coaching & GPS */}
      {step === 3 && (
        <section className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-10">
           <div className="space-y-4">
              <button 
                onClick={() => setCoachSettings({...coachSettings, enabled: !coachSettings.enabled})}
                className={clsx(
                  "flex items-center justify-between w-full p-6 rounded-[2rem] border-2 transition-all",
                  coachSettings.enabled ? "bg-emerald-50 border-emerald-100 shadow-lg shadow-emerald-50" : "bg-white border-slate-100 opacity-60"
                )}
              >
                 <div className="flex items-center space-x-4">
                    <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center", coachSettings.enabled ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-300")}>
                       <Volume2 size={20} />
                    </div>
                    <div className="text-left">
                       <p className={clsx("text-xs font-black uppercase tracking-widest", coachSettings.enabled ? "text-emerald-900" : "text-slate-400")}>Voice Coach</p>
                       <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Live Pace & Distance Audio</p>
                    </div>
                 </div>
                 <div className={clsx("w-10 h-6 rounded-full relative transition-colors p-1", coachSettings.enabled ? "bg-emerald-500" : "bg-slate-200")}>
                    <div className={clsx("w-4 h-4 bg-white rounded-full transition-transform shadow-sm", coachSettings.enabled ? "translate-x-4" : "translate-x-0")} />
                 </div>
              </button>

              <button 
                onClick={() => setCoachSettings({...coachSettings, keepScreenAwake: !coachSettings.keepScreenAwake})}
                className={clsx(
                  "flex items-center justify-between w-full p-6 rounded-[2rem] border-2 transition-all",
                  coachSettings.keepScreenAwake ? "bg-blue-50 border-blue-100" : "bg-white border-slate-100"
                )}
              >
                 <div className="flex items-center space-x-4">
                    <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center", coachSettings.keepScreenAwake ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-300")}>
                       <Zap size={20} />
                    </div>
                    <div className="text-left">
                       <p className={clsx("text-xs font-black uppercase tracking-widest", coachSettings.keepScreenAwake ? "text-blue-900" : "text-slate-400")}>Screen Wake</p>
                       <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Prevent screen dimming (PWA)</p>
                    </div>
                 </div>
                 <div className={clsx("w-10 h-6 rounded-full relative transition-colors p-1", coachSettings.keepScreenAwake ? "bg-blue-500" : "bg-slate-200")}>
                    <div className={clsx("w-4 h-4 bg-white rounded-full transition-transform shadow-sm", coachSettings.keepScreenAwake ? "translate-x-4" : "translate-x-0")} />
                 </div>
              </button>
           </div>

           {/* Signal Lock Dashboard */}
           <div className="bg-slate-900 p-8 rounded-[3rem] text-white space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px] opacity-10" />
              <div className="relative z-10 flex items-center justify-between">
                 <div className="space-y-1">
                    <h4 className="text-xl font-black italic italic">Telemetry Status</h4>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">Awaiting high-res coordination</p>
                 </div>
                 <GpsAccuracyBadge accuracy={gpsAccuracy} />
              </div>
              
              {!isGPSReady && (
                 <div className="bg-white/5 border border-white/5 p-5 rounded-2xl flex items-start space-x-4 relative z-10">
                    <Info className="text-amber-400 shrink-0 mt-0.5" size={16} />
                    <p className="text-[10px] text-slate-400 font-bold leading-relaxed italic">
                       GPS accuracy is insufficient ({gpsAccuracy?.toFixed(0)}m). Ensure you are outdoors with a clear view of the sky for peak precision.
                    </p>
                 </div>
              )}
           </div>

           <div className="flex gap-4">
              <button onClick={() => setStep(2)} className="p-6 bg-slate-100 text-slate-400 rounded-2xl hover:text-slate-600 transition-colors"><ChevronLeft size={20} strokeWidth={3} /></button>
              <button 
                onClick={handleStart}
                disabled={!isGPSReady}
                className={clsx(
                  "flex-1 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm shadow-2xl transition-all flex items-center justify-center space-x-3 active:scale-95",
                  isGPSReady ? "bg-blue-600 text-white shadow-blue-200" : "bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200"
                )}
              >
                 <Play size={20} fill="currentColor" />
                 <span>Ignition Start</span>
              </button>
           </div>

           <p className="text-[8px] text-slate-400 font-bold text-center uppercase tracking-widest px-8 leading-relaxed italic opacity-60">
              * Keep this app active and visible for best results. Native background tracking is limited by browser policy.
           </p>
        </section>
      )}
    </div>
  );
};
