import { useMutation } from "@tanstack/react-query";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";

import { signUp } from "@/src/services/auth.service";
import { useAuthStore } from "@/src/store/auth-store";

export default function SignUpScreen() {
  const setSession = useAuthStore((state) => state.setSession);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: signUp,
    onSuccess: (data) => {
      setSession(data.token, data.user);
      router.replace("/(app)/(tabs)/home");
    },
    onError: () => {
      setError("Unable to create account. Try a different email.");
    },
  });

  return (
    <View className="flex-1 justify-center bg-[#050607] px-6">
      <Text className="text-3xl font-bold tracking-tight text-white">
        Create Account
      </Text>
      <Text className="mt-2 text-[#8da0b2]">
        Start your daily streak and capture your city.
      </Text>

      <View className="mt-8 gap-3">
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Name"
          placeholderTextColor="#64748b"
          className="rounded-xl border border-[#25303a] bg-[#12171b] px-4 py-3 text-white"
        />
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#64748b"
          keyboardType="email-address"
          autoCapitalize="none"
          className="rounded-xl border border-[#25303a] bg-[#12171b] px-4 py-3 text-white"
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#64748b"
          secureTextEntry
          className="rounded-xl border border-[#25303a] bg-[#12171b] px-4 py-3 text-white"
        />
      </View>

      {error ? (
        <Text className="mt-3 text-sm text-[#ff8a33]">{error}</Text>
      ) : null}

      <Pressable
        className="mt-6 items-center rounded-xl bg-[#1c3f2e] py-3"
        onPress={() => mutation.mutate({ name, email, password })}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <ActivityIndicator color="#38ff9c" />
        ) : (
          <Text className="font-semibold text-[#d9ffe9]">Create account</Text>
        )}
      </Pressable>

      <Text className="mt-6 text-center text-[#90a1b0]">
        Already a user?{" "}
        <Link href="/(auth)/login" className="font-semibold text-[#38ff9c]">
          Login
        </Link>
      </Text>
    </View>
  );
}
