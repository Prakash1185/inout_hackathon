import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { Screen } from "@/src/components/Screen";
import { useEventsLocalStore } from "@/src/store/events-local-store";
import { useAppTheme } from "@/src/store/ui-store";

interface GroupInfo {
  id: string;
  name: string;
  members: number;
  focus: string;
  vibe: string;
  description: string;
}

const groups: GroupInfo[] = [
  {
    id: "grp-1",
    name: "Dwarka Early Movers",
    members: 128,
    focus: "Running + Mobility",
    vibe: "Morning",
    description:
      "Focused on morning routines, pace coaching, and weekly 5K build plans.",
  },
  {
    id: "grp-2",
    name: "Metro Fit Collective",
    members: 93,
    focus: "Strength + Cardio",
    vibe: "Evening",
    description:
      "After-work fitness group with circuit sessions and accountability check-ins.",
  },
  {
    id: "grp-3",
    name: "Weekend Warriors Delhi",
    members: 176,
    focus: "Cycling + Endurance",
    vibe: "Weekend",
    description:
      "Long-form weekend events including ride loops and endurance challenges.",
  },
];

const missions = [
  {
    id: "ms-1",
    title: "3 Event Streak",
    detail: "Join 3 events this week",
    reward: "+120 XP",
  },
  {
    id: "ms-2",
    title: "Community Connector",
    detail: "Participate with 2 different groups",
    reward: "Silver group badge",
  },
  {
    id: "ms-3",
    title: "Host Momentum",
    detail: "Host your first local event",
    reward: "+200 XP",
  },
];

