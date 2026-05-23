import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRunStore } from '../store/useRunStore';
import { useGeolocationTracker } from '../hooks/useGeolocationTracker';
import { useWakeLock } from '../hooks/useWakeLock';
import { useRunTimer } from '../hooks/useRunTimer';
import { useVoiceCoach } from '../hooks/useVoiceCoach';
import { useRunMediaSession } from '../hooks/useRunMediaSession';
import { LiveRunMap } from '../components/LiveRunMap';
import { GpsAccuracyBadge } from '../components/GpsAccuracyBadge';
import { FinishRunModal } from '../components/FinishRunModal';
import { TrainingProgressBar } from '../components/TrainingProgressBar';
import { PreRunSetup } from '../components/PreRunSetup';
import { VoiceCoachStatus } from '../components/VoiceCoachStatus';
import { formatDuration } from '../utils/calculations';
import { calculateRollingPace, secondsToPace, paceToSeconds } from '../utils/pace';
import { announceMile, speak, clearSpeechCooldowns } from '../utils/speech';
import { 
  ChevronDown, 
  ChevronUp, 
  TrendingUp,
  Terminal,
  Play,
  Pause,
  Square,
  Trophy
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { Run, RunType, CoachingSettings } from '../types';
import { clsx } from 'clsx';

export const LiveRun: React.FC = () => {
  const navigate = useNavigate();
  const { addRun, plans, activePlanId, activeWorkoutId, setActiveWorkout, updateWorkoutStatus } = useRunStore();

  // Flow State
  const [status, setStatus] = useState<'setup' | 'running' | 'paused' | 'finishing'>('setup');
  const [runType, setRunType] = useState<RunType>('Free Run');
  const [targetPace, setTargetPace] = useState({ min: '', max: '' });
  const [coachSettings, setCoachSettings] = useState<CoachingSettings>({
    enabled: true,
    paceAlerts: true,
    mileAnnouncements: true,
    goalAnnouncements: true,
    voiceRate: 1,
    voicePitch: 1,
    cooldownSeconds: 75,
    keepScreenAwake: true
  });
  
  const [mapExpanded, setMapExpanded] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Guided Workout Data
  const activePlan = plans.find(p => p.id === activePlanId);
  const activeWorkout = activePlan?.workouts.find(w => w.id === activeWorkoutId);

  // Hooks
  const timer = useRunTimer();
  const tracker = useGeolocationTracker(status === 'running');
  const { requestWakeLock, releaseWakeLock, status: wakeLockStatus } = useWakeLock();

  const currentPace = calculateRollingPace(tracker.acceptedPoints);
  const averagePace = secondsToPace(timer.elapsedSeconds, tracker.totalDistance);

  const { alertCounts } = useVoiceCoach({
    isActive: status === 'running',
    isPaused: status === 'paused',
    currentPace,
    totalDistance: tracker.totalDistance,
    elapsedSeconds: timer.elapsedSeconds,
    targetPaceMin: targetPace.min,
    targetPaceMax: targetPace.max,
    settings: coachSettings,
    runType,
    isGPSGood: tracker.accuracy !== null && tracker.accuracy <= 35
  });

  useRunMediaSession(status === 'running', {
    title: activeWorkout ? activeWorkout.type : 'ZoneCoach Run',
    artist: runType,
    album: targetPace.min ? `Target: ${targetPace.min}-${targetPace.max}` : 'Elite Training'
  }, {
    onPlay: () => setStatus('running'),
    onPause: () => setStatus('paused')
  });

  const lastSplitCount = useRef(0);
  const goalReachedSpoken = useRef(false);

  // Pre-fill setup from workout
  useEffect(() => {
    if (activeWorkout && status === 'setup') {
       setRunType(activeWorkout.type as RunType);
       if (activeWorkout.targetPaceMin) {
          setTargetPace({ min: activeWorkout.targetPaceMin, max: activeWorkout.targetPaceMax || '' });
       }
    }
  }, [activeWorkout, status]);

  // Sync Timer and Tracker with Status
  useEffect(() => {
    if (status === 'running') {
      timer.start();
      if (coachSettings.keepScreenAwake) requestWakeLock();
    } else if (status === 'paused') {
      timer.pause();
    } else if (status === 'setup') {
      timer.reset();
      tracker.reset();
      releaseWakeLock();
      clearSpeechCooldowns();
    }
  }, [status, coachSettings.keepScreenAwake, requestWakeLock, releaseWakeLock]);

  // Goal Completion Logic
  useEffect(() => {
    if (activeWorkout?.targetDistance && tracker.totalDistance >= activeWorkout.targetDistance && !goalReachedSpoken.current) {
        if (coachSettings.enabled && coachSettings.goalAnnouncements) {
            speak(`Workout goal reached. You completed ${activeWorkout.targetDistance} miles.`, coachSettings);
        }
        goalReachedSpoken.current = true;
    }
  }, [tracker.totalDistance, activeWorkout, coachSettings]);

  // Voice announcements for splits
  useEffect(() => {
    if (tracker.splits.length > lastSplitCount.current) {
      const lastSplit = tracker.splits[tracker.splits.length - 1];
      
      // Check if this was the fastest mile
      const isFastest = tracker.splits.length > 1 && 
        [...tracker.splits].sort((a, b) => a.time - b.time)[0].mile === lastSplit.mile;

      if (coachSettings.enabled && coachSettings.mileAnnouncements) {
        announceMile(lastSplit.mile, lastSplit.pace, isFastest, coachSettings);
      }
      lastSplitCount.current = tracker.splits.length;
    }
  }, [tracker.splits, coachSettings]);

  const handleStart = (type: RunType, pace: { min: string; max: string }, coach: CoachingSettings) => {
    setRunType(type);
    setTargetPace(pace);
    setCoachSettings(coach);
    setStatus('running');
    if (coach.enabled) {
      const startMsg = activeWorkout ? "Starting today's workout. Keep it controlled." : "Starting session. Good luck.";
      speak(startMsg, coach);
    }
  };

  const handlePause = () => setStatus('paused');
  const handleResume = () => setStatus('running');
  const handleEndClick = () => setStatus('finishing');
  
  const handleLog = (notes: string, shoeId?: string) => {
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
      title: activeWorkout ? `${activeWorkout.type} (Guided)` : `${runType} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
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
      shoeId: shoeId,
      accuracyMetadata: {
        avgAccuracy,
        bestAccuracy,
        worstAccuracy,
        acceptedPoints: tracker.acceptedPoints.length,
        rejectedPoints: tracker.rejectedCount
      },
      // Coaching Data
      targetPaceMinSeconds: paceToSeconds(targetPace.min),
      targetPaceMaxSeconds: paceToSeconds(targetPace.max),
      voiceCoachingEnabled: coachSettings.enabled,
      tooFastAlertCount: alertCounts.tooFast,
      tooSlowAlertCount: alertCounts.tooSlow,
      mileAnnouncementCount: tracker.splits.length,
      coachingSummary: `Completed ${tracker.totalDistance.toFixed(2)}mi session with ${alertCounts.tooFast + alertCounts.tooSlow} pace corrections.`,
      // Training Linkage
      trainingWorkoutId: activeWorkout?.id,
      trainingPlanId: activePlan?.id,
      plannedWorkoutName: activeWorkout?.type,
      plannedDistanceMiles: activeWorkout?.targetDistance,
      plannedTargetZone: activeWorkout?.targetZone,
      completionPercent: activeWorkout?.targetDistance ? Math.round((tracker.totalDistance / activeWorkout.targetDistance) * 100) : 100
    };

    addRun(newRun);
    
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

  const fastestMilePace = React.useMemo(() => {
    if (tracker.splits.length === 0) return '--:--';
    const sorted = [...tracker.splits].sort((a, b) => a.time - b.time);
    return sorted[0].pace;
  }, [tracker.splits]);

  // STEP 1: SETUP
  if (status === 'setup') {
    return (
      <div className="max-w-2xl mx-auto pb-12 px-6">
        <PreRunSetup 
          initialType={activeWorkout?.type as RunType}
          gpsAccuracy={tracker.accuracy}
          onStart={handleStart}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-40 flex flex-col font-sans overflow-hidden select-none">
      {/* Finish Modal */}
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
          <div className="flex flex-col">
             <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
               {activeWorkout ? `Guided: ${activeWorkout.type}` : status === 'running' ? 'Tracking Session' : 'Session Paused'}
             </span>
             <VoiceCoachStatus 
               settings={coachSettings} 
               isPaused={status === 'paused'}
               isGPSGood={tracker.accuracy !== null && tracker.accuracy <= 35}
               currentPaceSeconds={paceToSeconds(currentPace)}
               targetMinSeconds={paceToSeconds(targetPace.min)}
               targetMaxSeconds={paceToSeconds(targetPace.max)}
             />
          </div>
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
        <div className="flex-1 flex flex-col justify-center space-y-16 py-8">
          {/* Workout Progress Bar */}
          {activeWorkout?.targetDistance && (
            <div className="animate-in slide-in-from-top-4">
               <TrainingProgressBar 
                 current={tracker.totalDistance} 
                 target={activeWorkout.targetDistance} 
                 label="Mission Goal"
                 unit="mi"
                 color="bg-blue-600"
               />
            </div>
          )}

          {/* Big Distance */}
          <div className="text-center space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Distance</p>
            <div className="flex items-baseline justify-center">
              <span className="text-[9rem] sm:text-[11rem] font-black italic tracking-tighter leading-none text-slate-900 tabular-nums">
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
             <p className="text-xl font-black italic text-slate-900">{fastestMilePace}</p>
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
              <p><span className="text-white">WAKE_LOCK:</span> {wakeLockStatus.toUpperCase()}</p>
              <p><span className="text-white">ALERTS:</span> F:{alertCounts.tooFast} S:{alertCounts.tooSlow}</p>
           </div>
        </div>
      )}
    </div>
  );
};
