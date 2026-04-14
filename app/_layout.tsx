import { ClerkProvider } from "@clerk/clerk-expo";
import { Stack } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Text, View } from "react-native";

import { ClerkIdentityBridge } from "@/src/components/ClerkIdentityBridge";
import { AppProviders } from "@/src/providers/AppProviders";
import { tokenCache } from "@/src/services/clerk-token-cache";

import "../global.css";

WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0B0F14] px-6">
        <Text className="text-center text-base text-white">
          Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env
        </Text>
      </View>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <AppProviders>
        <ClerkIdentityBridge />
        <Stack screenOptions={{ headerShown: false }} />
      </AppProviders>
    </ClerkProvider>
  );
}
