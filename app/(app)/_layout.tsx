import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack, useSegments } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";

import { useAuthStore } from "@/src/store/auth-store";
import { useAppTheme, useUiStore } from "@/src/store/ui-store";

export default function ProtectedLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { theme } = useAppTheme();
  const segments = useSegments();
  const hasSeenOnboarding = useUiStore((state) => state.hasSeenOnboarding);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);
  const hasBootstrapped = useAuthStore((state) => state.hasBootstrapped);

  if (!isLoaded) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: theme.background }}
      >
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  if (isBootstrapping || !hasBootstrapped) {
    return (
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: theme.background }}
      >
        <ActivityIndicator color={theme.accent} />
        <Text className="mt-3 text-sm" style={{ color: theme.textMuted }}>
          Preparing your territory map...
        </Text>
      </View>
    );
  }

  const inWelcomeScreen = segments.includes("welcome");
  if (!hasSeenOnboarding && !inWelcomeScreen) {
    return <Redirect href="/(app)/welcome" />;
  }

  return (
    <Stack
      screenOptions={{ headerShown: false, animation: "fade_from_bottom" }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="activity/index" />
      <Stack.Screen name="activity/result" />
      <Stack.Screen name="events/[id]" />
      <Stack.Screen name="events/host" />
      <Stack.Screen name="profile/exercises-history" />
      <Stack.Screen name="profile/badges-earned" />
    </Stack>
  );
}
