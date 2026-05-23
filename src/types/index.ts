export type RunType = 
  | 'Free Run' 
  | 'Zone 2 Run' 
  | 'Easy Run' 
  | 'Tempo Run' 
  | 'Interval Run' 
  | 'Long Run' 
  | 'Race Pace'
  | 'Recovery Run'
  | 'Easy Zone 2 Run'
  | 'Hill Repeats'
  | 'Strides';

export interface Split {
  mile: number;
  time: number; // in seconds
  heartRate?: number;
}

export interface RoutePoint {
  lat: number;
  lng: number;
  time?: string;
  accuracy?: number;
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

export interface Shoe {
  id: string;
  nickname: string;
  brand: string;
  model: string;
  acquiredDate: string;
  startingMileage: number;
  currentMileage: number;
  retirementMileage: number;
  isRetired: boolean;
  color: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
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
  hrSamples?: HRSample[];
  shoeId?: string;
  shoeName?: string;
  gearMileageApplied?: boolean;
  source?: 'Manual' | 'Phone GPS' | 'Apple Watch';
  accuracyMetadata?: {
    avgAccuracy: number;
    bestAccuracy: number;
    worstAccuracy: number;
    acceptedPoints: number;
    rejectedPoints: number;
  };
  // Training Metadata
  trainingWorkoutId?: string;
  trainingPlanId?: string;
  plannedWorkoutName?: string;
  plannedDistanceMiles?: number;
  plannedTargetZone?: number;
  completedTrainingTarget?: boolean;
  completionPercent?: number;
  insights?: TrainingInsight[];
  // Coaching Data
  targetPaceMinSeconds?: number;
  targetPaceMaxSeconds?: number;
  voiceCoachingEnabled?: boolean;
  tooFastAlertCount?: number;
  tooSlowAlertCount?: number;
  mileAnnouncementCount?: number;
  trainingGoalAnnouncementCount?: number;
  coachingSummary?: string;
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
  planId: string;
  week: number;
  day: string; // 'Monday', etc.
  type: RunType | 'Rest Day' | 'Strength Day' | 'Mobility Day';
  targetDistance?: number;
  targetDuration?: number;
  targetZone?: number;
  targetPaceMin?: string;
  targetPaceMax?: string;
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
  startedAt?: string;
}

export interface PersonalRecord {
  id: string;
  label: string;
  value: string | number;
  date: string;
  runId?: string;
}

export interface CoachingSettings {
  enabled: boolean;
  paceAlerts: boolean;
  mileAnnouncements: boolean;
  goalAnnouncements: boolean;
  voiceRate: number;
  voicePitch: number;
  cooldownSeconds: number;
  keepScreenAwake: boolean;
}
