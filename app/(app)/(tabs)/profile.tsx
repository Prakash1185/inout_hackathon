import { useClerk } from "@clerk/clerk-expo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { Screen } from "@/src/components/Screen";
import { getMyProfile, updateProfile } from "@/src/services/user.service";
import { useAuthStore } from "@/src/store/auth-store";

export default function ProfileScreen() {
  const { signOut } = useClerk();
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
        <Text className="text-3xl font-bold text-white">Profile</Text>

        <View className="mt-5 rounded-2xl border border-[#1f2a33] bg-[#10161a] p-4">
          <Text className="text-sm text-[#8a9aa8]">Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            className="mt-2 rounded-xl border border-[#26313a] bg-[#161d22] px-3 py-2 text-white"
            placeholder="Your name"
            placeholderTextColor="#64748b"
          />

          <Pressable
            className="mt-3 rounded-lg bg-[#193f2d] py-2"
            onPress={() => updateMutation.mutate({ name })}
          >
            <Text className="text-center font-medium text-[#d8ffe9]">
              Update Profile
            </Text>
          </Pressable>
        </View>

        <View className="mt-5 rounded-2xl border border-[#1f2a33] bg-[#10161a] p-4">
          <Text className="text-base text-white">{profile?.name}</Text>
          <Text className="mt-1 text-sm text-[#8fa0b0]">{profile?.email}</Text>
          <Text className="mt-4 text-sm text-[#8fa0b0]">
            XP: {profile?.xp ?? 0}
          </Text>
          <Text className="mt-1 text-sm text-[#8fa0b0]">
            Level: {profile?.level ?? 1}
          </Text>
          <Text className="mt-1 text-sm text-[#8fa0b0]">
            Streak: {profile?.streak ?? 0} days
          </Text>
          <Text className="mt-3 text-sm font-semibold text-[#38ff9c]">
            Badges
          </Text>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {(profile?.badges ?? []).map((badge) => (
              <View key={badge} className="rounded-full bg-[#1c3328] px-3 py-1">
                <Text className="text-xs text-[#b7ffd9]">{badge}</Text>
              </View>
            ))}
          </View>
        </View>

        <Pressable
          className="mt-6 rounded-lg border border-[#4f2a2a] py-3"
          onPress={async () => {
            await signOut();
            clearIdentity();
            queryClient.clear();
          }}
        >
          <Text className="text-center font-semibold text-[#ff9a9a]">
            Logout
          </Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}
