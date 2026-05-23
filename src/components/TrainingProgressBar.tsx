import React from 'react';
import { clsx } from 'clsx';

interface Props {
  current: number;
  target: number;
  label: string;
  unit: string;
  color?: string;
}

export const TrainingProgressBar: React.FC<Props> = ({ current, target, label, unit, color = 'bg-blue-600' }) => {
  const percent = Math.min(100, Math.round((current / target) * 100));
  const remaining = Math.max(0, target - current);

  return (
    <div className="space-y-3 w-full">
      <div className="flex justify-between items-end px-1">
         <div className="space-y-0.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">{label}</p>
            <p className="text-xl font-black italic tracking-tighter text-slate-900 leading-none">
               {current.toFixed(2)} / {target.toFixed(1)} <span className="text-[10px] text-slate-400 not-italic uppercase tracking-normal">{unit}</span>
            </p>
         </div>
         <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">Remaining</p>
            <p className="text-lg font-black italic tracking-tighter text-slate-900 leading-none">
               {remaining.toFixed(2)} <span className="text-[10px] text-slate-400 not-italic uppercase tracking-normal">{unit}</span>
            </p>
         </div>
      </div>
      
      <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 border border-slate-200/50 relative">
         <div 
           className={clsx("h-full rounded-full transition-all duration-1000 shadow-sm", color)}
           style={{ width: `${percent}%` }}
         />
      </div>
    </div>
  );
};
