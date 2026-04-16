import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { NeonButton } from "@/src/components/NeonButton";
import { Screen } from "@/src/components/Screen";
import { getEvents } from "@/src/services/event.service";
import { useAppTheme } from "@/src/store/ui-store";

function formatDate(input: string) {
  const date = new Date(input);
  return `${date.toLocaleString("en-US", { month: "short" })} ${date.getDate()}`;
}

type CommunityFilter = "Nearby" | "Active Now" | "Safe Routes";

const filters: CommunityFilter[] = ["Nearby", "Active Now", "Safe Routes"];

export default function EventsScreen() {
  const { theme } = useAppTheme();
  const [activeFilter, setActiveFilter] = useState<CommunityFilter>("Nearby");

  const eventsQuery = useQuery({
    queryKey: ["events-feed"],
    queryFn: getEvents,
  });

  const missionCards = useMemo(() => {
    const remote = eventsQuery.data ?? [];
    if (remote.length > 0) {
      return remote.slice(0, 2).map((event, index) => ({
        id: event.id,
        title: event.name,
        subtitle:
          index === 0 ? "Local mission" : "Community mission",
        detail: `${formatDate(event.startDate)} - ${formatDate(event.endDate)}`,
        isActive: event.isActive,
      }));
    }

    return [
      {
        id: "fallback-1",
        title: "Sector vs Sector Battle",
        subtitle: "Local mission",
        detail: "Capture streak in North Dwarka this week",
        isActive: true,
      },
      {
        id: "fallback-2",
        title: "7 Day Streak Challenge",
        subtitle: "Community mission",
        detail: "Hold activity consistency for 7 days",
        isActive: false,
      },
    ];
  }, [eventsQuery.data]);

  const groups = [
    {
      id: "grp-1",
      name: "Sector 62 Walkers",
      members: 86,
      status: "Active tonight",
      live: true,
    },
    {
      id: "grp-2",
      name: "Dwarka Evening Runners",
      members: 124,
      status: "Safe route focus",
      live: false,
    },
  ];

  const feedItems = [
    "Rohan captured 2 zones in North Dwarka.",
    "Sector 62 Walkers are trending tonight.",
    "Priya started a metro-walk challenge near Blue Line.",
  ];

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 34 }}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-[30px] font-bold" style={{ color: theme.text }}>
              Community
            </Text>
            <Text className="mt-1 text-sm" style={{ color: theme.textMuted }}>
              Dwarka, Delhi local movement network
            </Text>
          </View>
          <Pressable
            className="rounded-2xl border p-2"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
            onPress={() => undefined}
          >
            <Ionicons name="search-outline" size={18} color={theme.text} />
          </Pressable>
        </View>

        <View
          className="mt-4 rounded-2xl border p-4"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="text-sm font-semibold" style={{ color: theme.text }}>
                Your local movement network
              </Text>
              <Text className="mt-1 text-xs" style={{ color: theme.textMuted }}>
                Discover nearby walkers, safe-route squads, and hyperlocal challenge
                groups around Dwarka.
              </Text>
            </View>
            <View
              className="rounded-2xl border px-2 py-1"
              style={{
                borderColor: theme.accent,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <Text className="text-[10px] font-semibold" style={{ color: theme.accent }}>
                Live activity
              </Text>
            </View>
          </View>

          <View className="mt-3 flex-row gap-2">
            <View
              className="flex-1 rounded-2xl border px-3 py-2"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <Text className="text-[11px]" style={{ color: theme.textMuted }}>
                Nearby active people
              </Text>
              <Text
                className="mt-1 text-sm font-semibold"
                style={{ color: theme.text }}
              >
                186 now
              </Text>
            </View>
            <View
              className="flex-1 rounded-2xl border px-3 py-2"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <Text className="text-[11px]" style={{ color: theme.textMuted }}>
                Best community window
              </Text>
              <Text
                className="mt-1 text-sm font-semibold"
                style={{ color: theme.text }}
              >
                6:30 PM - 8:00 PM
              </Text>
            </View>
          </View>

          <View className="mt-4 gap-3">
            <NeonButton
              label="Join Nearby Group"
              onPress={() => undefined}
              variant="primary"
            />
            <NeonButton
              label="Explore Safe Groups"
              onPress={() => undefined}
              variant="secondary"
            />
          </View>
        </View>

        <View className="mt-3 flex-row flex-wrap gap-2">
          {filters.map((filter) => {
            const active = activeFilter === filter;
            return (
              <Pressable
                key={filter}
                onPress={() => setActiveFilter(filter)}
                className="rounded-2xl border px-3 py-2"
                style={{
                  borderColor: active ? theme.accent : theme.border,
                  backgroundColor: active ? theme.surfaceMuted : theme.surface,
                }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: active ? theme.accent : theme.textMuted }}
                >
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-6 flex-row items-center justify-between">
          <Text className="text-2xl font-bold" style={{ color: theme.text }}>
            Zone Map
          </Text>
          <Text className="text-xs" style={{ color: theme.textMuted }}>
            locality preview
          </Text>
        </View>

        <View
          className="mt-3 rounded-2xl border p-3"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          <View
            className="relative h-44 overflow-hidden rounded-2xl border"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surfaceMuted,
            }}
          >
            {Array.from({ length: 7 }).map((_, index) => (
              <View
                key={`vertical-${index}`}
                style={{
                  position: "absolute",
                  left: `${index * 16}%`,
                  top: 0,
                  bottom: 0,
                  width: 1,
                  backgroundColor: theme.border,
                }}
              />
            ))}
            {Array.from({ length: 6 }).map((_, index) => (
              <View
                key={`horizontal-${index}`}
                style={{
                  position: "absolute",
                  top: `${index * 18}%`,
                  left: 0,
                  right: 0,
                  height: 1,
                  backgroundColor: theme.border,
                }}
              />
            ))}

            <View
              className="absolute left-3 top-3 rounded-2xl border px-2 py-1"
              style={{ borderColor: theme.accent, backgroundColor: theme.surface }}
            >
              <Text className="text-[10px] font-semibold" style={{ color: theme.accent }}>
                North Dwarka live
              </Text>
            </View>

            <View
              className="absolute bottom-3 right-3 rounded-2xl border px-2 py-1"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surface,
              }}
            >
              <Text className="text-[10px]" style={{ color: theme.textMuted }}>
                3 sectors highlighted
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-6 flex-row items-center justify-between">
          <Text className="text-2xl font-bold" style={{ color: theme.text }}>
            Active Local Groups
          </Text>
          <Text className="text-xs" style={{ color: theme.textMuted }}>
            nearby squads
          </Text>
        </View>

        <View className="mt-5 gap-3">
          {groups.map((group) => (
            <View
              key={group.id}
              className="rounded-2xl border p-4"
              style={{
                borderColor: group.live ? theme.accent : theme.border,
                backgroundColor: theme.surface,
              }}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-row items-center gap-3">
                  <View
                    className="h-11 w-11 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: theme.surfaceMuted }}
                  >
                    <Ionicons name="people-outline" size={18} color={theme.textMuted} />
                  </View>
                  <View>
                    <Text className="text-sm font-semibold" style={{ color: theme.text }}>
                      {group.name}
                    </Text>
                    <Text className="mt-1 text-xs" style={{ color: theme.textMuted }}>
                      {group.members} members
                    </Text>
                  </View>
                </View>
                <Text
                  className="rounded-full px-2 py-1 text-[10px] font-semibold"
                  style={{
                    color: group.live ? theme.accent : theme.textMuted,
                    backgroundColor: theme.surfaceMuted,
                  }}
                >
                  {group.status}
                </Text>
              </View>

              <View className="mt-3 flex-row items-center justify-between">
                <View className="flex-row -space-x-2">
                  {[0, 1, 2].map((avatar) => (
                    <View
                      key={`${group.id}-avatar-${avatar}`}
                      className="h-7 w-7 items-center justify-center rounded-full border"
                      style={{
                        borderColor: theme.border,
                        backgroundColor: theme.surfaceMuted,
                      }}
                    >
                      <Text className="text-[10px]" style={{ color: theme.textMuted }}>
                        {avatar + 1}
                      </Text>
                    </View>
                  ))}
                </View>

                <Pressable
                  onPress={() => undefined}
                  className="rounded-2xl border px-3 py-2"
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.surfaceMuted,
                  }}
                >
                  <Text className="text-xs font-semibold" style={{ color: theme.text }}>
                    Join
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        <View className="mt-6 flex-row items-center justify-between">
          <Text className="text-2xl font-bold" style={{ color: theme.text }}>
            Quick Actions
          </Text>
          <Text className="text-xs" style={{ color: theme.textMuted }}>
            instant
          </Text>
        </View>

        <View className="mt-3 flex-row flex-wrap gap-2">
          {[
            { label: "Create Challenge", icon: "flag-outline" as const },
            { label: "Invite Friends", icon: "person-add-outline" as const },
            { label: "Share Route", icon: "share-social-outline" as const },
          ].map((action) => (
            <Pressable
              key={action.label}
              onPress={() => undefined}
              className="w-[32%] rounded-2xl border px-2 py-3"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surface,
              }}
            >
              <View className="items-center gap-2">
                <Ionicons name={action.icon} size={16} color={theme.textMuted} />
                <Text
                  className="text-center text-[11px] font-semibold"
                  style={{ color: theme.text }}
                >
                  {action.label}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View
          className="mt-6 rounded-2xl border p-4"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[11px]" style={{ color: theme.textMuted }}>
                Local Standing
              </Text>
              <Text className="mt-1 text-xl font-semibold" style={{ color: theme.text }}>
                #4 in Dwarka
              </Text>
            </View>
            <View
              className="flex-row items-center gap-1 rounded-2xl border px-2 py-1"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <Ionicons name="arrow-up-outline" size={13} color={theme.accent} />
              <Text className="text-xs font-semibold" style={{ color: theme.accent }}>
                Up 1
              </Text>
            </View>
          </View>
          <Text className="mt-2 text-xs" style={{ color: theme.textMuted }}>
            Capture one more safe zone to enter top 3 tonight.
          </Text>
        </View>

        <View className="mt-6 flex-row items-center justify-between">
          <Text className="text-2xl font-bold" style={{ color: theme.text }}>
            Missions
          </Text>
          <Text className="text-xs" style={{ color: theme.textMuted }}>
            global and local
          </Text>
        </View>

        <View className="mt-3 gap-3">
          {missionCards.map((mission) => (
            <View
              key={mission.id}
              className="rounded-2xl border p-4"
              style={{
                borderColor: mission.isActive ? theme.accent : theme.border,
                backgroundColor: theme.surface,
              }}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-[11px]" style={{ color: theme.textMuted }}>
                  {mission.subtitle}
                </Text>
                <Text
                  className="rounded-full px-2 py-1 text-[10px] font-semibold"
                  style={{
                    color: mission.isActive ? theme.accent : theme.textMuted,
                    backgroundColor: theme.surfaceMuted,
                  }}
                >
                  {mission.isActive ? "Live" : "Upcoming"}
                </Text>
              </View>

              <Text className="mt-2 text-base font-semibold" style={{ color: theme.text }}>
                {mission.title}
              </Text>
              <Text className="mt-1 text-xs" style={{ color: theme.textMuted }}>
                {mission.detail}
              </Text>
            </View>
          ))}
        </View>

        <View className="mt-6 flex-row items-center justify-between">
          <Text className="text-2xl font-bold" style={{ color: theme.text }}>
            Recent Activity
          </Text>
          <Text className="text-xs" style={{ color: theme.textMuted }}>
            community feed
          </Text>
        </View>

        <View className="mt-3 gap-2">
          {feedItems.map((item) => (
            <View
              key={item}
              className="rounded-2xl border p-3"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surface,
              }}
            >
              <View className="flex-row items-center gap-2">
                <Ionicons name="flash-outline" size={14} color={theme.textMuted} />
                <Text className="flex-1 text-xs" style={{ color: theme.text }}>
                  {item}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
