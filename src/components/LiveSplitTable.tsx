import React from 'react';
import type { LiveSplit } from '../utils/splits';
import { formatDuration } from '../utils/calculations';

interface Props {
  splits: LiveSplit[];
}

export const LiveSplitTable: React.FC<Props> = ({ splits }) => {
  if (splits.length === 0) return null;

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
      <table className="w-full text-left">
        <thead className="bg-slate-50/50 border-b border-slate-100">
          <tr>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mile</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pace</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {[...splits].reverse().map((split) => (
            <tr key={split.mile} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4 font-black text-slate-900 italic">#{split.mile}</td>
              <td className="px-6 py-4 font-black text-blue-600 leading-none">{split.pace}</td>
              <td className="px-6 py-4 text-xs font-bold text-slate-500">{formatDuration(Math.round(split.time / 1000))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
