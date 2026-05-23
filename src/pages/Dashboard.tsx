import React from 'react';
import { useRunStore } from '../store/useRunStore';
import { calculatePace, formatDuration, getZoneAnalysis } from '../utils/calculations';
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
import { Link } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { clsx } from 'clsx';

export const Dashboard: React.FC = () => {
  const { runs, userProfile, plans, activePlanId } = useRunStore();

  const totalDistance = runs.reduce((acc, run) => acc + run.distance, 0);
  const totalRuns = runs.length;
  const avgPace = totalDistance > 0 
    ? calculatePace(runs.reduce((acc, run) => acc + run.duration, 0), totalDistance)
    : '0:00';
    
  const recentRuns = runs.slice(0, 4);
  const activePlan = plans.find(p => p.id === activePlanId);

  // Sparkline data for cards
  const sparkData = runs.slice(0, 7).reverse().map(r => ({ val: r.distance }));

  const stats = [
    { label: 'Total Distance', value: `${totalDistance.toFixed(1)}`, unit: 'mi', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', trend: sparkData },
    { label: 'Avg Pace', value: avgPace, unit: '/mi', icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: [] },
    { label: 'Total Activities', value: totalRuns, unit: 'runs', icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50', trend: [] },
    { label: 'Avg HR', value: totalRuns > 0 ? Math.round(runs.reduce((acc, run) => acc + run.avgHeartRate, 0) / totalRuns) : 0, unit: 'bpm', icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50', trend: [] },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Hey {userProfile.name.split(' ')[0]} 👋
          </h2>
          <p className="text-slate-500 font-bold flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>You're on a 3-day running streak!</span>
          </p>
        </div>
        <div className="flex items-center -space-x-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-black overflow-hidden shadow-sm">
              <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="Friend" />
            </div>
          ))}
          <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm">
            +12
          </div>
        </div>
      </header>

      {/* Grid Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="group bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} strokeWidth={2.5} />
              </div>
              {stat.trend.length > 0 && (
                <div className="h-10 w-20">
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={stat.trend}>
                       <Area type="monotone" dataKey="val" stroke={i === 0 ? '#3b82f6' : '#10b981'} fill={i === 0 ? '#dbeafe' : '#d1fae5'} strokeWidth={2} />
                     </AreaChart>
                   </ResponsiveContainer>
                </div>
              )}
            </div>
            <div>
              <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.15em] mb-1">{stat.label}</p>
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-black text-slate-900">{stat.value}</span>
                <span className="text-sm font-bold text-slate-400">{stat.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Feed */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900 flex items-center space-x-3">
              <Activity size={24} className="text-blue-600" />
              <span>Recent Feed</span>
            </h3>
            <Link to="/history" className="text-slate-400 font-black text-xs uppercase tracking-widest hover:text-blue-600 transition-colors">View Timeline</Link>
          </div>
          
          <div className="space-y-6">
            {recentRuns.length === 0 ? (
              <div className="bg-white p-16 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Plus size={32} className="text-slate-300" />
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-2">Ready to hit the pavement?</h4>
                <p className="text-slate-500 font-medium mb-8">Log your first activity to start seeing your analytics.</p>
                <Link to="/add-run" className="inline-flex items-center space-x-3 bg-slate-900 text-white px-8 py-4 rounded-full font-black hover:bg-blue-600 transition-all shadow-xl shadow-slate-200">
                  <Plus size={20} />
                  <span>Log your first run</span>
                </Link>
              </div>
            ) : (
              recentRuns.map((run) => {
                const analysis = getZoneAnalysis(run.avgHeartRate, userProfile.zoneSettings);
                return (
                  <Link 
                    key={run.id} 
                    to={`/run/${run.id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white rounded-[2rem] border border-slate-100 hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1 transition-all group"
                  >
                    <div className="flex items-center space-x-5 mb-4 sm:mb-0">
                      <div className={clsx(
                        "w-16 h-16 rounded-[1.25rem] flex flex-col items-center justify-center font-black relative overflow-hidden",
                        analysis.color.replace('text', 'bg').replace('500', '100'),
                        analysis.color
                      )}>
                        <div className={clsx("absolute top-0 left-0 w-full h-1", analysis.color.replace('text', 'bg'))} />
                        <span className="text-2xl leading-none">{run.distance.toFixed(1)}</span>
                        <span className="text-[10px] uppercase tracking-tighter opacity-70">mi</span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-0.5">
                          <p className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{run.title}</p>
                          {analysis.score > 90 && (
                            <span className="w-2 h-2 bg-emerald-500 rounded-full" title="Perfect Zone 2" />
                          )}
                        </div>
                        <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                          <span>{new Date(run.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <span>{run.type}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end sm:space-x-10 pl-2 sm:pl-0">
                      <div className="flex space-x-8">
                        <div className="text-center sm:text-right">
                          <p className="text-sm font-black text-slate-900">{calculatePace(run.duration, run.distance)}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">/mi</p>
                        </div>
                        <div className="text-center sm:text-right">
                          <p className="text-sm font-black text-slate-900">{formatDuration(run.duration)}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">time</p>
                        </div>
                        <div className="hidden md:block text-right">
                          <p className={clsx("text-sm font-black", analysis.color)}>{analysis.score}%</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-nowrap">Z2 Disc.</p>
                        </div>
                      </div>
                      <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                        <ChevronRight size={20} strokeWidth={3} />
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar widgets */}
        <div className="lg:col-span-4 space-y-8">
           {/* Training Widget */}
          <div className="space-y-4">
            <h3 className="text-xl font-black text-slate-900 flex items-center space-x-3 pl-2">
              <Target size={20} className="text-blue-600" />
              <span>Current Goal</span>
            </h3>
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-blue-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full -mr-16 -mt-16 blur-3xl opacity-30 group-hover:opacity-50 transition-opacity" />
              
              {activePlan ? (
                <>
                  <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Active Plan</p>
                  <h4 className="text-2xl font-black mb-6 leading-tight">{activePlan.title}</h4>
                  
                  <div className="space-y-6 relative z-10">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-white">12%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full w-[12%] shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-white/5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Next Session</p>
                          <p className="font-black text-sm">Zone 2 Base Run</p>
                          <p className="text-xs text-slate-500 font-bold mt-0.5">2.0 miles @ Z2 Intensity</p>
                        </div>
                        <Link to="/training" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                          <ArrowUpRight size={18} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                   <p className="text-slate-400 text-sm font-bold mb-6 italic">"A goal without a plan is just a wish."</p>
                   <Link to="/training" className="inline-block bg-white text-slate-900 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform">
                      Browse Plans
                   </Link>
                </div>
              )}
            </div>
          </div>

          {/* PR Widget */}
          <div className="space-y-4">
            <h3 className="text-xl font-black text-slate-900 flex items-center space-x-3 pl-2">
              <Trophy size={20} className="text-amber-500" />
              <span>Personal Best</span>
            </h3>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
               <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50 group hover:bg-amber-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm">
                      <TrendingUp size={18} strokeWidth={3} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fastest 5K</p>
                      <p className="text-lg font-black text-slate-900">22:45</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-amber-300" />
               </div>
               <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                      <Target size={18} strokeWidth={3} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Longest Run</p>
                      <p className="text-lg font-black text-slate-900">12.4 mi</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-200" />
               </div>
               <Link to="/records" className="block text-center pt-2 text-xs font-black text-blue-600 uppercase tracking-widest hover:underline">Full Trophy Case</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
