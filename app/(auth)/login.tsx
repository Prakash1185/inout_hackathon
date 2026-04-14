import { useOAuth } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { NeonButton } from "@/src/components/NeonButton";

export default function LoginScreen() {
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      const { createdSessionId, setActive } = await startOAuthFlow();

      if (!createdSessionId || !setActive) {
        setError("Google login was cancelled.");
        return;
      }

      await setActive({ session: createdSessionId });
      router.replace("/(app)/(tabs)/home");
    } catch {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center bg-[#0B0F14] px-6">
      <Text className="text-4xl font-extrabold tracking-tight text-white">
        BitBox
      </Text>
      <Text className="mt-2 text-base text-[#9CA3AF]">
        Capture streets. Earn XP. Dominate the leaderboard.
      </Text>

      <View className="mt-10 rounded-2xl border border-[#1F2937] bg-[#121821] p-5">
        <Text className="text-sm uppercase tracking-[2px] text-[#38B6FF]">
          Google Login Only
        </Text>
        <Text className="mt-2 text-sm text-[#9CA3AF]">
          Continue with Google using Clerk secure authentication.
        </Text>

        <View className="mt-5">
          <NeonButton
            label={loading ? "Connecting..." : "Continue with Google"}
            onPress={() => void handleGoogleLogin()}
            disabled={loading}
            variant="primary"
          />
        </View>

        {loading ? (
          <ActivityIndicator color="#00FF9D" className="mt-4" />
        ) : null}
      </View>

      {error ? (
        <Text className="mt-4 text-sm text-[#FF7A00]">{error}</Text>
      ) : null}

      <Text className="mt-6 text-center text-[#90a1b0]">
        Need signup route?{" "}
        <Link href="/(auth)/signup" className="font-semibold text-[#00FF9D]">
          Open signup
        </Link>
      </Text>
    </View>
  );
}
