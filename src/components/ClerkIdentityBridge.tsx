import { useUser } from "@clerk/clerk-expo";
import { useEffect, useRef } from "react";

import { getMyProfile } from "@/src/services/user.service";
import { useAuthStore } from "@/src/store/auth-store";

export function ClerkIdentityBridge() {
  const { user, isLoaded } = useUser();
  const setIdentity = useAuthStore((state) => state.setIdentity);
  const clearIdentity = useAuthStore((state) => state.clearIdentity);
  const setUser = useAuthStore((state) => state.setUser);
  const setBootstrapping = useAuthStore((state) => state.setBootstrapping);
  const setHasBootstrapped = useAuthStore((state) => state.setHasBootstrapped);
  const syncedUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!user) {
      syncedUserRef.current = null;
      clearIdentity();
      return;
    }

    const email =
      user.primaryEmailAddress?.emailAddress ??
      user.emailAddresses[0]?.emailAddress ??
      `${user.id}@auth.local`;

    setIdentity({
      clerkUserId: user.id,
      email,
      name: user.fullName ?? user.firstName ?? "TerraRunner",
    });

    if (
      syncedUserRef.current === user.id &&
      useAuthStore.getState().hasBootstrapped
    ) {
      return;
    }

    syncedUserRef.current = user.id;
    setBootstrapping(true);
    setHasBootstrapped(false);

    let cancelled = false;

    (async () => {
      try {
        const profile = await getMyProfile();
        if (!cancelled) {
          setUser(profile);
        }
      } finally {
        if (!cancelled) {
          setBootstrapping(false);
          setHasBootstrapped(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    clearIdentity,
    isLoaded,
    setBootstrapping,
    setHasBootstrapped,
    setIdentity,
    setUser,
    user,
  ]);

  return null;
}
