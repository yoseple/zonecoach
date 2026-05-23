import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Run, UserProfile, TrainingPlan, Shoe } from '../types';
import { sampleRuns, samplePlans } from '../data/sampleData';

interface RunState {
  runs: Run[];
  shoes: Shoe[];
  userProfile: UserProfile;
  activePlanId: string | null;
  activeWorkoutId: string | null;
  plans: TrainingPlan[];
  
  // Actions
  addRun: (run: Run) => void;
  deleteRun: (id: string) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  setActivePlan: (id: string | null) => void;
  setActiveWorkout: (id: string | null) => void;
  selectPlan: (plan: TrainingPlan) => void;
  updateWorkoutStatus: (planId: string, workoutId: string, status: 'completed' | 'skipped' | 'rescheduled' | 'pending', runId?: string) => void;
  addShoe: (shoe: Shoe) => void;
  updateShoeMileage: (shoeId: string, miles: number) => void;
  resetToSampleData: () => void;
}

export const useRunStore = create<RunState>()(
  persist(
    (set) => ({
      runs: sampleRuns,
      shoes: [],
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
      activeWorkoutId: null,
      plans: samplePlans,

      addRun: (run) => set((state) => ({ 
        runs: [run, ...state.runs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        shoes: run.shoeId ? state.shoes.map(s => s.id === run.shoeId ? { ...s, currentMileage: s.currentMileage + run.distance } : s) : state.shoes
      })),
      
      deleteRun: (id) => set((state) => ({ 
        runs: state.runs.filter((r) => r.id !== id) 
      })),
      
      updateUserProfile: (profile) => set((state) => ({ 
        userProfile: { ...state.userProfile, ...profile } 
      })),
      
      setActivePlan: (id) => set({ activePlanId: id }),
      
      setActiveWorkout: (id) => set({ activeWorkoutId: id }),
      
      selectPlan: (plan) => set((state) => ({
        plans: state.plans.some(p => p.id === plan.id) ? state.plans : [...state.plans, plan],
        activePlanId: plan.id
      })),
      
      updateWorkoutStatus: (planId, workoutId, status, runId) => set((state) => ({
        plans: state.plans.map((p) => {
          if (p.id !== planId) return p;
          return {
            ...p,
            workouts: p.workouts.map((w) => {
              if (w.id !== workoutId) return w;
              return { ...w, status, completedRunId: runId };
            })
          };
        })
      })),

      addShoe: (shoe) => set((state) => ({ shoes: [...state.shoes, shoe] })),

      updateShoeMileage: (shoeId, miles) => set((state) => ({
        shoes: state.shoes.map(s => s.id === shoeId ? { ...s, currentMileage: s.currentMileage + miles } : s)
      })),

      resetToSampleData: () => set({ runs: sampleRuns, plans: samplePlans, activePlanId: 'plan-5k-beginner', activeWorkoutId: null, shoes: [] }),
    }),
    {
      name: 'zonecoach-storage',
    }
  )
);
