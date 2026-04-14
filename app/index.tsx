import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { View } from "react-native";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <View className="flex-1 bg-[#0B0F14]" />;
  }

  return (
    <Redirect href={isSignedIn ? "/(app)/(tabs)/home" : "/(auth)/login"} />
  );
}
