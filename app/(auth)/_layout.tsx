import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useAppTheme } from "@/src/store/ui-store";

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { theme } = useAppTheme();

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

  if (isSignedIn) {
    return <Redirect href="/(app)/welcome" />;
  }

  return (
    <Stack
      screenOptions={{ headerShown: false, animation: "fade_from_bottom" }}
    />
  );
}
