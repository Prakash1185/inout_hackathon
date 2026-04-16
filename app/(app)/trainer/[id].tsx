import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Screen } from "@/src/components/Screen";
import { getExerciseById } from "@/src/constants/ai-trainer";
import { useAppTheme } from "@/src/store/ui-store";

function parseNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.round(parsed);
}

export default function TrainerExerciseDetailScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const params = useLocalSearchParams<{
    id?: string;
    sets?: string;
    reps?: string;
    restSec?: string;
    durationSec?: string;
    xpReward?: string;
    note?: string;
  }>();

  const exercise = params.id ? getExerciseById(params.id) : undefined;

  if (!exercise) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-lg font-semibold" style={{ color: theme.text }}>
            Exercise not found
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

  const configuredSets = parseNumber(params.sets, exercise.defaultSets);
  const configuredReps = parseNumber(params.reps, exercise.defaultReps);
  const configuredRest = parseNumber(params.restSec, exercise.restSec);
  const configuredDuration = parseNumber(
    params.durationSec,
    configuredSets * 60,
  );
  const configuredXp = parseNumber(params.xpReward, exercise.xpBase);

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
            Exercise Detail
          </Text>

          <View className="h-10 w-10" />
        </View>

        <View
          className="mt-4 rounded-3xl border p-4"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold" style={{ color: theme.text }}>
              {exercise.title}
            </Text>
            <Text
              className="rounded-full px-2 py-1 text-[10px] font-semibold"
              style={{ color: "#FFFFFF", backgroundColor: theme.accent }}
            >
              {exercise.primaryTarget}
            </Text>
          </View>

          <Text className="mt-2 text-sm" style={{ color: theme.textMuted }}>
            {exercise.description}
          </Text>

          <View className="mt-4 flex-row flex-wrap gap-2">
            <View
              className="rounded-xl border px-3 py-2"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: theme.text }}
              >
                {configuredSets} sets
              </Text>
            </View>
            <View
              className="rounded-xl border px-3 py-2"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: theme.text }}
              >
                {configuredReps} reps
              </Text>
            </View>
            <View
              className="rounded-xl border px-3 py-2"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: theme.text }}
              >
                Rest {configuredRest}s
              </Text>
            </View>
            <View
              className="rounded-xl border px-3 py-2"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: theme.text }}
              >
                {configuredDuration}s block
              </Text>
            </View>
            <View
              className="rounded-xl border px-3 py-2"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: theme.accent }}
              >
                +{configuredXp} XP
              </Text>
            </View>
          </View>

          <View
            className="mt-5 rounded-2xl border p-3"
            style={{ borderColor: theme.border }}
          >
            <Text
              className="text-sm font-semibold"
              style={{ color: theme.text }}
            >
              How To Perform
            </Text>
            <View className="mt-2 gap-2">
              {exercise.instructions.map((step, index) => (
                <View key={step} className="flex-row gap-2">
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: theme.accent }}
                  >
                    {index + 1}.
                  </Text>
                  <Text
                    className="flex-1 text-sm"
                    style={{ color: theme.text }}
                  >
                    {step}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View
            className="mt-4 rounded-2xl border p-3"
            style={{ borderColor: theme.border }}
          >
            <Text className="text-xs" style={{ color: theme.textMuted }}>
              Equipment
            </Text>
            <Text
              className="mt-1 text-sm font-semibold"
              style={{ color: theme.text }}
            >
              {exercise.equipment}
            </Text>

            <Text className="mt-3 text-xs" style={{ color: theme.textMuted }}>
              Tempo
            </Text>
            <Text
              className="mt-1 text-sm font-semibold"
              style={{ color: theme.text }}
            >
              {exercise.tempo}
            </Text>

            {params.note ? (
              <>
                <Text
                  className="mt-3 text-xs"
                  style={{ color: theme.textMuted }}
                >
                  Coach note
                </Text>
                <Text className="mt-1 text-sm" style={{ color: theme.text }}>
                  {params.note}
                </Text>
              </>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
