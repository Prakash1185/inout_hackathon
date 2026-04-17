import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type OnboardingGender =
  | "Male"
  | "Female"
  | "Non-binary"
  | "Prefer not to say";

export interface OnboardingProfile {
  name: string;
  age: number;
  gender: OnboardingGender;
  heightCm: number;
  weightKg: number;
  goal: string;
}

interface OnboardingStoreState {
  profile: OnboardingProfile | null;
  setProfile: (profile: OnboardingProfile) => void;
  clearProfile: () => void;
}

export const useOnboardingStore = create<OnboardingStoreState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: "velora-onboarding-profile",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ profile: state.profile }),
    },
  ),
);
