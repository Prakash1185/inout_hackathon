import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
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

const postureCheckMap: Record<
  string,
  { alignment: string[]; mistakes: string[]; breathing: string }
> = {
  Chest: {
    alignment: [
      "Keep shoulder blades retracted and pressed into the surface",
      "Maintain a neutral spine — avoid excessive arching",
      "Elbows should track at roughly 45° from the torso",
    ],
    mistakes: [
      "Flaring elbows out to 90° (places stress on shoulders)",
      "Lifting hips off the bench or floor",
      "Bouncing at the bottom of the movement",
    ],
    breathing: "Inhale on the lowering phase, exhale as you press up",
  },
  Back: {
    alignment: [
      "Keep your chest lifted and shoulders pulled back",
      "Maintain a slight natural arch in the lower back",
      "Engage your core throughout the pulling movement",
    ],
    mistakes: [
      "Rounding the upper back during the pull",
      "Using momentum or jerking the weight",
      "Shrugging shoulders toward the ears",
    ],
    breathing: "Exhale as you pull, inhale as you extend",
  },
  Legs: {
    alignment: [
      "Keep knees tracking over toes — never let them cave inward",
      "Distribute weight evenly through the foot",
      "Maintain an upright torso and proud chest",
    ],
    mistakes: [
      "Letting the knees shoot past the toes excessively",
      "Rounding the lower back at the bottom of the squat",
      "Rising on the toes instead of pushing through heels",
    ],
    breathing: "Inhale as you descend, exhale as you drive up",
  },
  Core: {
    alignment: [
      "Press the lower back firmly into the ground",
      "Keep the ribcage down — avoid flaring",
      "Maintain a neutral neck position throughout",
    ],
    mistakes: [
      "Letting the lower back arch off the floor",
      "Holding breath instead of steady breathing",
      "Pulling on the neck during crunching movements",
    ],
    breathing: "Exhale on the contraction, inhale on the release",
  },
  Shoulders: {
    alignment: [
      "Keep shoulders packed down and away from ears",
      "Maintain a neutral wrist position",
      "Engage your core to stabilize the torso",
    ],
    mistakes: [
      "Shrugging the shoulders during pressing",
      "Using excessive weight that compromises form",
      "Arching the back to compensate for weak shoulders",
    ],
    breathing: "Exhale as you press overhead, inhale as you lower",
  },
  Arms: {
    alignment: [
      "Keep elbows pinned to your sides for curls",
      "Maintain a stable shoulder position throughout",
      "Use a full range of motion on every rep",
    ],
    mistakes: [
      "Swinging the body to generate momentum",
      "Only doing partial reps",
      "Gripping too tightly — keep wrists neutral",
    ],
    breathing: "Exhale on the contraction, inhale on the eccentric",
  },
  "Full Body": {
    alignment: [
      "Maintain a straight line from head to heels in plank positions",
      "Land softly with bent knees during jumps",
      "Keep your core braced throughout transitions",
    ],
    mistakes: [
      "Sacrificing form for speed",
      "Forgetting to breathe during intense circuits",
      "Letting the hips sag during plank transitions",
    ],
    breathing:
      "Match your breathing to the movement rhythm — exhale on effort",
  },
};

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

  const postureCheck =
    postureCheckMap[exercise.primaryTarget] ??
    postureCheckMap["Full Body"];

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
          <View
            className="overflow-hidden rounded-[28px] border px-4 py-5"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surfaceMuted,
            }}
          >
            <Image
              source={exercise.image}
              contentFit="cover"
              style={{
                alignSelf: "center",
                width: 256,
                height: 256,
                borderRadius: 24,
                backgroundColor: theme.surface,
              }}
            />

            <View className="mt-5 items-center">
              <Text
                className="rounded-full px-3 py-1 text-[11px] font-semibold"
                style={{ color: "#FFFFFF", backgroundColor: theme.accent }}
              >
                {exercise.primaryTarget}
              </Text>
              <Text
                className="mt-4 text-center text-2xl font-bold"
                style={{ color: theme.text }}
              >
                {exercise.title}
              </Text>
              <Text
                className="mt-2 text-center text-sm leading-6"
                style={{ color: theme.textMuted }}
              >
                {exercise.description}
              </Text>
            </View>
          </View>

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
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surfaceMuted,
            }}
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

          {/* Posture Check Section */}
          <View
            className="mt-4 rounded-2xl border p-3"
            style={{
              borderColor: theme.accent,
              backgroundColor: theme.surfaceMuted,
            }}
          >
            <View className="flex-row items-center gap-2">
              <View
                className="h-7 w-7 items-center justify-center rounded-lg"
                style={{ backgroundColor: theme.accent }}
              >
                <Ionicons name="body-outline" size={14} color="#FFFFFF" />
              </View>
              <Text
                className="text-sm font-semibold"
                style={{ color: theme.text }}
              >
                Posture Check
              </Text>
            </View>

            <Text
              className="mt-3 text-xs font-semibold uppercase tracking-widest"
              style={{ color: theme.accent }}
            >
              Alignment
            </Text>
            <View className="mt-2 gap-2">
              {postureCheck.alignment.map((tip) => (
                <View key={tip} className="flex-row items-start gap-2">
                  <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color={theme.accent}
                    style={{ marginTop: 2 }}
                  />
                  <Text
                    className="flex-1 text-sm leading-5"
                    style={{ color: theme.text }}
                  >
                    {tip}
                  </Text>
                </View>
              ))}
            </View>

            <Text
              className="mt-4 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#F87171" }}
            >
              Common Mistakes
            </Text>
            <View className="mt-2 gap-2">
              {postureCheck.mistakes.map((mistake) => (
                <View key={mistake} className="flex-row items-start gap-2">
                  <Ionicons
                    name="close-circle"
                    size={14}
                    color="#F87171"
                    style={{ marginTop: 2 }}
                  />
                  <Text
                    className="flex-1 text-sm leading-5"
                    style={{ color: theme.text }}
                  >
                    {mistake}
                  </Text>
                </View>
              ))}
            </View>

            <View
              className="mt-4 rounded-xl border px-3 py-3"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surface,
              }}
            >
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name="fitness-outline"
                  size={14}
                  color={theme.accent}
                />
                <Text
                  className="text-xs font-semibold"
                  style={{ color: theme.textMuted }}
                >
                  Breathing Pattern
                </Text>
              </View>
              <Text
                className="mt-1 text-sm font-medium"
                style={{ color: theme.text }}
              >
                {postureCheck.breathing}
              </Text>
            </View>
          </View>

          <View
            className="mt-4 rounded-2xl border p-3"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surfaceMuted,
            }}
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
