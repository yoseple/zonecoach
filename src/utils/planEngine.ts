import type { TrainingPlan, Workout } from '../types';
import { v4 as uuidv4 } from 'uuid';

export type PlanGoal = 
  | 'beginner-5k' 
  | 'faster-5k' 
  | '10k' 
  | 'half-marathon' 
  | 'marathon' 
  | 'zone2-base' 
  | 'faster-mile';

export const generatePlan = (goal: PlanGoal): TrainingPlan => {
  const workouts: Workout[] = [];
  let durationWeeks = 8;
  let title = '';
  let goalDesc = '';
  let difficulty: TrainingPlan['difficulty'] = 'Beginner';

  switch (goal) {
    case 'beginner-5k':
      title = 'Beginner 5K';
      goalDesc = 'Complete your first 5K with consistent running.';
      durationWeeks = 8;
      difficulty = 'Beginner';
      for (let w = 1; w <= durationWeeks; w++) {
        const baseDist = 1.5 + (w * 0.2);
        workouts.push(createWorkout(w, 'Monday', 'Rest Day', 'Rest and recover.'));
        workouts.push(createWorkout(w, 'Tuesday', 'Easy Run', 'Conversational pace.', baseDist));
        workouts.push(createWorkout(w, 'Wednesday', 'Strength Day', 'Bodyweight exercises.'));
        workouts.push(createWorkout(w, 'Thursday', 'Easy Run', 'Stay light on your feet.', baseDist));
        workouts.push(createWorkout(w, 'Friday', 'Rest Day', 'Rest and recover.'));
        workouts.push(createWorkout(w, 'Saturday', 'Long Run', 'Build endurance.', baseDist + 1));
        workouts.push(createWorkout(w, 'Sunday', 'Rest Day', 'Prepare for next week.'));
      }
      break;

    case 'zone2-base':
      title = 'Zone 2 Base Building';
      goalDesc = 'Optimize your aerobic system and fat oxidation.';
      durationWeeks = 12;
      difficulty = 'Intermediate';
      for (let w = 1; w <= durationWeeks; w++) {
        const volume = 20 + (w * 2);
        workouts.push(createWorkout(w, 'Monday', 'Zone 2 Run', 'Pure aerobic effort.', volume * 0.2, 2));
        workouts.push(createWorkout(w, 'Tuesday', 'Zone 2 Run', 'Focus on breathing.', volume * 0.15, 2));
        workouts.push(createWorkout(w, 'Wednesday', 'Recovery Run', 'Very easy.', volume * 0.1, 1));
        workouts.push(createWorkout(w, 'Thursday', 'Zone 2 Run', 'Discipline is key.', volume * 0.2, 2));
        workouts.push(createWorkout(w, 'Friday', 'Rest Day', 'Total rest.'));
        workouts.push(createWorkout(w, 'Saturday', 'Long Run', 'Peak weekly volume.', volume * 0.35, 2));
        workouts.push(createWorkout(w, 'Sunday', 'Strength Day', 'Core and stability.'));
      }
      break;

    case 'marathon':
      title = 'Marathon Mastery';
      goalDesc = 'Prepare for the full 26.2 mile distance.';
      durationWeeks = 16;
      difficulty = 'Advanced';
      for (let w = 1; w <= durationWeeks; w++) {
        workouts.push(createWorkout(w, 'Monday', 'Rest Day', 'Recovery.'));
        workouts.push(createWorkout(w, 'Tuesday', 'Easy Run', 'Base miles.', 6 + (w * 0.2)));
        workouts.push(createWorkout(w, 'Wednesday', 'Tempo Run', 'Marathon pace effort.', 8 + (w * 0.3)));
        workouts.push(createWorkout(w, 'Thursday', 'Easy Run', 'Active recovery.', 5));
        workouts.push(createWorkout(w, 'Friday', 'Strength Day', 'Heavy lifting or legs.'));
        workouts.push(createWorkout(w, 'Saturday', 'Long Run', 'The big one.', 12 + (w * 1)));
        workouts.push(createWorkout(w, 'Sunday', 'Recovery Run', 'Flush the legs.', 3));
      }
      break;

    case 'faster-5k':
      title = 'Faster 5K';
      goalDesc = 'Slash your personal record and increase speed.';
      durationWeeks = 8;
      difficulty = 'Intermediate';
      for (let w = 1; w <= durationWeeks; w++) {
        workouts.push(createWorkout(w, 'Monday', 'Interval Run', '400m repeats at goal pace.', 4));
        workouts.push(createWorkout(w, 'Tuesday', 'Zone 2 Run', 'Aerobic maintenance.', 4, 2));
        workouts.push(createWorkout(w, 'Wednesday', 'Strength Day', 'Power and explosiveness.'));
        workouts.push(createWorkout(w, 'Thursday', 'Tempo Run', 'Threshold effort.', 5));
        workouts.push(createWorkout(w, 'Friday', 'Rest Day', 'Recovery.'));
        workouts.push(createWorkout(w, 'Saturday', 'Long Run', 'Strength building.', 7 + (w * 0.5)));
        workouts.push(createWorkout(w, 'Sunday', 'Easy Run', 'Light recovery.', 3));
      }
      break;

    // Defaulting to simple 5K for others for now to keep code concise
    default:
      title = goal.replace('-', ' ').toUpperCase();
      goalDesc = `A structured plan to reach your ${title} goal.`;
      durationWeeks = 10;
      difficulty = 'Intermediate';
      for (let w = 1; w <= durationWeeks; w++) {
        workouts.push(createWorkout(w, 'Monday', 'Easy Run', 'Building miles.', 3 + w*0.1));
        workouts.push(createWorkout(w, 'Wednesday', 'Tempo Run', 'Faster pace.', 4));
        workouts.push(createWorkout(w, 'Saturday', 'Long Run', 'Weekly peak.', 5 + w*0.5));
      }
  }

  return {
    id: `plan-${goal}-${uuidv4().slice(0, 8)}`,
    title,
    goal: goalDesc,
    durationWeeks,
    runsPerWeek: workouts.filter(w => w.type !== 'Rest Day' && w.type !== 'Strength Day').length / durationWeeks,
    difficulty,
    workouts
  };
};

const createWorkout = (
  week: number, 
  day: string, 
  type: Workout['type'], 
  notes: string, 
  dist?: number, 
  zone?: number
): Workout => ({
  id: uuidv4(),
  week,
  day,
  type,
  targetDistance: dist ? Math.round(dist * 10) / 10 : undefined,
  targetZone: zone,
  notes,
  status: 'pending'
});
