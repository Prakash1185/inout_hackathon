import { useOAuth } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { NeonButton } from "@/src/components/NeonButton";
import { useAppTheme } from "@/src/store/ui-store";

export default function LoginScreen() {
  const { theme } = useAppTheme();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"idle" | "auth" | "redirect">("idle");

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    setPhase("auth");

    try {
      const { createdSessionId, setActive } = await startOAuthFlow();

      if (!createdSessionId || !setActive) {
        setError("Google login was cancelled.");
        return;
      }

      await setActive({ session: createdSessionId });
      setPhase("redirect");
      router.replace("/(app)/(tabs)/home");
    } catch {
      setError("Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
      setPhase("idle");
    }
  };

  return (
    <View
      className="flex-1 justify-center px-6"
      style={{ backgroundColor: theme.background }}
    >
      <Text
        className="text-4xl font-extrabold tracking-tight"
        style={{ color: theme.text }}
      >
        Terranova
      </Text>
      <Text className="mt-2 text-base" style={{ color: theme.textMuted }}>
        Minimal running game for modern city captures.
      </Text>

      <View
        className="mt-10 rounded-2xl border p-5"
        style={{ borderColor: theme.border, backgroundColor: theme.surface }}
      >
        <Text
          className="text-sm uppercase tracking-[2px]"
          style={{ color: theme.accent }}
        >
          Google Login Only
        </Text>
        <Text className="mt-2 text-sm" style={{ color: theme.textMuted }}>
          Continue with Google secure sign-in.
        </Text>

        <View className="mt-5">
          <NeonButton
            label={loading ? "Signing in..." : "Continue with Google"}
            onPress={() => void handleGoogleLogin()}
            disabled={loading}
            variant="primary"
          />
        </View>

        {loading ? (
          <View className="mt-4 flex-row items-center gap-2">
            <ActivityIndicator color={theme.accent} />
            <Text className="text-xs" style={{ color: theme.textMuted }}>
              {phase === "redirect"
                ? "Preparing your home map..."
                : "Connecting..."}
            </Text>
          </View>
        ) : null}
      </View>

      {error ? (
        <Text className="mt-4 text-sm" style={{ color: theme.accent }}>
          {error}
        </Text>
      ) : null}

      <Text className="mt-6 text-center" style={{ color: theme.textMuted }}>
        Need signup route?{" "}
        <Link
          href="/(auth)/signup"
          style={{ fontWeight: "700", color: theme.accent }}
        >
          Open signup
        </Link>
      </Text>
    </View>
  );
}
