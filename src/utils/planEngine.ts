import type { TrainingPlan, Workout } from '../types';
import { v4 as uuidv4 } from 'uuid';

export type PlanGoal = 
  | 'beginner-5k' 
  | 'faster-5k' 
  | '10k' 
  | 'half-marathon' 
  | 'marathon' 
  | 'zone2-base' 
  | 'faster-mile'
  | 'weight-loss'
  | 'return-to-running';

export const generatePlan = (goal: PlanGoal): TrainingPlan => {
  const workouts: Workout[] = [];
  let durationWeeks = 8;
  let title = '';
  let goalDesc = '';
  let difficulty: TrainingPlan['difficulty'] = 'Beginner';

  switch (goal) {
    case 'beginner-5k':
      title = 'Beginner 5K Foundation';
      goalDesc = 'Safely build your endurance to complete 3.1 miles without stopping.';
      durationWeeks = 8;
      difficulty = 'Beginner';
      for (let w = 1; w <= durationWeeks; w++) {
        const isRecoveryWeek = w === 4;
        const volume = isRecoveryWeek ? 0.8 : 1 + (w * 0.1);
        
        workouts.push(createWorkout(w, 'Monday', 'Rest Day', 'Total recovery.'));
        workouts.push(createWorkout(w, 'Tuesday', 'Easy Zone 2 Run', 'Conversational pace. Keep HR low.', 1.5 * volume, 2));
        workouts.push(createWorkout(w, 'Wednesday', 'Mobility Day', 'Focus on hips and ankles.'));
        workouts.push(createWorkout(w, 'Thursday', 'Easy Zone 2 Run', 'Stay light and bouncy.', 1.5 * volume, 2));
        workouts.push(createWorkout(w, 'Friday', 'Strength Day', 'Core and glute activation.'));
        workouts.push(createWorkout(w, 'Saturday', 'Long Run', 'Build your aerobic base.', (2 + w * 0.25) * volume, 2));
        workouts.push(createWorkout(w, 'Sunday', 'Rest Day', 'Prepare for the new week.'));
      }
      break;

    case 'zone2-base':
      title = 'Aerobic Engine (Zone 2)';
      goalDesc = '12 weeks of strict aerobic base building to maximize fat oxidation.';
      durationWeeks = 12;
      difficulty = 'Intermediate';
      for (let w = 1; w <= durationWeeks; w++) {
        const isRecoveryWeek = w % 4 === 0;
        const multiplier = isRecoveryWeek ? 0.7 : 1 + (w * 0.05);
        
        workouts.push(createWorkout(w, 'Monday', 'Easy Zone 2 Run', 'Pure aerobic effort.', 4 * multiplier, 2));
        workouts.push(createWorkout(w, 'Tuesday', 'Easy Zone 2 Run', 'Consistency over intensity.', 4 * multiplier, 2));
        workouts.push(createWorkout(w, 'Wednesday', 'Recovery Run', 'Very slow, movement only.', 3 * multiplier, 1));
        workouts.push(createWorkout(w, 'Thursday', 'Easy Zone 2 Run', 'Strict HR discipline.', 5 * multiplier, 2));
        workouts.push(createWorkout(w, 'Friday', 'Strength Day', 'Heavy lower body focus.'));
        workouts.push(createWorkout(w, 'Saturday', 'Long Run', 'The weekly peak.', (8 + w * 0.5) * multiplier, 2));
        workouts.push(createWorkout(w, 'Sunday', 'Mobility Day', 'Full body reset.'));
      }
      break;

    case 'marathon':
      title = 'Marathon Mastery';
      goalDesc = 'A rigorous 16-week cycle for a successful 26.2 mile finish.';
      durationWeeks = 16;
      difficulty = 'Advanced';
      for (let w = 1; w <= durationWeeks; w++) {
        const isRecoveryWeek = w % 4 === 0;
        const phase = w <= 4 ? 'Base' : w <= 12 ? 'Build' : 'Peak/Taper';
        const mult = isRecoveryWeek ? 0.75 : 1;

        workouts.push(createWorkout(w, 'Monday', 'Rest Day', 'Essential recovery.'));
        workouts.push(createWorkout(w, 'Tuesday', 'Easy Zone 2 Run', 'Base building miles.', 6 * mult, 2));
        workouts.push(createWorkout(w, 'Wednesday', phase === 'Build' ? 'Tempo Run' : 'Easy Run', 'Specific marathon intensity.', 8 * mult));
        workouts.push(createWorkout(w, 'Thursday', 'Easy Zone 2 Run', 'Active recovery.', 5 * mult, 2));
        workouts.push(createWorkout(w, 'Friday', 'Strength Day', 'Compound movements.'));
        workouts.push(createWorkout(w, 'Saturday', 'Long Run', 'Progression to 20 miles.', (12 + w * 0.6) * mult, 2));
        workouts.push(createWorkout(w, 'Sunday', 'Recovery Run', 'Flush the lactic acid.', 3 * mult, 1));
      }
      break;

    case 'faster-5k':
      title = '5K Speed Development';
      goalDesc = 'Intervals and threshold work to crush your 5K personal best.';
      durationWeeks = 8;
      difficulty = 'Intermediate';
      for (let w = 1; w <= durationWeeks; w++) {
        workouts.push(createWorkout(w, 'Monday', 'Interval Run', '400m repeats at goal pace.', 4));
        workouts.push(createWorkout(w, 'Tuesday', 'Easy Zone 2 Run', 'Aerobic maintenance.', 4, 2));
        workouts.push(createWorkout(w, 'Wednesday', 'Strength Day', 'Explosive power focus.'));
        workouts.push(createWorkout(w, 'Thursday', 'Tempo Run', '20-min threshold effort.', 5));
        workouts.push(createWorkout(w, 'Friday', 'Rest Day', 'Total rest.'));
        workouts.push(createWorkout(w, 'Saturday', 'Long Run', 'Aerobic strength.', 7 + (w * 0.5), 2));
        workouts.push(createWorkout(w, 'Sunday', 'Recovery Run', 'Leg shakeout.', 3, 1));
      }
      break;
      
    case 'weight-loss':
      title = 'Metabolic Reset';
      goalDesc = 'Maximize calorie burn through consistent low-intensity movement.';
      durationWeeks = 10;
      difficulty = 'Beginner';
      for (let w = 1; w <= durationWeeks; w++) {
        workouts.push(createWorkout(w, 'Monday', 'Easy Zone 2 Run', 'Fat oxidation focus.', 2 + w * 0.1, 2));
        workouts.push(createWorkout(w, 'Tuesday', 'Strength Day', 'High rep bodyweight.'));
        workouts.push(createWorkout(w, 'Wednesday', 'Easy Zone 2 Run', 'Consistency session.', 2.5, 2));
        workouts.push(createWorkout(w, 'Thursday', 'Mobility Day', 'Keep joints healthy.'));
        workouts.push(createWorkout(w, 'Friday', 'Easy Zone 2 Run', 'Easy aerobic effort.', 2, 2));
        workouts.push(createWorkout(w, 'Saturday', 'Long Run', 'Weekly peak burn.', 4 + w * 0.2, 2));
        workouts.push(createWorkout(w, 'Sunday', 'Rest Day', 'Recover and reset.'));
      }
      break;

    default:
      title = goal.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
      goalDesc = `Comprehensive roadmap to achieve your ${title} target.`;
      durationWeeks = 10;
      difficulty = 'Intermediate';
      for (let w = 1; w <= durationWeeks; w++) {
        workouts.push(createWorkout(w, 'Monday', 'Easy Zone 2 Run', 'Foundation miles.', 3 + w*0.1, 2));
        workouts.push(createWorkout(w, 'Wednesday', 'Tempo Run', 'Intensity session.', 4 + w*0.1));
        workouts.push(createWorkout(w, 'Saturday', 'Long Run', 'Building distance.', 5 + w*0.5, 2));
      }
  }

  return {
    id: `plan-${goal}-${uuidv4().slice(0, 8)}`,
    title,
    goal: goalDesc,
    durationWeeks,
    runsPerWeek: Math.round(workouts.filter(w => !['Rest Day', 'Strength Day', 'Mobility Day'].includes(w.type)).length / durationWeeks),
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
