import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useRunStore } from '../store/useRunStore';
import { 
  calculatePace, 
  formatDuration, 
  getZoneAnalysis, 
  getFastestSplit, 
  getSlowestSplit 
} from '../utils/calculations';
import { 
  ArrowLeft, 
  Activity, 
  Clock, 
  Map as MapIcon, 
  Flame, 
  Heart,
  TrendingUp,
  FileText,
  Calendar,
  Share2,
  ShieldCheck,
  Trophy,
  Info,
  Target,
  X,
  Zap,
  Footprints,
  Image as ImageIcon,
  Edit2
} from 'lucide-react';
import { RouteMap } from '../components/RouteMap';
import { clsx } from 'clsx';
import { calculatePersonalRecords } from '../utils/calculations';
import { RunRecapBuilder } from '../components/RunRecapBuilder';

export const RunDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { runs, userProfile, shoes, updateRunShoe } = useRunStore();
  const [showRecap, setShowRecap] = React.useState(false);
  const [isEditingShoe, setIsEditingShoe] = React.useState(false);
  
  const run = runs.find((r) => r.id === id);

  if (!run) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
           <MapIcon size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-900">Activity not found</h3>
          <p className="text-slate-500 font-medium">The run you're looking for doesn't exist or has been removed.</p>
        </div>
        <Link to="/history" className="px-8 py-3 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-xs">Back to History</Link>
      </div>
    );
  }

  const analysis = getZoneAnalysis(run.avgHeartRate, userProfile.zoneSettings);
  const fastest = getFastestSplit(run.splits);
  const slowest = getSlowestSplit(run.splits);
  
  // PR Check
  const records = calculatePersonalRecords(runs, userProfile.zoneSettings);
  const isPR = records.fastestMile.run?.id === run.id || 
               records.fastest5k.run?.id === run.id || 
               records.fastest10k.run?.id === run.id || 
               records.longestRun.run?.id === run.id;

  const currentShoe = shoes.find(s => s.id === run.shoeId);
  const activeShoes = shoes.filter(s => !s.isRetired || s.id === run.shoeId);

  const handleLinkShoe = (shoeId: string) => {
    updateRunShoe(run.id, shoeId || undefined);
    setIsEditingShoe(false);
  };

  const getAccuracyRating = (avg: number) => {
    if (avg <= 10) return { label: 'Excellent', color: 'text-emerald-500', bg: 'bg-emerald-50' };
    if (avg <= 20) return { label: 'Good', color: 'text-blue-500', bg: 'bg-blue-50' };
    if (avg <= 35) return { label: 'Fair', color: 'text-amber-500', bg: 'bg-amber-50' };
    return { label: 'Poor', color: 'text-rose-500', bg: 'bg-rose-50' };
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center space-x-3 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-slate-50 transition-colors">
            <ArrowLeft size={18} strokeWidth={2.5} />
          </div>
          <span className="font-black uppercase tracking-widest text-[10px]">Back to feed</span>
        </button>
        <div className="flex items-center space-x-3">
           {isPR && (
              <div className="bg-amber-100 text-amber-600 px-4 py-2 rounded-xl flex items-center space-x-2 shadow-lg shadow-amber-50 animate-bounce">
                <Trophy size={16} fill="currentColor" />
                <span className="text-[10px] font-black uppercase tracking-widest text-nowrap">New Personal Record</span>
              </div>
           )}
           <button 
             onClick={() => setShowRecap(true)}
             className="bg-slate-900 text-white px-6 py-2 rounded-xl flex items-center space-x-2 shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
           >
              <ImageIcon size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest text-nowrap">Create Recap</span>
           </button>
           <button className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm hover:bg-slate-50 text-slate-500 transition-colors">
              <Share2 size={18} />
           </button>
        </div>
      </header>

      {showRecap && (
        <RunRecapBuilder run={run} onClose={() => setShowRecap(false)} />
      )}

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        {/* Map Header */}
        {run.routePoints && run.routePoints.length > 0 ? (
          <div className="relative group">
            <RouteMap 
              points={run.routePoints} 
              distance={run.distance}
              duration={formatDuration(run.duration)}
              pace={calculatePace(run.duration, run.distance)}
            />
            <div className="absolute top-6 left-6 pointer-events-none">
               <div className="bg-white/90 backdrop-blur shadow-xl px-4 py-2 rounded-2xl flex items-center space-x-2 border border-white">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">GPS Track Active</span>
               </div>
            </div>
          </div>
        ) : (
          <div className="h-48 bg-slate-900 flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]" />
             <div className="text-center relative z-10">
                <MapIcon className="text-slate-700 mx-auto mb-3" size={40} />
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">No GPS data provided</p>
             </div>
          </div>
        )}

        <div className="p-8 md:p-12 space-y-12">
          {/* Activity Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                 <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100/50">
                    {run.type}
                 </div>
                 <div className="flex items-center space-x-1.5 text-slate-400 font-bold text-xs uppercase tracking-wider">
                    <Calendar size={14} />
                    <span>{new Date(run.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                 </div>
                 {run.source && (
                    <div className="flex items-center space-x-1 px-2 py-0.5 bg-slate-100 rounded text-[8px] font-black uppercase tracking-tighter text-slate-500">
                       <ShieldCheck size={10} />
                       <span>{run.source}</span>
                    </div>
                 )}
                 {run.trainingPlanId && (
                    <div className="flex items-center space-x-1 px-2 py-0.5 bg-blue-100 rounded text-[8px] font-black uppercase tracking-tighter text-blue-600">
                       <Zap size={10} fill="currentColor" />
                       <span>Guided Workout</span>
                    </div>
                 )}
              </div>
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-[0.9]">{run.title}</h2>
              {run.plannedWorkoutName && (
                 <p className="text-sm font-bold text-slate-400 italic">Completed as part of your {run.plannedWorkoutName} goal</p>
              )}
            </div>
            <div className="text-left md:text-right space-y-1">
              <p className="text-7xl font-black text-blue-600 tracking-tighter leading-none italic">{run.distance.toFixed(2)}</p>
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Total Miles</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-slate-400 mb-1">
                <Clock size={14} strokeWidth={3} />
                <span className="text-[10px] font-black uppercase tracking-widest">Duration</span>
              </div>
              <p className="text-2xl font-black text-slate-900">{formatDuration(run.duration)}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-slate-400 mb-1">
                <TrendingUp size={14} strokeWidth={3} />
                <span className="text-[10px] font-black uppercase tracking-widest">Avg Pace</span>
              </div>
              <p className="text-2xl font-black text-slate-900">{calculatePace(run.duration, run.distance)}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-slate-400 mb-1">
                <Heart size={14} strokeWidth={3} />
                <span className="text-[10px] font-black uppercase tracking-widest">Avg HR</span>
              </div>
              <p className="text-2xl font-black text-slate-900">{run.avgHeartRate > 0 ? run.avgHeartRate : '--'} <span className="text-xs text-slate-400">bpm</span></p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-slate-400 mb-1">
                <Flame size={14} strokeWidth={3} />
                <span className="text-[10px] font-black uppercase tracking-widest">Energy</span>
              </div>
              <p className="text-2xl font-black text-slate-900">{run.calories} <span className="text-xs text-slate-400">kcal</span></p>
            </div>
          </div>

          {/* Analysis Card */}
          <div className={clsx(
            "p-10 rounded-[2.5rem] border-2 relative overflow-hidden",
            analysis.color === 'text-green-500' ? "bg-emerald-50 border-emerald-100" :
            analysis.color === 'text-yellow-500' ? "bg-amber-50 border-amber-100" :
            analysis.color === 'text-blue-500' ? "bg-blue-50 border-blue-100" :
            "bg-rose-50 border-rose-100"
          )}>
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <Activity size={120} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
               <div className="space-y-3 flex-1">
                 <div className="flex items-center space-x-3">
                    <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg", analysis.color.replace('text', 'bg'))}>
                       <Activity size={20} strokeWidth={3} />
                    </div>
                    <h3 className={clsx("text-2xl font-black tracking-tight", analysis.color)}>Zone 2 Discipline</h3>
                 </div>
                 <p className="text-slate-700 font-bold text-lg max-w-xl">{analysis.feedback}</p>
                 
                 {/* Adaptive Insights */}
                 <div className="pt-4 flex flex-wrap gap-2">
                    {run.distance > 10 && (
                       <div className="px-3 py-1 bg-purple-500/10 text-purple-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-purple-500/20">
                          Endurance King
                       </div>
                    )}
                    {analysis.score > 90 && (
                       <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                          Aerobic Legend
                       </div>
                    )}
                 </div>
               </div>
               <div className="flex items-center space-x-4">
                  <div className="text-right">
                     <p className={clsx("text-6xl font-black italic tracking-tighter leading-none", analysis.color)}>{analysis.score}%</p>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-nowrap">Discipline Score</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Shoe / Gear Tracker Integration */}
          <div className="space-y-6">
             <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-black text-slate-900 italic tracking-tight flex items-center space-x-3">
                   <Footprints size={20} className="text-slate-400" />
                   <span>Gear Used</span>
                </h3>
                {currentShoe && !isEditingShoe && (
                   <button 
                     onClick={() => setIsEditingShoe(true)}
                     className="text-[10px] font-black uppercase text-blue-600 tracking-widest hover:underline flex items-center space-x-1"
                   >
                      <Edit2 size={10} />
                      <span>Change Gear</span>
                   </button>
                )}
             </div>
             
             {isEditingShoe ? (
                <div className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-xl animate-in zoom-in-95 space-y-6">
                   <div className="flex items-center justify-between">
                      <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Select Different Shoes</p>
                      <button onClick={() => setIsEditingShoe(false)} className="text-slate-300 hover:text-slate-900"><X size={18} /></button>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {activeShoes.map(s => (
                         <button
                           key={s.id}
                           onClick={() => handleLinkShoe(s.id)}
                           className={clsx(
                             "flex items-center space-x-4 p-4 rounded-2xl border-2 transition-all text-left",
                             run.shoeId === s.id ? "border-blue-600 bg-blue-50" : "border-slate-50 bg-slate-50 hover:border-slate-200"
                           )}
                         >
                            <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0", s.color)}>
                               <Footprints size={18} />
                            </div>
                            <div className="min-w-0">
                               <p className="font-black text-sm truncate">{s.nickname || `${s.brand} ${s.model}`}</p>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.currentMileage.toFixed(1)} mi total</p>
                            </div>
                         </button>
                      ))}
                      <button 
                         onClick={() => handleLinkShoe('')}
                         className="flex items-center justify-center p-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-all text-[10px] font-black uppercase tracking-widest"
                      >
                         Remove Gear
                      </button>
                   </div>
                </div>
             ) : currentShoe ? (
                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all duration-500">
                   <div className="flex items-center space-x-6">
                      <div className={clsx("w-16 h-16 rounded-[1.75rem] flex items-center justify-center text-white shadow-lg", currentShoe.color)}>
                         <Footprints size={32} />
                      </div>
                      <div>
                         <p className="text-2xl font-black italic text-slate-900 tracking-tight">{currentShoe.nickname || `${currentShoe.brand} ${currentShoe.model}`}</p>
                         <div className="flex items-center space-x-3 mt-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{currentShoe.brand} {currentShoe.model}</p>
                            <div className="w-1 h-1 bg-slate-200 rounded-full" />
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">+{run.distance.toFixed(2)} mi added</p>
                         </div>
                      </div>
                   </div>
                   <div className="hidden sm:flex items-center space-x-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full border border-emerald-100">
                      <ShieldCheck size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Active Pair</span>
                   </div>
                </div>
             ) : (
                <div className="bg-slate-50 p-10 rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-4">
                   <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-200 shadow-sm">
                      <Footprints size={32} strokeWidth={1} />
                   </div>
                   <div className="space-y-1">
                      <p className="text-slate-400 font-bold italic">No shoes linked to this assignment.</p>
                      <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">Gear tracking prevents overload and repetitive strain.</p>
                   </div>
                   <button 
                     onClick={() => setIsEditingShoe(true)}
                     className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"
                   >
                      Link Shoes
                   </button>
                </div>
             )}
          </div>

          {/* Accuracy & Quality (If GPS used) */}
          {run.accuracyMetadata && (
            <div className="space-y-6">
               <h3 className="text-xl font-black text-slate-900 italic tracking-tight flex items-center space-x-3">
                  <ShieldCheck size={20} className="text-blue-500" />
                  <span>Tracking Accuracy</span>
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Avg Accuracy', value: `${run.accuracyMetadata.avgAccuracy.toFixed(1)}m`, rating: getAccuracyRating(run.accuracyMetadata.avgAccuracy) },
                    { label: 'Best Fix', value: `${run.accuracyMetadata.bestAccuracy.toFixed(1)}m`, icon: Target },
                    { label: 'Samples', value: run.accuracyMetadata.acceptedPoints, icon: Activity },
                    { label: 'Rejected', value: run.accuracyMetadata.rejectedPoints, icon: X }
                  ].map((stat, i) => (
                    <div key={i} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-2">
                       <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">{stat.label}</p>
                       <p className={clsx("text-xl font-black tabular-nums italic", stat.rating?.color || "text-slate-900")}>{stat.value}</p>
                       {stat.rating && <span className={clsx("text-[8px] font-black uppercase px-2 py-0.5 rounded-full", stat.rating.bg, stat.rating.color)}>{stat.rating.label}</span>}
                    </div>
                  ))}
               </div>
               <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex items-start space-x-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                     <Info size={18} className="text-blue-400" />
                  </div>
                  <div className="space-y-1">
                     <p className="font-black text-xs uppercase tracking-widest text-blue-400">Pro Tip for Accuracy</p>
                     <p className="text-xs text-slate-400 font-medium leading-relaxed italic">
                        Keep your phone in an armband or running belt for a clear view of the sky. Avoid battery saver mode, which can throttle GPS frequency.
                     </p>
                  </div>
               </div>
            </div>
          )}

          {/* Bottom Grid: Splits & Notes */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
             <div className="lg:col-span-7 space-y-6">
                <h3 className="text-xl font-black text-slate-900 italic tracking-tight flex items-center space-x-3">
                   <span>Mile-by-Mile Breakdown</span>
                </h3>
                {run.splits.length > 0 ? (
                  <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mile</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pace</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Avg HR</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {run.splits.map((split) => (
                          <tr key={split.mile} className={clsx(
                            "transition-colors",
                            split === fastest ? 'bg-emerald-50/30' : split === slowest ? 'bg-rose-50/30' : 'hover:bg-slate-50/50'
                          )}>
                            <td className="px-6 py-5 font-black text-slate-900 italic">#{split.mile}</td>
                            <td className="px-6 py-5">
                              <div className="flex items-center space-x-3">
                                <span className="font-black text-slate-700 leading-none">{formatDuration(split.time)}</span>
                                {split === fastest && <span className="text-[8px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-tighter shadow-sm">Fastest</span>}
                                {split === slowest && <span className="text-[8px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-tighter shadow-sm">Slowest</span>}
                              </div>
                            </td>
                            <td className="px-6 py-5 text-sm font-bold text-slate-500">{split.heartRate} <span className="text-[10px] uppercase opacity-60">bpm</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                     <p className="text-slate-400 font-bold italic">No split data recorded for this activity.</p>
                  </div>
                )}
             </div>

             <div className="lg:col-span-5 space-y-6">
                <h3 className="text-xl font-black text-slate-900 italic tracking-tight flex items-center space-x-3">
                   <FileText size={20} className="text-slate-400" />
                   <span>Activity Notes</span>
                </h3>
                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 min-h-[200px]">
                   {run.notes ? (
                     <p className="text-slate-700 font-bold leading-relaxed italic opacity-80">"{run.notes}"</p>
                   ) : (
                     <p className="text-slate-400 font-bold italic">No notes added to this activity.</p>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
