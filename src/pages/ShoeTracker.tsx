import React from 'react';
import { useRunStore } from '../store/useRunStore';
import { Plus, Footprints, Trash2, ShieldAlert } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Shoe } from '../types';
import { clsx } from 'clsx';

export const ShoeTracker: React.FC = () => {
  const { shoes, addShoe, updateShoeMileage } = useRunStore();
  const [showAdd, setShowAdd] = React.useState(false);
  const [name, setName] = React.useState('');
  const [brand, setBrand] = React.useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newShoe: Shoe = {
      id: uuidv4(),
      name,
      brand,
      acquiredDate: new Date().toISOString(),
      startingMileage: 0,
      currentMileage: 0,
      retired: false,
      color: ['bg-blue-500', 'bg-emerald-500', 'bg-rose-500', 'bg-purple-500'][Math.floor(Math.random() * 4)]
    };
    addShoe(newShoe);
    setName('');
    setBrand('');
    setShowAdd(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Gear Locker</h2>
          <p className="text-slate-500 font-bold">Track shoe mileage to prevent injury.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl hover:bg-blue-600 transition-all active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
        </button>
      </header>

      {showAdd && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-xl animate-in zoom-in-95">
          <form onSubmit={handleAdd} className="space-y-6">
            <h3 className="text-xl font-black italic">New Gear</h3>
            <div className="grid grid-cols-2 gap-4">
              <input 
                placeholder="Shoe Name" 
                value={name} 
                onChange={e => setName(e.target.value)}
                className="px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold focus:bg-white border-2 border-transparent focus:border-blue-100 transition-all"
              />
              <input 
                placeholder="Brand" 
                value={brand} 
                onChange={e => setBrand(e.target.value)}
                className="px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold focus:bg-white border-2 border-transparent focus:border-blue-100 transition-all"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px]">Add Shoe</button>
              <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px]">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {shoes.length === 0 ? (
          <div className="md:col-span-2 py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
             <Footprints size={48} className="mx-auto text-slate-100 mb-4" />
             <p className="text-slate-400 font-bold italic">No shoes in your locker yet.</p>
          </div>
        ) : (
          shoes.map(shoe => {
            const lifePercent = Math.min(100, (shoe.currentMileage / 400) * 100);
            return (
              <div key={shoe.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
                <div className="flex items-start justify-between mb-6">
                  <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center text-white", shoe.color)}>
                    <Footprints size={24} />
                  </div>
                  {lifePercent > 80 && (
                    <div className="flex items-center space-x-2 text-rose-500 bg-rose-50 px-3 py-1 rounded-full">
                       <ShieldAlert size={14} />
                       <span className="text-[8px] font-black uppercase tracking-widest">Replace Soon</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-2xl font-black italic tracking-tight">{shoe.name}</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{shoe.brand}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                       <span className="text-slate-400">Total Mileage</span>
                       <span className="text-slate-900">{shoe.currentMileage.toFixed(1)} / 400 mi</span>
                    </div>
                    <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden p-0.5">
                       <div 
                         className={clsx("h-full rounded-full transition-all duration-1000", lifePercent > 80 ? 'bg-rose-500' : 'bg-blue-500')} 
                         style={{ width: `${lifePercent}%` }}
                       />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
