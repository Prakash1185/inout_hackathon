import { useQuery } from "@tanstack/react-query";
import { ScrollView, Text, View } from "react-native";

import { NeonButton } from "@/src/components/NeonButton";
import { Screen } from "@/src/components/Screen";
import { getEvents } from "@/src/services/event.service";
import { useAppTheme } from "@/src/store/ui-store";

function formatDate(input: string) {
  const date = new Date(input);
  return `${date.toLocaleString("en-US", { month: "short" })} ${date.getDate()}`;
}

export default function EventsScreen() {
  const { theme } = useAppTheme();
  const eventsQuery = useQuery({
    queryKey: ["events-feed"],
    queryFn: getEvents,
  });

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
      >
        <Text className="text-3xl font-bold" style={{ color: theme.text }}>
          Events
        </Text>
        <Text className="mt-1 text-sm" style={{ color: theme.textMuted }}>
          Current, upcoming, and campaign-style runs.
        </Text>

        <View className="mt-5 gap-3">
          {(eventsQuery.data ?? []).map((event) => (
            <View
              key={event.id}
              className="rounded-2xl border p-4"
              style={{
                borderColor: event.isActive ? theme.accent : theme.border,
                backgroundColor: theme.surface,
              }}
            >
              <View className="flex-row items-center justify-between">
                <Text
                  className="text-base font-semibold"
                  style={{ color: theme.text }}
                >
                  {event.name}
                </Text>
                <Text
                  className="rounded-full px-2 py-1 text-xs"
                  style={{
                    color: event.isActive ? "#FFFFFF" : theme.textMuted,
                    backgroundColor: event.isActive
                      ? theme.accent
                      : theme.surfaceMuted,
                  }}
                >
                  {event.isActive ? "Live" : "Upcoming"}
                </Text>
              </View>

              <Text className="mt-2 text-sm" style={{ color: theme.textMuted }}>
                {event.location}
              </Text>
              <Text className="mt-1 text-xs" style={{ color: theme.textMuted }}>
                {formatDate(event.startDate)} - {formatDate(event.endDate)}
              </Text>

              <View className="mt-3">
                <NeonButton
                  label={
                    event.isActive ? "Track In Live Event" : "Set Reminder"
                  }
                  onPress={() => undefined}
                  variant={event.isActive ? "primary" : "secondary"}
                />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
