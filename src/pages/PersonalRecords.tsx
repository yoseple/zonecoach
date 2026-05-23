import React from 'react';
import { useRunStore } from '../store/useRunStore';
import { calculatePersonalRecords, formatDuration } from '../utils/calculations';
import { Trophy, Calendar, MapPin, Activity, Award, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

export const PersonalRecords: React.FC = () => {
  const { runs, userProfile } = useRunStore();
  const records = calculatePersonalRecords(runs, userProfile.zoneSettings);

  const recordCards = [
    {
      label: 'Fastest Mile',
      value: records.fastestMile.value === Infinity ? 'N/A' : formatDuration(records.fastestMile.value),
      run: records.fastestMile.run,
      icon: Activity,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
    },
    {
      label: 'Fastest 5K',
      value: records.fastest5k.value === Infinity ? 'N/A' : formatDuration(Math.round(records.fastest5k.value)),
      run: records.fastest5k.run,
      icon: Trophy,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
    {
      label: 'Fastest 10K',
      value: records.fastest10k.value === Infinity ? 'N/A' : formatDuration(Math.round(records.fastest10k.value)),
      run: records.fastest10k.run,
      icon: MapPin,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    {
      label: 'Longest Run',
      value: records.longestRun.value === 0 ? 'N/A' : `${records.longestRun.value.toFixed(2)} mi`,
      run: records.longestRun.run,
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
    },
    {
      label: 'Best Zone 2 Discipline',
      value: records.bestZone2Score.value === 0 ? 'N/A' : `${records.bestZone2Score.value}%`,
      run: records.bestZone2Score.run,
      icon: Award,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-100',
    },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="max-w-2xl">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl shadow-amber-50">
          <Star size={32} fill="currentColor" strokeWidth={2.5} />
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Trophy Case</h2>
        <p className="text-slate-500 font-bold text-lg leading-relaxed">
          Your hard work summarized in records. Every mile logged is a step toward your next personal best.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {recordCards.map((record, i) => (
          <div 
            key={i} 
            className={clsx(
              "group relative bg-white p-10 rounded-[3rem] shadow-sm border-2 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2",
              record.run ? "border-slate-50" : "border-dashed border-slate-200"
            )}
          >
            {record.run && (
              <div className="absolute top-8 right-8">
                <div className="bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                  Record
                </div>
              </div>
            )}
            
            <div className={clsx(
              "w-20 h-20 rounded-[1.75rem] flex items-center justify-center mb-8 transition-transform group-hover:scale-110",
              record.bg,
              record.color
            )}>
              <record.icon size={36} strokeWidth={2.5} />
            </div>
            
            <div className="space-y-1 mb-10">
              <h3 className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">{record.label}</h3>
              <p className="text-5xl font-black text-slate-900 tracking-tighter italic">{record.value}</p>
            </div>
            
            {record.run ? (
              <div className="space-y-5 pt-8 border-t border-slate-50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Achieved on</p>
                    <p className="text-sm font-black text-slate-700">
                      {new Date(record.run.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <Link 
                  to={`/run/${record.run.id}`}
                  className="flex items-center justify-center w-full py-4 bg-slate-50 rounded-2xl text-slate-900 text-sm font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all group"
                >
                  <span>Analyze Run</span>
                </Link>
              </div>
            ) : (
              <div className="pt-8 border-t border-slate-50 text-center">
                <p className="text-slate-400 text-sm font-bold italic">Keep logging activities to unlock this trophy.</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
