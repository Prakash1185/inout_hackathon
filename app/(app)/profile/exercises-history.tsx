import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Screen } from "@/src/components/Screen";
import { useAppTheme } from "@/src/store/ui-store";

const historyItems = [
  {
    id: "h-1",
    exercise: "Incline Dumbbell Press",
    muscle: "Chest",
    completedAt: "Today, 6:40 PM",
    sets: "4 sets x 10 reps",
  },
  {
    id: "h-2",
    exercise: "Seated Cable Row",
    muscle: "Back",
    completedAt: "Yesterday, 8:10 PM",
    sets: "4 sets x 12 reps",
  },
  {
    id: "h-3",
    exercise: "Romanian Deadlift",
    muscle: "Hamstrings",
    completedAt: "Mon, 7:25 PM",
    sets: "3 sets x 8 reps",
  },
  {
    id: "h-4",
    exercise: "Shoulder Press",
    muscle: "Shoulders",
    completedAt: "Sun, 5:50 PM",
    sets: "4 sets x 10 reps",
  },
];

export default function ExercisesHistoryScreen() {
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
            Exercise History
          </Text>
        </View>

        <Text className="mt-2 text-sm" style={{ color: theme.textMuted }}>
          All completed workouts with quick details.
        </Text>

        <View className="mt-5 gap-3">
          {historyItems.map((item) => (
            <View
              key={item.id}
              className="rounded-3xl border p-3"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surface,
              }}
            >
              <View className="flex-row items-center gap-3">
                <View
                  className="h-16 w-16 rounded-2xl border"
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.surfaceMuted,
                  }}
                />

                <View className="flex-1">
                  <Text
                    className="text-base font-semibold"
                    style={{ color: theme.text }}
                  >
                    {item.exercise}
                  </Text>
                  <Text
                    className="mt-1 text-sm"
                    style={{ color: theme.textMuted }}
                  >
                    Muscle: {item.muscle}
                  </Text>
                  <Text className="text-sm" style={{ color: theme.textMuted }}>
                    {item.sets}
                  </Text>
                  <Text
                    className="mt-1 text-xs"
                    style={{ color: theme.textMuted }}
                  >
                    {item.completedAt}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
