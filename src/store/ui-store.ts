import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { themes, type ThemeMode } from "@/src/constants/theme";

interface UiState {
  themeMode: ThemeMode;
  hasSeenOnboarding: boolean;
  seenOnboardingUserIds: string[];
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  completeOnboarding: () => void;
  completeOnboardingForUser: (userId: string) => void;
  hasCompletedOnboardingForUser: (userId: string) => boolean;
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      themeMode: "dark",
      hasSeenOnboarding: false,
      seenOnboardingUserIds: [],
      setThemeMode: (mode) => set({ themeMode: mode }),
      toggleTheme: () => {
        const nextMode = get().themeMode === "dark" ? "light" : "dark";
        set({ themeMode: nextMode });
      },
      completeOnboarding: () => set({ hasSeenOnboarding: true }),
      completeOnboardingForUser: (userId) =>
        set((state) => {
          if (!userId.trim()) {
            return { hasSeenOnboarding: true };
          }

          if (state.seenOnboardingUserIds.includes(userId)) {
            return { hasSeenOnboarding: true };
          }

          return {
            hasSeenOnboarding: true,
            seenOnboardingUserIds: [...state.seenOnboardingUserIds, userId],
          };
        }),
      hasCompletedOnboardingForUser: (userId) =>
        get().seenOnboardingUserIds.includes(userId),
    }),
    {
      name: "velora-ui-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        themeMode: state.themeMode,
        hasSeenOnboarding: state.hasSeenOnboarding,
        seenOnboardingUserIds: state.seenOnboardingUserIds,
      }),
    },
  ),
);

export function useAppTheme() {
  const mode = useUiStore((state) => state.themeMode);
  const toggleTheme = useUiStore((state) => state.toggleTheme);

  return {
    mode,
    theme: themes[mode],
    toggleTheme,
  };
}
