import { useEffect, useRef, useCallback } from 'react';
import type { CoachingSettings } from '../types';
import { paceToSeconds, isPaceTooFast, isPaceTooSlow } from '../utils/pace';
import { speak } from '../utils/speech';

interface Props {
  isActive: boolean;
  isPaused: boolean;
  currentPace: string;
  totalDistance: number;
  elapsedSeconds: number;
  targetPaceMin?: string;
  targetPaceMax?: string;
  settings: CoachingSettings;
  runType: string;
  isGPSGood: boolean;
}

export const useVoiceCoach = ({
  isActive,
  isPaused,
  currentPace,
  totalDistance,
  elapsedSeconds,
  targetPaceMin,
  targetPaceMax,
  settings,
  runType,
  isGPSGood
}: Props) => {
  const tooFastCounter = useRef(0);
  const tooSlowCounter = useRef(0);
  const onTargetCounter = useRef(0);
  const alertCount = useRef({ tooFast: 0, tooSlow: 0 });

  const resetCounters = useCallback(() => {
    tooFastCounter.current = 0;
    tooSlowCounter.current = 0;
    onTargetCounter.current = 0;
  }, []);

  useEffect(() => {
    if (!isActive || isPaused || !isGPSGood || !settings.enabled || !settings.paceAlerts) {
      resetCounters();
      return;
    }

    // Do not alert in first 30s or before 0.05 miles
    if (elapsedSeconds < 30 || totalDistance < 0.05) return;

    const interval = window.setInterval(() => {
      const paceSec = paceToSeconds(currentPace);
      const targetMinSec = paceToSeconds(targetPaceMin || '');
      const targetMaxSec = paceToSeconds(targetPaceMax || '');

      if (paceSec === 0 || (!targetMinSec && !targetMaxSec)) return;

      if (targetMinSec && isPaceTooFast(paceSec, targetMinSec)) {
        tooFastCounter.current += 1;
        tooSlowCounter.current = 0;
        onTargetCounter.current = 0;
        
        if (tooFastCounter.current >= 25) {
          const msg = runType.includes('Zone 2') 
            ? "Slow down. Keep this easy Zone 2 effort."
            : "Slow down. You are running too fast.";
          speak(msg, settings);
          tooFastCounter.current = 0;
          alertCount.current.tooFast += 1;
        }
      } else if (targetMaxSec && isPaceTooSlow(paceSec, targetMaxSec)) {
        tooSlowCounter.current += 1;
        tooFastCounter.current = 0;
        onTargetCounter.current = 0;

        if (tooSlowCounter.current >= 25) {
          speak("Pick it up slightly. You are below target pace.", settings);
          tooSlowCounter.current = 0;
          alertCount.current.tooSlow += 1;
        }
      } else {
        // On target
        onTargetCounter.current += 1;
        
        // If we were too fast or too slow before
        if (onTargetCounter.current >= 15 && (tooFastCounter.current > 0 || tooSlowCounter.current > 0)) {
           speak("Good pace. Stay here.", settings);
           resetCounters();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPaused, isGPSGood, currentPace, targetPaceMin, targetPaceMax, settings, runType, resetCounters, totalDistance, elapsedSeconds]);

  return {
    alertCounts: alertCount.current
  };
};
