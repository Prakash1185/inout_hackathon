import { ClerkProvider } from "@clerk/clerk-expo";
import { Stack } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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
          Missing authentication publishable key in .env
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <AppProviders>
          <ClerkIdentityBridge />
          <Stack screenOptions={{ headerShown: false }} />
        </AppProviders>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}
