import React from 'react';
import type { Workout } from '../types';
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  Activity, 
  Clock, 
  ArrowRight,
  MoreHorizontal
} from 'lucide-react';
import { clsx } from 'clsx';
import { formatDuration } from '../utils/calculations';

interface Props {
  workout: Workout;
  onStart?: (id: string) => void;
  onViewRun?: (runId: string) => void;
  onSkip?: (id: string) => void;
  isToday?: boolean;
}

export const WorkoutCard: React.FC<Props> = ({ 
  workout, 
  onStart, 
  onViewRun, 
  onSkip,
  isToday 
}) => {
  const isCompleted = workout.status === 'completed';
  const isSkipped = workout.status === 'skipped';
  const isPending = workout.status === 'pending';

  return (
    <div 
      className={clsx(
        "group relative p-8 rounded-[2.5rem] border-2 transition-all duration-300",
        isCompleted ? "bg-emerald-50/50 border-emerald-100" : 
        isToday ? "bg-white border-blue-500 shadow-xl shadow-blue-100" :
        "bg-white border-slate-50 hover:border-slate-200"
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
           <span className={clsx(
             "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
             isCompleted ? "bg-emerald-500 text-white" : 
             isToday ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
           )}>
             {workout.day}
           </span>
           {isToday && isPending && (
             <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
           )}
        </div>
        
        <div className="flex items-center space-x-2">
           {isCompleted ? (
             <CheckCircle2 size={24} className="text-emerald-500" />
           ) : isSkipped ? (
             <XCircle size={24} className="text-rose-400" />
           ) : (
             <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                <MoreHorizontal size={20} />
             </button>
           )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h5 className={clsx(
            "text-xl font-black italic tracking-tight leading-tight mb-1",
            isCompleted ? "text-emerald-900 opacity-60 line-through" : "text-slate-900"
          )}>
            {workout.type}
          </h5>
          <p className="text-xs text-slate-400 font-bold italic line-clamp-2">"{workout.notes}"</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
           {workout.targetDistance && (
             <div className="flex items-center space-x-1.5">
                <MapPin size={12} className="text-blue-500" />
                <span>{workout.targetDistance.toFixed(1)} mi</span>
             </div>
           )}
           {workout.targetDuration && (
             <div className="flex items-center space-x-1.5">
                <Clock size={12} className="text-purple-500" />
                <span>{formatDuration(workout.targetDuration)}</span>
             </div>
           )}
           {workout.targetZone && (
             <div className="flex items-center space-x-1.5">
                <Activity size={12} className="text-rose-500" />
                <span>Zone {workout.targetZone}</span>
             </div>
           )}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-50 flex gap-3">
         {isPending && onStart && (
           <button 
             onClick={() => onStart(workout.id)}
             className={clsx(
               "flex-1 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center space-x-3 transition-all active:scale-95 shadow-lg",
               isToday ? "bg-slate-900 text-white hover:bg-blue-600 shadow-slate-200" : "bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white"
             )}
           >
              <Play size={14} fill="currentColor" />
              <span>{isToday ? 'Start Training' : 'Start Now'}</span>
           </button>
         )}

         {isCompleted && workout.completedRunId && onViewRun && (
           <button 
             onClick={() => onViewRun(workout.completedRunId!)}
             className="flex-1 py-4 bg-emerald-100 text-emerald-700 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center space-x-2 hover:bg-emerald-200 transition-all"
           >
              <span>View Assignment</span>
              <ArrowRight size={14} strokeWidth={3} />
           </button>
         )}

         {isPending && isToday && onSkip && (
           <button 
             onClick={() => onSkip(workout.id)}
             className="w-12 h-14 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all"
           >
              <XCircle size={20} />
           </button>
         )}
      </div>
    </div>
  );
};
