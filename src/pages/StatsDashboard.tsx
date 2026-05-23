import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { useRunStore } from '../store/useRunStore';
import { getZoneAnalysis } from '../utils/calculations';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const StatsDashboard: React.FC = () => {
  const { runs, userProfile } = useRunStore();

  const chartData = [...runs].reverse().map(run => ({
    date: new Date(run.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    distance: run.distance,
    pace: run.duration / run.distance / 60, // pace in decimal minutes
    hr: run.avgHeartRate,
    zone2: getZoneAnalysis(run.avgHeartRate, userProfile.zoneSettings).score,
  }));

  const typeDataMap = runs.reduce((acc, run) => {
    acc[run.type] = (acc[run.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeData = Object.entries(typeDataMap).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="max-w-2xl">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Performance Analysis</h2>
        <p className="text-slate-500 font-bold text-lg leading-relaxed">
          Deep dive into your training data. Track your progress across distance, pace, and heart rate discipline.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distance Trend */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group transition-all duration-300 hover:shadow-2xl hover:shadow-blue-100/50">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-black text-slate-900">Distance Volume</h3>
             <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">Miles</div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorDist" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: '700', fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: '700', fill: '#94a3b8'}} />
                <Tooltip 
                  cursor={{stroke: '#3b82f6', strokeWidth: 2}}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                />
                <Area type="monotone" dataKey="distance" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorDist)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Zone 2 Discipline Score */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-100/50">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-black text-slate-900">Zone 2 Consistency</h3>
             <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">Discipline Score</div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: '700', fill: '#94a3b8'}} dy={10} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: '700', fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                />
                <Line type="monotone" dataKey="zone2" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Heart Rate Trend */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group transition-all duration-300 hover:shadow-2xl hover:shadow-rose-100/50">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-black text-slate-900">Average Heart Rate</h3>
             <div className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest">BPM</div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: '700', fill: '#94a3b8'}} dy={10} />
                <YAxis domain={['dataMin - 5', 'dataMax + 5']} axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: '700', fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                  cursor={{fill: '#f8fafc', radius: 10}}
                />
                <Bar dataKey="hr" fill="#ef4444" radius={[10, 10, 10, 10]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Run Type Breakdown */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-black text-slate-900">Activity Distribution</h3>
             <div className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">Frequency</div>
          </div>
          <div className="h-72 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={105}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {typeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div className="text-center">
                 <p className="text-3xl font-black text-slate-900">{runs.length}</p>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Activities</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
