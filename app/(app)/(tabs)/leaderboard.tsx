import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    Easing,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";

import type { LeaderboardEntry } from "@/shared/types";
import { Screen } from "@/src/components/Screen";
import { getActiveEvent } from "@/src/services/event.service";
import {
    getEventLeaderboard,
    getGlobalLeaderboard,
} from "@/src/services/leaderboard.service";
import { useAuthStore } from "@/src/store/auth-store";
import { useAppTheme } from "@/src/store/ui-store";

type RankingScope = "local" | "global";

interface LeaderboardRow {
  rank: number;
  userId: string;
  name: string;
  areaM2: number;
  progress: number;
  isCurrentUser: boolean;
}

interface MockLeaderboardUser {
  rank: number;
  name: string;
  areaCovered: number;
}

const mockLeaderboardData: MockLeaderboardUser[] = [
  { rank: 1, name: "Aarav Sharma", areaCovered: 31.2 },
  { rank: 2, name: "Riya Verma", areaCovered: 29.4 },
  { rank: 3, name: "Kunal Mehta", areaCovered: 27.8 },
  { rank: 4, name: "Sneha Kapoor", areaCovered: 24.8 },
  { rank: 5, name: "You", areaCovered: 22.6 },
  { rank: 6, name: "Arjun Singh", areaCovered: 20.9 },
  { rank: 7, name: "Neha Joshi", areaCovered: 18.7 },
  { rank: 8, name: "Rahul Das", areaCovered: 16.4 },
  { rank: 9, name: "Priya Nair", areaCovered: 14.2 },
  { rank: 10, name: "Ananya Roy", areaCovered: 12.5 },
];

function toAreaM2(entry: LeaderboardEntry) {
  return Math.max(0, entry.totalAreaCaptured ?? 0);
}

function formatAreaKm2(areaM2: number) {
  const km2 = areaM2 / 1_000_000;
  return km2.toFixed(1);
}

function getInitial(name: string) {
  const first = name.trim().charAt(0);
  return first ? first.toUpperCase() : "?";
}

function buildRows(entries: LeaderboardEntry[], currentUserId?: string | null) {
  const sorted = [...entries].sort((a, b) => toAreaM2(b) - toAreaM2(a));
  const maxArea = Math.max(...sorted.map((item) => toAreaM2(item)), 1);

  return sorted.map((entry, index) => {
    const areaM2 = toAreaM2(entry);
    return {
      rank: index + 1,
      userId: entry.userId,
      name: entry.name,
      areaM2,
      progress: areaM2 / maxArea,
      isCurrentUser: entry.userId === currentUserId,
    } satisfies LeaderboardRow;
  });
}

