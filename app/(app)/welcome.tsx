import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

import { NeonButton } from "@/src/components/NeonButton";
import { Screen } from "@/src/components/Screen";
import { updateProfile } from "@/src/services/user.service";
import { useAuthStore } from "@/src/store/auth-store";
import {
    type OnboardingGender,
    useOnboardingStore,
} from "@/src/store/onboarding-store";
import { useAppTheme, useUiStore } from "@/src/store/ui-store";

type FormState = {
  name: string;
  age: string;
  gender: OnboardingGender;
  heightCm: string;
  weightKg: string;
  goal: string;
};

const stepMeta = [
  {
    title: "Tell us about you",
    description:
      "Starter profile setup helps us personalize your zones, challenges, and daily targets.",
  },
  {
    title: "Body metrics",
    description:
      "These basics let us estimate effort and keep your fitness progress meaningful.",
  },
  {
    title: "Your goal",
    description:
      "Set your current fitness target so your app journey starts with the right intent.",
  },
];

const goalOptions = [
  "Lose body fat",
  "Build muscle",
  "Improve endurance",
  "Stay active daily",
];

const genderOptions: OnboardingGender[] = [
  "Male",
  "Female",
  "Non-binary",
  "Prefer not to say",
];

function parsePositiveInteger(value: string): number | null {
  const parsed = Number(value.trim());
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.round(parsed);
}

