import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useAuthStore } from "@/src/store/auth-store";

export default function ProtectedLayout() {
  const token = useAuthStore((state) => state.token);
  const hydrated = useAuthStore((state) => state.hydrated);

  if (!hydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-[#050607]">
        <ActivityIndicator color="#38ff9c" />
      </View>
    );
  }

  if (!token) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="activity/index" />
      <Stack.Screen name="activity/result" />
    </Stack>
  );
}
