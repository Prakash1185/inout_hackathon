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
  setIdentity: (identity: IdentityState) => void;
  clearIdentity: () => void;
  setUser: (user: UserProfile) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      identity: null,
      user: null,
      setIdentity: (identity) => set({ identity }),
      clearIdentity: () => set({ identity: null, user: null }),
      setUser: (user) => set({ user }),
    }),
    {
      name: "bitbox-auth-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ identity: state.identity, user: state.user }),
    },
  ),
);
