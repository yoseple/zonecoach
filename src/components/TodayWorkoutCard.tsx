import React from 'react';
import type { Workout } from '../types';
import { 
  Play, 
  Target, 
  ArrowUpRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  workout: Workout;
  onStart: (id: string) => void;
}

export const TodayWorkoutCard: React.FC<Props> = ({ workout, onStart }) => {
  return (
    <div className="bg-slate-900 p-8 md:p-10 rounded-[3rem] text-white shadow-2xl shadow-blue-200 relative overflow-hidden group min-h-[340px] flex flex-col animate-in zoom-in-95 duration-500">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full -mr-32 -mt-32 blur-[100px] opacity-30 group-hover:opacity-50 transition-opacity duration-700" />
      
      <div className="relative z-10 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-8">
           <div>
              <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Priority Objective</p>
              <h4 className="text-4xl font-black italic tracking-tighter leading-tight">{workout.type}</h4>
           </div>
           <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
              <Target size={24} className="text-blue-400" />
           </div>
        </div>
        
        <p className="text-slate-400 font-bold text-sm italic mb-8 max-w-xs">"{workout.notes}"</p>

        <div className="space-y-8 mt-auto">
          <div className="flex gap-10">
             {workout.targetDistance && (
                <div>
                   <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">Target</p>
                   <p className="text-3xl font-black italic">{workout.targetDistance.toFixed(1)} <span className="text-xs uppercase opacity-40">Miles</span></p>
                </div>
             )}
             {workout.targetZone && (
                <div>
                   <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">Effort</p>
                   <p className="text-3xl font-black italic text-emerald-400">Zone {workout.targetZone}</p>
                </div>
             )}
          </div>
          
          <div className="pt-8 border-t border-white/10 flex items-center justify-between">
            <button 
              onClick={() => onStart(workout.id)}
              className="px-10 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs flex items-center space-x-3 hover:bg-blue-500 transition-all shadow-xl active:scale-95"
            >
              <Play size={18} fill="currentColor" />
              <span>Initiate Training</span>
            </button>
            <Link to="/training" className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors">
               <ArrowUpRight size={20} className="text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
