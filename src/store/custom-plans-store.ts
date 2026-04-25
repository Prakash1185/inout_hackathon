import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { GeneratedExercise } from "@/src/constants/ai-trainer";

export interface CustomPlan {
  id: string;
  name: string;
  exercises: GeneratedExercise[];
  createdAt: number;
}

interface CustomPlansState {
  plans: CustomPlan[];
  addPlan: (name: string, exercises: GeneratedExercise[]) => void;
  removePlan: (id: string) => void;
  updatePlan: (id: string, exercises: GeneratedExercise[]) => void;
}

export const useCustomPlansStore = create<CustomPlansState>()(
  persist(
    (set) => ({
      plans: [],
      addPlan: (name, exercises) =>
        set((state) => ({
          plans: [
            ...state.plans,
            {
              id: `custom-plan-${Date.now()}`,
              name,
              exercises,
              createdAt: Date.now(),
            },
          ],
        })),
      removePlan: (id) =>
        set((state) => ({
          plans: state.plans.filter((p) => p.id !== id),
        })),
      updatePlan: (id, exercises) =>
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === id ? { ...p, exercises } : p
          ),
        })),
    }),
    {
      name: "velora-custom-plans",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
