import React, { useState } from 'react';
import { useRunStore } from '../store/useRunStore';
import { calculateZones } from '../utils/calculations';
import { Save, User, Shield, Info, Activity } from 'lucide-react';
import { clsx } from 'clsx';

export const ZoneSettings: React.FC = () => {
  const { userProfile, updateUserProfile } = useRunStore();
  const [formData, setFormData] = useState(userProfile.zoneSettings);
  const [name, setName] = useState(userProfile.name);

  const zones = calculateZones(formData);

  const handleSave = () => {
    updateUserProfile({
      name,
      zoneSettings: formData
    });
    alert('Profile & Zone settings updated successfully!');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight italic">Settings</h2>
          <p className="text-slate-500 font-bold text-lg leading-relaxed">Customize your profile and fine-tune your physiological zones.</p>
        </div>
        <button 
          onClick={handleSave}
          className="inline-flex items-center space-x-3 bg-blue-600 text-white px-8 py-4 rounded-[1.5rem] font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
        >
          <Save size={20} strokeWidth={2.5} />
          <span>Save Changes</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Section: Profile */}
          <section className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-8">
            <div className="flex items-center space-x-4 mb-2">
               <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <User size={24} strokeWidth={2.5} />
               </div>
               <h3 className="text-2xl font-black text-slate-900">Athlete Profile</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Display Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all" 
                  placeholder="e.g. Alex Runner"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Age</label>
                  <input 
                    type="number" 
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: Number(e.target.value)})}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all text-center" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Resting HR</label>
                  <input 
                    type="number" 
                    value={formData.restingHeartRate}
                    onChange={(e) => setFormData({...formData, restingHeartRate: Number(e.target.value)})}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all text-center" 
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section: Zone Calculation */}
          <section className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-8">
            <div className="flex items-center space-x-4 mb-2">
               <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <Shield size={24} strokeWidth={2.5} />
               </div>
               <h3 className="text-2xl font-black text-slate-900">Intensity Logic</h3>
            </div>

            <div className="space-y-6">
              <p className="text-slate-500 font-medium">How should we determine your heart rate zones?</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setFormData({...formData, method: 'simple'})}
                  className={clsx(
                    "flex-1 p-6 rounded-[2rem] border-2 transition-all text-left group",
                    formData.method === 'simple' ? "border-blue-600 bg-blue-50/50" : "border-slate-50 bg-slate-50/30 hover:border-slate-200"
                  )}
                >
                  <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center mb-3 transition-colors", formData.method === 'simple' ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-400 group-hover:bg-slate-300")}>
                     <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  <h4 className={clsx("font-black mb-1", formData.method === 'simple' ? "text-blue-900" : "text-slate-900")}>Simple Method</h4>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed italic">Calculated as 220 minus your age. Good for beginners.</p>
                </button>
                
                <button 
                  onClick={() => setFormData({...formData, method: 'manual'})}
                  className={clsx(
                    "flex-1 p-6 rounded-[2rem] border-2 transition-all text-left group",
                    formData.method === 'manual' ? "border-blue-600 bg-blue-50/50" : "border-slate-50 bg-slate-50/30 hover:border-slate-200"
                  )}
                >
                  <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center mb-3 transition-colors", formData.method === 'manual' ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-400 group-hover:bg-slate-300")}>
                     <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  <h4 className={clsx("font-black mb-1", formData.method === 'manual' ? "text-blue-900" : "text-slate-900")}>Manual Threshold</h4>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed italic">Input your known laboratory-tested Max HR for peak accuracy.</p>
                </button>
              </div>

              {formData.method === 'manual' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Laboratory Max Heart Rate</label>
                  <input 
                    type="number" 
                    value={formData.maxHeartRate}
                    onChange={(e) => setFormData({...formData, maxHeartRate: Number(e.target.value)})}
                    className="w-full md:w-1/2 px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all" 
                  />
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Sidebar: Zone Preview */}
        <div className="space-y-8">
          <div className="bg-slate-900 p-8 md:p-10 rounded-[3rem] shadow-2xl shadow-blue-200 text-white space-y-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full -mr-16 -mt-16 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
            
            <div className="flex items-center space-x-4 relative z-10">
               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Activity size={24} strokeWidth={2.5} className="text-emerald-400" />
               </div>
               <h3 className="text-2xl font-black italic tracking-tight">Your Zones</h3>
            </div>
            
            <div className="space-y-6 relative z-10">
              {[
                { label: 'Zone 1 (Recovery)', range: zones.z1, color: 'bg-slate-600', ring: 'ring-slate-800' },
                { label: 'Zone 2 (Aerobic)', range: zones.z2, color: 'bg-emerald-500', ring: 'ring-emerald-500/20' },
                { label: 'Zone 3 (Tempo)', range: zones.z3, color: 'bg-amber-500', ring: 'ring-amber-500/20' },
                { label: 'Zone 4 (Threshold)', range: zones.z4, color: 'bg-orange-500', ring: 'ring-orange-500/20' },
                { label: 'Zone 5 (Anaerobic)', range: zones.z5, color: 'bg-rose-600', ring: 'ring-rose-600/20' },
              ].map((z, i) => (
                <div key={i} className="flex items-center space-x-5 group/item cursor-default">
                  <div className={clsx("w-4 h-12 rounded-full ring-8 transition-all group-hover/item:ring-[12px]", z.color, z.ring)} />
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{z.label}</p>
                    <p className="text-xl font-black tracking-tighter">
                      {z.range[0]} - {z.range[1]} <span className="text-xs font-bold text-slate-500 ml-1 italic">bpm</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 relative z-10 group-hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-2 mb-3 text-emerald-400">
                 <Info size={16} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Training Insight</span>
              </div>
              <p className="text-xs text-slate-400 font-bold leading-relaxed italic">
                Focus on staying in <span className="text-white">Zone 2</span> for 80% of your weekly volume to maximize cardiovascular adaptation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
