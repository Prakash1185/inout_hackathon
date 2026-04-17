import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { UserProfile } from "@/shared/types";

interface IdentityState {
  clerkUserId: string;
  email: string;
  name: string;
}

interface AuthState {
  identity: IdentityState | null;
  user: UserProfile | null;
  isBootstrapping: boolean;
  hasBootstrapped: boolean;
  setIdentity: (identity: IdentityState) => void;
  clearIdentity: () => void;
  setUser: (user: UserProfile) => void;
  setBootstrapping: (value: boolean) => void;
  setHasBootstrapped: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      identity: null,
      user: null,
      isBootstrapping: false,
      hasBootstrapped: false,
      setIdentity: (identity) => set({ identity }),
      clearIdentity: () =>
        set({
          identity: null,
          user: null,
          isBootstrapping: false,
          hasBootstrapped: false,
        }),
      setUser: (user) => set({ user }),
      setBootstrapping: (value) => set({ isBootstrapping: value }),
      setHasBootstrapped: (value) => set({ hasBootstrapped: value }),
    }),
    {
      name: "velora-auth-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ identity: state.identity, user: state.user }),
    },
  ),
);
