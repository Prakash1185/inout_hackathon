import { Stack, router, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

import { AppProviders } from "@/src/providers/AppProviders";
import { useAuthStore } from "@/src/store/auth-store";

import "../global.css";

function AuthGate() {
  const token = useAuthStore((state) => state.token);
  const hydrated = useAuthStore((state) => state.hydrated);
  const segments = useSegments();

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";

    if (!token && !inAuthGroup) {
      router.replace("/(auth)/login");
      return;
    }

    if (token && inAuthGroup) {
      router.replace("/(app)/(tabs)/home");
    }
  }, [hydrated, segments, token]);

  if (!hydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-[#050607]">
        <ActivityIndicator color="#38ff9c" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <AppProviders>
      <AuthGate />
    </AppProviders>
  );
}
