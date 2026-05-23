import type { Split } from '../types';
import { secondsToPace } from './pace';

export const interpolateSplitTime = (
  prevDist: number,
  currDist: number,
  prevTime: number,
  currTime: number,
  targetMile: number
): number => {
  const fraction = (targetMile - prevDist) / (currDist - prevDist);
  return prevTime + fraction * (currTime - prevTime);
};

export interface LiveSplit extends Split {
  startTime: number;
  endTime: number;
  pace: string;
  cumulativeDistance: number;
  cumulativeTime: number;
}

export const createLiveSplit = (
  mile: number,
  startTime: number,
  endTime: number,
  cumulativeDistance: number,
  cumulativeTime: number
): LiveSplit => {
  const duration = endTime - startTime;
  return {
    mile,
    time: duration,
    startTime,
    endTime,
    pace: secondsToPace(duration, 1),
    cumulativeDistance,
    cumulativeTime
  };
};
