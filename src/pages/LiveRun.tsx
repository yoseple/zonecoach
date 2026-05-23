import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRunStore } from '../store/useRunStore';
import { useGeolocationTracker } from '../hooks/useGeolocationTracker';
import { useWakeLock } from '../hooks/useWakeLock';
import { LiveRunControls } from '../components/LiveRunControls';
import { LiveRunMap } from '../components/LiveRunMap';
import { GpsAccuracyBadge } from '../components/GpsAccuracyBadge';
import { formatDuration } from '../utils/calculations';
import { calculateRollingPace, secondsToPace } from '../utils/pace';
import { announceMile } from '../utils/speech';
import { 
  ChevronDown, 
  ChevronUp, 
  Map as MapIcon, 
  Activity, 
  TrendingUp,
  Zap,
  Target
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { Run } from '../types';
import { clsx } from 'clsx';

export const LiveRun: React.FC = () => {
  const navigate = useNavigate();
  const addRun = useRunStore(state => state.addRun);
  const activePlan = useRunStore(state => state.plans.find(p => p.id === state.activePlanId));

  const [status, setStatus] = useState<'lock' | 'ready' | 'tracking' | 'paused'>('lock');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [mapExpanded, setMapExpanded] = useState(false);
  
  // High-precision timing refs
  const accumulatedTimeRef = useRef(0); // in ms
  const startTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  const { acceptedPoints, totalDistance, splits, accuracy, reset, rejectedCount } = useGeolocationTracker(status === 'tracking');
  const { requestWakeLock, releaseWakeLock } = useWakeLock();

  const lastSplitCount = useRef(0);

  // GPS Lock Logic
  useEffect(() => {
    if (status === 'lock' && accuracy && accuracy <= 20) {
      setStatus('ready');
    }
  }, [accuracy, status]);

  // Timer logic
  useEffect(() => {
    if (status === 'tracking') {
      startTimeRef.current = Date.now();
      requestWakeLock();
      
      timerIntervalRef.current = window.setInterval(() => {
        if (startTimeRef.current) {
          const delta = Date.now() - startTimeRef.current;
          const totalMs = accumulatedTimeRef.current + delta;
          setElapsedSeconds(Math.floor(totalMs / 1000));
        }
      }, 1000);
    } else {
      if (status === 'paused' && startTimeRef.current) {
        accumulatedTimeRef.current += (Date.now() - startTimeRef.current);
        startTimeRef.current = null;
      }
      
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      
      if (status === 'ready' || status === 'lock') {
        releaseWakeLock();
      }
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [status, requestWakeLock, releaseWakeLock]);

  // Voice announcements
  useEffect(() => {
    if (splits.length > lastSplitCount.current) {
      const lastSplit = splits[splits.length - 1];
      announceMile(lastSplit.mile, lastSplit.pace, {
        enabled: true,
        mileAnnouncements: true,
        paceAlerts: false,
        rate: 1,
        pitch: 1
      });
      lastSplitCount.current = splits.length;
    }
  }, [splits]);

  const handleStart = () => setStatus('tracking');
  const handlePause = () => setStatus('paused');
  const handleResume = () => setStatus('tracking');
  const handleDiscard = () => {
    if (window.confirm('Discard this run? All data will be lost.')) {
      reset();
      accumulatedTimeRef.current = 0;
      startTimeRef.current = null;
      setElapsedSeconds(0);
      setStatus('lock');
      lastSplitCount.current = 0;
    }
  };
const handleEnd = () => {
  // Basic validation
  const isTooShort = totalDistance < 0.03 || elapsedSeconds < 30 || acceptedPoints.length < 3;

  if (isTooShort) {
    if (!window.confirm('This activity seems too short to save. Discard it instead?')) {
      return;
    }
    handleDiscard();
    return;
  }

  if (!window.confirm('End and save this activity?')) {
      return;
  }

  const runId = uuidv4();
  // Calculate accuracy stats
  const accuracies = acceptedPoints.map(p => p.accuracy);
  const avgAccuracy = accuracies.length > 0 ? accuracies.reduce((a, b) => a + b, 0) / accuracies.length : 0;
  const bestAccuracy = accuracies.length > 0 ? Math.min(...accuracies) : 0;
  const worstAccuracy = accuracies.length > 0 ? Math.max(...accuracies) : 0;

  const newRun: Run = {
    id: runId,
    date: new Date().toISOString().split('T')[0],
    title: `Live Run ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    type: 'Free Run',
    distance: totalDistance,
    duration: elapsedSeconds,
    avgHeartRate: 0,
    maxHeartRate: 0,
    calories: Math.round(totalDistance * 100),
    notes: `Tracked via Phone GPS.`,
    splits: splits.map(s => ({ mile: s.mile, time: Math.round(s.time / 1000) })),
    routePoints: acceptedPoints.map(p => ({ lat: p.lat, lng: p.lng, time: new Date(p.timestamp).toISOString() })),
    source: 'Phone GPS',
    accuracyMetadata: {
      avgAccuracy,
      bestAccuracy,
      worstAccuracy,
      acceptedPoints: acceptedPoints.length,
      rejectedPoints: rejectedCount
    }
  };


    addRun(newRun);
    if (activePlan) {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const workout = activePlan.workouts.find(w => w.day === today && w.status === 'pending');
        if (workout) {
            useRunStore.getState().updateWorkoutStatus(activePlan.id, workout.id, 'completed');
        }
    }
    navigate(`/run/${runId}`);
  };

  const currentPace = calculateRollingPace(acceptedPoints);
  const averagePace = secondsToPace(elapsedSeconds, totalDistance);

  // GPS Lock Screen
  if (status === 'lock') {
    return (
      <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col items-center justify-center p-8 text-white text-center">
        <div className="w-24 h-24 bg-blue-600/20 rounded-[2rem] flex items-center justify-center mb-8 relative">
           <div className="absolute inset-0 border-4 border-blue-500/30 rounded-[2.5rem] animate-ping" />
           <Activity className="text-blue-500 animate-pulse" size={48} />
        </div>
        <h2 className="text-3xl font-black italic tracking-tighter mb-4">Awaiting Signal</h2>
        <p className="text-slate-400 font-bold mb-12 max-w-xs leading-relaxed">
          Acquiring high-accuracy GPS lock. For best results, ensure you are outdoors with a clear view of the sky.
        </p>
        
        <div className="space-y-4 w-full max-w-xs">
          <GpsAccuracyBadge accuracy={accuracy} />
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
             <div 
               className="h-full bg-blue-500 transition-all duration-1000" 
               style={{ width: accuracy ? `${Math.min(100, Math.max(10, (35/accuracy)*100))}%` : '10%' }}
             />
          </div>
        </div>

        <button 
          onClick={() => navigate(-1)}
          className="mt-12 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors"
        >
          Cancel Activity
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-40 flex flex-col font-sans overflow-hidden">
      {/* Top Header - Minimal */}
      <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-50">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Recording</span>
        </div>
        <GpsAccuracyBadge accuracy={accuracy} />
      </header>

      {/* Main Metrics Area */}
      <div className={clsx(
        "flex-1 flex flex-col p-6 transition-all duration-500",
        mapExpanded ? "opacity-0 scale-95 pointer-events-none absolute" : "opacity-100 scale-100 relative"
      )}>
        <div className="flex-1 flex flex-col justify-center space-y-16">
          {/* Main Triple Display */}
          <div className="text-center space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Total Distance</p>
            <div className="flex items-baseline justify-center space-x-2">
              <span className="text-9xl font-black italic tracking-tighter leading-none">{totalDistance.toFixed(2)}</span>
              <span className="text-2xl font-black italic text-slate-300 uppercase tracking-tighter">mi</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="text-center space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Duration</p>
              <p className="text-5xl font-black italic tracking-tighter tabular-nums">{formatDuration(elapsedSeconds)}</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Current Pace</p>
              <p className="text-5xl font-black italic tracking-tighter text-blue-600 tabular-nums">{currentPace}</p>
            </div>
          </div>
        </div>

        {/* Sub-metrics Grid */}
        <div className="grid grid-cols-3 gap-4 pt-10 border-t border-slate-50 mb-32">
          <div className="bg-slate-50 p-4 rounded-3xl text-center space-y-1">
             <TrendingUp size={16} className="mx-auto text-slate-300" />
             <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Avg Pace</p>
             <p className="text-sm font-black italic text-slate-900">{averagePace}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-3xl text-center space-y-1">
             <Target size={16} className="mx-auto text-slate-300" />
             <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Current Split</p>
             <p className="text-sm font-black italic text-slate-900">{splits[splits.length - 1]?.pace || '--:--'}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-3xl text-center space-y-1">
             <Zap size={16} className="mx-auto text-slate-300" />
             <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Calories</p>
             <p className="text-sm font-black italic text-slate-900">{Math.round(totalDistance * 100)}</p>
          </div>
        </div>
      </div>

      {/* Map Drawer */}
      <div className={clsx(
        "absolute bottom-0 left-0 w-full bg-slate-900 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] z-40",
        mapExpanded ? "h-[calc(100vh-64px)]" : "h-24"
      )}>
        <button 
          onClick={() => setMapExpanded(!mapExpanded)}
          className="absolute top-0 left-0 w-full h-8 flex items-center justify-center text-white/40 hover:text-white transition-colors z-[1001]"
        >
          {mapExpanded ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
        </button>

        <div className="h-full w-full">
           <LiveRunMap points={acceptedPoints} currentPoint={acceptedPoints[acceptedPoints.length - 1] || null} />
        </div>

        {!mapExpanded && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center mt-4">
             <div className="flex items-center space-x-2 text-white/50 text-[10px] font-black uppercase tracking-widest">
                <MapIcon size={14} />
                <span>View Route Map</span>
             </div>
          </div>
        )}
      </div>

      {/* Controls Overlay */}
      <div className={clsx(
        "fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-50 transition-transform duration-500",
        mapExpanded ? "translate-y-32" : "translate-y-0"
      )}>
        <div className="bg-white/90 backdrop-blur-xl p-4 rounded-[3.5rem] shadow-2xl border border-slate-100 shadow-slate-200">
          <LiveRunControls 
            status={(status as any) === 'lock' || status === 'ready' ? 'ready' : status} 
            onStart={handleStart} 
            onPause={handlePause} 
            onResume={handleResume} 
            onEnd={handleEnd}
            onDiscard={handleDiscard}
          />
        </div>
      </div>
    </div>
  );
};
