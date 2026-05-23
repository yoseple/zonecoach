import React from 'react';
import { clsx } from 'clsx';

interface MetricProps {
  label: string;
  value: string | number;
  unit?: string;
  size?: 'normal' | 'large';
  color?: string;
}

const Metric: React.FC<MetricProps> = ({ label, value, unit, size = 'normal', color = 'text-slate-900' }) => (
  <div className="text-center space-y-1">
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">{label}</p>
    <div className="flex items-baseline justify-center space-x-1">
      <p className={clsx(
        "font-black tracking-tighter italic leading-none",
        size === 'large' ? "text-7xl" : "text-4xl",
        color
      )}>{value}</p>
      {unit && <span className="text-xs font-black uppercase text-slate-400 italic">{unit}</span>}
    </div>
  </div>
);

interface Props {
  time: string;
  distance: number;
  pace: string;
  avgPace: string;
}

export const LiveRunMetrics: React.FC<Props> = ({ time, distance, pace, avgPace }) => {
  return (
    <div className="space-y-12 py-4">
      <Metric label="Elapsed Time" value={time} size="large" />
      
      <div className="grid grid-cols-2 gap-12">
        <Metric label="Distance" value={distance.toFixed(2)} unit="mi" />
        <Metric label="Current Pace" value={pace} unit="/mi" color="text-blue-600" />
      </div>
      
      <div className="grid grid-cols-1 gap-12 border-t border-slate-100 pt-8">
        <Metric label="Average Pace" value={avgPace} unit="/mi" />
      </div>
    </div>
  );
};
