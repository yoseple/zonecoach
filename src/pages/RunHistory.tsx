import React from 'react';
import { Link } from 'react-router-dom';
import { useRunStore } from '../store/useRunStore';
import { calculatePace, formatDuration, getZoneAnalysis } from '../utils/calculations';
import { Trash2, ChevronRight, Activity, History as HistoryIcon, MapPin, Clock } from 'lucide-react';
import { clsx } from 'clsx';

export const RunHistory: React.FC = () => {
  const { runs, deleteRun, userProfile } = useRunStore();

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center space-x-4">
             <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                <HistoryIcon size={28} />
             </div>
             <span>Activity Timeline</span>
          </h2>
          <p className="text-slate-500 font-bold text-lg">Every run, every mile, all in one place.</p>
        </div>
        <Link 
          to="/live-run"
          className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 text-white font-black rounded-full hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
        >
          Start Live Tracker
        </Link>
      </header>

      {runs.length === 0 ? (
        <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-200 text-center space-y-6">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
             <MapPin size={48} />
          </div>
          <div className="max-w-xs mx-auto space-y-2">
            <h3 className="text-2xl font-black text-slate-900">Your history is clear</h3>
            <p className="text-slate-500 font-medium">Log your first activity to start building your running legacy.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {runs.map((run) => {
            const analysis = getZoneAnalysis(run.avgHeartRate, userProfile.zoneSettings);
            return (
              <div 
                key={run.id} 
                className="group bg-white rounded-[2.5rem] border border-slate-100 p-2 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center p-6 gap-6">
                  {/* Date & Icon */}
                  <div className="flex md:flex-col items-center justify-center md:w-24 text-center border-b md:border-b-0 md:border-r border-slate-50 pb-4 md:pb-0 md:pr-4">
                     <span className="text-3xl font-black text-slate-900 italic leading-none">{new Date(run.date).getDate()}</span>
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                        {new Date(run.date).toLocaleDateString('en-US', { month: 'short' })}
                     </span>
                  </div>

                  {/* Main Info */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                        {run.title}
                      </h4>
                      {run.distance > 6.2 && (
                        <div className="bg-purple-100 text-purple-700 p-1 rounded-md" title="Endurance Run">
                           <AwardIcon size={14} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                       <span className="flex items-center space-x-1.5 text-blue-600">
                          <Activity size={12} strokeWidth={3} />
                          <span>{run.type}</span>
                       </span>
                       <span className="flex items-center space-x-1.5">
                          <Clock size={12} strokeWidth={3} />
                          <span>{formatDuration(run.duration)}</span>
                       </span>
                       {run.avgHeartRate > 0 && (
                          <span className="flex items-center space-x-1.5">
                             <HeartIcon size={12} strokeWidth={3} />
                             <span>{run.avgHeartRate} bpm</span>
                          </span>
                       )}
                       {run.shoeName && (
                          <span className="flex items-center space-x-1.5 text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                             <Footprints size={10} strokeWidth={3} />
                             <span className="text-[9px]">{run.shoeName}</span>
                          </span>
                       )}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-12 px-2 md:px-8 border-t md:border-t-0 md:border-x border-slate-50 py-4 md:py-0">
                    <div>
                      <p className="text-3xl font-black text-slate-900 tracking-tighter">{run.distance.toFixed(2)}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">miles</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-900 tracking-tighter">{calculatePace(run.duration, run.distance)}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">pace</p>
                    </div>
                    <div className="hidden sm:block">
                      <p className={clsx("text-2xl font-black tracking-tighter", analysis.color)}>{analysis.score}%</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-nowrap">Z2 Disc.</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-3 md:pl-4">
                    <button 
                      onClick={() => deleteRun(run.id)}
                      className="p-3 bg-rose-50 text-rose-400 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-90"
                      title="Delete activity"
                    >
                      <Trash2 size={20} />
                    </button>
                    <Link 
                      to={`/run/${run.id}`}
                      className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"
                    >
                      <ChevronRight size={20} strokeWidth={3} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Internal icon mocks
const AwardIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 15l-3.353 1.763.64-3.734L6.574 10.4l3.75-.545L12 6.5l1.676 3.355 3.75.545-2.713 2.642.64 3.734L12 15z"></path></svg>
);
const HeartIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
);
