import { useAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { useAppTheme } from "@/src/store/ui-store";

export default function NotFound() {
  const { isLoaded, isSignedIn } = useAuth();
  const { theme } = useAppTheme();
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || redirectedRef.current) {
      return;
    }

    redirectedRef.current = true;

    const nextRoute = isSignedIn ? "/(app)/(tabs)/home" : "/(auth)/login";
    router.replace(nextRoute);
  }, [isLoaded, isSignedIn]);

  return (
    <View
      className="flex-1 items-center justify-center px-6"
      style={{ backgroundColor: theme.background }}
    >
      <ActivityIndicator color={theme.accent} />
      <Text
        className="mt-3 text-sm font-semibold"
        style={{ color: theme.text }}
      >
        Loading your app...
      </Text>
      <Text
        className="mt-1 text-xs text-center"
        style={{ color: theme.textMuted }}
      >
        Getting everything ready. Please wait.
      </Text>
    </View>
  );
}
