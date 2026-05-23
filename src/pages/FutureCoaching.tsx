import React from 'react';
import { 
  Watch, 
  Zap, 
  Volume2, 
  ShieldCheck, 
  Bell, 
  Navigation 
} from 'lucide-react';

export const FutureCoaching: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
          <Zap size={14} />
          <span>Coming Soon</span>
        </div>
        <h2 className="text-4xl font-black text-slate-900">Native Apple Watch Integration</h2>
        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
          ZoneCoach is expanding. Soon, you'll be able to take your digital coach on every run with our native watchOS app.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center">
            <Watch size={24} />
          </div>
          <h3 className="text-2xl font-black text-slate-900">Live Wrist Coaching</h3>
          <p className="text-slate-500 font-medium leading-relaxed">
            Real-time feedback directly on your wrist. No more checking your phone or guessing your effort levels.
          </p>
          <ul className="space-y-4">
            {[
              { icon: Activity, text: 'Real-time Heart Rate Tracking' },
              { icon: Navigation, text: 'GPS Route Recording' },
              { icon: Bell, text: 'Haptic Zone Alerts' },
              { icon: ShieldCheck, text: 'Auto-Sync to Apple Health' },
            ].map((item, i) => (
              <li key={i} className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-blue-600">
                  <item.icon size={14} />
                </div>
                <span className="text-slate-700 font-bold text-sm">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-900 p-8 rounded-3xl shadow-xl text-white space-y-6">
          <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center">
            <Volume2 size={24} />
          </div>
          <h3 className="text-2xl font-black">Audio Feedback</h3>
          <p className="text-slate-400 font-medium leading-relaxed">
            Crystal clear audio cues through your AirPods to keep you in the zone.
          </p>
          
          <div className="space-y-3">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Sample Alerts</p>
            {[
              { text: '"Slow down. You’re above Zone 2."', type: 'Warning' },
              { text: '"Heart rate is still high. Ease up or walk briefly."', type: 'Urgent' },
              { text: '"Good. You’re back in Zone 2."', type: 'Success' },
              { text: '"Pick it up slightly. You’re below target."', type: 'Correction' },
            ].map((alert, i) => (
              <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="text-sm font-medium italic mb-1 text-white">
                  {alert.text}
                </p>
                <span className={`text-[10px] font-black uppercase tracking-tighter ${
                  alert.type === 'Warning' ? 'text-amber-400' :
                  alert.type === 'Urgent' ? 'text-rose-500' :
                  alert.type === 'Success' ? 'text-emerald-400' :
                  'text-blue-400'
                }`}>
                  {alert.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-2xl font-black text-slate-900 mb-8">Smart Alert Logic</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-black">1</div>
            <h4 className="font-bold text-slate-900">Detection</h4>
            <p className="text-sm text-slate-500 font-medium">If HR exceeds Zone 2 max for 20-30 seconds, a gentle haptic alert triggers.</p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-black">2</div>
            <h4 className="font-bold text-slate-900">Escalation</h4>
            <p className="text-sm text-slate-500 font-medium">If HR remains high after another 30 seconds, a stronger audio alert is played.</p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-black">3</div>
            <h4 className="font-bold text-slate-900">Recovery</h4>
            <p className="text-sm text-slate-500 font-medium">Once back in range, the coach confirms and enters a 90-second cooldown.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mock icon for the list
const Activity = (props: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
