import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { EventsPanel } from "@/app/(app)/(tabs)/events";
import { LeaderboardPanel } from "@/app/(app)/(tabs)/leaderboard";
import { UpdatesPanel } from "@/src/components/feed/UpdatesPanel";
import { Screen } from "@/src/components/Screen";
import { useAppTheme } from "@/src/store/ui-store";

type FeedTab = "events" | "rankings" | "updates";

export default function FeedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const { theme } = useAppTheme();
  const [activeTab, setActiveTab] = useState<FeedTab>("rankings");

  useEffect(() => {
    if (
      params.tab === "events" ||
      params.tab === "rankings" ||
      params.tab === "updates"
    ) {
      setActiveTab(params.tab);
    }
  }, [params.tab]);

  return (
    <Screen>
      <View className="px-4 pb-2 pt-3">
        <View className="flex-row items-center justify-between">
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-2xl border"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
            onPress={() => router.push("/(app)/(tabs)/home")}
          >
            <Ionicons name="chevron-back" size={18} color={theme.text} />
          </Pressable>

          <View className="flex-row items-center gap-2">
            <Ionicons
              name="newspaper-outline"
              size={18}
              color={theme.textMuted}
            />
            <Text className="text-2xl font-bold" style={{ color: theme.text }}>
              Feed
            </Text>
          </View>

          <View className="h-10 w-10" />
        </View>

        <View
          className="mt-3 self-start rounded-2xl border p-1"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          <View className="flex-row gap-1">
            {(
              [
                {
                  key: "rankings",
                  label: "Rankings",
                  icon: "trophy-outline" as const,
                },
                {
                  key: "events",
                  label: "Events",
                  icon: "calendar-outline" as const,
                },
                {
                  key: "updates",
                  label: "Updates",
                  icon: "newspaper-outline" as const,
                },
              ] as const
            ).map((tab) => {
              const active = activeTab === tab.key;
              return (
                <Pressable
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  className="flex-row items-center gap-1 rounded-xl px-4 py-2"
                  style={{
                    backgroundColor: active ? theme.accent : theme.surfaceMuted,
                  }}
                >
                  <Ionicons
                    name={tab.icon}
                    size={12}
                    color={active ? "#FFFFFF" : theme.textMuted}
                  />
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: active ? "#FFFFFF" : theme.textMuted }}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {activeTab === "events" ? <EventsPanel /> : null}
      {activeTab === "rankings" ? <LeaderboardPanel /> : null}
      {activeTab === "updates" ? <UpdatesPanel /> : null}
    </Screen>
  );
}
