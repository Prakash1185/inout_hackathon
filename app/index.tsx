import { Redirect } from "expo-router";
import { View } from "react-native";

import { useAuthStore } from "@/src/store/auth-store";

export default function Index() {
  const token = useAuthStore((state) => state.token);
  const hydrated = useAuthStore((state) => state.hydrated);

  if (!hydrated) {
    return <View className="flex-1 bg-[#050607]" />;
  }

  return <Redirect href={token ? "/(app)/(tabs)/home" : "/(auth)/login"} />;
}
