import React from 'react';
import { Volume2, VolumeX, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import type { CoachingSettings } from '../types';

interface Props {
  settings: CoachingSettings;
  currentPaceSeconds: number;
  targetMinSeconds: number;
  targetMaxSeconds: number;
  isGPSGood: boolean;
  isPaused: boolean;
}

export const VoiceCoachStatus: React.FC<Props> = ({
  settings,
  currentPaceSeconds,
  targetMinSeconds,
  targetMaxSeconds,
  isGPSGood,
  isPaused
}) => {
  if (!settings.enabled) {
    return (
      <div className="flex items-center space-x-2 text-slate-400 bg-slate-50 px-4 py-2 rounded-2xl">
         <VolumeX size={14} />
         <span className="text-[10px] font-black uppercase tracking-widest">Voice Coach Off</span>
      </div>
    );
  }

  let status = "On Target";
  let color = "text-emerald-500 bg-emerald-50";
  let Icon = CheckCircle2;

  if (isPaused) {
    status = "Paused";
    color = "text-slate-400 bg-slate-100";
    Icon = Volume2;
  } else if (!isGPSGood) {
    status = "Stabilizing GPS";
    color = "text-amber-500 bg-amber-50";
    Icon = AlertTriangle;
  } else if (targetMinSeconds > 0 && currentPaceSeconds < targetMinSeconds) {
    status = "Too Fast";
    color = "text-rose-500 bg-rose-50";
    Icon = AlertTriangle;
  } else if (targetMaxSeconds > 0 && currentPaceSeconds > targetMaxSeconds) {
    status = "Too Slow";
    color = "text-rose-500 bg-rose-50";
    Icon = AlertTriangle;
  } else if (targetMinSeconds === 0 && targetMaxSeconds === 0) {
    status = "No Target Pace";
    color = "text-slate-400 bg-slate-50";
    Icon = Volume2;
  }

  return (
    <div className={clsx("flex items-center space-x-3 px-4 py-2 rounded-2xl transition-colors shadow-sm", color)}>
       <Icon size={14} strokeWidth={3} />
       <span className="text-[10px] font-black uppercase tracking-[0.1em]">{status}</span>
    </div>
  );
};
