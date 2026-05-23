import React, { useState } from 'react';
import { useRunStore } from '../store/useRunStore';
import { Plus, Footprints, ShieldAlert, Ruler, Info, ArrowRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { Shoe } from '../types';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';

export const ShoeTracker: React.FC = () => {
  const { shoes, addShoe, runs } = useRunStore();
  const [showAdd, setShowAdd] = useState(false);
  const [nickname, setNickname] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [retirementMileage, setRetirementMileage] = useState(400);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newShoe: Shoe = {
      id: uuidv4(),
      nickname,
      brand,
      model,
      acquiredDate: new Date().toISOString(),
      startingMileage: 0,
      currentMileage: 0,
      retirementMileage,
      isRetired: false,
      color: ['bg-blue-500', 'bg-emerald-500', 'bg-rose-500', 'bg-purple-500'][Math.floor(Math.random() * 4)],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    addShoe(newShoe);
    setNickname('');
    setBrand('');
    setModel('');
    setRetirementMileage(400);
    setShowAdd(false);
  };

  const getShoeStatus = (current: number, target: number) => {
    const lifePercent = (current / target) * 100;
    if (lifePercent < 25) return { label: 'Fresh', color: 'text-emerald-500', bg: 'bg-emerald-50' };
    if (lifePercent < 60) return { label: 'Good', color: 'text-blue-500', bg: 'bg-blue-50' };
    if (lifePercent < 85) return { label: 'Monitor', color: 'text-amber-500', bg: 'bg-amber-50' };
    return { label: 'Retire Soon', color: 'text-rose-500', bg: 'bg-rose-50' };
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight italic">Gear Locker</h2>
          <p className="text-slate-500 font-bold text-lg leading-relaxed">Track shoe mileage to prevent injury and maintain performance.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="p-5 bg-slate-900 text-white rounded-[1.5rem] shadow-xl hover:bg-blue-600 transition-all active:scale-95"
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      </header>

      {showAdd && (
        <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-blue-100 shadow-2xl animate-in zoom-in-95">
          <form onSubmit={handleAdd} className="space-y-8">
            <div className="flex items-center space-x-4">
               <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Footprints size={24} />
               </div>
               <h3 className="text-2xl font-black italic">New Assignment Gear</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nickname</label>
                 <input 
                   placeholder="e.g. Daily Trainer, Race Day" 
                   value={nickname} 
                   onChange={e => setNickname(e.target.value)}
                   className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold focus:bg-white border-2 border-transparent focus:border-blue-100 transition-all"
                 />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brand</label>
                    <input 
                      placeholder="e.g. Nike" 
                      value={brand} 
                      onChange={e => setBrand(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold focus:bg-white border-2 border-transparent focus:border-blue-100 transition-all"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Model</label>
                    <input 
                      placeholder="e.g. Pegasus 41" 
                      value={model} 
                      onChange={e => setModel(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold focus:bg-white border-2 border-transparent focus:border-blue-100 transition-all"
                    />
                 </div>
              </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Retirement Goal (miles)</label>
               <div className="relative">
                  <Ruler className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="number"
                    value={retirementMileage} 
                    onChange={e => setRetirementMileage(Number(e.target.value))}
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold focus:bg-white border-2 border-transparent focus:border-blue-100 transition-all"
                  />
               </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="submit" className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-100 active:scale-95">Commission Gear</button>
              <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-5 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px]">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {shoes.length === 0 ? (
          <div className="md:col-span-2 py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
             <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-200">
                <Footprints size={48} strokeWidth={1} />
             </div>
             <h3 className="text-xl font-black italic text-slate-900 mb-2">Locker is Empty</h3>
             <p className="text-slate-400 font-bold italic">Register your rotation to begin tracking mileage.</p>
          </div>
        ) : (
          shoes.map(shoe => {
            const lifePercent = Math.min(100, (shoe.currentMileage / shoe.retirementMileage) * 100);
            const status = getShoeStatus(shoe.currentMileage, shoe.retirementMileage);
            const shoeRuns = runs.filter(r => r.shoeId === shoe.id);
            const milesRemaining = Math.max(0, shoe.retirementMileage - shoe.currentMileage);

            return (
              <div key={shoe.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex flex-col">
                <div className="flex items-start justify-between mb-8">
                  <div className={clsx("w-16 h-16 rounded-[1.75rem] flex items-center justify-center text-white shadow-lg", shoe.color)}>
                    <Footprints size={32} strokeWidth={2.5} />
                  </div>
                  <div className={clsx("flex items-center space-x-2 px-4 py-1.5 rounded-full border shadow-sm", status.bg, status.color)}>
                     <div className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", status.color.replace('text', 'bg'))} />
                     <span className="text-[10px] font-black uppercase tracking-widest">{status.label}</span>
                  </div>
                </div>
                
                <div className="space-y-10 flex-1 flex flex-col">
                  <div>
                    <h4 className="text-3xl font-black italic tracking-tighter leading-tight italic">{shoe.nickname || `${shoe.brand} ${shoe.model}`}</h4>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{shoe.brand} {shoe.model}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-end px-1">
                       <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Life Expectancy</p>
                          <p className="text-2xl font-black italic text-slate-900 leading-none">{shoe.currentMileage.toFixed(1)} <span className="text-[10px] text-slate-400">/ {shoe.retirementMileage} mi</span></p>
                       </div>
                       <div className="text-right">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Remaining</p>
                          <p className="text-xl font-black italic text-blue-600 leading-none">{milesRemaining.toFixed(1)} <span className="text-[10px] opacity-60">mi</span></p>
                       </div>
                    </div>
                    <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden p-1 border border-slate-100">
                       <div 
                         className={clsx("h-full rounded-full transition-all duration-1000", lifePercent > 85 ? 'bg-rose-500' : 'bg-blue-600')} 
                         style={{ width: `${lifePercent}%` }}
                       />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-8 mt-auto">
                     <div className="space-y-1">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Assignments</p>
                        <p className="text-lg font-black italic">{shoeRuns.length}</p>
                     </div>
                     <div className="space-y-1 text-right">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Commissioned</p>
                        <p className="text-lg font-black italic text-slate-400">{new Date(shoe.acquiredDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</p>
                     </div>
                  </div>
                  
                  {shoeRuns.length > 0 && (
                     <Link 
                       to="/history" 
                       className="w-full py-4 bg-slate-50 rounded-2xl flex items-center justify-center space-x-2 group/btn hover:bg-slate-900 transition-all duration-300"
                     >
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover/btn:text-white transition-colors">View Activity Logs</span>
                        <ArrowRight size={14} className="text-slate-300 group-hover/btn:text-white transition-colors" />
                     </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-8 bg-blue-600 rounded-[3rem] text-white flex items-start space-x-6 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16 opacity-10 group-hover:scale-110 transition-transform duration-700" />
         <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
            <Info size={24} className="text-white" />
         </div>
         <div className="space-y-2 relative z-10">
            <h4 className="text-xl font-black italic tracking-tight">Injury Prevention Insight</h4>
            <p className="text-blue-100 font-bold text-sm leading-relaxed italic opacity-90">
               Running shoes typically lose their shock absorption after 300-500 miles. ZoneCoach monitors your cumulative gear strain to help you decide when it's time for a fresh pair.
            </p>
         </div>
      </div>
    </div>
  );
};
