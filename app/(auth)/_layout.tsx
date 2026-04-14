import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0B0F14]">
        <ActivityIndicator color="#38ff9c" />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/(app)/(tabs)/home" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
