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
  updateRunShoe: (runId: string, shoeId: string | undefined) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  setActivePlan: (id: string | null) => void;
  setActiveWorkout: (id: string | null) => void;
  selectPlan: (plan: TrainingPlan) => void;
  updateWorkoutStatus: (planId: string, workoutId: string, status: 'completed' | 'skipped' | 'rescheduled' | 'pending', runId?: string) => void;
  addShoe: (shoe: Shoe) => void;
  updateShoe: (id: string, updates: Partial<Shoe>) => void;
  deleteShoe: (id: string) => void;
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

      addRun: (run) => set((state) => {
        let updatedShoes = [...state.shoes];
        let runWithAppliedMileage = { ...run };

        if (run.shoeId && !run.gearMileageApplied) {
          updatedShoes = state.shoes.map(s => 
            s.id === run.shoeId ? { ...s, currentMileage: s.currentMileage + run.distance, updatedAt: new Date().toISOString() } : s
          );
          runWithAppliedMileage.gearMileageApplied = true;
          const shoe = state.shoes.find(s => s.id === run.shoeId);
          if (shoe) runWithAppliedMileage.shoeName = shoe.nickname || `${shoe.brand} ${shoe.model}`;
        }

        return { 
          runs: [runWithAppliedMileage, ...state.runs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
          shoes: updatedShoes
        };
      }),
      
      deleteRun: (id) => set((state) => {
        const runToDelete = state.runs.find(r => r.id === id);
        let updatedShoes = [...state.shoes];

        if (runToDelete && runToDelete.shoeId && runToDelete.gearMileageApplied) {
          updatedShoes = state.shoes.map(s => 
            s.id === runToDelete.shoeId ? { ...s, currentMileage: Math.max(0, s.currentMileage - runToDelete.distance), updatedAt: new Date().toISOString() } : s
          );
        }

        return { 
          runs: state.runs.filter((r) => r.id !== id),
          shoes: updatedShoes
        };
      }),

      updateRunShoe: (runId, newShoeId) => set((state) => {
        const run = state.runs.find(r => r.id === runId);
        if (!run) return state;

        let updatedShoes = [...state.shoes];
        
        // Subtract from old shoe if mileage was applied
        if (run.shoeId && run.gearMileageApplied) {
          updatedShoes = updatedShoes.map(s => 
            s.id === run.shoeId ? { ...s, currentMileage: Math.max(0, s.currentMileage - run.distance), updatedAt: new Date().toISOString() } : s
          );
        }

        // Add to new shoe
        let newShoeName = undefined;
        if (newShoeId) {
          updatedShoes = updatedShoes.map(s => 
            s.id === newShoeId ? { ...s, currentMileage: s.currentMileage + run.distance, updatedAt: new Date().toISOString() } : s
          );
          const shoe = state.shoes.find(s => s.id === newShoeId);
          if (shoe) newShoeName = shoe.nickname || `${shoe.brand} ${shoe.model}`;
        }

        return {
          runs: state.runs.map(r => r.id === runId ? { 
            ...r, 
            shoeId: newShoeId, 
            shoeName: newShoeName, 
            gearMileageApplied: !!newShoeId 
          } : r),
          shoes: updatedShoes
        };
      }),
      
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

      addShoe: (shoe) => set((state) => ({ 
        shoes: [...state.shoes, { ...shoe, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }] 
      })),

      updateShoe: (id, updates) => set((state) => ({
        shoes: state.shoes.map(s => s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s)
      })),

      deleteShoe: (id) => set((state) => ({
        shoes: state.shoes.filter(s => s.id !== id),
        runs: state.runs.map(r => r.id === id ? { ...r, shoeId: undefined, shoeName: undefined, gearMileageApplied: false } : r)
      })),

      resetToSampleData: () => set({ 
        runs: sampleRuns, 
        plans: samplePlans, 
        activePlanId: 'plan-5k-beginner', 
        activeWorkoutId: null, 
        shoes: [] 
      }),
    }),
    {
      name: 'zonecoach-storage',
    }
  )
);
