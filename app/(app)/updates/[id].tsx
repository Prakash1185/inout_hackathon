import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Screen } from "@/src/components/Screen";
import { updatesFeed } from "@/src/constants/updates-feed";
import { useAppTheme } from "@/src/store/ui-store";

export default function UpdateDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { theme } = useAppTheme();

  const update = updatesFeed.find((item) => item.id === id);

  if (!update) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-lg font-semibold" style={{ color: theme.text }}>
            Update not found
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
            Update
          </Text>

          <View className="h-10 w-10" />
        </View>

        <View
          className="mt-4 overflow-hidden rounded-3xl border"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          <Image
            source={{ uri: update.imageUrl }}
            style={{ width: "100%", height: 220 }}
            contentFit="cover"
          />

          <View className="p-4">
            <View className="flex-row items-center justify-between">
              <Text
                className="rounded-full px-2 py-1 text-[10px] font-semibold"
                style={{ color: "#FFFFFF", backgroundColor: theme.accent }}
              >
                {update.category}
              </Text>
              <Text className="text-[11px]" style={{ color: theme.textMuted }}>
                {update.publishedAt}
              </Text>
            </View>

            <Text
              className="mt-3 text-2xl font-bold"
              style={{ color: theme.text }}
            >
              {update.title}
            </Text>

            <Text className="mt-2 text-sm" style={{ color: theme.textMuted }}>
              {update.source}
            </Text>

            <Text className="mt-4 text-base" style={{ color: theme.text }}>
              {update.content}
            </Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
