export type RunType = 
  | 'Free Run' 
  | 'Zone 2 Run' 
  | 'Easy Run' 
  | 'Tempo Run' 
  | 'Interval Run' 
  | 'Long Run' 
  | 'Race Pace';

export interface Split {
  mile: number;
  time: number; // in seconds
  heartRate?: number;
}

export interface RoutePoint {
  lat: number;
  lng: number;
  time?: string;
}

export interface Run {
  id: string;
  date: string;
  title: string;
  type: RunType;
  distance: number; // in miles
  duration: number; // in seconds
  avgHeartRate: number;
  maxHeartRate: number;
  calories: number;
  notes: string;
  splits: Split[];
  routePoints?: RoutePoint[];
  // Tracking Metadata
  source?: 'Manual' | 'Phone GPS' | 'Apple Watch';
  accuracyMetadata?: {
    avgAccuracy: number;
    bestAccuracy: number;
    worstAccuracy: number;
    acceptedPoints: number;
    rejectedPoints: number;
  };
}

export interface ZoneSettings {
  age: number;
  restingHeartRate: number;
  maxHeartRate: number;
  method: 'simple' | 'manual';
  manualZones?: {
    z1: [number, number];
    z2: [number, number];
    z3: [number, number];
    z4: [number, number];
    z5: [number, number];
  };
}

export interface UserProfile {
  name: string;
  zoneSettings: ZoneSettings;
}

export interface Workout {
  id: string;
  week: number;
  day: string; // 'Monday', etc.
  type: RunType | 'Rest Day' | 'Strength Day' | 'Recovery Run' | 'Easy Zone 2 Run' | 'Mobility Day';
  targetDistance?: number;
  targetDuration?: number;
  targetZone?: number;
  notes: string;
  status: 'pending' | 'completed' | 'skipped' | 'rescheduled';
  completedRunId?: string; // Link to the actual run
}

export interface TrainingPlan {
  id: string;
  title: string;
  goal: string;
  durationWeeks: number;
  runsPerWeek: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  workouts: Workout[];
}

export interface PersonalRecord {
  id: string;
  label: string;
  value: string | number;
  date: string;
  runId?: string;
}
