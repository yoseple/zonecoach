import React, { useState } from 'react';
import { useRunStore } from '../store/useRunStore';
import { 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  Activity, 
  Trophy, 
  Zap, 
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { generatePlan } from '../utils/planEngine';
import type { PlanGoal } from '../utils/planEngine';

const GOAL_OPTIONS: { value: PlanGoal; label: string; icon: any; color: string }[] = [
  { value: 'beginner-5k', label: 'Beginner 5K', icon: Trophy, color: 'text-emerald-500' },
  { value: 'faster-5k', label: 'Faster 5K', icon: Zap, color: 'text-blue-500' },
  { value: 'zone2-base', label: 'Zone 2 Base', icon: Activity, color: 'text-rose-500' },
  { value: 'marathon', label: 'Full Marathon', icon: Trophy, color: 'text-amber-500' },
  { value: '10k', label: '10K Goal', icon: Zap, color: 'text-purple-500' },
  { value: 'faster-mile', label: 'Faster Mile', icon: Zap, color: 'text-orange-500' },
];

export const TrainingPlans: React.FC = () => {
  const { plans, activePlanId, updateWorkoutStatus, setActivePlan, selectPlan } = useRunStore();
  const [currentWeek, setCurrentWeek] = useState(1);
  
  const activePlan = plans.find(p => p.id === activePlanId);
  const weekWorkouts = activePlan?.workouts.filter(w => w.week === currentWeek) || [];

  const handleEnroll = (goal: PlanGoal) => {
    const newPlan = generatePlan(goal);
    selectPlan(newPlan);
    setCurrentWeek(1);
  };

  const calculateProgress = () => {
    if (!activePlan) return 0;
    const completed = activePlan.workouts.filter(w => w.status === 'completed').length;
    return Math.round((completed / activePlan.workouts.length) * 100);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <header className="max-w-2xl space-y-4">
        <div className="w-16 h-16 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-blue-200">
           <Zap size={32} fill="currentColor" strokeWidth={2.5} />
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight italic">Training Labs</h2>
        <p className="text-slate-500 font-bold text-lg leading-relaxed">
          Expert-crafted regimes designed to optimize your aerobic base and peak performance.
        </p>
      </header>

      {activePlan ? (
        <section className="space-y-8 animate-in zoom-in-95 duration-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 gap-4">
            <div className="flex items-center space-x-3">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
               <h3 className="text-2xl font-black text-slate-900">Active: {activePlan.title}</h3>
            </div>
            <div className="flex items-center space-x-4">
               <div className="flex items-center bg-white border border-slate-100 rounded-2xl p-1 shadow-sm">
                  <button 
                    onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
                    disabled={currentWeek === 1}
                    className="p-2 text-slate-400 hover:text-slate-900 disabled:opacity-20 transition-colors"
                  >
                    <ChevronLeft size={20} strokeWidth={3} />
                  </button>
                  <span className="px-4 text-xs font-black uppercase tracking-widest text-slate-700">Week {currentWeek}</span>
                  <button 
                    onClick={() => setCurrentWeek(Math.min(activePlan.durationWeeks, currentWeek + 1))}
                    disabled={currentWeek === activePlan.durationWeeks}
                    className="p-2 text-slate-400 hover:text-slate-900 disabled:opacity-20 transition-colors"
                  >
                    <ChevronRight size={20} strokeWidth={3} />
                  </button>
               </div>
               <button 
                 onClick={() => setActivePlan(null)}
                 className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-600 transition-colors"
               >
                 End Plan
               </button>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[3rem] shadow-2xl shadow-blue-100 overflow-hidden text-white relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full -mr-32 -mt-32 blur-[100px] opacity-20 pointer-events-none" />
            
            <div className="p-8 md:p-12 border-b border-white/5 relative z-10">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="space-y-2">
                     <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Elite Training Program</p>
                     <h2 className="text-5xl font-black italic tracking-tighter">{activePlan.title}</h2>
                     <p className="text-slate-400 font-bold text-lg max-w-xl italic">"{activePlan.goal}"</p>
                  </div>
                  <div className="flex gap-10">
                     <div className="space-y-1">
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest text-nowrap">Progress</p>
                        <p className="text-3xl font-black italic text-blue-400">{calculateProgress()}%</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest text-nowrap">Intensity</p>
                        <p className="text-3xl font-black italic text-emerald-400">{activePlan.difficulty.charAt(0)}</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-8 md:p-12 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {weekWorkouts.map((workout) => (
                  <div 
                    key={workout.id}
                    className={clsx(
                      "p-8 rounded-[2.5rem] border-2 transition-all duration-300 relative group",
                      workout.status === 'completed' ? "bg-emerald-500/5 border-emerald-500/20" : "bg-white/5 border-white/5 hover:border-blue-500/30"
                    )}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <span className={clsx(
                        "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                        workout.status === 'completed' ? "bg-emerald-500 text-white" : "bg-white/10 text-slate-400"
                      )}>
                        {workout.day}
                      </span>
                      {workout.status === 'completed' ? (
                        <CheckCircle2 size={24} className="text-emerald-500" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-white/10 group-hover:border-blue-500/50 transition-colors" />
                      )}
                    </div>
                    
                    <h5 className={clsx("text-xl font-black italic mb-2 tracking-tight", workout.status === 'completed' ? "text-slate-300 line-through opacity-50" : "text-white")}>
                       {workout.type}
                    </h5>
                    
                    <div className="flex items-center space-x-4 text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 mb-8">
                      {workout.targetDistance && (
                        <div className="flex items-center space-x-1.5">
                          <MapPin size={12} className="text-blue-500" />
                          <span>{workout.targetDistance} mi</span>
                        </div>
                      )}
                      {workout.targetZone && (
                        <div className="flex items-center space-x-1.5">
                          <Activity size={12} className="text-emerald-500" />
                          <span>Zone {workout.targetZone}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      {workout.status !== 'completed' && (
                        <button 
                          onClick={() => updateWorkoutStatus(activePlan.id, workout.id, 'completed')}
                          className="flex-1 bg-white text-slate-900 text-[10px] font-black uppercase py-4 rounded-2xl hover:bg-blue-500 hover:text-white transition-all shadow-lg active:scale-95"
                        >
                          Mark Done
                        </button>
                      )}
                      {workout.status === 'pending' && (
                        <button 
                          onClick={() => updateWorkoutStatus(activePlan.id, workout.id, 'skipped')}
                          className="w-12 bg-white/5 text-slate-500 rounded-2xl flex items-center justify-center hover:bg-rose-500/20 hover:text-rose-400 transition-all"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
          <Trophy size={64} className="mx-auto text-slate-100 mb-8" strokeWidth={1} />
          <h3 className="text-3xl font-black text-slate-900 mb-2">Forge Your Legacy</h3>
          <p className="text-slate-500 font-bold max-w-md mx-auto mb-10 leading-relaxed italic text-lg">
            Every athlete needs a roadmap. Choose a program below to begin your transformation.
          </p>
        </section>
      )}

      {/* Templates Section */}
      <section className="space-y-10 px-2">
        <div className="flex items-center justify-between">
           <h3 className="text-2xl font-black text-slate-900 italic tracking-tight">Available Programs</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {GOAL_OPTIONS.map((goal) => (
            <div 
              key={goal.value}
              className="group bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2 transition-all duration-500 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50", goal.color)}>
                  <goal.icon size={24} strokeWidth={2.5} />
                </div>
              </div>
              
              <h4 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter leading-tight italic group-hover:text-blue-600 transition-colors">{goal.label}</h4>
              
              <button 
                onClick={() => handleEnroll(goal.value)}
                className="mt-8 w-full font-black uppercase tracking-[0.3em] text-[10px] py-5 rounded-[1.5rem] bg-slate-900 text-white hover:bg-blue-600 shadow-xl shadow-slate-200 transition-all flex items-center justify-center space-x-3"
              >
                <span>Enroll Athlete</span>
                <ArrowRight size={14} strokeWidth={3} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
