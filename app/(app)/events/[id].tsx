import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Screen } from "@/src/components/Screen";
import { useEventsLocalStore } from "@/src/store/events-local-store";
import { useAppTheme } from "@/src/store/ui-store";

export default function EventDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { theme } = useAppTheme();

  const events = useEventsLocalStore((state) => state.events);
  const joinedEventIds = useEventsLocalStore((state) => state.joinedEventIds);
  const joinEvent = useEventsLocalStore((state) => state.joinEvent);

  const event = events.find((item) => item.id === id);

  if (!event) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-lg font-semibold" style={{ color: theme.text }}>
            Event not found
          </Text>
          <Pressable
            className="mt-4 rounded-2xl border px-4 py-2"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
            onPress={() => router.back()}
          >
            <Text className="font-semibold" style={{ color: theme.text }}>
              Go back
            </Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const isJoined = joinedEventIds.includes(event.id);

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 36 }}
      >
        <View className="flex-row items-center justify-between">
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

          <Text className="text-xl font-semibold" style={{ color: theme.text }}>
            Event Details
          </Text>

          <View className="h-10 w-10" />
        </View>

        <View
          className="mt-4 overflow-hidden rounded-3xl border"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          <Image
            source={{ uri: event.imageUrl }}
            style={{ width: "100%", height: 220 }}
            contentFit="cover"
          />

          <View className="p-4">
            <Text className="text-2xl font-bold" style={{ color: theme.text }}>
              {event.name}
            </Text>

            <View className="mt-3 gap-2">
              <Text className="text-sm" style={{ color: theme.textMuted }}>
                Location: {event.location}
              </Text>
              <Text className="text-sm" style={{ color: theme.textMuted }}>
                Duration: {event.duration}
              </Text>
              <Text className="text-sm" style={{ color: theme.textMuted }}>
                Schedule: {event.dateLabel}
              </Text>
              <Text className="text-sm" style={{ color: theme.textMuted }}>
                Hosted by: {event.hostedBy}
              </Text>
              <Text className="text-sm" style={{ color: theme.textMuted }}>
                Participants: {event.participants}
              </Text>
            </View>

            <Text className="mt-4 text-sm" style={{ color: theme.text }}>
              {event.description}
            </Text>

            <Pressable
              className="mt-5 items-center rounded-2xl border py-3"
              style={{
                borderColor: theme.accent,
                backgroundColor: theme.accent,
                opacity: isJoined ? 0.9 : 1,
              }}
              onPress={() => {
                joinEvent(event.id);
                router.push("/(app)/(tabs)/events");
              }}
            >
              <Text className="font-semibold" style={{ color: "#FFFFFF" }}>
                {isJoined ? "Joined" : "Join Now"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
