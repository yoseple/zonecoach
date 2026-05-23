import React from 'react';
import type { CoachingSettings } from '../types';
import { Volume2, Smartphone, Zap, Clock, Play } from 'lucide-react';
import { clsx } from 'clsx';
import { speak } from '../utils/speech';

interface Props {
  settings: CoachingSettings;
  onChange: (settings: CoachingSettings) => void;
}

export const VoiceCoachSettings: React.FC<Props> = ({ settings, onChange }) => {
  const handleTest = () => {
    speak("Voice coaching is ready.", settings);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
         <h3 className="text-xl font-black italic text-slate-900">Coaching Engine</h3>
         <button 
           onClick={handleTest}
           className="flex items-center space-x-2 text-[10px] font-black uppercase text-blue-600 tracking-widest hover:underline"
         >
            <Play size={12} fill="currentColor" />
            <span>Test Audio</span>
         </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Toggle Master */}
        <button 
          onClick={() => onChange({...settings, enabled: !settings.enabled})}
          className={clsx(
            "flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all",
            settings.enabled ? "bg-emerald-50 border-emerald-100 shadow-lg shadow-emerald-50" : "bg-white border-slate-100 opacity-60"
          )}
        >
          <div className="flex items-center space-x-4">
            <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center", settings.enabled ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-300")}>
               <Volume2 size={20} />
            </div>
            <div className="text-left">
               <p className={clsx("text-xs font-black uppercase tracking-widest", settings.enabled ? "text-emerald-900" : "text-slate-400")}>Main Switch</p>
               <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Enable All Audio Feedback</p>
            </div>
          </div>
          <div className={clsx("w-10 h-6 rounded-full relative transition-colors p-1", settings.enabled ? "bg-emerald-500" : "bg-slate-200")}>
            <div className={clsx("w-4 h-4 bg-white rounded-full transition-transform shadow-sm", settings.enabled ? "translate-x-4" : "translate-x-0")} />
          </div>
        </button>

        {/* Sub Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
           {[
             { key: 'paceAlerts', label: 'Pace Alerts', icon: Zap },
             { key: 'mileAnnouncements', label: 'Mile Splits', icon: Clock },
             { key: 'goalAnnouncements', label: 'Goal Status', icon: Zap }
           ].map(item => (
             <button 
               key={item.key}
               disabled={!settings.enabled}
               onClick={() => onChange({...settings, [item.key]: !settings[item.key as keyof CoachingSettings]})}
               className={clsx(
                 "p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center space-y-2",
                 !settings.enabled ? "opacity-30 grayscale cursor-not-allowed" :
                 settings[item.key as keyof CoachingSettings] ? "bg-blue-50 border-blue-100 text-blue-600 shadow-sm" : "bg-white border-slate-50 text-slate-400"
               )}
             >
                <item.icon size={18} />
                <span className="text-[9px] font-black uppercase tracking-widest leading-none">{item.label}</span>
             </button>
           ))}
        </div>

        {/* Sliders */}
        <div className={clsx("bg-slate-50 p-6 rounded-[2rem] space-y-6 transition-opacity", !settings.enabled && "opacity-30 grayscale pointer-events-none")}>
           <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                 <span>Voice Rate</span>
                 <span className="text-slate-900">{settings.voiceRate.toFixed(1)}x</span>
              </div>
              <input 
                type="range" min="0.5" max="1.5" step="0.1" 
                value={settings.voiceRate} 
                onChange={e => onChange({...settings, voiceRate: parseFloat(e.target.value)})}
                className="w-full accent-blue-600"
              />
           </div>
           
           <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                 <span>Alert Cooldown</span>
                 <span className="text-slate-900">{settings.cooldownSeconds}s</span>
              </div>
              <input 
                type="range" min="30" max="180" step="15" 
                value={settings.cooldownSeconds} 
                onChange={e => onChange({...settings, cooldownSeconds: parseInt(e.target.value)})}
                className="w-full accent-blue-600"
              />
           </div>
        </div>
      </div>

      <div className="bg-slate-900 p-6 rounded-[2rem] text-white flex items-start space-x-4">
         <Smartphone className="text-blue-400 shrink-0 mt-0.5" size={18} />
         <p className="text-[9px] text-slate-400 font-medium leading-relaxed italic">
            <span className="text-white font-bold">Web Limitation:</span> Audio alerts may be blocked by some browsers if the app is in the background. Keep the screen active for best results.
         </p>
      </div>
    </div>
  );
};
