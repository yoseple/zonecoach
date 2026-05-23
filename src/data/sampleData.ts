import type { Run, TrainingPlan } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const sampleRuns: Run[] = [
  {
    id: uuidv4(),
    date: '2026-05-20',
    title: 'Morning Zone 2',
    type: 'Zone 2 Run',
    distance: 3.1,
    duration: 1860, // 31 mins
    avgHeartRate: 142,
    maxHeartRate: 150,
    calories: 350,
    notes: 'Felt good, very disciplined.',
    splits: [
      { mile: 1, time: 600, heartRate: 140 },
      { mile: 2, time: 610, heartRate: 143 },
      { mile: 3, time: 605, heartRate: 142 },
      { mile: 3.1, time: 45, heartRate: 145 },
    ],
  },
  {
    id: uuidv4(),
    date: '2026-05-18',
    title: 'Long Trail Run',
    type: 'Long Run',
    distance: 8.5,
    duration: 5100, // 1h 25m
    avgHeartRate: 155,
    maxHeartRate: 172,
    calories: 950,
    notes: 'Beautiful weather. Heart rate spiked on the hills.',
    splits: [
      { mile: 1, time: 580, heartRate: 145 },
      { mile: 2, time: 590, heartRate: 148 },
      { mile: 3, time: 600, heartRate: 152 },
      { mile: 4, time: 610, heartRate: 155 },
      { mile: 5, time: 620, heartRate: 160 },
      { mile: 6, time: 605, heartRate: 165 },
      { mile: 7, time: 595, heartRate: 158 },
      { mile: 8, time: 590, heartRate: 155 },
      { mile: 8.5, time: 310, heartRate: 160 },
    ],
  },
  {
    id: uuidv4(),
    date: '2026-05-15',
    title: 'Tempo Session',
    type: 'Tempo Run',
    distance: 4.0,
    duration: 1920, // 32 mins
    avgHeartRate: 168,
    maxHeartRate: 182,
    calories: 500,
    notes: 'Pushed the pace. Hard but rewarding.',
    splits: [
      { mile: 1, time: 500, heartRate: 160 },
      { mile: 2, time: 470, heartRate: 172 },
      { mile: 3, time: 470, heartRate: 175 },
      { mile: 4, time: 480, heartRate: 170 },
    ],
  },
];

export const samplePlans: TrainingPlan[] = [
  {
    id: 'plan-5k-beginner',
    title: 'Beginner 5K',
    goal: 'Complete your first 5K without walking.',
    durationWeeks: 8,
    runsPerWeek: 3,
    difficulty: 'Beginner',
    workouts: [
      { id: 'w1', week: 1, day: 'Monday', type: 'Recovery Run', targetDistance: 1.5, notes: 'Easy pace.', status: 'completed' },
      { id: 'w2', week: 1, day: 'Wednesday', type: 'Zone 2 Run', targetDistance: 2.0, notes: 'Stay in Zone 2.', status: 'pending' },
      { id: 'w3', week: 1, day: 'Saturday', type: 'Long Run', targetDistance: 3.0, notes: 'Consistency is key.', status: 'pending' },
    ],
  },
];
