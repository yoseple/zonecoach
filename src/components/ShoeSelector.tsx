import React from 'react';
import { useRunStore } from '../store/useRunStore';
import { Footprints, Plus, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

interface Props {
  selectedShoeId: string;
  onSelect: (shoeId: string) => void;
}

export const ShoeSelector: React.FC<Props> = ({ selectedShoeId, onSelect }) => {
  const { shoes } = useRunStore();
  const activeShoes = shoes.filter(s => !s.isRetired);

  if (shoes.length === 0) {
    return (
      <div className="bg-slate-50 p-6 rounded-[2rem] border border-dashed border-slate-200 text-center space-y-4">
        <Footprints size={32} className="mx-auto text-slate-300" />
        <p className="text-xs font-bold text-slate-400 italic">No shoes in your locker yet.</p>
        <Link 
          to="/gear" 
          className="inline-flex items-center space-x-2 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline"
        >
          <Plus size={12} strokeWidth={3} />
          <span>Add Your First Pair</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Gear</p>
         <Link to="/gear" className="text-[9px] font-black uppercase text-blue-600 tracking-widest hover:underline">+ New Shoe</Link>
      </div>

      <div className="grid grid-cols-1 gap-3 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
        {activeShoes.map(shoe => (
          <button
            key={shoe.id}
            type="button"
            onClick={() => onSelect(selectedShoeId === shoe.id ? '' : shoe.id)}
            className={clsx(
              "flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left",
              selectedShoeId === shoe.id ? "border-blue-600 bg-blue-50" : "border-slate-50 bg-slate-50/50 hover:border-slate-200"
            )}
          >
            <div className="flex items-center space-x-3">
              <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0", shoe.color)}>
                 <Footprints size={18} />
              </div>
              <div className="min-w-0">
                <p className={clsx("font-black text-sm truncate", selectedShoeId === shoe.id ? "text-blue-900" : "text-slate-700")}>
                  {shoe.nickname || `${shoe.brand} ${shoe.model}`}
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  {shoe.currentMileage.toFixed(1)} / {shoe.retirementMileage} mi
                </p>
              </div>
            </div>
            {selectedShoeId === shoe.id && <Check size={18} className="text-blue-600 shrink-0" strokeWidth={3} />}
          </button>
        ))}
        {activeShoes.length === 0 && (
          <p className="text-xs text-slate-400 italic text-center py-4">All your shoes are retired. Add a new pair!</p>
        )}
      </div>
    </div>
  );
};
