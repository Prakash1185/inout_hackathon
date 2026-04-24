import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import type { AppNotificationItem } from "@/src/constants/notifications";
import { demoNotifications } from "@/src/constants/notifications";
import { Screen } from "@/src/components/Screen";
import { useAppTheme } from "@/src/store/ui-store";

function getNotificationIcon(category: AppNotificationItem["category"]) {
  switch (category) {
    case "activity":
      return "walk-outline";
    case "event":
      return "calendar-outline";
    case "leaderboard":
      return "trophy-outline";
    default:
      return "notifications-outline";
  }
}

export default function NotificationsScreen() {
  const { theme } = useAppTheme();
  const unreadCount = demoNotifications.filter((item) => item.unread).length;

  const todayItems = demoNotifications.filter(
    (item) => item.timeLabel.includes("ago") || item.timeLabel === "Today",
  );
  const earlierItems = demoNotifications.filter(
    (item) => !todayItems.includes(item),
  );

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 36, gap: 18 }}
      >
        <View
          className="rounded-3xl border px-4 py-4"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          <View className="flex-row items-center justify-between">
            <Pressable
              className="h-10 w-10 items-center justify-center rounded-2xl border"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={18} color={theme.text} />
            </Pressable>

            <View className="items-center">
              <Text
                className="text-lg font-semibold"
                style={{ color: theme.text }}
              >
                Notifications
              </Text>
              <Text className="text-xs" style={{ color: theme.textMuted }}>
                {unreadCount} unread updates
              </Text>
            </View>

            <View className="h-10 w-10 rounded-2xl" />
          </View>
        </View>

        {[
          { title: "Today", items: todayItems },
          { title: "Earlier", items: earlierItems },
        ].map((section) =>
          section.items.length ? (
            <View key={section.title}>
              <Text
                className="mb-3 px-1 text-sm font-semibold"
                style={{ color: theme.text }}
              >
                {section.title}
              </Text>

              <View className="gap-3">
                {section.items.map((item) => (
                  <View
                    key={item.id}
                    className="rounded-3xl border px-4 py-4"
                    style={{
                      borderColor: item.unread ? theme.text : theme.border,
                      backgroundColor: theme.surface,
                    }}
                  >
                    <View className="flex-row items-start gap-3">
                      <View
                        className="h-11 w-11 items-center justify-center rounded-2xl border"
                        style={{
                          borderColor: theme.border,
                          backgroundColor: theme.surfaceMuted,
                        }}
                      >
                        <Ionicons
                          name={getNotificationIcon(item.category)}
                          size={18}
                          color={theme.text}
                        />
                      </View>

                      <View className="flex-1">
                        <View className="flex-row items-start justify-between gap-3">
                          <Text
                            className="flex-1 text-sm font-semibold"
                            style={{ color: theme.text }}
                          >
                            {item.title}
                          </Text>
                          <Text
                            className="text-[11px]"
                            style={{ color: theme.textMuted }}
                          >
                            {item.timeLabel}
                          </Text>
                        </View>

                        <Text
                          className="mt-1 text-sm leading-6"
                          style={{ color: theme.textMuted }}
                        >
                          {item.description}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : null,
        )}
      </ScrollView>
    </Screen>
  );
}
