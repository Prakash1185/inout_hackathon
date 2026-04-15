import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";

import { useAppTheme } from "@/src/store/ui-store";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const { theme } = useAppTheme();

  if (!isLoaded) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: theme.background }}
      >
        <ActivityIndicator color={theme.accent} />
        <Text className="mt-3 text-xs" style={{ color: theme.textMuted }}>
          Loading app...
        </Text>
      </View>
    );
  }

  return (
    <Redirect href={isSignedIn ? "/(app)/(tabs)/home" : "/(auth)/login"} />
  );
}
