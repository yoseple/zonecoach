import React from 'react';
import { getGPSAccuracyCategory } from '../utils/gps';
import { clsx } from 'clsx';

interface Props {
  accuracy: number | null;
}

export const GpsAccuracyBadge: React.FC<Props> = ({ accuracy }) => {
  if (accuracy === null) return (
    <div className="flex items-center space-x-2 px-3 py-1 bg-slate-100 rounded-full">
      <div className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" />
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Waiting for GPS</span>
    </div>
  );

  const category = getGPSAccuracyCategory(accuracy);

  return (
    <div className={clsx("flex items-center space-x-2 px-3 py-1 rounded-full transition-colors", category.bg)}>
      <div className={clsx("w-2 h-2 rounded-full", category.color.replace('text', 'bg'))} />
      <span className={clsx("text-[10px] font-black uppercase tracking-widest", category.color)}>
        {category.label} GPS ({Math.round(accuracy)}m)
      </span>
    </div>
  );
};
