import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";

import { Screen } from "@/src/components/Screen";
import { getActiveEvent } from "@/src/services/event.service";
import {
    getEventLeaderboard,
    getGlobalLeaderboard,
} from "@/src/services/leaderboard.service";

export default function LeaderboardScreen() {
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
        <Text className="text-3xl font-bold text-white">Leaderboard</Text>
        <Text className="mt-1 text-sm text-[#8fa0b0]">
          Track event and global rankings in real time.
        </Text>

        <View className="mt-5 rounded-2xl border border-[#1f2a33] bg-[#10161a] p-4">
          <Text className="text-lg font-semibold text-[#38ff9c]">
            Event Rankings
          </Text>
          <Text className="text-xs text-[#8fa0b0]">
            {eventQuery.data?.name ?? "Active event"}
          </Text>

          <View className="mt-4 gap-2">
            {hasEventData ? (
              eventRankings.slice(0, 10).map((entry) => (
                <View
                  key={`${entry.userId}-${entry.rank}`}
                  className="flex-row items-center justify-between rounded-lg bg-[#151d23] px-3 py-2"
                >
                  <Text className="w-8 text-[#ff8a33]">#{entry.rank}</Text>
                  <Text className="flex-1 text-white">{entry.name}</Text>
                  <Text className="font-semibold text-[#38ff9c]">
                    {entry.totalXp ?? 0} XP
                  </Text>
                </View>
              ))
            ) : (
              <Text className="text-[#9aacbb]">
                No activity yet for this event.
              </Text>
            )}
          </View>
        </View>

        <View className="mt-5 rounded-2xl border border-[#1f2a33] bg-[#10161a] p-4">
          <Text className="text-lg font-semibold text-[#ff8a33]">
            Global Rankings
          </Text>
          <View className="mt-4 gap-2">
            {globalRankings.slice(0, 10).map((entry) => (
              <View
                key={`${entry.userId}-${entry.rank}`}
                className="flex-row items-center justify-between rounded-lg bg-[#151d23] px-3 py-2"
              >
                <Text className="w-8 text-[#ff8a33]">#{entry.rank}</Text>
                <Text className="flex-1 text-white">{entry.name}</Text>
                <Text className="font-semibold text-[#38ff9c]">
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