export default function WelcomeScreen() {
  const { theme } = useAppTheme();
  const completeOnboarding = useUiStore((state) => state.completeOnboarding);
  const completeOnboardingForUser = useUiStore(
    (state) => state.completeOnboardingForUser,
  );
  const identity = useAuthStore((state) => state.identity);
  const authUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const setOnboardingProfile = useOnboardingStore((state) => state.setProfile);
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    name: authUser?.name ?? "",
    age: "",
    gender: "Prefer not to say",
    heightCm: "",
    weightKg: "",
    goal: "Stay active daily",
  });

  const updateNameMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updated) => {
      if (authUser) {
        setUser({ ...authUser, ...updated });
      }
      queryClient.setQueryData(["profile"], updated);
    },
  });

  const item = stepMeta[step];
  const isLastStep = step === stepMeta.length - 1;

  const canContinue = useMemo(() => {
    if (step === 0) {
      return (
        form.name.trim().length >= 2 &&
        parsePositiveInteger(form.age) !== null &&
        Boolean(form.gender)
      );
    }

    if (step === 1) {
      return (
        parsePositiveInteger(form.heightCm) !== null &&
        parsePositiveInteger(form.weightKg) !== null
      );
    }

    return form.goal.trim().length >= 3;
  }, [form, step]);

  function onChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validateStep(): boolean {
    if (step === 0) {
      if (form.name.trim().length < 2) {
        Alert.alert("Name required", "Please enter your full name.");
        return false;
      }

      const age = parsePositiveInteger(form.age);
      if (age === null || age < 10 || age > 99) {
        Alert.alert(
          "Invalid age",
          "Please enter a valid age between 10 and 99.",
        );
        return false;
      }
    }

    if (step === 1) {
      const height = parsePositiveInteger(form.heightCm);
      const weight = parsePositiveInteger(form.weightKg);

      if (height === null || height < 80 || height > 260) {
        Alert.alert("Invalid height", "Please enter height in cm (80 - 260).");
        return false;
      }

      if (weight === null || weight < 25 || weight > 350) {
        Alert.alert(
          "Invalid weight",
          "Please enter body weight in kg (25 - 350).",
        );
        return false;
      }
    }

    if (step === 2 && form.goal.trim().length < 3) {
      Alert.alert("Goal required", "Please add your current fitness goal.");
      return false;
    }

    return true;
  }

  async function finishOnboarding() {
    const age = parsePositiveInteger(form.age);
    const heightCm = parsePositiveInteger(form.heightCm);
    const weightKg = parsePositiveInteger(form.weightKg);

    if (!age || !heightCm || !weightKg) {
      Alert.alert("Missing details", "Please complete all required fields.");
      return;
    }

    const trimmedName = form.name.trim();

    setOnboardingProfile({
      name: trimmedName,
      age,
      gender: form.gender,
      heightCm,
      weightKg,
      goal: form.goal.trim(),
    });

    if (authUser && trimmedName && trimmedName !== authUser.name) {
      try {
        await updateNameMutation.mutateAsync({ name: trimmedName });
      } catch {
        // Name sync failure should not block onboarding completion.
      }
    }

    if (identity?.clerkUserId) {
      completeOnboardingForUser(identity.clerkUserId);
    } else {
      completeOnboarding();
    }
    router.replace("/(app)/(tabs)/home");
  }

  function onPrimaryPress() {
    if (!validateStep()) {
      return;
    }

    if (isLastStep) {
      finishOnboarding().catch(() => undefined);
      return;
    }

    setStep((prev) => Math.min(prev + 1, stepMeta.length - 1));
  }

  function onSkip() {
    if (identity?.clerkUserId) {
      completeOnboardingForUser(identity.clerkUserId);
    } else {
      completeOnboarding();
    }
    router.replace("/(app)/(tabs)/home");
  }

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 20,
          paddingBottom: 30,
          gap: 18,
          backgroundColor: theme.background,
        }}
      >
        <View>
          <Text
            className="text-xs uppercase tracking-[2px]"
            style={{ color: theme.textMuted }}
          >
            Terranova
          </Text>
          <Text
            className="mt-2 text-3xl font-semibold"
            style={{ color: theme.text }}
          >
            Let&apos;s set your fitness context
          </Text>
          <Text
            className="mt-2 text-sm leading-6"
            style={{ color: theme.textMuted }}
          >
            Quick starter setup in 3 simple screens. This helps us tailor your
            map, goals, and challenge recommendations.
          </Text>
        </View>

        <View className="flex-row gap-2">
          {stepMeta.map((_, index) => (
            <View
              key={`step-${index}`}
              className="h-2 flex-1 rounded-full"
              style={{
                backgroundColor:
                  index <= step ? theme.accent : theme.surfaceMuted,
              }}
            />
          ))}
        </View>

        <View
          className="rounded-3xl border px-5 py-6"
          style={{ backgroundColor: theme.surface, borderColor: theme.border }}
        >
          <Text
            className="text-2xl font-semibold"
            style={{ color: theme.text }}
          >
            {item.title}
          </Text>
          <Text
            className="mt-2 text-sm leading-6"
            style={{ color: theme.textMuted }}
          >
            {item.description}
          </Text>

          {step === 0 ? (
            <View className="mt-6 gap-4">
              <View>
                <Text
                  className="mb-2 text-xs font-semibold"
                  style={{ color: theme.textMuted }}
                >
                  Name
                </Text>
                <TextInput
                  value={form.name}
                  onChangeText={(value) => onChange("name", value)}
                  placeholder="Enter your name"
                  placeholderTextColor={theme.textMuted}
                  className="rounded-2xl border px-4 py-4"
                  style={{ borderColor: theme.border, color: theme.text }}
                />
              </View>

              <View>
                <Text
                  className="mb-2 text-xs font-semibold"
                  style={{ color: theme.textMuted }}
                >
                  Age
                </Text>
                <TextInput
                  value={form.age}
                  onChangeText={(value) => onChange("age", value)}
                  keyboardType="number-pad"
                  placeholder="Enter your age"
                  placeholderTextColor={theme.textMuted}
                  className="rounded-2xl border px-4 py-4"
                  style={{ borderColor: theme.border, color: theme.text }}
                />
              </View>

              <View>
                <Text
                  className="mb-2 text-xs font-semibold"
                  style={{ color: theme.textMuted }}
                >
                  Gender
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {genderOptions.map((option) => {
                    const active = form.gender === option;
                    return (
                      <Pressable
                        key={option}
                        className="rounded-2xl border px-4 py-3"
                        style={{
                          borderColor: active ? theme.accent : theme.border,
                          backgroundColor: active
                            ? theme.accent
                            : theme.surface,
                        }}
                        onPress={() => onChange("gender", option)}
                      >
                        <Text
                          className="text-xs font-semibold"
                          style={{ color: active ? "#FFFFFF" : theme.text }}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>
          ) : null}

          {step === 1 ? (
            <View className="mt-6 gap-4">
              <View>
                <Text
                  className="mb-2 text-xs font-semibold"
                  style={{ color: theme.textMuted }}
                >
                  Height (cm)
                </Text>
                <TextInput
                  value={form.heightCm}
                  onChangeText={(value) => onChange("heightCm", value)}
                  keyboardType="number-pad"
                  placeholder="e.g. 172"
                  placeholderTextColor={theme.textMuted}
                  className="rounded-2xl border px-4 py-4"
                  style={{ borderColor: theme.border, color: theme.text }}
                />
              </View>

              <View>
                <Text
                  className="mb-2 text-xs font-semibold"
                  style={{ color: theme.textMuted }}
                >
                  Body weight (kg)
                </Text>
                <TextInput
                  value={form.weightKg}
                  onChangeText={(value) => onChange("weightKg", value)}
                  keyboardType="number-pad"
                  placeholder="e.g. 70"
                  placeholderTextColor={theme.textMuted}
                  className="rounded-2xl border px-4 py-4"
                  style={{ borderColor: theme.border, color: theme.text }}
                />
              </View>
            </View>
          ) : null}

          {step === 2 ? (
            <View className="mt-6 gap-4">
              <View>
                <Text
                  className="mb-2 text-xs font-semibold"
                  style={{ color: theme.textMuted }}
                >
                  Goal presets
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {goalOptions.map((option) => {
                    const active = form.goal === option;
                    return (
                      <Pressable
                        key={option}
                        className="rounded-2xl border px-4 py-3"
                        style={{
                          borderColor: active ? theme.accent : theme.border,
                          backgroundColor: active
                            ? theme.accent
                            : theme.surface,
                        }}
                        onPress={() => onChange("goal", option)}
                      >
                        <Text
                          className="text-xs font-semibold"
                          style={{ color: active ? "#FFFFFF" : theme.text }}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View>
                <Text
                  className="mb-2 text-xs font-semibold"
                  style={{ color: theme.textMuted }}
                >
                  Your current goal
                </Text>
                <TextInput
                  value={form.goal}
                  onChangeText={(value) => onChange("goal", value)}
                  placeholder="e.g. Lose fat and improve stamina"
                  placeholderTextColor={theme.textMuted}
                  multiline
                  textAlignVertical="top"
                  className="rounded-2xl border px-4 py-4"
                  style={{
                    borderColor: theme.border,
                    color: theme.text,
                    minHeight: 110,
                  }}
                />
              </View>
            </View>
          ) : null}
        </View>

        <View className="gap-3">
          <NeonButton
            label={isLastStep ? "Finish Setup" : "Continue"}
            onPress={onPrimaryPress}
            disabled={!canContinue || updateNameMutation.isPending}
            variant="primary"
          />

          {step > 0 ? (
            <NeonButton
              label="Back"
              onPress={() => setStep((prev) => Math.max(prev - 1, 0))}
              variant="secondary"
            />
          ) : (
            <NeonButton
              label="Skip for now"
              onPress={onSkip}
              variant="secondary"
            />
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
