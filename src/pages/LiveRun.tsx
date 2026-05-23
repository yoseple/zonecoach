import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRunStore } from '../store/useRunStore';
import { useGeolocationTracker } from '../hooks/useGeolocationTracker';
import { useWakeLock } from '../hooks/useWakeLock';
import { useRunTimer } from '../hooks/useRunTimer';
import { LiveRunMap } from '../components/LiveRunMap';
import { GpsAccuracyBadge } from '../components/GpsAccuracyBadge';
import { FinishRunModal } from '../components/FinishRunModal';
import { TrainingModeBanner } from '../components/TrainingModeBanner';
import { TrainingProgressBar } from '../components/TrainingProgressBar';
import { formatDuration, calculatePace } from '../utils/calculations';
import { calculateRollingPace, secondsToPace } from '../utils/pace';
import { announceMile, speak } from '../utils/speech';
import { 
  ChevronDown, 
  ChevronUp, 
  Map as MapIcon, 
  TrendingUp,
  Terminal,
  Play,
  Pause,
  Square,
  Volume2,
  Settings2,
  Activity as ActivityIcon,
  Trophy,
  Target
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { Run, RunType, Workout } from '../types';
import { clsx } from 'clsx';

const RUN_TYPES: RunType[] = [
  'Free Run', 
  'Zone 2 Run', 
  'Easy Run', 
  'Tempo Run', 
  'Interval Run', 
  'Long Run', 
  'Race Pace',
  'Easy Zone 2 Run',
  'Recovery Run'
];

export const LiveRun: React.FC = () => {
  const navigate = useNavigate();
  const { addRun, plans, activePlanId, activeWorkoutId, setActiveWorkout, updateWorkoutStatus } = useRunStore();

  // Flow State
  const [status, setStatus] = useState<'setup' | 'running' | 'paused' | 'finishing'>('setup');
  const [runType, setRunType] = useState<RunType>('Free Run');
  const [audioEnabled, setAudioAlerts] = useState(true);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Guided Workout Data
  const activePlan = plans.find(p => p.id === activePlanId);
  const activeWorkout = activePlan?.workouts.find(w => w.id === activeWorkoutId);

  // Hooks
  const timer = useRunTimer();
  const tracker = useGeolocationTracker(status === 'running');
  const { requestWakeLock, releaseWakeLock } = useWakeLock();

  const lastSplitCount = useRef(0);
  const goalReachedSpoken = useRef(false);

  // Pre-fill setup from workout
  useEffect(() => {
    if (activeWorkout && status === 'setup') {
       setRunType(activeWorkout.type as RunType);
    }
  }, [activeWorkout, status]);

  // Sync Timer and Tracker with Status
  useEffect(() => {
    if (status === 'running') {
      timer.start();
      requestWakeLock();
    } else if (status === 'paused') {
      timer.pause();
    } else if (status === 'setup') {
      timer.reset();
      tracker.reset();
      releaseWakeLock();
    }
  }, [status]);

  // Goal Completion Logic
  useEffect(() => {
    if (activeWorkout?.targetDistance && tracker.totalDistance >= activeWorkout.targetDistance && !goalReachedSpoken.current) {
        if (audioEnabled) {
            speak(`Workout goal reached. You completed ${activeWorkout.targetDistance} miles.`, {
                enabled: true,
                mileAnnouncements: true,
                paceAlerts: false,
                rate: 1,
                pitch: 1
            });
        }
        goalReachedSpoken.current = true;
    }
  }, [tracker.totalDistance, activeWorkout, audioEnabled]);

  // Voice announcements
  useEffect(() => {
    if (tracker.splits.length > lastSplitCount.current) {
      const lastSplit = tracker.splits[tracker.splits.length - 1];
      if (audioEnabled) {
        announceMile(lastSplit.mile, lastSplit.pace, {
          enabled: true,
          mileAnnouncements: true,
          paceAlerts: false,
          rate: 1,
          pitch: 1
        });
      }
      lastSplitCount.current = tracker.splits.length;
    }
  }, [tracker.splits, audioEnabled]);

  const handleStart = () => setStatus('running');
  const handlePause = () => setStatus('paused');
  const handleResume = () => setStatus('running');
  const handleEndClick = () => setStatus('finishing');
  
  const handleLog = (notes: string) => {
    if (isSaving) return;
    setIsSaving(true);

    const runId = uuidv4();
    const accuracies = tracker.acceptedPoints.map(p => p.accuracy);
    const avgAccuracy = accuracies.length > 0 ? accuracies.reduce((a, b) => a + b, 0) / accuracies.length : 0;
    const bestAccuracy = accuracies.length > 0 ? Math.min(...accuracies) : 0;
    const worstAccuracy = accuracies.length > 0 ? Math.max(...accuracies) : 0;

    const newRun: Run = {
      id: runId,
      date: new Date().toISOString().split('T')[0],
      title: activeWorkout ? `${activeWorkout.type} (Plan)` : `${runType} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      type: runType,
      distance: tracker.totalDistance,
      duration: timer.elapsedSeconds,
      avgHeartRate: 0,
      maxHeartRate: 0,
      calories: Math.round(tracker.totalDistance * 100),
      notes: notes || `Tracked via Phone GPS.`,
      splits: tracker.splits.map(s => ({ mile: s.mile, time: Math.round(s.time / 1000) })),
      routePoints: tracker.acceptedPoints.map(p => ({ lat: p.lat, lng: p.lng, time: new Date(p.timestamp).toISOString() })),
      source: 'Phone GPS',
      accuracyMetadata: {
        avgAccuracy,
        bestAccuracy,
        worstAccuracy,
        acceptedPoints: tracker.acceptedPoints.length,
        rejectedPoints: tracker.rejectedCount
      },
      // Training Linkage
      trainingWorkoutId: activeWorkout?.id,
      trainingPlanId: activePlan?.id,
      plannedWorkoutName: activeWorkout?.type,
      plannedDistanceMiles: activeWorkout?.targetDistance,
      plannedTargetZone: activeWorkout?.targetZone,
      completionPercent: activeWorkout?.targetDistance ? Math.round((tracker.totalDistance / activeWorkout.targetDistance) * 100) : 100
    };

    addRun(newRun);
    
    // Complete the workout
    if (activePlan && activeWorkout) {
        updateWorkoutStatus(activePlan.id, activeWorkout.id, 'completed', runId);
        setActiveWorkout(null);
    }

    navigate(`/run/${runId}`);
  };

  const handleDiscard = () => {
    tracker.reset();
    timer.reset();
    setActiveWorkout(null);
    setStatus('setup');
    lastSplitCount.current = 0;
    goalReachedSpoken.current = false;
  };

  const currentPace = calculateRollingPace(tracker.acceptedPoints);
  const averagePace = secondsToPace(timer.elapsedSeconds, tracker.totalDistance);

  // Calculate fastest mile
  const fastestMile = React.useMemo(() => {
    if (tracker.splits.length === 0) return '--:--';
    const sorted = [...tracker.splits].sort((a, b) => a.time - b.time);
    return sorted[0].pace;
  }, [tracker.splits]);

  // STEP 1: SETUP
  if (status === 'setup') {
    return (
      <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in duration-500 pb-12">
        <header className="flex justify-between items-start">
           <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight italic">Live Tracker</h2>
              <p className="text-slate-500 font-bold mt-1">Configure your session and hit the road.</p>
           </div>
           <button onClick={() => navigate(-1)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900"><X size={20} /></button>
        </header>

        {activeWorkout && <TrainingModeBanner workout={activeWorkout} />}

        <div className="grid grid-cols-1 gap-6">
           {/* GPS Status Card */}
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Satellite Signal</p>
                 <GpsAccuracyBadge accuracy={tracker.accuracy} />
              </div>
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                 <MapIcon size={24} />
              </div>
           </div>

           {/* Run Type Selector - Hidden or Disabled in Training Mode */}
           {!activeWorkout && (
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center space-x-3 text-slate-900">
                   <ActivityIcon size={20} className="text-blue-600" />
                   <h3 className="text-xl font-black italic">Activity Profile</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                   {RUN_TYPES.map(type => (
                     <button
                       key={type}
                       onClick={() => setRunType(type)}
                       className={clsx(
                         "py-4 px-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                         runType === type ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100"
                       )}
                     >
                       {type}
                     </button>
                   ))}
                </div>
             </div>
           )}

           {/* Settings Toggles */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => setAudioAlerts(!audioEnabled)}
                className={clsx(
                  "flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all",
                  audioEnabled ? "bg-emerald-50 border-emerald-100" : "bg-white border-slate-100 opacity-60"
                )}
              >
                 <div className="flex items-center space-x-3">
                    <Volume2 size={20} className={audioEnabled ? "text-emerald-600" : "text-slate-400"} />
                    <span className={clsx("text-xs font-black uppercase tracking-widest", audioEnabled ? "text-emerald-900" : "text-slate-400")}>Audio Alerts</span>
                 </div>
                 <div className={clsx("w-8 h-4 rounded-full relative transition-colors", audioEnabled ? "bg-emerald-500" : "bg-slate-200")}>
                    <div className={clsx("absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all", audioEnabled ? "left-[1.125rem]" : "left-0.5")} />
                 </div>
              </button>
              <div className="bg-slate-50 p-6 rounded-[2rem] flex items-center justify-between opacity-40 grayscale cursor-not-allowed">
                 <div className="flex items-center space-x-3">
                    <Settings2 size={20} className="text-slate-400" />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Target Pace</span>
                 </div>
                 <span className="text-[8px] font-black uppercase text-slate-400">Pro Feature</span>
              </div>
           </div>
        </div>

        <button 
          onClick={handleStart}
          className="w-full py-8 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm shadow-2xl shadow-slate-200 hover:bg-blue-600 transition-all flex items-center justify-center space-x-4 group active:scale-[0.98]"
        >
           <Play size={24} fill="currentColor" className="group-hover:scale-110 transition-transform" />
           <span>Ignition Start</span>
        </button>
      </div>
    );
  }

  // STEP 2 & 3: ACTIVE / PAUSED
  return (
    <div className="fixed inset-0 bg-white z-40 flex flex-col font-sans overflow-hidden select-none">
      <FinishRunModal 
        isOpen={status === 'finishing'}
        distance={tracker.totalDistance}
        time={timer.elapsedSeconds}
        pace={averagePace}
        onLog={handleLog}
        onContinue={() => setStatus(timer.isRunning ? 'running' : 'paused')}
        onDiscard={handleDiscard}
      />

      <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-slate-50 shrink-0">
        <div className="flex items-center space-x-3">
          <div className={clsx("w-2 h-2 rounded-full", status === 'running' ? "bg-emerald-500 animate-pulse" : "bg-amber-500")} />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 text-nowrap">
            {activeWorkout ? `Guided: ${activeWorkout.type}` : status === 'running' ? 'Tracking' : 'Paused'}
          </span>
        </div>
        <div className="flex items-center space-x-4">
           <button onClick={() => setShowDebug(!showDebug)} className={clsx("p-2 rounded-lg transition-colors", showDebug ? "text-emerald-500 bg-slate-900" : "text-slate-200")}><Terminal size={14} /></button>
           <GpsAccuracyBadge accuracy={tracker.accuracy} />
        </div>
      </header>

      {/* Main Metrics Area */}
      <div className={clsx(
        "flex-1 flex flex-col px-6 transition-all duration-500",
        mapExpanded ? "opacity-0 scale-95 pointer-events-none absolute inset-0" : "opacity-100 scale-100 relative"
      )}>
        <div className="flex-1 flex flex-col justify-center space-y-12 py-4">
          
          {/* Workout Progress Bar */}
          {activeWorkout?.targetDistance && (
            <div className="animate-in slide-in-from-top-4">
               <TrainingProgressBar 
                 current={tracker.totalDistance} 
                 target={activeWorkout.targetDistance} 
                 label="Assignment Goal"
                 unit="mi"
                 color="bg-blue-600"
               />
            </div>
          )}

          {/* Big Distance */}
          <div className="text-center space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Distance</p>
            <div className="flex items-baseline justify-center">
              <span className="text-[9rem] sm:text-[10rem] font-black italic tracking-tighter leading-none text-slate-900 tabular-nums">
                {tracker.totalDistance.toFixed(2)}
              </span>
              <span className="text-2xl font-black italic text-slate-300 ml-2 uppercase tracking-tighter">mi</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12">
            {/* Big Timer */}
            <div className="text-center space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Timer</p>
              <p className="text-5xl sm:text-6xl font-black italic tracking-tighter tabular-nums text-slate-900 leading-none">
                {formatDuration(timer.elapsedSeconds)}
              </p>
            </div>
            {/* Big Current Pace */}
            <div className="text-center space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Pace</p>
              <p className="text-5xl sm:text-6xl font-black italic tracking-tighter text-blue-600 tabular-nums leading-none">
                {currentPace}
              </p>
            </div>
          </div>
        </div>

        {/* Sub-metrics Cards */}
        <div className="grid grid-cols-2 gap-4 pb-36 border-t border-slate-50 pt-8 shrink-0">
          <div className="bg-slate-50 p-6 rounded-[2rem] flex flex-col items-center justify-center space-y-1">
             <TrendingUp size={18} className="text-slate-300" />
             <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Average Pace</p>
             <p className="text-xl font-black italic text-slate-900">{averagePace}</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-[2rem] flex flex-col items-center justify-center space-y-1">
             <Trophy size={18} className="text-slate-300" />
             <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Fastest Mile</p>
             <p className="text-xl font-black italic text-slate-900">{fastestMile}</p>
          </div>
        </div>
      </div>

      {/* Map Drawer */}
      <div className={clsx(
        "absolute bottom-0 left-0 w-full bg-slate-900 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] z-40",
        mapExpanded ? "h-[calc(100vh-56px)]" : "h-16"
      )}>
        <button onClick={() => setMapExpanded(!mapExpanded)} className="absolute top-0 left-0 w-full h-12 flex items-center justify-center text-white/20 hover:text-white transition-colors z-[1001]">
          {mapExpanded ? <ChevronDown size={28} /> : <ChevronUp size={28} />}
        </button>
        <div className="h-full w-full">
           <LiveRunMap points={tracker.acceptedPoints} currentPoint={tracker.acceptedPoints[tracker.acceptedPoints.length - 1] || null} />
        </div>
      </div>

      {/* Fixed Sticky Controls */}
      <div className={clsx(
        "fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-sm px-8 z-50 transition-all duration-500",
        mapExpanded ? "translate-y-32 opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
      )}>
        <div className="flex items-center justify-between gap-6">
           <button onClick={handleEndClick} className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center shadow-lg border border-slate-100 active:scale-90 transition-transform">
              <Square size={24} fill="currentColor" />
           </button>
           <button 
             onClick={status === 'running' ? handlePause : handleResume}
             className={clsx(
               "flex-1 h-24 rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.2)] active:scale-95 transition-all space-x-3",
               status === 'running' ? "bg-slate-900 text-white" : "bg-blue-600 text-white"
             )}
           >
              {status === 'running' ? (
                <><Pause size={32} fill="currentColor" /><span className="font-black uppercase tracking-[0.2em] text-xs">Pause</span></>
              ) : (
                <><Play size={32} fill="currentColor" className="ml-1" /><span className="font-black uppercase tracking-[0.2em] text-xs">Resume</span></>
              )}
           </button>
        </div>
      </div>

      {showDebug && (
        <div className="absolute top-20 right-6 z-[2000] w-64 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl text-[10px] font-mono space-y-3 animate-in fade-in slide-in-from-top-2">
           <p className="text-emerald-400 font-black uppercase">Telemetry Feed</p>
           <div className="space-y-1 text-slate-400">
              <p><span className="text-white">STATUS:</span> {status.toUpperCase()}</p>
              <p><span className="text-white">ELAPSED:</span> {timer.elapsedSeconds}s</p>
              <p><span className="text-white">ACCURACY:</span> {tracker.accuracy?.toFixed(1) || '--'}m</p>
              <p><span className="text-white">SAMPLES:</span> {tracker.acceptedPoints.length}</p>
           </div>
        </div>
      )}
    </div>
  );
};

const X = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
