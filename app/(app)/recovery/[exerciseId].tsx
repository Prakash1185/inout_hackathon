import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { NeonButton } from "@/src/components/NeonButton";
import { Screen } from "@/src/components/Screen";
import {
    recoveryExerciseLibrary,
    type RecoveryArea,
    type RecoveryExercise,
} from "@/src/constants/recovery-ai";
import { useAppTheme } from "@/src/store/ui-store";

function findExercise(exerciseId: string): RecoveryExercise | null {
  for (const area of Object.values(recoveryExerciseLibrary)) {
    const match = area.find((exercise) => exercise.id === exerciseId);
    if (match) {
      return match;
    }
  }

  return null;
}

function findAreaLabel(exercise: RecoveryExercise): string {
  const areaEntry = Object.entries(recoveryExerciseLibrary).find(([, items]) =>
    items.some((item) => item.id === exercise.id),
  );

  return ((areaEntry?.[0] as RecoveryArea | undefined) ?? "knee").replace(
    /^./,
    (char) => char.toUpperCase(),
  );
}

function softCardStyle(theme: ReturnType<typeof useAppTheme>["theme"]) {
  return {
    borderColor: theme.border,
    backgroundColor: theme.surface,
    shadowColor: "#000000",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  } as const;
}

export default function RecoveryExerciseDetailScreen() {
  const { theme } = useAppTheme();
  const { exerciseId } = useLocalSearchParams<{ exerciseId?: string }>();
  const exercise = exerciseId ? findExercise(exerciseId) : null;

  if (!exercise) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-lg font-semibold" style={{ color: theme.text }}>
            Exercise not found
          </Text>
          <Text
            className="mt-2 text-center text-sm"
            style={{ color: theme.textMuted }}
          >
            The exercise link may be invalid or outdated.
          </Text>
          <NeonButton
            label="Back to Recovery AI"
            onPress={() => router.back()}
            variant="secondary"
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingTop: 12,
          paddingBottom: 32,
          gap: 16,
        }}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center rounded-full border"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface,
              shadowColor: "#000000",
              shadowOpacity: 0.04,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 3 },
              elevation: 1,
            }}
          >
            <Ionicons name="arrow-back" size={18} color={theme.text} />
          </Pressable>
          <Text
            className="text-xs font-medium"
            style={{ color: theme.textMuted }}
          >
            Exercise Detail
          </Text>
          <View className="h-11 w-11" />
        </View>

        <View
          className="overflow-hidden rounded-[28px] border"
          style={softCardStyle(theme)}
        >
          <Image
            source={exercise.image}
            className="h-80 w-full"
            contentFit="cover"
          />
          <View className="px-5 py-5">
            <View className="flex-row items-center justify-between gap-3">
              <View
                className="rounded-full border px-3 py-1.5"
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.surfaceMuted,
                }}
              >
                <Text
                  className="text-[11px] font-semibold"
                  style={{ color: theme.text }}
                >
                  {findAreaLabel(exercise)} Recovery
                </Text>
              </View>
              <View
                className="rounded-full border px-3 py-1.5"
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.surfaceMuted,
                }}
              >
                <Text
                  className="text-[11px] font-semibold"
                  style={{ color: theme.text }}
                >
                  Guided
                </Text>
              </View>
            </View>
            <Text
              className="mt-4 text-3xl font-semibold"
              style={{ color: theme.text }}
            >
              {exercise.title}
            </Text>
            <Text className="mt-2 text-sm" style={{ color: theme.textMuted }}>
              {exercise.duration}
            </Text>
            <Text
              className="mt-3 text-sm leading-6"
              style={{ color: theme.textMuted }}
            >
              {exercise.description}
            </Text>
          </View>
        </View>

        <View
          className="rounded-[28px] border px-5 py-5"
          style={softCardStyle(theme)}
        >
          <Text className="text-sm font-semibold" style={{ color: theme.text }}>
            How to do it
          </Text>
          <View className="mt-4 gap-3">
            {exercise.instructions.map((instruction, index) => (
              <View
                key={`${exercise.id}-${index}`}
                className="flex-row gap-3 rounded-2xl border px-4 py-4"
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.surfaceMuted,
                }}
              >
                <View
                  className="h-8 w-8 items-center justify-center rounded-full border"
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.surface,
                  }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: theme.text }}
                  >
                    {index + 1}
                  </Text>
                </View>
                <Text
                  className="flex-1 text-sm leading-6"
                  style={{ color: theme.text }}
                >
                  {instruction}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View
          className="rounded-[28px] border px-5 py-5"
          style={softCardStyle(theme)}
        >
          <Text
            className="text-xs font-semibold"
            style={{ color: theme.textMuted }}
          >
            Posture Check
          </Text>
          <View
            className="mt-3 flex-row items-start gap-3 rounded-2xl border px-4 py-4"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surfaceMuted,
            }}
          >
            <Ionicons name="body-outline" size={20} color={theme.text} />
            <Text
              className="flex-1 text-sm leading-6"
              style={{ color: theme.text }}
            >
              {exercise.postureHint}
            </Text>
          </View>
        </View>

        <View
          className="rounded-[28px] border px-5 py-5"
          style={softCardStyle(theme)}
        >
          <Text
            className="text-xs font-semibold"
            style={{ color: theme.textMuted }}
          >
            Session Format
          </Text>
          <Text
            className="mt-2 text-lg font-semibold"
            style={{ color: theme.text }}
          >
            {exercise.sets} sets • {exercise.reps}
          </Text>
          <Text
            className="mt-2 text-sm leading-6"
            style={{ color: theme.textMuted }}
          >
            Keep the movement slow, controlled, and pain-aware. Stop if symptoms
            worsen.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
