import { useUser } from "@clerk/clerk-expo";
import { useEffect } from "react";

import { useAuthStore } from "@/src/store/auth-store";

export function ClerkIdentityBridge() {
  const { user, isLoaded } = useUser();
  const setIdentity = useAuthStore((state) => state.setIdentity);
  const clearIdentity = useAuthStore((state) => state.clearIdentity);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!user) {
      clearIdentity();
      return;
    }

    const email =
      user.primaryEmailAddress?.emailAddress ??
      user.emailAddresses[0]?.emailAddress ??
      `${user.id}@clerk.local`;

    setIdentity({
      clerkUserId: user.id,
      email,
      name: user.fullName ?? user.firstName ?? "BitBox Athlete",
    });
  }, [clearIdentity, isLoaded, setIdentity, user]);

  return null;
}