export function LeaderboardPanel() {
  const { theme } = useAppTheme();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const [scope, setScope] = useState<RankingScope>("local");
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fallbackCurrentUserId = currentUserId ?? "__mock_current_user__";

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

  const globalRows = useMemo(
    () => buildRows(globalQuery.data?.rankings ?? [], currentUserId),
    [currentUserId, globalQuery.data?.rankings],
  );

  const mockRows = useMemo(() => {
    const sortedMockData = [...mockLeaderboardData]
      .sort((a, b) => b.areaCovered - a.areaCovered)
      .map((user, index) => ({ ...user, rank: index + 1 }));

    const mockEntries: LeaderboardEntry[] = sortedMockData.map((user) => ({
      rank: user.rank,
      userId:
        user.name === "You"
          ? fallbackCurrentUserId
          : `mock-${user.name.toLowerCase().replace(/\s+/g, "-")}`,
      name: user.name,
      totalAreaCaptured: user.areaCovered * 1_000_000,
    }));

    return buildRows(mockEntries, fallbackCurrentUserId);
  }, [fallbackCurrentUserId]);

  const localRows = useMemo(() => {
    const eventRows = buildRows(
      eventLeaderboardQuery.data?.rankings ?? [],
      currentUserId,
    );
    if (eventRows.length > 0) {
      return eventRows;
    }

    const source = globalRows;
    if (!source.length) {
      return source;
    }

    const myIndex = source.findIndex((entry) => entry.isCurrentUser);
    if (myIndex === -1) {
      return source.slice(0, 12);
    }

    const start = Math.max(0, myIndex - 5);
    return source.slice(start, start + 12);
  }, [currentUserId, eventLeaderboardQuery.data?.rankings, globalRows]);

  const selectedRows =
    (scope === "local" ? localRows : globalRows).length > 0
      ? scope === "local"
        ? localRows
        : globalRows
      : mockRows;

  const visibleRows = useMemo(() => {
    const topRows = selectedRows.slice(0, 12);
    const myRow = selectedRows.find((entry) => entry.isCurrentUser);
    if (!myRow || topRows.some((entry) => entry.userId === myRow.userId)) {
      return topRows;
    }
    return [...topRows, myRow];
  }, [selectedRows]);

  const podiumRows = useMemo(() => selectedRows.slice(0, 3), [selectedRows]);

  useEffect(() => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progressAnim, scope, selectedRows.length]);

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16, paddingBottom: 36 }}
    >
      <Text className="text-[30px] font-bold" style={{ color: theme.text }}>
        Leaderboard
      </Text>
      <Text className="mt-1 text-sm" style={{ color: theme.textMuted }}>
        Ranked by captured area (km²).
      </Text>

      <View
        className="mt-4 self-start rounded-2xl border p-1"
        style={{
          borderColor: theme.border,
          backgroundColor: theme.surface,
        }}
      >
        <View className="flex-row">
          {(["local", "global"] as const).map((option) => {
            const active = scope === option;
            return (
              <Pressable
                key={option}
                onPress={() => setScope(option)}
                className="rounded-2xl px-4 py-1.5"
                style={{
                  backgroundColor: active ? theme.accent : "transparent",
                }}
              >
                <Text
                  className="text-xs font-semibold capitalize"
                  style={{
                    color: active ? theme.background : theme.textMuted,
                  }}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View
        className="mt-4 rounded-2xl border p-4"
        style={{ borderColor: theme.border, backgroundColor: theme.surface }}
      >
        <View className="flex-row items-end justify-between">
          {[1, 0, 2]
            .map((index) => podiumRows[index])
            .filter(Boolean)
            .map((winner, index) => {
              if (!winner) {
                return null;
              }
              const isFirst = winner.rank === 1;
              return (
                <View
                  key={winner.userId}
                  className="flex-1 rounded-2xl border px-2 py-3"
                  style={{
                    borderColor: isFirst ? theme.accent : theme.border,
                    backgroundColor: theme.surfaceMuted,
                    marginTop: isFirst ? 0 : 12,
                    marginHorizontal: index === 1 ? 6 : 0,
                  }}
                >
                  <View className="items-center">
                    <View
                      className="items-center justify-center rounded-full"
                      style={{
                        backgroundColor: theme.surface,
                        height: isFirst ? 44 : 36,
                        width: isFirst ? 44 : 36,
                      }}
                    >
                      <Text
                        className="font-semibold"
                        style={{
                          color: theme.text,
                          fontSize: isFirst ? 14 : 12,
                        }}
                      >
                        {getInitial(winner.name)}
                      </Text>
                    </View>
                    <Text
                      className="mt-2 text-[11px] font-semibold"
                      style={{ color: theme.text }}
                      numberOfLines={1}
                    >
                      {winner.name}
                    </Text>
                    <Text
                      className="mt-1 text-[10px]"
                      style={{ color: theme.textMuted }}
                    >
                      #{winner.rank}
                    </Text>
                    <Text
                      className="mt-1 text-[11px] font-semibold"
                      style={{ color: theme.accent }}
                    >
                      {formatAreaKm2(winner.areaM2)} km²
                    </Text>
                  </View>
                </View>
              );
            })}
        </View>
      </View>

      <View
        className="mt-4 rounded-2xl border p-4"
        style={{ borderColor: theme.border, backgroundColor: theme.surface }}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-semibold" style={{ color: theme.text }}>
            Rankings
          </Text>
          <View className="flex-row items-center gap-1">
            <Ionicons
              name="location-outline"
              size={13}
              color={theme.textMuted}
            />
            <Text className="text-[11px]" style={{ color: theme.textMuted }}>
              {eventQuery.data?.location ?? "Live updates"}
            </Text>
          </View>
        </View>

        <View className="mt-4 gap-2">
          {visibleRows.length ? (
            visibleRows.map((entry) => {
              const barWidth = progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [
                  "0%",
                  `${Math.max(8, Math.round(entry.progress * 100))}%`,
                ],
              });

              return (
                <View
                  key={`${entry.userId}-${entry.rank}-${scope}`}
                  className="rounded-2xl border px-3 py-3"
                  style={{
                    borderColor: entry.isCurrentUser
                      ? theme.accent
                      : theme.border,
                    backgroundColor: entry.isCurrentUser
                      ? theme.surfaceMuted
                      : theme.surface,
                  }}
                >
                  <View className="flex-row items-center">
                    <Text
                      className="w-7 text-xs font-semibold"
                      style={{
                        color: entry.isCurrentUser
                          ? theme.accent
                          : theme.textMuted,
                      }}
                    >
                      {entry.rank}
                    </Text>
                    <View
                      className="h-8 w-8 items-center justify-center rounded-full"
                      style={{ backgroundColor: theme.surfaceMuted }}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: theme.text }}
                      >
                        {getInitial(entry.name)}
                      </Text>
                    </View>
                    <View className="ml-3 flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text
                          className="text-sm font-semibold"
                          style={{ color: theme.text }}
                          numberOfLines={1}
                        >
                          {entry.name}
                        </Text>
                        {entry.isCurrentUser ? (
                          <Text
                            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{
                              color: theme.accent,
                              backgroundColor: theme.surface,
                            }}
                          >
                            Trending up
                          </Text>
                        ) : null}
                      </View>
                    </View>
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: theme.text }}
                    >
                      {formatAreaKm2(entry.areaM2)} km²
                    </Text>
                  </View>

                  <View
                    className="mt-2 h-1.5 overflow-hidden rounded-full"
                    style={{ backgroundColor: theme.surfaceMuted }}
                  >
                    <Animated.View
                      className="h-1.5 rounded-full"
                      style={{
                        width: barWidth,
                        backgroundColor: theme.accent,
                        opacity: 0.88,
                      }}
                    />
                  </View>
                </View>
              );
            })
          ) : (
            <Text className="text-sm" style={{ color: theme.textMuted }}>
              No ranking activity yet.
            </Text>
          )}
        </View>
      </View>

      <Pressable
        className="mt-5 rounded-2xl border py-3"
        style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        onPress={() => undefined}
      >
        <Text
          className="text-center text-sm font-semibold"
          style={{ color: theme.text }}
        >
          View Full Rankings
        </Text>
      </Pressable>
    </ScrollView>
  );
}

export default function LeaderboardScreen() {
  return (
    <Screen>
      <LeaderboardPanel />
    </Screen>
  );
}
