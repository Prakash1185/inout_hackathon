import { Link, Redirect } from "expo-router";
import { Text, View } from "react-native";

export default function SignUpScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-[#0B0F14] px-6">
      <Text className="text-center text-base text-[#9CA3AF]">
        Signup is handled via Google on the login screen.
      </Text>
      <Text className="mt-3 text-center text-sm text-[#38B6FF]">
        <Link href="/(auth)/login">Go to login</Link>
      </Text>
      <Redirect href="/(auth)/login" />
    </View>
  );
}
