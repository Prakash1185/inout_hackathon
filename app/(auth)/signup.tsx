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

import { NeonButton } from "@/src/components/NeonButton";
import { useAppTheme } from "@/src/store/ui-store";

export default function SignUpScreen() {
  const { theme } = useAppTheme();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleGoogleSignUp = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const { createdSessionId, setActive } = await startOAuthFlow();

      if (!createdSessionId || !setActive) {
        setError("Google sign up was cancelled.");
        return;
      }

      await setActive({ session: createdSessionId });
      router.replace("/(app)/welcome");
    } catch {
      setError("Google sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = () => {
    setError(null);
    setMessage("Use Google sign up to continue.");
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
              <Ionicons name="person-add" size={18} color={theme.accent} />
            </View>
            <Text
              className="mt-4 text-[30px] font-bold"
              style={{ color: theme.text }}
            >
              Create Account
            </Text>
            <Text
              className="mt-1 text-center text-xs"
              style={{ color: theme.textMuted }}
            >
              Fill your details to create your account.
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
                <Ionicons name="person" size={14} color={theme.textMuted} />
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Full name"
                  placeholderTextColor={theme.textMuted}
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
                <Ionicons name="mail" size={14} color={theme.textMuted} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="E-mail"
                  placeholderTextColor={theme.textMuted}
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
                  secureTextEntry
                  placeholder="Password"
                  placeholderTextColor={theme.textMuted}
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
                  name="shield-checkmark"
                  size={14}
                  color={theme.textMuted}
                />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholder="Confirm password"
                  placeholderTextColor={theme.textMuted}
                  className="flex-1 text-sm"
                  style={{ color: theme.text }}
                />
              </View>
            </View>
          </View>

          <View className="mt-4">
            <NeonButton label="Create account" onPress={handleEmailSignUp} />
          </View>

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

          <NeonButton
            label={loading ? "Creating account..." : "Sign up with Google"}
            onPress={() => void handleGoogleSignUp()}
            disabled={loading}
            variant="secondary"
            icon={<AntDesign name="google" size={16} color={theme.text} />}
          />

          <View className="mt-5 flex-row items-center justify-center">
            <Text className="text-sm" style={{ color: theme.textMuted }}>
              Already have an account?
            </Text>
            <Pressable onPress={() => router.push("/(auth)/login")}>
              <Text
                className="text-xs font-bold"
                style={{ color: theme.accent }}
              >
                Sign in
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
            By creating an account, you agree to the Terms and Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
