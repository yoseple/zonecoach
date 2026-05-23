import type { GPSPoint } from './gps';
import { calculateDistance, metersToMiles } from './gps';

export const secondsToPace = (seconds: number, miles: number): string => {
  if (miles <= 0) return '--:--';
  const paceSeconds = Math.round(seconds / miles);
  const m = Math.floor(paceSeconds / 60);
  const s = paceSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const paceToSeconds = (paceStr: string): number => {
  if (paceStr === '--:--' || !paceStr) return 0;
  const [m, s] = paceStr.split(':').map(Number);
  return m * 60 + s;
};

export const formatPace = (paceStr: string): string => paceStr;

export const calculateAveragePace = (seconds: number, miles: number): string => {
  return secondsToPace(seconds, miles);
};

export const calculateRollingPace = (points: GPSPoint[], windowSeconds: number = 20): string => {
  if (points.length < 2) return '--:--';
  
  const now = points[points.length - 1].timestamp;
  const windowStart = now - (windowSeconds * 1000);
  
  const windowPoints = points.filter(p => p.timestamp >= windowStart);
  
  if (windowPoints.length < 2) return '--:--';
  
  let totalMeters = 0;
  for (let i = 1; i < windowPoints.length; i++) {
    totalMeters += calculateDistance(windowPoints[i-1], windowPoints[i]);
  }
  
  const totalMiles = metersToMiles(totalMeters);
  const totalSeconds = (windowPoints[windowPoints.length - 1].timestamp - windowPoints[0].timestamp) / 1000;
  
  if (totalMiles < 0.005) return '--:--'; // Too small to be accurate
  
  return secondsToPace(totalSeconds, totalMiles);
};

export const isPaceTooFast = (currentPaceSeconds: number, targetPaceMinSeconds: number): boolean => {
  if (targetPaceMinSeconds <= 0) return false;
  return currentPaceSeconds < targetPaceMinSeconds;
};

export const isPaceTooSlow = (currentPaceSeconds: number, targetPaceMaxSeconds: number): boolean => {
  if (targetPaceMaxSeconds <= 0) return false;
  return currentPaceSeconds > targetPaceMaxSeconds;
};
