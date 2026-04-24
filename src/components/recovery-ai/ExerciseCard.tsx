import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

import type { RecoveryExercise } from "@/src/constants/recovery-ai";
import { useAppTheme } from "@/src/store/ui-store";

export function ExerciseCard({
  exercise,
  onPress,
}: {
  exercise: RecoveryExercise;
  onPress: () => void;
}) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      className="rounded-3xl border px-4 py-4"
      style={({ pressed }) => ({
        borderColor: theme.border,
        backgroundColor: theme.surface,
        shadowColor: "#000000",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <View className="flex-row items-start gap-3">
        <Image
          source={exercise.image}
          className="h-20 w-20 rounded-2xl border"
          contentFit="cover"
        />
        <View className="flex-1">
          <View className="flex-row items-center justify-between gap-2">
            <Text
              className="text-[11px] font-medium"
              style={{ color: theme.textMuted }}
            >
              Recovery move
            </Text>
            <View
              className="rounded-full border px-2.5 py-1"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <Text
                className="text-[10px] font-semibold"
                style={{ color: theme.text }}
              >
                Details
              </Text>
            </View>
          </View>
          <Text
            className="mt-1 text-base font-semibold"
            style={{ color: theme.text }}
          >
            {exercise.title}
          </Text>
          <Text className="mt-1 text-xs" style={{ color: theme.textMuted }}>
            {exercise.duration}
          </Text>
          <Text
            className="mt-2 text-sm leading-5"
            style={{ color: theme.textMuted }}
          >
            {exercise.description}
          </Text>
        </View>
        <View className="pt-1">
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        </View>
      </View>
    </Pressable>
  );
}
