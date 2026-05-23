import React from 'react';
import type { Workout } from '../types';
import { Zap, Target, Activity, Info } from 'lucide-react';

interface Props {
  workout: Workout;
}

export const TrainingModeBanner: React.FC<Props> = ({ workout }) => {
  return (
    <div className="bg-slate-900 text-white rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden animate-in slide-in-from-top-4 duration-500">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full -mr-16 -mt-16 blur-3xl opacity-20" />
      
      <div className="relative z-10 flex items-start justify-between">
         <div className="space-y-3">
            <div className="flex items-center space-x-2">
               <Zap size={14} className="text-blue-400 fill-blue-400" />
               <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">Assignment In Progress</span>
            </div>
            <div>
               <h3 className="text-xl font-black italic tracking-tight">{workout.type}</h3>
               <p className="text-slate-400 text-[10px] font-bold mt-0.5 italic">"{workout.notes}"</p>
            </div>
            
            <div className="flex items-center space-x-4 pt-2">
               {workout.targetDistance && (
                  <div className="flex items-center space-x-1.5">
                     <Target size={12} className="text-slate-500" />
                     <span className="text-[10px] font-black uppercase tracking-widest">{workout.targetDistance}mi Target</span>
                  </div>
               )}
               {workout.targetZone && (
                  <div className="flex items-center space-x-1.5 border-l border-white/10 pl-4">
                     <Activity size={12} className="text-emerald-500" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Zone {workout.targetZone}</span>
                  </div>
               )}
            </div>
         </div>

         {workout.targetZone === 2 && (
            <div className="bg-white/5 border border-white/10 p-3 rounded-2xl max-w-[120px]">
               <div className="flex items-center space-x-1.5 mb-1">
                  <Info size={10} className="text-blue-400" />
                  <span className="text-[8px] font-black uppercase text-slate-500">Coach Tip</span>
               </div>
               <p className="text-[9px] text-slate-300 font-bold leading-tight italic">Conversational pace only.</p>
            </div>
         )}
      </div>
    </div>
  );
};
