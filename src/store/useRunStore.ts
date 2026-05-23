import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Run, UserProfile, TrainingPlan } from '../types';
import { sampleRuns, samplePlans } from '../data/sampleData';

interface RunState {
  runs: Run[];
  userProfile: UserProfile;
  activePlanId: string | null;
  plans: TrainingPlan[];
  
  // Actions
  addRun: (run: Run) => void;
  deleteRun: (id: string) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  setActivePlan: (id: string | null) => void;
  selectPlan: (plan: TrainingPlan) => void;
  updateWorkoutStatus: (planId: string, workoutId: string, status: 'completed' | 'skipped' | 'rescheduled' | 'pending') => void;
  resetToSampleData: () => void;
}

export const useRunStore = create<RunState>()(
  persist(
    (set) => ({
      runs: sampleRuns,
      userProfile: {
        name: 'Runner',
        zoneSettings: {
          age: 30,
          restingHeartRate: 60,
          maxHeartRate: 190,
          method: 'simple'
        }
      },
      activePlanId: 'plan-5k-beginner',
      plans: samplePlans,

      addRun: (run) => set((state) => ({ 
        runs: [run, ...state.runs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) 
      })),
      
      deleteRun: (id) => set((state) => ({ 
        runs: state.runs.filter((r) => r.id !== id) 
      })),
      
      updateUserProfile: (profile) => set((state) => ({ 
        userProfile: { ...state.userProfile, ...profile } 
      })),
      
      setActivePlan: (id) => set({ activePlanId: id }),
      
      selectPlan: (plan) => set((state) => ({
        plans: state.plans.some(p => p.id === plan.id) ? state.plans : [...state.plans, plan],
        activePlanId: plan.id
      })),
      
      updateWorkoutStatus: (planId, workoutId, status) => set((state) => ({
        plans: state.plans.map((p) => {
          if (p.id !== planId) return p;
          return {
            ...p,
            workouts: p.workouts.map((w) => {
              if (w.id !== workoutId) return w;
              return { ...w, status };
            })
          };
        })
      })),

      resetToSampleData: () => set({ runs: sampleRuns, plans: samplePlans, activePlanId: 'plan-5k-beginner' }),
    }),
    {
      name: 'zonecoach-storage',
    }
  )
);
