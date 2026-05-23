import React from 'react';
import { useRunStore } from '../store/useRunStore';
import { calculatePace, getZoneAnalysis } from '../utils/calculations';
import { 
  TrendingUp, 
  Activity, 
  Clock, 
  Calendar,
  ChevronRight,
  Plus,
  ArrowUpRight,
  Target,
  Trophy
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { clsx } from 'clsx';
import { TodayWorkoutCard } from '../components/TodayWorkoutCard';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { runs, userProfile, plans, activePlanId, setActiveWorkout } = useRunStore();

  const totalDistance = runs.reduce((acc, run) => acc + run.distance, 0);
  const totalRuns = runs.length;
  const avgPace = totalDistance > 0 
    ? calculatePace(runs.reduce((acc, run) => acc + run.duration, 0), totalDistance)
    : '0:00';
    
  const recentRuns = runs.slice(0, 3);
  const activePlan = plans.find(p => p.id === activePlanId);
  const todayWorkout = activePlan?.workouts.find(w => w.day === new Date().toLocaleDateString('en-US', { weekday: 'long' }) && w.status === 'pending');

  const handleStartWorkout = (id: string) => {
    setActiveWorkout(id);
    navigate('/live-run');
  };

  // Sparkline data for cards
  const sparkData = runs.slice(0, 7).reverse().map(r => ({ val: r.distance }));

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header & Quick Stats */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Hey {userProfile.name.split(' ')[0]} 👋
          </h2>
          <p className="text-slate-500 font-bold flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active Assignment: {activePlan ? activePlan.title : 'No active plan'}</span>
          </p>
        </div>
        
        <div className="flex space-x-4">
           <div className="bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm text-center min-w-[120px]">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Distance</p>
              <p className="text-xl font-black italic text-slate-900">{totalDistance.toFixed(1)} <span className="text-[10px] text-slate-400">mi</span></p>
           </div>
           <div className="bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm text-center min-w-[120px]">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Avg Pace</p>
              <p className="text-xl font-black italic text-blue-600">{avgPace} <span className="text-[10px] text-slate-400">/mi</span></p>
           </div>
        </div>
      </header>

      {/* Primary Focus: Active Goal / Training Regime */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <h3 className="text-xl font-black text-slate-900 flex items-center space-x-3 mb-6 px-2">
            <Target size={20} className="text-blue-600" />
            <span>Mission Objective</span>
          </h3>
          {todayWorkout ? (
            <TodayWorkoutCard workout={todayWorkout} onStart={handleStartWorkout} />
          ) : (
            <div className="bg-slate-900 p-8 md:p-10 rounded-[3rem] text-white shadow-2xl shadow-blue-200 relative overflow-hidden group min-h-[340px] flex flex-col">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full -mr-32 -mt-32 blur-[100px] opacity-30 group-hover:opacity-50 transition-opacity duration-700" />
              
              {activePlan ? (
                <div className="relative z-10 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                        <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Primary Regime</p>
                        <h4 className="text-4xl font-black italic tracking-tighter leading-tight">{activePlan.title}</h4>
                    </div>
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                        <Trophy size={24} className="text-blue-400" />
                    </div>
                  </div>
                  
                  <div className="space-y-8 mt-auto">
                    <p className="text-slate-400 font-bold text-sm italic">"Mission for today accomplished or resting. Prepare for the next cycle."</p>
                    <Link to="/training" className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center space-x-2 hover:bg-blue-500 hover:text-white transition-all shadow-xl active:scale-95 self-start">
                      <span>View Roadmap</span>
                      <ArrowUpRight size={14} strokeWidth={3} />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center space-y-6">
                   <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center text-slate-600 border border-white/5">
                      <Target size={40} strokeWidth={1} />
                   </div>
                   <div className="space-y-2">
                      <h4 className="text-2xl font-black italic tracking-tight">No Active Program</h4>
                      <p className="text-slate-400 text-sm font-bold max-w-xs mx-auto italic">"Without strategy, execution is aimless."</p>
                   </div>
                   <Link to="/training" className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform shadow-xl shadow-white/5">
                      Browse Plans
                   </Link>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-5">
          <h3 className="text-xl font-black text-slate-900 flex items-center space-x-3 mb-6 px-2">
            <Activity size={20} className="text-emerald-500" />
            <span>Intelligence Feed</span>
          </h3>
          <div className="space-y-4">
            {recentRuns.length === 0 ? (
              <div className="bg-white p-16 rounded-[3rem] border-2 border-dashed border-slate-100 text-center flex flex-col items-center justify-center min-h-[340px]">
                <Plus size={32} className="text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold italic text-sm">Awaiting first activity logs...</p>
              </div>
            ) : (
              recentRuns.map((run) => {
                const analysis = getZoneAnalysis(run.avgHeartRate, userProfile.zoneSettings);
                return (
                  <Link 
                    key={run.id} 
                    to={`/run/${run.id}`}
                    className="flex items-center justify-between p-6 bg-white rounded-[2rem] border border-slate-100 hover:shadow-xl hover:shadow-slate-200/40 transition-all group"
                  >
                    <div className="flex items-center space-x-5">
                      <div className={clsx(
                        "w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black relative overflow-hidden",
                        analysis.color.replace('text', 'bg').replace('500', '100'),
                        analysis.color
                      )}>
                        <span className="text-xl leading-none italic">{run.distance.toFixed(1)}</span>
                        <span className="text-[8px] uppercase tracking-tighter opacity-70">mi</span>
                      </div>
                      <div>
                        <p className="font-black text-slate-900 group-hover:text-blue-600 transition-colors italic leading-tight">{run.title}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                          {new Date(run.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {run.type}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-200 group-hover:text-blue-600 transition-colors" strokeWidth={3} />
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Performance Analytics (Bottom Section) */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-xl font-black text-slate-900 flex items-center space-x-3">
             <TrendingUp size={20} className="text-purple-600" />
             <span>Analytics Overview</span>
           </h3>
           <Link to="/stats" className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-blue-600">Advanced Analysis</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {[
             { label: 'Weekly Vol', value: totalDistance.toFixed(1), unit: 'mi', color: 'text-blue-600', bg: 'bg-blue-50', icon: Calendar, trend: sparkData },
             { label: 'Avg Heart Rate', value: totalRuns > 0 ? Math.round(runs.reduce((acc, run) => acc + run.avgHeartRate, 0) / totalRuns) : '--', unit: 'bpm', color: 'text-rose-600', bg: 'bg-rose-50', icon: Activity, trend: [] },
             { label: 'Active Streak', value: '3', unit: 'days', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: TrendingUp, trend: [] },
             { label: 'Assignments', value: totalRuns, unit: 'total', color: 'text-purple-600', bg: 'bg-purple-50', icon: Clock, trend: [] },
           ].map((stat, i) => (
             <div key={i} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <stat.icon size={20} strokeWidth={2.5} />
                  </div>
                  {stat.trend.length > 0 && (
                    <div className="h-8 w-16 opacity-40">
                       <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={stat.trend}>
                           <Area type="monotone" dataKey="val" stroke="#3b82f6" fill="#dbeafe" strokeWidth={2} />
                         </AreaChart>
                       </ResponsiveContainer>
                    </div>
                  )}
                </div>
                <div>
                   <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                   <div className="flex items-baseline space-x-1">
                      <span className="text-2xl font-black text-slate-900 italic">{stat.value}</span>
                      <span className="text-[10px] font-bold text-slate-400">{stat.unit}</span>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </section>
    </div>
  );
};
