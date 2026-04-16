import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Screen } from "@/src/components/Screen";
import { useAppTheme } from "@/src/store/ui-store";

const earnedBadges = [
  { id: "b-1", name: "Starter", rule: "First workout completed" },
  { id: "b-2", name: "Streak", rule: "7 day active streak" },
  { id: "b-3", name: "Pacer", rule: "25 km total distance" },
  { id: "b-4", name: "Steady", rule: "10 sessions in a month" },
];

const lockedBadges = [
  { id: "l-1", name: "Titan", rule: "40 completed sessions" },
  { id: "l-2", name: "Iron Heart", rule: "14 day streak" },
];

function BadgeCard({
  name,
  rule,
  locked,
}: {
  name: string;
  rule: string;
  locked?: boolean;
}) {
  const { theme } = useAppTheme();

  return (
    <View
      className="w-[48%] rounded-3xl border p-3"
      style={{
        borderColor: theme.border,
        backgroundColor: theme.surface,
        opacity: locked ? 0.72 : 1,
      }}
    >
      <View className="flex-row items-center gap-2">
        <View
          className="h-10 w-10 items-center justify-center rounded-full border"
          style={{
            borderColor: theme.border,
            backgroundColor: theme.surfaceMuted,
          }}
        >
          <Ionicons
            name={locked ? "lock-closed" : "checkmark"}
            size={16}
            color={locked ? theme.textMuted : theme.accent}
          />
        </View>

        <View className="flex-1">
          <Text className="text-sm font-semibold" style={{ color: theme.text }}>
            {name}
          </Text>
          <Text className="text-xs" style={{ color: theme.textMuted }}>
            {rule}
          </Text>
        </View>
      </View>

      {locked ? (
        <View
          className="mt-3 self-start rounded-xl border px-3 py-1"
          style={{ borderColor: theme.accent, backgroundColor: theme.accent }}
        >
          <Text className="text-xs font-semibold" style={{ color: "#FFFFFF" }}>
            Lock
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default function BadgesEarnedScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        <View className="flex-row items-center gap-3">
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

          <Text
            className="text-2xl font-semibold"
            style={{ color: theme.text }}
          >
            Badges
          </Text>
        </View>

        <Text className="mt-2 text-sm" style={{ color: theme.textMuted }}>
          Earned and locked badges in one place.
        </Text>

        <Text
          className="mt-5 text-xl font-semibold"
          style={{ color: theme.text }}
        >
          Earned
        </Text>
        <View className="mt-3 flex-row flex-wrap gap-3">
          {earnedBadges.map((badge) => (
            <BadgeCard key={badge.id} name={badge.name} rule={badge.rule} />
          ))}
        </View>

        <Text
          className="mt-6 text-xl font-semibold"
          style={{ color: theme.text }}
        >
          Locked
        </Text>
        <View className="mt-3 flex-row flex-wrap gap-3">
          {lockedBadges.map((badge) => (
            <BadgeCard
              key={badge.id}
              name={badge.name}
              rule={badge.rule}
              locked
            />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
