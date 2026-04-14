import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";

import { Screen } from "@/src/components/Screen";
import { getActiveEvent } from "@/src/services/event.service";
import {
    getEventLeaderboard,
    getGlobalLeaderboard,
} from "@/src/services/leaderboard.service";
import { useAppTheme } from "@/src/store/ui-store";

export default function LeaderboardScreen() {
  const { theme } = useAppTheme();
  const eventQuery = useQuery({
    queryKey: ["active-event"],
    queryFn: getActiveEvent,
  });

  const globalQuery = useQuery({
    queryKey: ["leaderboard", "global"],
    queryFn: getGlobalLeaderboard,
  });

  const eventLeaderboardQuery = useQuery({
    queryKey: ["leaderboard", "event", eventQuery.data?.id],
    enabled: Boolean(eventQuery.data?.id),
    queryFn: () => getEventLeaderboard(eventQuery.data!.id),
  });

  const globalRankings = globalQuery.data?.rankings ?? [];
  const eventRankings = eventLeaderboardQuery.data?.rankings ?? [];

  const hasEventData = useMemo(
    () => eventRankings.length > 0,
    [eventRankings.length],
  );

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
      >
        <Text className="text-3xl font-bold" style={{ color: theme.text }}>
          Leaderboard
        </Text>
        <Text className="mt-1 text-sm" style={{ color: theme.textMuted }}>
          Track event and global rankings in real time.
        </Text>

        <View
          className="mt-5 rounded-2xl border p-4"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          <Text className="text-lg font-semibold" style={{ color: theme.text }}>
            Event Rankings
          </Text>
          <Text className="text-xs" style={{ color: theme.textMuted }}>
            {eventQuery.data?.name ?? "Active event"}
          </Text>

          <View className="mt-4 gap-2">
            {hasEventData ? (
              eventRankings.slice(0, 10).map((entry) => (
                <View
                  key={`${entry.userId}-${entry.rank}`}
                  className="flex-row items-center justify-between rounded-lg px-3 py-2"
                  style={{ backgroundColor: theme.surfaceMuted }}
                >
                  <Text className="w-8" style={{ color: theme.accent }}>
                    #{entry.rank}
                  </Text>
                  <Text className="flex-1" style={{ color: theme.text }}>
                    {entry.name}
                  </Text>
                  <Text
                    className="font-semibold"
                    style={{ color: theme.accent }}
                  >
                    {entry.totalXp ?? 0} XP
                  </Text>
                </View>
              ))
            ) : (
              <Text style={{ color: theme.textMuted }}>
                No activity yet for this event.
              </Text>
            )}
          </View>
        </View>

        <View
          className="mt-5 rounded-2xl border p-4"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          <Text className="text-lg font-semibold" style={{ color: theme.text }}>
            Global Rankings
          </Text>
          <View className="mt-4 gap-2">
            {globalRankings.slice(0, 10).map((entry) => (
              <View
                key={`${entry.userId}-${entry.rank}`}
                className="flex-row items-center justify-between rounded-lg px-3 py-2"
                style={{ backgroundColor: theme.surfaceMuted }}
              >
                <Text className="w-8" style={{ color: theme.accent }}>
                  #{entry.rank}
                </Text>
                <Text className="flex-1" style={{ color: theme.text }}>
                  {entry.name}
                </Text>
                <Text className="font-semibold" style={{ color: theme.accent }}>
                  {entry.xp ?? 0} XP
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
