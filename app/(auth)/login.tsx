import { useOAuth } from "@clerk/clerk-expo";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

import { useAppTheme } from "@/src/store/ui-store";

export default function LoginScreen() {
  const { theme } = useAppTheme();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const { createdSessionId, setActive } = await startOAuthFlow();

      if (!createdSessionId || !setActive) {
        setError("Google sign in was cancelled.");
        return;
      }

      await setActive({ session: createdSessionId });
      router.replace("/(app)/(tabs)/home");
    } catch {
      setError("Google sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = () => {
    setError(null);
    setMessage("Use Google sign in to continue.");
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 20,
        }}
      >
        <View
          className="mx-auto w-full max-w-[430px] rounded-2xl border p-5"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          <View className="items-center">
            <View
              className="h-11 w-11 items-center justify-center rounded-2xl"
              style={{ backgroundColor: theme.surfaceMuted }}
            >
              <Ionicons name="fitness" size={18} color={theme.accent} />
            </View>
            <Text
              className="mt-4 text-[30px] font-bold"
              style={{ color: theme.text }}
            >
              Sign In
            </Text>
            <Text
              className="mt-1 text-center text-xs"
              style={{ color: theme.textMuted }}
            >
              Enter your email and password to continue.
            </Text>
          </View>

          <View className="mt-5 gap-3">
            <View
              className="rounded-2xl border px-3 py-0.5"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <View className="flex-row items-center gap-2">
                <Ionicons name="mail" size={14} color={theme.textMuted} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="E-mail"
                  placeholderTextColor={theme.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="flex-1 text-sm"
                  style={{ color: theme.text }}
                />
              </View>
            </View>

            <View
              className="rounded-2xl border px-3 py-0.5"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name="lock-closed"
                  size={14}
                  color={theme.textMuted}
                />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor={theme.textMuted}
                  secureTextEntry
                  className="flex-1 text-sm"
                  style={{ color: theme.text }}
                />
              </View>
            </View>
          </View>

          <Pressable className="mt-3 self-center" onPress={() => undefined}>
            <Text
              className="text-xs font-semibold"
              style={{ color: theme.textMuted }}
            >
              Forgot password?
            </Text>
          </Pressable>

          <Pressable
            onPress={handleEmailLogin}
            className="mt-4 rounded-2xl py-3"
            style={{ backgroundColor: theme.accent }}
          >
            <Text
              className="text-center font-semibold"
              style={{ color: theme.background }}
            >
              Continue
            </Text>
          </Pressable>

          <View className="my-4 flex-row items-center gap-3">
            <View
              className="h-px flex-1"
              style={{ backgroundColor: theme.border }}
            />
            <Text className="text-xs" style={{ color: theme.textMuted }}>
              Social Login
            </Text>
            <View
              className="h-px flex-1"
              style={{ backgroundColor: theme.border }}
            />
          </View>

          <Pressable
            onPress={() => void handleGoogleLogin()}
            className="flex-row items-center justify-center gap-2 rounded-2xl border py-3"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surfaceMuted,
              opacity: loading ? 0.7 : 1,
            }}
            disabled={loading}
          >
            <AntDesign name="google" size={16} color={theme.text} />
            <Text className="font-semibold" style={{ color: theme.text }}>
              {loading ? "Signing in..." : "Sign in with Google"}
            </Text>
          </Pressable>

          <View className="mt-5 flex-row items-center justify-center">
            <Text className="text-sm" style={{ color: theme.textMuted }}>
              Don&apos;t have an account?
            </Text>
            <Pressable onPress={() => router.push("/(auth)/signup")}>
              <Text
                className="text-xs font-bold"
                style={{ color: theme.accent }}
              >
                Create account
              </Text>
            </Pressable>
          </View>

          {loading ? (
            <View className="mt-3 flex-row items-center justify-center gap-2">
              <ActivityIndicator color={theme.accent} />
              <Text className="text-xs" style={{ color: theme.textMuted }}>
                Connecting...
              </Text>
            </View>
          ) : null}

          {message ? (
            <Text
              className="mt-4 text-center text-xs"
              style={{ color: theme.textMuted }}
            >
              {message}
            </Text>
          ) : null}

          {error ? (
            <Text
              className="mt-4 text-center text-xs"
              style={{ color: theme.accent }}
            >
              {error}
            </Text>
          ) : null}

          <Text
            className="mt-5 text-center text-[11px]"
            style={{ color: theme.textMuted }}
          >
            By clicking "Continue", you agree to the Terms and Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
