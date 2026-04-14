import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

import { NeonButton } from "@/src/components/NeonButton";
import { Screen } from "@/src/components/Screen";
import { useAppTheme, useUiStore } from "@/src/store/ui-store";

const onboardingSlides = [
  {
    title: "Claim Your Streets",
    description:
      "Each run paints your zone live on the city map so your team can see momentum instantly.",
  },
  {
    title: "Compete In Live Events",
    description:
      "Join weekly missions, challenge nearby runners, and push your streak into the leaderboard top tier.",
  },
  {
    title: "Build A Winning Story",
    description:
      "Your profile, map coverage, and event progress become the MVP demo judges can trust.",
  },
];

export default function WelcomeScreen() {
  const { theme } = useAppTheme();
  const completeOnboarding = useUiStore((state) => state.completeOnboarding);
  const [step, setStep] = useState(0);

  const item = onboardingSlides[step];
  const isLast = step === onboardingSlides.length - 1;

  return (
    <Screen>
      <View
        className="flex-1 px-6 pb-8 pt-10"
        style={{ backgroundColor: theme.background }}
      >
        <Text
          className="text-xs uppercase tracking-[2px]"
          style={{ color: theme.textMuted }}
        >
          Terranova
        </Text>

        <View
          className="mt-5 rounded-3xl border p-6"
          style={{ backgroundColor: theme.surface, borderColor: theme.border }}
        >
          <Text
            className="text-3xl font-semibold"
            style={{ color: theme.text }}
          >
            {item.title}
          </Text>
          <Text
            className="mt-4 text-base leading-6"
            style={{ color: theme.textMuted }}
          >
            {item.description}
          </Text>

          <View className="mt-6 flex-row gap-2">
            {onboardingSlides.map((_, index) => (
              <View
                key={`step-${index}`}
                className="h-2 flex-1 rounded-full"
                style={{
                  backgroundColor:
                    index <= step ? theme.accent : theme.accentSoft,
                }}
              />
            ))}
          </View>
        </View>

        <View className="mt-auto gap-3">
          {!isLast ? (
            <NeonButton
              label="Continue"
              onPress={() =>
                setStep((prev) =>
                  Math.min(prev + 1, onboardingSlides.length - 1),
                )
              }
              variant="primary"
            />
          ) : (
            <NeonButton
              label="Enter App"
              onPress={() => {
                completeOnboarding();
                router.replace("/(app)/(tabs)/home");
              }}
              variant="primary"
            />
          )}

          <NeonButton
            label="Skip"
            onPress={() => {
              completeOnboarding();
              router.replace("/(app)/(tabs)/home");
            }}
            variant="secondary"
          />
        </View>
      </View>
    </Screen>
  );
}
