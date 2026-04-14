import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { themes, type ThemeMode } from "@/src/constants/theme";

interface UiState {
  themeMode: ThemeMode;
  hasSeenOnboarding: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  completeOnboarding: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      themeMode: "dark",
      hasSeenOnboarding: false,
      setThemeMode: (mode) => set({ themeMode: mode }),
      toggleTheme: () => {
        const nextMode = get().themeMode === "dark" ? "light" : "dark";
        set({ themeMode: nextMode });
      },
      completeOnboarding: () => set({ hasSeenOnboarding: true }),
    }),
    {
      name: "terranova-ui-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        themeMode: state.themeMode,
        hasSeenOnboarding: state.hasSeenOnboarding,
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