export function EventsPanel() {
  const router = useRouter();
  const { theme } = useAppTheme();

  const events = useEventsLocalStore((state) => state.events);
  const joinedEventIds = useEventsLocalStore((state) => state.joinedEventIds);

  const [selectedGroup, setSelectedGroup] = useState<GroupInfo | null>(null);

  const joinedEvents = useMemo(
    () => events.filter((event) => joinedEventIds.includes(event.id)),
    [events, joinedEventIds],
  );

  const upcomingEvents = useMemo(
    () => events.filter((event) => !joinedEventIds.includes(event.id)),
    [events, joinedEventIds],
  );

  return (
    <>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 38 }}
      >
        <View className="flex-row items-center justify-between">
          {/* <Pressable
            className="h-10 w-10 items-center justify-center rounded-2xl border"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
            onPress={() => router.push("/(app)/(tabs)/home")}
          >
            <Ionicons name="chevron-back" size={18} color={theme.text} />
          </Pressable> */}

          <Text className="text-[30px] font-bold" style={{ color: theme.text }}>
            Events
          </Text>

          <Pressable
            className="h-10 rounded-2xl border px-3"
            style={{ borderColor: theme.accent, backgroundColor: theme.accent }}
            onPress={() => router.push("/(app)/events/host")}
          >
            <View className="h-full flex-row items-center gap-1">
              <Ionicons name="add" size={14} color="#FFFFFF" />
              <Text
                className="text-xs font-semibold"
                style={{ color: "#FFFFFF" }}
              >
                Host
              </Text>
            </View>
          </Pressable>
        </View>

        <Text className="mt-1 text-sm" style={{ color: theme.textMuted }}>
          Discover, join, and host local fitness events.
        </Text>

        <View
          className="mt-5 rounded-2xl border p-4"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold" style={{ color: theme.text }}>
              Your Joined Events
            </Text>
            <Text className="text-xs" style={{ color: theme.textMuted }}>
              {joinedEvents.length} joined
            </Text>
          </View>

          <View className="mt-3 gap-3">
            {joinedEvents.length === 0 ? (
              <View
                className="rounded-2xl border p-3"
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.surfaceMuted,
                }}
              >
                <Text className="text-sm" style={{ color: theme.textMuted }}>
                  No joined events yet. Open upcoming events and join one.
                </Text>
              </View>
            ) : null}

            {joinedEvents.map((event) => (
              <View
                key={event.id}
                className="rounded-2xl border p-3"
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.surfaceMuted,
                }}
              >
                <View className="flex-row gap-3">
                  <Image
                    source={{ uri: event.imageUrl }}
                    style={{ width: 88, height: 88, borderRadius: 14 }}
                    contentFit="cover"
                  />

                  <View className="flex-1 justify-between">
                    <View>
                      <Text
                        className="text-base font-semibold"
                        style={{ color: theme.text }}
                      >
                        {event.name}
                      </Text>
                      <Text
                        className="mt-1 text-xs"
                        style={{ color: theme.textMuted }}
                      >
                        {event.location}
                      </Text>
                      <Text
                        className="mt-1 text-xs"
                        style={{ color: theme.textMuted }}
                      >
                        {event.duration} | {event.dateLabel}
                      </Text>
                    </View>

                    <View className="mt-2 flex-row items-center justify-between">
                      <Text
                        className="rounded-full px-2 py-1 text-[10px] font-semibold"
                        style={{
                          color: "#FFFFFF",
                          backgroundColor: theme.accent,
                        }}
                      >
                        Joined
                      </Text>

                      <Pressable
                        className="rounded-xl border px-3 py-1.5"
                        style={{
                          borderColor: theme.accent,
                          backgroundColor: theme.accent,
                        }}
                        onPress={() =>
                          router.push({
                            pathname: "/(app)/events/[id]",
                            params: { id: event.id },
                          })
                        }
                      >
                        <Text
                          className="text-xs font-semibold"
                          style={{ color: "#FFFFFF" }}
                        >
                          View More
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-6 flex-row items-center justify-between">
          <Text className="text-2xl font-bold" style={{ color: theme.text }}>
            Upcoming Events
          </Text>
          <Text className="text-xs" style={{ color: theme.textMuted }}>
            {upcomingEvents.length} available
          </Text>
        </View>

        <View className="mt-3 gap-4">
          {upcomingEvents.map((event) => (
            <View
              key={event.id}
              className="overflow-hidden rounded-3xl border"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surface,
              }}
            >
              <Image
                source={{ uri: event.imageUrl }}
                style={{ width: "100%", height: 185 }}
                contentFit="cover"
              />

              <View className="p-4">
                <Text
                  className="text-lg font-semibold"
                  style={{ color: theme.text }}
                >
                  {event.name}
                </Text>
                <Text
                  className="mt-1 text-sm"
                  style={{ color: theme.textMuted }}
                >
                  {event.location}
                </Text>
                <Text
                  className="mt-1 text-sm"
                  style={{ color: theme.textMuted }}
                >
                  {event.duration} | {event.dateLabel}
                </Text>
                <Text
                  className="mt-1 text-xs"
                  style={{ color: theme.textMuted }}
                >
                  Hosted by {event.hostedBy}
                </Text>

                <Pressable
                  className="mt-4 items-center rounded-2xl border py-3"
                  style={{
                    borderColor: theme.accent,
                    backgroundColor: theme.accent,
                  }}
                  onPress={() =>
                    router.push({
                      pathname: "/(app)/events/[id]",
                      params: { id: event.id },
                    })
                  }
                >
                  <Text className="font-semibold" style={{ color: "#FFFFFF" }}>
                    Join Now
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        <View
          className="mt-6 rounded-2xl border p-4"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold" style={{ color: theme.text }}>
              Host an Event
            </Text>
            <Ionicons
              name="sparkles-outline"
              size={16}
              color={theme.textMuted}
            />
          </View>
          <Text className="mt-2 text-sm" style={{ color: theme.textMuted }}>
            Create a new event in under a minute. This is fully local dummy
            flow.
          </Text>
          <Pressable
            className="mt-4 items-center rounded-2xl border py-3"
            style={{ borderColor: theme.accent, backgroundColor: theme.accent }}
            onPress={() => router.push("/(app)/events/host")}
          >
            <Text className="font-semibold" style={{ color: "#FFFFFF" }}>
              Create Event
            </Text>
          </Pressable>
        </View>

        <View className="mt-6 flex-row items-center justify-between">
          <Text className="text-2xl font-bold" style={{ color: theme.text }}>
            Groups
          </Text>
          <Text className="text-xs" style={{ color: theme.textMuted }}>
            local communities
          </Text>
        </View>

        <View className="mt-3 gap-3">
          {groups.map((group) => (
            <View
              key={group.id}
              className="rounded-2xl border p-4"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surface,
              }}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text
                    className="text-base font-semibold"
                    style={{ color: theme.text }}
                  >
                    {group.name}
                  </Text>
                  <Text
                    className="mt-1 text-xs"
                    style={{ color: theme.textMuted }}
                  >
                    {group.members} people | {group.focus}
                  </Text>
                </View>

                <Pressable
                  className="rounded-xl border px-3 py-1.5"
                  style={{
                    borderColor: theme.accent,
                    backgroundColor: theme.accent,
                  }}
                  onPress={() => setSelectedGroup(group)}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: "#FFFFFF" }}
                  >
                    Details
                  </Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        <View className="mt-6 flex-row items-center justify-between">
          <Text className="text-2xl font-bold" style={{ color: theme.text }}>
            Missions
          </Text>
          <Text className="text-xs" style={{ color: theme.textMuted }}>
            weekly goals
          </Text>
        </View>

        <View className="mt-3 gap-3">
          {missions.map((mission, index) => (
            <View
              key={mission.id}
              className="rounded-2xl border p-4"
              style={{
                borderColor: index === 0 ? theme.accent : theme.border,
                backgroundColor: theme.surface,
              }}
            >
              <Text
                className="text-base font-semibold"
                style={{ color: theme.text }}
              >
                {mission.title}
              </Text>
              <Text className="mt-1 text-sm" style={{ color: theme.textMuted }}>
                {mission.detail}
              </Text>
              <Text
                className="mt-2 text-xs font-semibold"
                style={{ color: theme.accent }}
              >
                Reward: {mission.reward}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={Boolean(selectedGroup)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedGroup(null)}
      >
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.28)" }}
          onPress={() => setSelectedGroup(null)}
        >
          <Pressable
            className="rounded-t-3xl border px-5 pb-6 pt-5"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
            onPress={() => undefined}
          >
            <Text
              className="text-xl font-semibold"
              style={{ color: theme.text }}
            >
              {selectedGroup?.name}
            </Text>
            <Text className="mt-3 text-sm" style={{ color: theme.textMuted }}>
              People: {selectedGroup?.members}
            </Text>
            <Text className="mt-1 text-sm" style={{ color: theme.textMuted }}>
              Focus: {selectedGroup?.focus}
            </Text>
            <Text className="mt-1 text-sm" style={{ color: theme.textMuted }}>
              Vibe: {selectedGroup?.vibe}
            </Text>
            <Text className="mt-3 text-sm" style={{ color: theme.text }}>
              {selectedGroup?.description}
            </Text>

            <Pressable
              className="mt-5 items-center rounded-2xl border py-3"
              style={{
                borderColor: theme.accent,
                backgroundColor: theme.accent,
              }}
              onPress={() => setSelectedGroup(null)}
            >
              <Text className="font-semibold" style={{ color: "#FFFFFF" }}>
                Close
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

export default function EventsScreen() {
  return (
    <Screen>
      <EventsPanel />
    </Screen>
  );
}
