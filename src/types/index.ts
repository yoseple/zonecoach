import type { Run, RunType, Split, RoutePoint } from '../types';

export interface Shoe {
  id: string;
  name: string;
  brand: string;
  acquiredDate: string;
  startingMileage: number;
  currentMileage: number;
  retired: boolean;
  color: string;
}

export interface HRSample {
  timestamp: number;
  bpm: number;
}

export interface TrainingInsight {
  type: 'fatigue' | 'consistency' | 'improvement' | 'caution';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Run {
  id: string;
  date: string;
  title: string;
  type: RunType;
  distance: number;
  duration: number;
  avgHeartRate: number;
  maxHeartRate: number;
  calories: number;
  notes: string;
  splits: Split[];
  routePoints?: RoutePoint[];
  hrSamples?: HRSample[];
  shoeId?: string;
  source?: 'Manual' | 'Phone GPS' | 'Apple Watch';
  accuracyMetadata?: {
    avgAccuracy: number;
    bestAccuracy: number;
    worstAccuracy: number;
    acceptedPoints: number;
    rejectedPoints: number;
  };
  trainingWorkoutId?: string;
  trainingPlanId?: string;
  plannedWorkoutName?: string;
  plannedDistanceMiles?: number;
  plannedTargetZone?: number;
  completedTrainingTarget?: boolean;
  completionPercent?: number;
  insights?: TrainingInsight[];
}
