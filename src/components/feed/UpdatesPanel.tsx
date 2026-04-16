import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { updatesFeed } from "@/src/constants/updates-feed";
import { useAppTheme } from "@/src/store/ui-store";

export function UpdatesPanel() {
  const router = useRouter();
  const { theme } = useAppTheme();

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16, paddingBottom: 36 }}
    >
      <Text className="text-[30px] font-bold" style={{ color: theme.text }}>
        Updates
      </Text>
      <Text className="mt-1 text-sm" style={{ color: theme.textMuted }}>
        Fitness news, quick tips, and community highlights.
      </Text>

      <View className="mt-4 gap-3">
        {updatesFeed.map((item) => (
          <Pressable
            key={item.id}
            className="overflow-hidden rounded-3xl border"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
            onPress={() =>
              router.push({
                pathname: "/(app)/updates/[id]",
                params: { id: item.id },
              })
            }
          >
            <Image
              source={{ uri: item.imageUrl }}
              style={{ width: "100%", height: 180 }}
              contentFit="cover"
            />

            <View className="p-4">
              <View className="flex-row items-center justify-between">
                <Text
                  className="rounded-full px-2 py-1 text-[10px] font-semibold"
                  style={{ color: "#FFFFFF", backgroundColor: theme.accent }}
                >
                  {item.category}
                </Text>
                <Text
                  className="text-[11px]"
                  style={{ color: theme.textMuted }}
                >
                  {item.publishedAt}
                </Text>
              </View>

              <Text
                className="mt-3 text-base font-semibold"
                style={{ color: theme.text }}
              >
                {item.title}
              </Text>
              <Text className="mt-1 text-sm" style={{ color: theme.textMuted }}>
                {item.summary}
              </Text>

              <View className="mt-3 flex-row items-center justify-between">
                <Text className="text-xs" style={{ color: theme.textMuted }}>
                  {item.source}
                </Text>
                <View className="flex-row items-center gap-1">
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: theme.accent }}
                  >
                    Open
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={13}
                    color={theme.accent}
                  />
                </View>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
