import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { NeonButton } from "@/src/components/NeonButton";
import { Screen } from "@/src/components/Screen";
import {
    buildTrainerPlan,
    getLevelProgress,
    type GeneratedExercise,
    type MuscleTarget,
    type TrainerIconName,
} from "@/src/constants/ai-trainer";
import { useAuthStore } from "@/src/store/auth-store";
import { useAppTheme } from "@/src/store/ui-store";

const targetOptions: MuscleTarget[] = [
  "Full Body",
  "Chest",
  "Back",
  "Legs",
  "Core",
  "Shoulders",
  "Arms",
];

function toInt(value: string, fallback: number) {
  const cleaned = value.replace(/[^0-9]/g, "");
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

function getCardState(
  exercise: GeneratedExercise,
  currentExercise: GeneratedExercise | undefined,
  completedIds: string[],
) {
  if (completedIds.includes(exercise.planId)) {
    return "Completed";
  }
  if (currentExercise?.planId === exercise.planId) {
    return "Current";
  }
  return "Queued";
}

export default function AiTrainerScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [targetMuscle, setTargetMuscle] = useState<MuscleTarget>("Full Body");
  const [minutesInput, setMinutesInput] = useState("28");
  const [repetitionsInput, setRepetitionsInput] = useState("12");
  const [extraContext, setExtraContext] = useState("");

  const [plan, setPlan] = useState<GeneratedExercise[]>([]);
  const [isStarted, setIsStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [sessionXp, setSessionXp] = useState(0);

  const levelState = getLevelProgress(user);

  useEffect(() => {
    setPlan(
      buildTrainerPlan({
        targetMuscle,
        minutes: toInt(minutesInput, 28),
        repetitions: toInt(repetitionsInput, 12),
        extraContext,
      }),
    );
  }, []);

  const currentExercise = plan[currentStep];
  const currentStepDone =
    currentExercise && completedIds.includes(currentExercise.planId);

  const totalPlanXp = useMemo(
    () => plan.reduce((sum, item) => sum + item.xpReward, 0),
    [plan],
  );
  const estimatedMinutes = useMemo(
    () =>
      Math.round(plan.reduce((sum, item) => sum + item.durationSec, 0) / 60),
    [plan],
  );
  const completionRatio =
    plan.length === 0 ? 0 : completedIds.length / Math.max(plan.length, 1);

  const regeneratePlan = () => {
    const next = buildTrainerPlan({
      targetMuscle,
      minutes: toInt(minutesInput, 28),
      repetitions: toInt(repetitionsInput, 12),
      extraContext,
    });
    setPlan(next);
    setCurrentStep(0);
    setCompletedIds([]);
    setSessionXp(0);
    setIsStarted(false);
  };

  const startPlan = () => {
    if (plan.length === 0) {
      regeneratePlan();
      return;
    }
    setIsStarted(true);
  };

  const completeCurrentStep = () => {
    if (!currentExercise || completedIds.includes(currentExercise.planId)) {
      return;
    }

    setCompletedIds((prev) => [...prev, currentExercise.planId]);
    setSessionXp((prev) => prev + currentExercise.xpReward);

    if (user) {
      let xp = user.xp + currentExercise.xpReward;
      let level = user.level;
      let nextLevelXp =
        user.nextLevelXp ?? Math.max(user.xp + 200, user.level * 250);

      while (xp >= nextLevelXp) {
        level += 1;
        nextLevelXp += 250;
      }

      setUser({
        ...user,
        xp,
        level,
        nextLevelXp,
      });
    }
  };

  const advanceStep = () => {
    if (currentStep >= plan.length - 1) {
      setIsStarted(false);
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, plan.length - 1));
  };

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 36 }}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-[30px] font-bold" style={{ color: theme.text }}>
            AI Trainer
          </Text>
          <View
            className="rounded-full border px-3 py-1"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: theme.textMuted }}
            >
              Level {levelState.level}
            </Text>
          </View>
        </View>

        <Text className="mt-1 text-sm" style={{ color: theme.textMuted }}>
          Build a personalized plan from your context and train step-by-step.
        </Text>

        <View
          className="mt-4 rounded-2xl border p-4"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          <Text
            className="text-base font-semibold"
            style={{ color: theme.text }}
          >
            Context Form
          </Text>

          <Text
            className="mt-3 text-xs font-semibold"
            style={{ color: theme.textMuted }}
          >
            Target Muscle
          </Text>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {targetOptions.map((option) => {
              const active = option === targetMuscle;
              return (
                <Pressable
                  key={option}
                  className="rounded-full border px-3 py-2"
                  style={{
                    borderColor: active ? theme.accent : theme.border,
                    backgroundColor: active ? theme.accent : theme.surfaceMuted,
                  }}
                  onPress={() => setTargetMuscle(option)}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: active ? "#FFFFFF" : theme.textMuted }}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className="mt-4 flex-row gap-3">
            <View className="flex-1">
              <Text
                className="text-xs font-semibold"
                style={{ color: theme.textMuted }}
              >
                Time (minutes)
              </Text>
              <TextInput
                value={minutesInput}
                onChangeText={setMinutesInput}
                keyboardType="numeric"
                className="mt-2 rounded-xl border px-3 py-2"
                placeholder="e.g. 30"
                placeholderTextColor={theme.textMuted}
                style={{ borderColor: theme.border, color: theme.text }}
              />
            </View>

            <View className="flex-1">
              <Text
                className="text-xs font-semibold"
                style={{ color: theme.textMuted }}
              >
                Repetition Goal
              </Text>
              <TextInput
                value={repetitionsInput}
                onChangeText={setRepetitionsInput}
                keyboardType="numeric"
                className="mt-2 rounded-xl border px-3 py-2"
                placeholder="e.g. 12"
                placeholderTextColor={theme.textMuted}
                style={{ borderColor: theme.border, color: theme.text }}
              />
            </View>
          </View>

          <Text
            className="mt-4 text-xs font-semibold"
            style={{ color: theme.textMuted }}
          >
            Extra Context
          </Text>
          <TextInput
            value={extraContext}
            onChangeText={setExtraContext}
            multiline
            textAlignVertical="top"
            className="mt-2 rounded-xl border px-3 py-3"
            placeholder="Any injury notes, available equipment, preferred pace, or constraints"
            placeholderTextColor={theme.textMuted}
            style={{
              borderColor: theme.border,
              color: theme.text,
              minHeight: 86,
            }}
          />

          <View className="mt-4 flex-row gap-3">
            <View className="flex-1">
              <NeonButton label="Generate Plan" onPress={regeneratePlan} />
            </View>
            <View className="flex-1">
              <NeonButton
                label={isStarted ? "Plan Running" : "Start Plan"}
                onPress={startPlan}
                disabled={isStarted || plan.length === 0}
                variant="secondary"
              />
            </View>
          </View>
        </View>

        <View
          className="mt-4 rounded-2xl border p-4"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          <View className="flex-row items-center justify-between">
            <Text
              className="text-base font-semibold"
              style={{ color: theme.text }}
            >
              Mission Board
            </Text>
            <Text className="text-xs" style={{ color: theme.textMuted }}>
              {completedIds.length}/{plan.length} done
            </Text>
          </View>

          <View className="mt-3 flex-row gap-2">
            <View
              className="flex-1 rounded-xl border p-3"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <Text className="text-[11px]" style={{ color: theme.textMuted }}>
                Session XP
              </Text>
              <Text
                className="mt-1 text-lg font-bold"
                style={{ color: theme.text }}
              >
                +{sessionXp}
              </Text>
            </View>
            <View
              className="flex-1 rounded-xl border p-3"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <Text className="text-[11px]" style={{ color: theme.textMuted }}>
                Total Plan XP
              </Text>
              <Text
                className="mt-1 text-lg font-bold"
                style={{ color: theme.text }}
              >
                {totalPlanXp}
              </Text>
            </View>
            <View
              className="flex-1 rounded-xl border p-3"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <Text className="text-[11px]" style={{ color: theme.textMuted }}>
                Est. Time
              </Text>
              <Text
                className="mt-1 text-lg font-bold"
                style={{ color: theme.text }}
              >
                {estimatedMinutes}m
              </Text>
            </View>
          </View>

          <View className="mt-3">
            <View
              className="h-2 overflow-hidden rounded-full"
              style={{ backgroundColor: theme.surfaceMuted }}
            >
              <View
                className="h-2 rounded-full"
                style={{
                  backgroundColor: theme.accent,
                  width: `${Math.max(4, Math.round(completionRatio * 100))}%`,
                }}
              />
            </View>
            <Text className="mt-2 text-xs" style={{ color: theme.textMuted }}>
              Gamified progression updates each completed step.
            </Text>
          </View>
        </View>

        {isStarted && currentExercise ? (
          <View
            className="mt-4 rounded-2xl border p-4"
            style={{
              borderColor: theme.accent,
              backgroundColor: theme.surface,
            }}
          >
            <Text
              className="text-sm font-semibold"
              style={{ color: theme.accent }}
            >
              Live Step Tracker
            </Text>
            <Text
              className="mt-2 text-xl font-bold"
              style={{ color: theme.text }}
            >
              Step {currentStep + 1}: {currentExercise.title}
            </Text>
            <Text className="mt-1 text-sm" style={{ color: theme.textMuted }}>
              {currentExercise.sets} sets x {currentExercise.reps} reps | Rest{" "}
              {currentExercise.restSec}s
            </Text>

            <Text className="mt-2 text-sm" style={{ color: theme.text }}>
              {currentExercise.coachNote}
            </Text>

            <View className="mt-4 flex-row gap-3">
              {!currentStepDone ? (
                <View className="flex-1">
                  <NeonButton
                    label={`Complete Step +${currentExercise.xpReward} XP`}
                    onPress={completeCurrentStep}
                  />
                </View>
              ) : (
                <View className="flex-1">
                  <NeonButton
                    label={
                      currentStep === plan.length - 1
                        ? "Finish Plan"
                        : "Next Step"
                    }
                    onPress={advanceStep}
                  />
                </View>
              )}
            </View>
          </View>
        ) : null}

        <View className="mt-5 gap-3">
          {plan.map((exercise) => {
            const state = getCardState(exercise, currentExercise, completedIds);
            const iconName = exercise.icon as TrainerIconName;

            return (
              <Pressable
                key={exercise.planId}
                className="rounded-2xl border px-3 py-3"
                style={{
                  borderColor:
                    state === "Current" ? theme.accent : theme.border,
                  backgroundColor: theme.surface,
                }}
                onPress={() =>
                  router.push({
                    pathname: "/(app)/trainer/[id]",
                    params: {
                      id: exercise.exerciseId,
                      sets: String(exercise.sets),
                      reps: String(exercise.reps),
                      restSec: String(exercise.restSec),
                      durationSec: String(exercise.durationSec),
                      xpReward: String(exercise.xpReward),
                      note: exercise.coachNote,
                    },
                  })
                }
              >
                <View className="flex-row items-center gap-3">
                  <View
                    className="h-14 w-14 items-center justify-center rounded-xl"
                    style={{ backgroundColor: theme.surfaceMuted }}
                  >
                    <Ionicons
                      name={iconName}
                      size={24}
                      color={
                        state === "Current" ? theme.accent : theme.textMuted
                      }
                    />
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text
                        className="text-base font-semibold"
                        style={{ color: theme.text }}
                      >
                        {exercise.title}
                      </Text>
                      <Text
                        className="rounded-full px-2 py-1 text-[10px] font-semibold"
                        style={{
                          color:
                            state === "Current" ? "#FFFFFF" : theme.textMuted,
                          backgroundColor:
                            state === "Current"
                              ? theme.accent
                              : theme.surfaceMuted,
                        }}
                      >
                        {state}
                      </Text>
                    </View>

                    <Text
                      className="mt-1 text-xs"
                      style={{ color: theme.textMuted }}
                    >
                      {exercise.primaryTarget} | {exercise.difficulty}
                    </Text>

                    <View className="mt-2 flex-row items-center justify-between">
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: theme.text }}
                      >
                        {exercise.sets} sets x {exercise.reps} reps
                      </Text>
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: theme.accent }}
                      >
                        +{exercise.xpReward} XP
                      </Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}
