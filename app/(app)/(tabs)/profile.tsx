import { useClerk } from "@clerk/clerk-expo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { NeonButton } from "@/src/components/NeonButton";
import { Screen } from "@/src/components/Screen";
import { getMyProfile, updateProfile } from "@/src/services/user.service";
import { useAuthStore } from "@/src/store/auth-store";
import { useAppTheme } from "@/src/store/ui-store";

export default function ProfileScreen() {
  const { signOut } = useClerk();
  const { mode, theme, toggleTheme } = useAppTheme();
  const queryClient = useQueryClient();
  const authUser = useAuthStore((state) => state.user);
  const clearIdentity = useAuthStore((state) => state.clearIdentity);
  const setUser = useAuthStore((state) => state.setUser);

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: getMyProfile,
    initialData: authUser ?? undefined,
  });

  const [name, setName] = useState(profileQuery.data?.name ?? "");

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updated) => {
      setUser({ ...(authUser ?? updated), ...updated });
      queryClient.setQueryData(["profile"], updated);
    },
  });

  const profile = profileQuery.data;

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
      >
        <Text className="text-3xl font-bold" style={{ color: theme.text }}>
          Profile
        </Text>

        <View className="mt-4">
          <NeonButton
            label={mode === "dark" ? "Switch to Light" : "Switch to Dark"}
            onPress={toggleTheme}
            variant="secondary"
          />
        </View>

        <View
          className="mt-5 rounded-2xl border p-4"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          <Text className="text-sm" style={{ color: theme.textMuted }}>
            Name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            className="mt-2 rounded-xl border px-3 py-2"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surfaceMuted,
              color: theme.text,
            }}
            placeholder="Your name"
            placeholderTextColor={theme.textMuted}
          />

          <View className="mt-3">
            <NeonButton
              label="Update Profile"
              onPress={() => updateMutation.mutate({ name })}
              variant="primary"
            />
          </View>
        </View>

        <View
          className="mt-5 rounded-2xl border p-4"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          <Text className="text-base" style={{ color: theme.text }}>
            {profile?.name}
          </Text>
          <Text className="mt-1 text-sm" style={{ color: theme.textMuted }}>
            {profile?.email}
          </Text>
          <Text className="mt-4 text-sm" style={{ color: theme.textMuted }}>
            XP: {profile?.xp ?? 0}
          </Text>
          <Text className="mt-1 text-sm" style={{ color: theme.textMuted }}>
            Level: {profile?.level ?? 1}
          </Text>
          <Text className="mt-1 text-sm" style={{ color: theme.textMuted }}>
            Streak: {profile?.streak ?? 0} days
          </Text>
          <Text
            className="mt-3 text-sm font-semibold"
            style={{ color: theme.accent }}
          >
            Badges
          </Text>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {(profile?.badges ?? []).map((badge) => (
              <View
                key={badge}
                className="rounded-full px-3 py-1"
                style={{ backgroundColor: theme.accentSoft }}
              >
                <Text className="text-xs" style={{ color: theme.text }}>
                  {badge}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <Pressable
          className="mt-6 rounded-lg border py-3"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
          onPress={async () => {
            await signOut();
            clearIdentity();
            queryClient.clear();
          }}
        >
          <Text
            className="text-center font-semibold"
            style={{ color: theme.accent }}
          >
            Logout
          </Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}
