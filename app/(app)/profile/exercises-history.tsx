import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Screen } from "@/src/components/Screen";
import { getUserActivities } from "@/src/services/activity.service";
import { useAppTheme } from "@/src/store/ui-store";

function formatActivityTimeLabel(raw: string) {
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return "Recently";
  }

  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ExercisesHistoryScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const historyQuery = useQuery({
    queryKey: ["my-activities"],
    queryFn: getUserActivities,
  });

  const activities = historyQuery.data ?? [];

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        <View className="flex-row items-center gap-3">
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-2xl border"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={18} color={theme.text} />
          </Pressable>

          <Text
            className="text-2xl font-semibold"
            style={{ color: theme.text }}
          >
            Walk Activity History
          </Text>
        </View>

        <Text className="mt-2 text-sm" style={{ color: theme.textMuted }}>
          All logged walking sessions with distance, area capture, and XP.
        </Text>

        {historyQuery.isLoading ? (
          <View
            className="mt-5 rounded-2xl border p-4"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
          >
            <Text className="text-sm" style={{ color: theme.textMuted }}>
              Loading walking history...
            </Text>
          </View>
        ) : null}

        {!historyQuery.isLoading && activities.length === 0 ? (
          <View
            className="mt-5 rounded-2xl border p-4"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
          >
            <Text className="text-sm" style={{ color: theme.textMuted }}>
              No walk activity yet. Start a track from Activity screen.
            </Text>
          </View>
        ) : null}

        {!historyQuery.isLoading ? (
          <View className="mt-5 gap-3">
            {activities.map((item) => (
              <View
                key={item.id}
                className="rounded-3xl border p-3"
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.surface,
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View
                    className="h-12 w-12 items-center justify-center rounded-2xl border"
                    style={{
                      borderColor: theme.border,
                      backgroundColor: theme.surfaceMuted,
                    }}
                  >
                    <Ionicons
                      name="walk-outline"
                      size={20}
                      color={theme.textMuted}
                    />
                  </View>

                  <View className="ml-3 flex-1">
                    <Text
                      className="text-base font-semibold"
                      style={{ color: theme.text }}
                    >
                      {item.distance.toFixed(2)} km walk
                    </Text>
                    <Text
                      className="mt-1 text-sm"
                      style={{ color: theme.textMuted }}
                    >
                      Captured area: {item.areaCaptured.toFixed(0)} m2
                    </Text>
                    <Text
                      className="text-sm"
                      style={{ color: theme.textMuted }}
                    >
                      Event: {item.eventId}
                    </Text>
                    <Text
                      className="mt-1 text-xs"
                      style={{ color: theme.textMuted }}
                    >
                      {formatActivityTimeLabel(item.createdAt)}
                    </Text>
                  </View>

                  <Text
                    className="text-sm font-semibold"
                    style={{ color: theme.accent }}
                  >
                    +{item.xpEarned}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
