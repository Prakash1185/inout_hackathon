import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useMemo } from "react";
import { Alert, ScrollView, Text, View } from "react-native";

import { NeonButton } from "@/src/components/NeonButton";
import { Screen } from "@/src/components/Screen";
import { StatCard } from "@/src/components/StatCard";
import { createActivity } from "@/src/services/activity.service";
import { getActiveEvent } from "@/src/services/event.service";
import { useActivityStore } from "@/src/store/activity-store";
import { useAuthStore } from "@/src/store/auth-store";
import { useAppTheme } from "@/src/store/ui-store";
import { approximatePolygonAreaSqMeters } from "@/src/utils/geo";

function estimateXp(distanceKm: number, areaSqMeters: number): number {
  return Math.round(distanceKm * 35 + (areaSqMeters / 100) * 6);
}

export default function ActivityResultScreen() {
  const { theme } = useAppTheme();
  const queryClient = useQueryClient();
  const coordinates = useActivityStore((state) => state.coordinates);
  const distanceKm = useActivityStore((state) => state.distanceKm);
  const resetDraft = useActivityStore((state) => state.resetDraft);
  const setUser = useAuthStore((state) => state.setUser);
  const authUser = useAuthStore((state) => state.user);

  const eventQuery = useQuery({
    queryKey: ["active-event"],
    queryFn: getActiveEvent,
  });

  const areaCaptured = useMemo(
    () => approximatePolygonAreaSqMeters(coordinates),
    [coordinates],
  );
  const xpEarned = useMemo(
    () => estimateXp(distanceKm, areaCaptured),
    [areaCaptured, distanceKm],
  );

  const saveMutation = useMutation({
    mutationFn: createActivity,
    onSuccess: async (result) => {
      if (authUser) {
        setUser({
          ...authUser,
          xp: result.user.xp,
          level: result.user.level,
          streak: result.user.streak,
          badges: result.user.badges,
        });
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["my-activities"] }),
        queryClient.invalidateQueries({ queryKey: ["profile"] }),
        queryClient.invalidateQueries({ queryKey: ["leaderboard"] }),
      ]);

      resetDraft();
      router.replace("/(app)/(tabs)/leaderboard");
    },
    onError: () => {
      Alert.alert("Save failed", "Could not save activity. Please try again.");
    },
  });

  if (coordinates.length < 2) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-lg" style={{ color: theme.text }}>
            No tracked activity found.
          </Text>
          <View className="mt-4">
            <NeonButton
              label="Back to Home"
              onPress={() => router.replace("/(app)/(tabs)/home")}
            />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
      >
        <Text className="text-3xl font-bold" style={{ color: theme.text }}>
          Activity Result
        </Text>
        <Text className="mt-1 text-sm" style={{ color: theme.textMuted }}>
          Your run has been analyzed. Save it to compete.
        </Text>

        <View className="mt-5 flex-row gap-3">
          <StatCard
            label="Distance"
            value={`${distanceKm.toFixed(2)} km`}
            accent="green"
          />
          <StatCard
            label="Area"
            value={`${areaCaptured.toFixed(0)} m2`}
            accent="orange"
          />
        </View>

        <View className="mt-3 flex-row gap-3">
          <StatCard label="XP Earned" value={`${xpEarned}`} accent="green" />
          <StatCard
            label="Event"
            value={eventQuery.data?.name?.split(" ")[0] ?? "Active"}
            accent="orange"
          />
        </View>

        <View className="mt-8 gap-3">
          <NeonButton
            label={saveMutation.isPending ? "Saving..." : "Save Activity"}
            onPress={() =>
              saveMutation.mutate({
                coordinates,
                eventId: eventQuery.data?.id,
              })
            }
            disabled={saveMutation.isPending}
            variant="primary"
          />
          <NeonButton
            label="Discard"
            onPress={() => {
              resetDraft();
              router.replace("/(app)/(tabs)/home");
            }}
            variant="secondary"
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
