import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useRunStore } from '../store/useRunStore';
import type { RunType, Split, RoutePoint } from '../types';
import { parseGPX } from '../utils/gpxParser';
import { 
  Calendar, 
  MapPin, 
  Heart, 
  Flame, 
  FileText, 
  Upload, 
  Check, 
  ChevronRight,
  Zap,
  Activity,
  Plus
} from 'lucide-react';
import { clsx } from 'clsx';

const RUN_TYPES: RunType[] = [
  'Free Run', 
  'Zone 2 Run', 
  'Easy Run', 
  'Tempo Run', 
  'Interval Run', 
  'Long Run', 
  'Race Pace'
];

export const AddRun: React.FC = () => {
  const navigate = useNavigate();
  const addRun = useRunStore((state) => state.addRun);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<RunType>('Free Run');
  const [distance, setDistance] = useState('');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('0');
  const [seconds, setSeconds] = useState('0');
  const [avgHR, setAvgHR] = useState('');
  const [maxHR, setMaxHR] = useState('');
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');
  const [splits, setSplits] = useState<Split[]>([]);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [linkToWorkoutId, setLinkToWorkoutId] = useState('');

  const activePlan = useRunStore((state) => state.plans.find(p => p.id === state.activePlanId));
  const pendingWorkouts = activePlan?.workouts.filter(w => w.status === 'pending') || [];

  const handleGPXUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const points = await parseGPX(file);
      setRoutePoints(points);
      if (!distance && points.length > 0) {
        setDistance((points.length / 500).toFixed(2));
      }
    }
  };

  const handleAddSplit = () => {
    const nextMile = splits.length + 1;
    setSplits([...splits, { mile: nextMile, time: 0, heartRate: 0 }]);
  };

  const handleSplitChange = (index: number, field: keyof Split, value: string) => {
    const newSplits = [...splits];
    newSplits[index] = { ...newSplits[index], [field]: Number(value) };
    setSplits(newSplits);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalSeconds = (Number(hours) * 3600) + (Number(minutes) * 60) + Number(seconds);
    const runId = uuidv4();
    
    const newRun = {
      id: runId,
      date,
      title: title || `${type} on ${date}`,
      type,
      distance: Number(distance),
      duration: totalSeconds,
      avgHeartRate: Number(avgHR),
      maxHeartRate: Number(maxHR),
      calories: Number(calories),
      notes,
      splits,
      routePoints,
    };
    
    addRun(newRun);
    
    if (linkToWorkoutId && activePlan) {
      useRunStore.getState().updateWorkoutStatus(activePlan.id, linkToWorkoutId, 'completed');
      // Note: In a real app we'd also store the runId on the workout, 
      // but the current store action only updates status.
    }
    
    navigate('/history');
  };

  return (
    <div className="max-w-5xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-12">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Manual Activity</h2>
        <p className="text-slate-500 font-bold text-lg">Log a past run or workout details manually.</p>
      </header>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          {/* Main Details */}
          <section className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-8">
            <div className="flex items-center space-x-4">
               <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Activity size={24} strokeWidth={2.5} />
               </div>
               <h3 className="text-2xl font-black text-slate-900">Run Specs</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Run Title</label>
                <input 
                  type="text" 
                  placeholder="Morning Interval Session"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
                  <input 
                    type="date" 
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all" 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Activity Type</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value as RunType)}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all appearance-none cursor-pointer"
                >
                  {RUN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Distance (miles)</label>
                <div className="relative">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Duration</label>
              <div className="grid grid-cols-3 gap-4">
                <div className="relative group">
                   <input type="number" placeholder="HH" value={hours} onChange={(e) => setHours(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl outline-none font-black text-slate-700 text-center transition-all" />
                   <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase pointer-events-none group-focus-within:text-blue-200">h</span>
                </div>
                <div className="relative group">
                   <input type="number" placeholder="MM" max="59" value={minutes} onChange={(e) => setMinutes(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl outline-none font-black text-slate-700 text-center transition-all" />
                   <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase pointer-events-none group-focus-within:text-blue-200">m</span>
                </div>
                <div className="relative group">
                   <input type="number" placeholder="SS" max="59" value={seconds} onChange={(e) => setSeconds(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl outline-none font-black text-slate-700 text-center transition-all" />
                   <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase pointer-events-none group-focus-within:text-blue-200">s</span>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-8">
            <div className="flex items-center space-x-4">
               <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                  <Zap size={24} strokeWidth={2.5} />
               </div>
               <h3 className="text-2xl font-black text-slate-900">Training Link</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-slate-500 font-medium text-sm">Is this run part of your active training plan?</p>
              {pendingWorkouts.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {pendingWorkouts.slice(0, 3).map(w => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setLinkToWorkoutId(linkToWorkoutId === w.id ? '' : w.id)}
                      className={clsx(
                        "flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left",
                        linkToWorkoutId === w.id ? "border-blue-600 bg-blue-50" : "border-slate-50 bg-slate-50/50 hover:border-slate-200"
                      )}
                    >
                      <div>
                        <p className={clsx("font-black text-sm", linkToWorkoutId === w.id ? "text-blue-900" : "text-slate-700")}>{w.type}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{w.day} • Week {w.week}</p>
                      </div>
                      {linkToWorkoutId === w.id && <Check size={18} className="text-blue-600" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No pending workouts found in your active plan.</p>
              )}
            </div>
          </section>

          {/* Physiological Stats */}
          <section className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-8">
            <div className="flex items-center space-x-4">
               <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                  <Heart size={24} strokeWidth={2.5} />
               </div>
               <h3 className="text-2xl font-black text-slate-900">Intensity Metrics</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Avg Heart Rate</label>
                <div className="relative group">
                  <Heart className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none transition-colors group-focus-within:text-rose-400" size={18} />
                  <input type="number" placeholder="BPM" value={avgHR} onChange={(e) => setAvgHR(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-rose-100 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Max Heart Rate</label>
                <div className="relative group">
                  <Zap className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none transition-colors group-focus-within:text-amber-400" size={18} />
                  <input type="number" placeholder="BPM" value={maxHR} onChange={(e) => setMaxHR(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-amber-100 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Energy Burnt</label>
                <div className="relative group">
                  <Flame className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none transition-colors group-focus-within:text-orange-400" size={18} />
                  <input type="number" placeholder="Kcal" value={calories} onChange={(e) => setCalories(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-orange-100 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300" />
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 text-nowrap">Notes & Feeling</label>
              <div className="relative group">
                <FileText className="absolute left-6 top-6 text-slate-300 pointer-events-none transition-colors group-focus-within:text-blue-400" size={18} />
                <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How did it go? Any soreness? Discipline notes..." className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-3xl outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300 resize-none" />
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-10">
          {/* GPX Import Card */}
          <section className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl shadow-blue-100 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full -mr-16 -mt-16 blur-3xl opacity-30 transition-opacity group-hover:opacity-50" />
            <h3 className="text-xl font-black mb-6 relative z-10 italic tracking-tight">Import Route</h3>
            <div className="relative z-10 space-y-6">
              <label className="block w-full">
                <div className={clsx(
                  "border-2 border-dashed rounded-[2rem] p-8 text-center cursor-pointer transition-all",
                  routePoints.length > 0 ? "border-emerald-500 bg-emerald-500/10" : "border-slate-700 hover:border-blue-500 hover:bg-white/5"
                )}>
                  {routePoints.length > 0 ? (
                    <div className="space-y-2 animate-in zoom-in-75">
                      <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                         <Check size={24} strokeWidth={3} />
                      </div>
                      <p className="text-sm font-black text-emerald-400 uppercase tracking-widest">{routePoints.length} Points Loaded</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="mx-auto text-slate-600 mb-2" size={32} strokeWidth={2.5} />
                      <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Drop .GPX file here</p>
                    </div>
                  )}
                  <input type="file" accept=".gpx" onChange={handleGPXUpload} className="hidden" />
                </div>
              </label>
              <p className="text-[10px] text-slate-500 font-bold text-center leading-relaxed">
                Import GPS data to auto-calculate distance and see your route on the analysis map.
              </p>
            </div>
          </section>

          {/* Splits Card */}
          <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 italic tracking-tight">Mile Splits</h3>
              <button type="button" onClick={handleAddSplit} className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-100 hover:bg-blue-700 transition-colors active:scale-90">
                <Plus size={20} strokeWidth={3} />
              </button>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
              {splits.length === 0 ? (
                <p className="text-xs text-slate-400 font-bold text-center py-6 italic">No splits added yet.</p>
              ) : (
                splits.map((split, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl group transition-all hover:bg-slate-100">
                    <span className="w-8 text-[10px] font-black text-slate-400 uppercase">#{split.mile}</span>
                    <div className="flex-1 flex space-x-2">
                       <input type="number" placeholder="Sec" onChange={(e) => handleSplitChange(index, 'time', e.target.value)} className="w-full px-3 py-2 bg-white rounded-lg border-transparent border-2 focus:border-blue-100 outline-none text-sm font-black" />
                       <input type="number" placeholder="HR" onChange={(e) => handleSplitChange(index, 'heartRate', e.target.value)} className="w-full px-3 py-2 bg-white rounded-lg border-transparent border-2 focus:border-blue-100 outline-none text-sm font-black" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Action Footer */}
          <button 
            type="submit"
            className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-slate-200 hover:bg-blue-600 transition-all active:scale-[0.98] group"
          >
            <div className="flex items-center justify-center space-x-3">
               <span>Publish Activity</span>
               <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
            </div>
          </button>
        </div>
      </form>
    </div>
  );
};
