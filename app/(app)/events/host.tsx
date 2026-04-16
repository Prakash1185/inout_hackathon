import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { Screen } from "@/src/components/Screen";
import { useEventsLocalStore } from "@/src/store/events-local-store";
import { useAppTheme } from "@/src/store/ui-store";

export default function HostEventScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const createEvent = useEventsLocalStore((state) => state.createEvent);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [duration, setDuration] = useState("");
  const [dateLabel, setDateLabel] = useState("");
  const [hostedBy, setHostedBy] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const canCreate =
    name.trim().length > 0 &&
    location.trim().length > 0 &&
    duration.trim().length > 0 &&
    dateLabel.trim().length > 0;

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
            Host Event
          </Text>

          <View className="h-10 w-10" />
        </View>

        <View
          className="mt-4 rounded-3xl border p-4"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          <Text className="text-sm" style={{ color: theme.textMuted }}>
            Create a local event with dummy data. It will appear in upcoming
            events.
          </Text>

          {[
            {
              label: "Event name",
              value: name,
              setter: setName,
              placeholder: "ex: Sunrise Mobility Session",
            },
            {
              label: "Location",
              value: location,
              setter: setLocation,
              placeholder: "ex: Lodhi Garden",
            },
            {
              label: "Duration",
              value: duration,
              setter: setDuration,
              placeholder: "ex: 60 min",
            },
            {
              label: "Date & time",
              value: dateLabel,
              setter: setDateLabel,
              placeholder: "ex: Sun, 7:00 AM",
            },
            {
              label: "Host name",
              value: hostedBy,
              setter: setHostedBy,
              placeholder: "ex: Move Better Circle",
            },
            {
              label: "Image URL (optional)",
              value: imageUrl,
              setter: setImageUrl,
              placeholder: "https://images.unsplash.com/...",
            },
          ].map((field) => (
            <View key={field.label} className="mt-4">
              <Text className="text-xs" style={{ color: theme.textMuted }}>
                {field.label}
              </Text>
              <TextInput
                value={field.value}
                onChangeText={field.setter}
                className="mt-2 rounded-2xl border px-4 py-3"
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.surfaceMuted,
                  color: theme.text,
                }}
                placeholder={field.placeholder}
                placeholderTextColor={theme.textMuted}
              />
            </View>
          ))}

          <View className="mt-4">
            <Text className="text-xs" style={{ color: theme.textMuted }}>
              Description
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="mt-2 rounded-2xl border px-4 py-3"
              style={{
                minHeight: 100,
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
                color: theme.text,
              }}
              placeholder="Tell participants what this event includes"
              placeholderTextColor={theme.textMuted}
            />
          </View>

          <Pressable
            className="mt-5 items-center rounded-2xl border py-3"
            style={{
              borderColor: theme.accent,
              backgroundColor: theme.accent,
              opacity: canCreate ? 1 : 0.6,
            }}
            disabled={!canCreate}
            onPress={() => {
              createEvent({
                name: name.trim(),
                location: location.trim(),
                duration: duration.trim(),
                dateLabel: dateLabel.trim(),
                hostedBy: hostedBy.trim() || "Community Host",
                description:
                  description.trim() ||
                  "Community fitness event with local participants.",
                imageUrl: imageUrl.trim() || undefined,
              });
              router.push("/(app)/(tabs)/events");
            }}
          >
            <Text className="font-semibold" style={{ color: "#FFFFFF" }}>
              Create Event
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}
