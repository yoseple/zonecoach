import React from 'react';
import { 
  ShieldCheck, 
  Watch, 
  Heart, 
  Zap, 
  Smartphone, 
  Lock,
  ArrowRightLeft,
  Settings,
  Database
} from 'lucide-react';

export const FutureCoaching: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
          <Zap size={14} fill="currentColor" />
          <span>Technical Roadmap</span>
        </div>
        <h2 className="text-5xl font-black text-slate-900 tracking-tight italic">Apple Health Ecosystem</h2>
        <p className="text-xl text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed">
          The future of ZoneCoach is native. Here is how we plan to integrate with your Apple Fitness data for elite analysis.
        </p>
      </header>

      {/* Architecture Diagram */}
      <section className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-slate-100">
         <h3 className="text-2xl font-black italic mb-10 flex items-center space-x-3">
            <Settings className="text-blue-600" />
            <span>Future Sync Architecture</span>
         </h3>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-4 group">
               <div className="w-20 h-20 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-500">
                  <Watch size={32} strokeWidth={2.5} />
               </div>
               <div>
                  <p className="font-black text-slate-900 uppercase text-xs tracking-widest">Apple Watch</p>
                  <p className="text-slate-400 text-[10px] font-bold mt-1">Live HR & Movement</p>
               </div>
            </div>

            {/* Connection 1 */}
            <div className="hidden md:flex absolute top-10 left-[25%] w-[15%] items-center justify-center">
               <ArrowRightLeft className="text-slate-200" size={24} />
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-4 group">
               <div className="w-20 h-20 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-500 relative">
                  <div className="absolute -top-2 -right-2 bg-emerald-500 p-1.5 rounded-xl border-4 border-white shadow-lg">
                     <Lock size={12} fill="white" />
                  </div>
                  <Smartphone size={32} strokeWidth={2.5} />
               </div>
               <div>
                  <p className="font-black text-slate-900 uppercase text-xs tracking-widest italic">Native iOS Bridge</p>
                  <p className="text-slate-400 text-[10px] font-bold mt-1">HealthKit Permissions</p>
               </div>
            </div>

            {/* Connection 2 */}
            <div className="hidden md:flex absolute top-10 left-[60%] w-[15%] items-center justify-center">
               <ArrowRightLeft className="text-slate-200" size={24} />
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-4 group">
               <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-500">
                  <Database size={32} strokeWidth={2.5} />
               </div>
               <div>
                  <p className="font-black text-slate-900 uppercase text-xs tracking-widest">ZoneCoach Cloud</p>
                  <p className="text-slate-400 text-[10px] font-bold mt-1">Advanced Zone 2 Scoring</p>
               </div>
            </div>
         </div>
      </section>

      {/* Detailed Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <section className="bg-slate-900 p-10 rounded-[3rem] text-white space-y-8">
            <h3 className="text-2xl font-black italic text-emerald-400">Why a Native App?</h3>
            <p className="text-slate-400 font-medium leading-relaxed italic">
               Currently, browser-based apps (PWAs) cannot access Apple's <span className="text-white">HealthKit API</span> due to Apple's strict privacy sandbox. 
               To calculate elite Zone 2 data, we need high-frequency heart rate samples.
            </p>
            <ul className="space-y-4">
               {[
                 { icon: Heart, label: 'HR Samples', desc: 'Second-by-second cardiac intensity.' },
                 { icon: Watch, label: 'Watch Notifications', desc: 'Haptic alerts when you exit Zone 2.' },
                 { icon: ShieldCheck, label: 'HealthKit Sync', desc: 'Auto-import activities from Apple Fitness.' }
               ].map((item, i) => (
                 <li key={i} className="flex items-start space-x-4 p-4 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-colors">
                    <item.icon size={20} className="text-blue-400 shrink-0" />
                    <div>
                       <p className="text-sm font-black uppercase tracking-widest">{item.label}</p>
                       <p className="text-xs text-slate-500 font-bold mt-0.5">{item.desc}</p>
                    </div>
                 </li>
               ))}
            </ul>
         </section>

         <section className="bg-white p-10 rounded-[3rem] border border-slate-100 space-y-8">
            <h3 className="text-2xl font-black italic text-slate-900 leading-tight">Advanced Metrics Planned</h3>
            <div className="space-y-6">
               <div className="p-6 bg-slate-50 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Cardiac Drift Analysis</span>
                     <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-[8px] font-black">PREMIUM</span>
                  </div>
                  <p className="text-sm text-slate-600 font-bold leading-relaxed">
                     Detecting internal fatigue by comparing HR samples against pace over time.
                  </p>
               </div>
               <div className="p-6 bg-slate-50 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Time-In-Zone (TIZ)</span>
                     <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded text-[8px] font-black">CORE</span>
                  </div>
                  <p className="text-sm text-slate-600 font-bold leading-relaxed">
                     Exact second-based count of your discipline within the aerobic threshold.
                  </p>
               </div>
               <div className="p-6 bg-slate-50 rounded-2xl space-y-3 opacity-60">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">VO2 Max Estimation</span>
                     <span className="px-2 py-0.5 bg-slate-200 text-slate-400 rounded text-[8px] font-black">RESEARCH</span>
                  </div>
                  <p className="text-sm text-slate-400 font-bold leading-relaxed italic">
                     Calculating maximum oxygen uptake using Apple Health's historical baseline.
                  </p>
               </div>
            </div>
         </section>
      </div>

      {/* Status Footer */}
      <footer className="bg-blue-600 p-12 rounded-[3rem] text-white text-center relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32 opacity-10 group-hover:scale-110 transition-transform duration-700" />
         <div className="relative z-10 space-y-4">
            <h4 className="text-3xl font-black italic tracking-tighter">Current Phase: PWA Development</h4>
            <p className="text-blue-100 font-bold max-w-xl mx-auto italic opacity-80">
               We are currently perfecting the tracking engine for your mobile browser. The native iOS companion is scheduled for the next development cycle.
            </p>
         </div>
      </footer>
    </div>
  );
};
