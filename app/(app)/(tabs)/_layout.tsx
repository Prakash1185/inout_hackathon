import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { useAppTheme } from "@/src/store/ui-store";

export default function TabsLayout() {
  const { theme } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 0.8,
          height: 66,
          paddingTop: 2,
          paddingBottom: 9,
        },
        tabBarItemStyle: {
          borderRadius: "100%",
          marginHorizontal: 2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        // tabBarActiveBackgroundColor: theme.surfaceMuted,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textMuted,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="feed"
        options={{
          title: "Feed",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai-trainer"
        options={{
          title: "AI Trainer",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="start"
        options={{
          title: "Start",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="person-walking" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
