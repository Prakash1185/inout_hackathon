import { useClerk } from "@clerk/clerk-expo";
import {
  Poppins_500Medium,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState, type ComponentProps } from "react";
import {
  Modal,
  Pressable,
  Text as RNText,
  ScrollView,
  TextInput,
  View,
} from "react-native";

import { NeonButton } from "@/src/components/NeonButton";
import { Screen } from "@/src/components/Screen";
import { getUserActivities } from "@/src/services/activity.service";
import { getMyProfile, updateProfile } from "@/src/services/user.service";
import { useAuthStore } from "@/src/store/auth-store";
import {
  useOnboardingStore,
  type OnboardingGender,
} from "@/src/store/onboarding-store";
import { useAppTheme } from "@/src/store/ui-store";

type PeriodKey = "7D" | "30D" | "90D";
type ChartMetric = "calories" | "minutes" | "km" | "steps";
type IconName = keyof typeof Ionicons.glyphMap;

interface WeeklyStat {
  label: string;
  calories: number;
  minutes: number;
  km: number;
  steps: number;
}

interface BadgeInfo {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  unlocked: boolean;
  progress: number;
}

interface TrainingItem {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  icon: IconName;
}

const periodOptions: PeriodKey[] = ["7D", "30D", "90D"];

const weeklyByPeriod: Record<PeriodKey, WeeklyStat[]> = {
  "7D": [
    { label: "Mo", calories: 265, minutes: 32, km: 4.2, steps: 6920 },
    { label: "Tu", calories: 238, minutes: 28, km: 3.9, steps: 6410 },
    { label: "We", calories: 356, minutes: 43, km: 5.7, steps: 8800 },
    { label: "Th", calories: 289, minutes: 35, km: 4.5, steps: 7310 },
    { label: "Fr", calories: 402, minutes: 52, km: 6.4, steps: 9820 },
    { label: "Sa", calories: 318, minutes: 39, km: 5.1, steps: 8230 },
    { label: "Su", calories: 301, minutes: 36, km: 4.8, steps: 7750 },
  ],
  "30D": [
    { label: "W1", calories: 1850, minutes: 210, km: 28.1, steps: 54210 },
    { label: "W2", calories: 1718, minutes: 196, km: 26.4, steps: 50960 },
    { label: "W3", calories: 2012, minutes: 236, km: 31.2, steps: 59420 },
    { label: "W4", calories: 1934, minutes: 228, km: 29.6, steps: 57180 },
  ],
  "90D": [
    {
      label: "Jan",
      calories: 7040,
      minutes: 812,
      km: 104.2,
      steps: 194300,
    },
    {
      label: "Feb",
      calories: 6728,
      minutes: 778,
      km: 99.8,
      steps: 186200,
    },
    {
      label: "Mar",
      calories: 7432,
      minutes: 861,
      km: 112.7,
      steps: 207400,
    },
  ],
};

const trainingItems: TrainingItem[] = [
  {
    id: "tr-1",
    title: "Bulgarian Split Squat",
    subtitle: "2 days ago",
    duration: "26 min",
    icon: "barbell-outline",
  },
  {
    id: "tr-2",
    title: "Keep-fit Core Session",
    subtitle: "4 days ago",
    duration: "18 min",
    icon: "fitness-outline",
  },
  {
    id: "tr-3",
    title: "Steady Run Intervals",
    subtitle: "6 days ago",
    duration: "34 min",
    icon: "walk-outline",
  },
];

const badgeCatalog: BadgeInfo[] = [
  {
    id: "bdg-1",
    title: "Streak Keeper",
    description: "Completed activity for 10 straight days.",
    icon: "flame-outline",
    unlocked: true,
    progress: 100,
  },
  {
    id: "bdg-2",
    title: "Cardio Pulse",
    description: "Crossed 30km distance in a single week.",
    icon: "heart-outline",
    unlocked: true,
    progress: 100,
  },
  {
    id: "bdg-3",
    title: "Macro Master",
    description: "Stayed within nutrition targets for 7 days.",
    icon: "restaurant-outline",
    unlocked: false,
    progress: 68,
  },
  {
    id: "bdg-4",
    title: "Core Titan",
    description: "Finished 12 strength sessions this month.",
    icon: "shield-checkmark-outline",
    unlocked: false,
    progress: 42,
  },
];

const demoProfile = {
  id: "demo-user",
  name: "Carly Jones",
  email: "carly@inout.app",
  xp: 1208,
  level: 13,
  streak: 10,
  badges: ["Streak Keeper", "Cardio Pulse"],
  createdAt: new Date().toISOString(),
  nextLevelXp: 1500,
};

const healthIndicators = [
  {
    label: "Recovery",
    value: 82,
    icon: "pulse-outline" as IconName,
    note: "On track",
  },
  {
    label: "Hydration",
    value: 74,
    icon: "water-outline" as IconName,
    note: "Needs 0.4L",
  },
  {
    label: "Sleep Quality",
    value: 88,
    icon: "moon-outline" as IconName,
    note: "Strong",
  },
  {
    label: "Exercise Consistency",
    value: 79,
    icon: "barbell-outline" as IconName,
    note: "Good rhythm",
  },
];

const profileGenderOptions: OnboardingGender[] = [
  "Male",
  "Female",
  "Non-binary",
  "Prefer not to say",
];

function getMetricValue(item: WeeklyStat, metric: ChartMetric) {
  return item[metric];
}

function formatMetricValue(value: number, metric: ChartMetric) {
  if (metric === "minutes") {
    return `${Math.round(value)} min`;
  }
  if (metric === "km") {
    return `${value.toFixed(1)} km`;
  }
  if (metric === "steps") {
    return `${Math.round(value).toLocaleString()} steps`;
  }
  return `${Math.round(value).toLocaleString()} kcal`;
}

function formatActivityTimeLabel(raw: string) {
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return "Recently";
  }

  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function parsePositiveInteger(value: string): number | null {
  const parsed = Number(value.trim());
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.round(parsed);
}

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { theme } = useAppTheme();
  const queryClient = useQueryClient();
  const authUser = useAuthStore((state) => state.user);
  const clearIdentity = useAuthStore((state) => state.clearIdentity);
  const setUser = useAuthStore((state) => state.setUser);
  const onboardingProfile = useOnboardingStore((state) => state.profile);
  const setOnboardingProfile = useOnboardingStore((state) => state.setProfile);

  const [fontsLoaded] = useFonts({
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  const bodyFontFamily = fontsLoaded ? "Poppins_500Medium" : undefined;

  type ProfileTextProps = ComponentProps<typeof RNText>;

  const Text = ({ style, ...props }: ProfileTextProps) => (
    <RNText {...props} style={[{ fontFamily: bodyFontFamily }, style]} />
  );

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: getMyProfile,
    initialData: authUser ?? undefined,
  });

  const activitiesQuery = useQuery({
    queryKey: ["my-activities"],
    queryFn: getUserActivities,
  });

  const [period, setPeriod] = useState<PeriodKey>("7D");
  const [chartMetric, setChartMetric] = useState<ChartMetric>("calories");
  const [name, setName] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [personalDetailsOpen, setPersonalDetailsOpen] = useState(false);
  const [personalGoal, setPersonalGoal] = useState(
    onboardingProfile?.goal ?? "Stay active daily",
  );
  const [personalAge, setPersonalAge] = useState(
    onboardingProfile?.age ? String(onboardingProfile.age) : "",
  );
  const [personalHeightCm, setPersonalHeightCm] = useState(
    onboardingProfile?.heightCm ? String(onboardingProfile.heightCm) : "",
  );
  const [personalWeightKg, setPersonalWeightKg] = useState(
    onboardingProfile?.weightKg ? String(onboardingProfile.weightKg) : "",
  );
  const [personalGender, setPersonalGender] = useState<OnboardingGender>(
    onboardingProfile?.gender ?? "Prefer not to say",
  );
  const [selectedBadge, setSelectedBadge] = useState<BadgeInfo | null>(null);

  const profile = profileQuery.data ?? authUser ?? demoProfile;

  useEffect(() => {
    setName(profile.name);
  }, [profile.name]);

  useEffect(() => {
    setPersonalGoal(onboardingProfile?.goal ?? "Stay active daily");
    setPersonalAge(onboardingProfile?.age ? String(onboardingProfile.age) : "");
    setPersonalHeightCm(
      onboardingProfile?.heightCm ? String(onboardingProfile.heightCm) : "",
    );
    setPersonalWeightKg(
      onboardingProfile?.weightKg ? String(onboardingProfile.weightKg) : "",
    );
    setPersonalGender(onboardingProfile?.gender ?? "Prefer not to say");
  }, [onboardingProfile]);

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updated) => {
      setUser({ ...(authUser ?? updated), ...updated });
      queryClient.setQueryData(["profile"], updated);
    },
  });

  const stats = weeklyByPeriod[period];

  const totals = useMemo(() => {
    return stats.reduce(
      (acc, item) => {
        acc.calories += item.calories;
        acc.minutes += item.minutes;
        acc.km += item.km;
        acc.steps += item.steps;
        return acc;
      },
      { calories: 0, minutes: 0, km: 0, steps: 0 },
    );
  }, [stats]);

  const maxMetricValue = useMemo(
    () =>
      Math.max(
        ...stats.map((item) => Number(getMetricValue(item, chartMetric))),
        1,
      ),
    [chartMetric, stats],
  );

  const nextLevelXp = profile.nextLevelXp ?? profile.xp + 300;
  const levelProgress = Math.min(1, profile.xp / Math.max(nextLevelXp, 1));
  const recentWalks = activitiesQuery.data?.slice(0, 4) ?? [];
  const bmiValue = useMemo(() => {
    if (!onboardingProfile) {
      return null;
    }

    const heightMeters = onboardingProfile.heightCm / 100;
    if (!heightMeters) {
      return null;
    }

    return onboardingProfile.weightKg / (heightMeters * heightMeters);
  }, [onboardingProfile]);

  const bmiLabel = useMemo(() => {
    if (bmiValue === null) {
      return "--";
    }

    if (bmiValue < 18.5) {
      return "Underweight";
    }
    if (bmiValue < 25) {
      return "Healthy";
    }
    if (bmiValue < 30) {
      return "Overweight";
    }
    return "High";
  }, [bmiValue]);

  const onboardingDetailCards = useMemo(() => {
    if (!onboardingProfile) {
      return [];
    }

    return [
      {
        label: "Age",
        value: `${onboardingProfile.age} yrs`,
        icon: "calendar-outline" as IconName,
      },
      {
        label: "Gender",
        value: onboardingProfile.gender,
        icon: "person-outline" as IconName,
      },
      {
        label: "Height",
        value: `${onboardingProfile.heightCm} cm`,
        icon: "resize-outline" as IconName,
      },
      {
        label: "Weight",
        value: `${onboardingProfile.weightKg} kg`,
        icon: "barbell-outline" as IconName,
      },
      {
        label: "BMI",
        value:
          bmiValue === null ? "--" : `${bmiValue.toFixed(1)} (${bmiLabel})`,
        icon: "analytics-outline" as IconName,
      },
      {
        label: "Goal",
        value: `${onboardingProfile?.goal ?? "Stay active daily"}`,
        icon: "golf-sharp" as IconName,
      },
    ];
  }, [bmiLabel, bmiValue, onboardingProfile]);

  function openPersonalDetailsEditor() {
    setPersonalGoal(onboardingProfile?.goal ?? "Stay active daily");
    setPersonalAge(onboardingProfile?.age ? String(onboardingProfile.age) : "");
    setPersonalHeightCm(
      onboardingProfile?.heightCm ? String(onboardingProfile.heightCm) : "",
    );
    setPersonalWeightKg(
      onboardingProfile?.weightKg ? String(onboardingProfile.weightKg) : "",
    );
    setPersonalGender(onboardingProfile?.gender ?? "Prefer not to say");
    setPersonalDetailsOpen(true);
  }

  function savePersonalDetails() {
    const age = parsePositiveInteger(personalAge);
    const heightCm = parsePositiveInteger(personalHeightCm);
    const weightKg = parsePositiveInteger(personalWeightKg);
    const goalText = personalGoal.trim();

    if (!age || age < 10 || age > 99) {
      return;
    }

    if (!heightCm || heightCm < 80 || heightCm > 260) {
      return;
    }

    if (!weightKg || weightKg < 25 || weightKg > 350) {
      return;
    }

    if (goalText.length < 3) {
      return;
    }

    setOnboardingProfile({
      name: onboardingProfile?.name ?? profile.name,
      age,
      gender: personalGender,
      heightCm,
      weightKg,
      goal: goalText,
    });

    setPersonalDetailsOpen(false);
  }

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-[30px] font-bold" style={{ color: theme.text }}>
            Profile
          </Text>
          <View className="h-10 w-10" />
        </View>

        <View
          className="mt-4 rounded-2xl border p-4"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          <View className="flex-row items-start justify-between">
            <View className="flex-row items-center gap-3">
              <View
                className="h-16 w-16 items-center justify-center rounded-full"
                style={{ backgroundColor: theme.surfaceMuted }}
              >
                <Ionicons name="person" size={28} color={theme.textMuted} />
              </View>

              <View>
                <Text
                  className="text-xl font-semibold"
                  style={{ color: theme.text }}
                >
                  {profile.name}
                </Text>
                <Text className="text-xs" style={{ color: theme.textMuted }}>
                  {profile.email}
                </Text>
                <View className="mt-2 flex-row items-center gap-3">
                  <Text className="text-xs" style={{ color: theme.text }}>
                    <Text className="font-semibold">1,208</Text> followers
                  </Text>
                  <Text className="text-xs" style={{ color: theme.text }}>
                    <Text className="font-semibold">380</Text> following
                  </Text>
                </View>
              </View>
            </View>

            <Pressable
              onPress={() => setEditOpen(true)}
              className="rounded-2xl border px-3 py-2"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: theme.text }}
              >
                Edit
              </Text>
            </Pressable>
          </View>

          <View className="mt-4 flex-row items-center justify-between">
            <View>
              <Text className="text-[11px]" style={{ color: theme.textMuted }}>
                Fitness Level
              </Text>
              <View className="mt-1 flex-row items-center gap-1">
                <Ionicons name="flame" size={14} color={theme.accent} />
                <Text
                  className="text-xs font-semibold"
                  style={{ color: theme.text }}
                >
                  Beginner
                </Text>
              </View>
            </View>
            <View>
              <Text className="text-[11px]" style={{ color: theme.textMuted }}>
                Weekly Goal
              </Text>
              <Text
                className="mt-1 text-xs font-semibold"
                style={{ color: theme.text }}
              >
                120 hrs
              </Text>
            </View>
            <View>
              <Text className="text-[11px]" style={{ color: theme.textMuted }}>
                Streak
              </Text>
              <Text
                className="mt-1 text-xs font-semibold"
                style={{ color: theme.text }}
              >
                {profile.streak} days
              </Text>
            </View>
          </View>

          <View
            className="mt-3 h-2 overflow-hidden rounded-full"
            style={{ backgroundColor: theme.surfaceMuted }}
          >
            <View
              className="h-2 rounded-full"
              style={{
                backgroundColor: theme.accent,
                width: `${Math.round(levelProgress * 100)}%`,
              }}
            />
          </View>

          <View className="mt-3 flex-row gap-2">
            <View
              className="flex-1 rounded-2xl border px-3 py-2"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <Text className="text-[11px]" style={{ color: theme.textMuted }}>
                XP
              </Text>
              <Text
                className="mt-1 text-sm font-semibold"
                style={{ color: theme.text }}
              >
                {profile.xp}
              </Text>
            </View>
            <View
              className="flex-1 rounded-2xl border px-3 py-2"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <Text className="text-[11px]" style={{ color: theme.textMuted }}>
                KM Walked
              </Text>
              <Text
                className="mt-1 text-sm font-semibold"
                style={{ color: theme.text }}
              >
                {totals.km.toFixed(1)}
              </Text>
            </View>
            <View
              className="flex-1 rounded-2xl border px-3 py-2"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <Text className="text-[11px]" style={{ color: theme.textMuted }}>
                Calories
              </Text>
              <Text
                className="mt-1 text-sm font-semibold"
                style={{ color: theme.text }}
              >
                {Math.round(totals.calories)}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-6 flex-row items-center justify-between">
          <Text className="text-2xl font-bold" style={{ color: theme.text }}>
            Statistics
          </Text>
          <Text className="text-xs" style={{ color: theme.textMuted }}>
            this {period.toLowerCase()}
          </Text>
        </View>

        <View
          className="mt-3 rounded-2xl border p-4"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          <View className="flex-row items-start justify-between">
            <View>
              <Text className="text-[11px]" style={{ color: theme.textMuted }}>
                {chartMetric === "calories"
                  ? "Calories"
                  : chartMetric === "minutes"
                    ? "Active Time"
                    : chartMetric === "km"
                      ? "Distance"
                      : "Steps"}
              </Text>
              <Text
                className="mt-1 text-2xl font-bold"
                style={{ color: theme.text }}
              >
                {formatMetricValue(totals[chartMetric], chartMetric)}
              </Text>
            </View>

            <View
              className="rounded-2xl border p-1"
              style={{ borderColor: theme.border }}
            >
              <View className="flex-row">
                {(
                  [
                    { key: "calories", label: "Cal" },
                    { key: "minutes", label: "Min" },
                    { key: "km", label: "Km" },
                    { key: "steps", label: "Steps" },
                  ] as const
                ).map((metric) => {
                  const active = chartMetric === metric.key;
                  return (
                    <Pressable
                      key={metric.key}
                      onPress={() => setChartMetric(metric.key)}
                      className="rounded-2xl px-2 py-1"
                      style={{
                        backgroundColor: active ? theme.accent : "transparent",
                      }}
                    >
                      <Text
                        className="text-[10px] font-semibold"
                        style={{
                          color: active ? theme.background : theme.textMuted,
                        }}
                      >
                        {metric.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          <View className="mt-4 flex-row items-end gap-1">
            {stats.map((item) => {
              const value = Number(getMetricValue(item, chartMetric));
              const barHeight = Math.max(
                10,
                Math.round((value / maxMetricValue) * 112),
              );

              return (
                <View key={item.label} className="flex-1 items-center">
                  <View
                    className="w-full items-center justify-end overflow-hidden rounded-2xl"
                    style={{ height: 120, backgroundColor: theme.surfaceMuted }}
                  >
                    <View
                      className="w-full rounded-2xl"
                      style={{
                        height: barHeight,
                        backgroundColor: theme.accent,
                      }}
                    />
                  </View>
                  <Text
                    className="mt-2 text-[10px]"
                    style={{ color: theme.textMuted }}
                  >
                    {item.label}
                  </Text>
                </View>
              );
            })}
          </View>

          <View className="mt-4 flex-row justify-between">
            {periodOptions.map((option) => {
              const active = option === period;
              return (
                <Pressable
                  key={option}
                  onPress={() => setPeriod(option)}
                  className="rounded-2xl border px-3 py-2"
                  style={{
                    borderColor: active ? theme.accent : theme.border,
                    backgroundColor: active
                      ? theme.surfaceMuted
                      : theme.surface,
                  }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: active ? theme.accent : theme.textMuted }}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="mt-6 flex-row items-center justify-between">
          <Text className="text-2xl font-bold" style={{ color: theme.text }}>
            Health Status
          </Text>
          <Text className="text-xs" style={{ color: theme.textMuted }}>
            live snapshot
          </Text>
        </View>

        <View
          className="mt-3 rounded-2xl border p-4"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          {healthIndicators.map((item) => (
            <View key={item.label} className="mb-3 last:mb-0">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Ionicons
                    name={item.icon}
                    size={14}
                    color={theme.textMuted}
                  />
                  <Text className="text-xs" style={{ color: theme.textMuted }}>
                    {item.label}
                  </Text>
                </View>
                <View className="items-end">
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: theme.text }}
                  >
                    {item.value}%
                  </Text>
                  <Text
                    className="text-[10px]"
                    style={{ color: theme.textMuted }}
                  >
                    {item.note}
                  </Text>
                </View>
              </View>
              <View
                className="mt-1 h-2 overflow-hidden rounded-full"
                style={{ backgroundColor: theme.surfaceMuted }}
              >
                <View
                  className="h-2 rounded-full"
                  style={{
                    width: `${item.value}%`,
                    backgroundColor: theme.accent,
                  }}
                />
              </View>
            </View>
          ))}
        </View>

        <View className="mt-6 flex-row items-center justify-between">
          <Text className="text-2xl font-bold" style={{ color: theme.text }}>
            Walking Activity Log
          </Text>
          <Pressable
            onPress={() => router.push("/(app)/profile/exercises-history")}
          >
            <Text className="text-xs" style={{ color: theme.textMuted }}>
              show all
            </Text>
          </Pressable>
        </View>

        {activitiesQuery.isLoading ? (
          <View
            className="mt-3 rounded-2xl border p-4"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
          >
            <Text className="text-sm" style={{ color: theme.textMuted }}>
              Loading recent walks...
            </Text>
          </View>
        ) : null}

        {!activitiesQuery.isLoading && recentWalks.length === 0 ? (
          <View
            className="mt-3 rounded-2xl border p-4"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
          >
            <Text className="text-sm" style={{ color: theme.textMuted }}>
              No walk logs yet. Complete a tracked walk to populate this list.
            </Text>
          </View>
        ) : null}

        {!activitiesQuery.isLoading && recentWalks.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
            contentContainerStyle={{ gap: 10, paddingRight: 8 }}
          >
            {recentWalks.map((item) => (
              <View
                key={item.id}
                className="w-64 rounded-2xl border p-3"
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.surface,
                }}
              >
                <View className="flex-row items-center justify-between">
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: theme.text }}
                  >
                    {item.distance.toFixed(2)} km walk
                  </Text>
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: theme.accent }}
                  >
                    +{item.xpEarned} XP
                  </Text>
                </View>

                <Text
                  className="mt-1 text-xs"
                  style={{ color: theme.textMuted }}
                >
                  Captured {item.areaCaptured.toFixed(0)} m2
                </Text>

                <Text
                  className="mt-2 text-[11px]"
                  style={{ color: theme.textMuted }}
                >
                  {formatActivityTimeLabel(item.createdAt)}
                </Text>
              </View>
            ))}
          </ScrollView>
        ) : null}

        <View className="mt-6 flex-row items-center justify-between">
          <Text className="text-2xl font-bold" style={{ color: theme.text }}>
            Trainings
          </Text>
          <Pressable
            onPress={() => router.push("/(app)/profile/exercises-history")}
          >
            <Text className="text-xs" style={{ color: theme.textMuted }}>
              show all
            </Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-3"
          contentContainerStyle={{ gap: 10, paddingRight: 8 }}
        >
          {trainingItems.map((item) => (
            <View
              key={item.id}
              className="w-52 rounded-2xl border p-3"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surface,
              }}
            >
              <View className="flex-row items-center gap-3">
                <View
                  className="h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: theme.surfaceMuted }}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={theme.textMuted}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: theme.text }}
                  >
                    {item.title}
                  </Text>
                  <Text
                    className="mt-1 text-xs"
                    style={{ color: theme.textMuted }}
                  >
                    {item.subtitle}
                  </Text>
                </View>
              </View>
              <Text
                className="mt-3 text-xs font-semibold"
                style={{ color: theme.accent }}
              >
                {item.duration}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View className="mt-6 flex-row items-center justify-between">
          <Text className="text-2xl font-bold" style={{ color: theme.text }}>
            Badges
          </Text>
          <Pressable
            onPress={() => router.push("/(app)/profile/badges-earned")}
          >
            <Text className="text-xs" style={{ color: theme.textMuted }}>
              show all
            </Text>
          </Pressable>
        </View>

        <View className="mt-3 flex-row flex-wrap gap-3">
          {badgeCatalog.map((badge) => (
            <Pressable
              key={badge.id}
              onPress={() => setSelectedBadge(badge)}
              className="w-[48%] rounded-2xl border p-3"
              style={{
                borderColor: badge.unlocked ? theme.accent : theme.border,
                backgroundColor: theme.surface,
                opacity: badge.unlocked ? 1 : 0.72,
              }}
            >
              <View className="flex-row items-center justify-between">
                <Ionicons
                  name={badge.icon}
                  size={18}
                  color={badge.unlocked ? theme.accent : theme.textMuted}
                />
                <Ionicons
                  name={
                    badge.unlocked ? "checkmark-circle" : "lock-closed-outline"
                  }
                  size={16}
                  color={badge.unlocked ? theme.accent : theme.textMuted}
                />
              </View>
              <Text
                className="mt-3 text-sm font-semibold"
                style={{ color: theme.text }}
              >
                {badge.title}
              </Text>
              <Text
                className="mt-1 text-[11px]"
                style={{ color: theme.textMuted }}
              >
                {badge.unlocked ? "Unlocked" : "In progress"}
              </Text>
              <View
                className="mt-2 h-1.5 overflow-hidden rounded-full"
                style={{ backgroundColor: theme.surfaceMuted }}
              >
                <View
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${badge.progress}%`,
                    backgroundColor: theme.accent,
                  }}
                />
              </View>
              <Text
                className="mt-1 text-[10px]"
                style={{ color: theme.textMuted }}
              >
                {badge.progress}% milestone
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="mt-6 flex-row items-center justify-between">
          <Text className="text-2xl font-bold" style={{ color: theme.text }}>
            Personal Details
          </Text>
          <Pressable
            onPress={openPersonalDetailsEditor}
            className="rounded-2xl border px-3 py-2"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surfaceMuted,
            }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: theme.text }}
            >
              Edit
            </Text>
          </Pressable>
        </View>

        {onboardingProfile ? (
          <View
            className="mt-3 rounded-2xl border p-5"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
          >
            <View className="flex-row flex-wrap gap-3">
              {onboardingDetailCards.map((item) => (
                <View
                  key={item.label}
                  className="w-[48%] rounded-2xl border px-4 py-4"
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.surfaceMuted,
                  }}
                >
                  <View className="flex-row items-center gap-2">
                    <Ionicons
                      name={item.icon}
                      size={14}
                      color={theme.textMuted}
                    />
                    <Text
                      className="text-[11px]"
                      style={{ color: theme.textMuted }}
                    >
                      {item.label}
                    </Text>
                  </View>
                  <Text
                    className="mt-3 text-base font-semibold"
                    style={{ color: theme.text }}
                  >
                    {item.value}
                  </Text>
                </View>
              ))}
            </View>

            {/* <View
              className="mt-4 rounded-2xl border px-4 py-4"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <Text className="text-[11px]" style={{ color: theme.textMuted }}>
                Goal
              </Text>
              <Text
                className="mt-2 text-sm leading-6"
                style={{ color: theme.text }}
              >
                {onboardingProfile.goal}
              </Text>
            </View> */}
          </View>
        ) : (
          <View
            className="mt-3 rounded-2xl border p-4"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
          >
            <Text className="text-sm" style={{ color: theme.textMuted }}>
              Add your personal details to personalize your fitness plan.
            </Text>
          </View>
        )}

        <View className="mt-6">
          <NeonButton
            label="Logout"
            onPress={() => {
              signOut()
                .then(() => {
                  clearIdentity();
                  queryClient.clear();
                })
                .catch(() => undefined);
            }}
            variant="secondary"
          />
        </View>
      </ScrollView>

      <Modal
        visible={editOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setEditOpen(false)}
      >
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.25)" }}
          onPress={() => setEditOpen(false)}
        >
          <Pressable
            className="rounded-t-2xl border px-5 pb-6 pt-5"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
            onPress={() => undefined}
          >
            <Text
              className="text-lg font-semibold"
              style={{ color: theme.text }}
            >
              Edit Profile
            </Text>
            <Text className="mt-1 text-xs" style={{ color: theme.textMuted }}>
              Keep your public profile updated.
            </Text>

            <TextInput
              value={name}
              onChangeText={setName}
              className="mt-4 rounded-2xl border px-4 py-3"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
                color: theme.text,
                fontFamily: bodyFontFamily,
              }}
              placeholder="Display name"
              placeholderTextColor={theme.textMuted}
            />

            <View className="mt-4">
              <NeonButton
                label={updateMutation.isPending ? "Saving..." : "Save Changes"}
                onPress={() => {
                  updateMutation.mutate({ name: name.trim() || profile.name });
                  setEditOpen(false);
                }}
                variant="primary"
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={personalDetailsOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPersonalDetailsOpen(false)}
      >
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.25)" }}
          onPress={() => setPersonalDetailsOpen(false)}
        >
          <Pressable
            className="rounded-t-2xl border px-5 pb-6 pt-5"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
            onPress={() => undefined}
          >
            <Text
              className="text-lg font-semibold"
              style={{ color: theme.text }}
            >
              Edit Personal Details
            </Text>
            <Text className="mt-1 text-xs" style={{ color: theme.textMuted }}>
              Update your health details for better recommendations.
            </Text>

            <TextInput
              value={personalAge}
              onChangeText={setPersonalAge}
              className="mt-4 rounded-2xl border px-4 py-3"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
                color: theme.text,
                fontFamily: bodyFontFamily,
              }}
              placeholder="Age"
              placeholderTextColor={theme.textMuted}
              keyboardType="number-pad"
            />

            <View className="mt-3 flex-row flex-wrap gap-2">
              {profileGenderOptions.map((option) => {
                const active = personalGender === option;

                return (
                  <Pressable
                    key={option}
                    className="rounded-2xl border px-3 py-2"
                    style={{
                      borderColor: active ? theme.accent : theme.border,
                      backgroundColor: active
                        ? theme.accent
                        : theme.surfaceMuted,
                    }}
                    onPress={() => setPersonalGender(option)}
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

            <TextInput
              value={personalHeightCm}
              onChangeText={setPersonalHeightCm}
              className="mt-3 rounded-2xl border px-4 py-3"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
                color: theme.text,
                fontFamily: bodyFontFamily,
              }}
              placeholder="Height (cm)"
              placeholderTextColor={theme.textMuted}
              keyboardType="number-pad"
            />

            <TextInput
              value={personalWeightKg}
              onChangeText={setPersonalWeightKg}
              className="mt-3 rounded-2xl border px-4 py-3"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
                color: theme.text,
                fontFamily: bodyFontFamily,
              }}
              placeholder="Weight (kg)"
              placeholderTextColor={theme.textMuted}
              keyboardType="number-pad"
            />

            <TextInput
              value={personalGoal}
              onChangeText={setPersonalGoal}
              className="mt-3 rounded-2xl border px-4 py-3"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
                color: theme.text,
                fontFamily: bodyFontFamily,
              }}
              placeholder="Fitness goal"
              placeholderTextColor={theme.textMuted}
              multiline
            />

            <View className="mt-4">
              <NeonButton
                label="Save Personal Details"
                onPress={savePersonalDetails}
                variant="primary"
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={Boolean(selectedBadge)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedBadge(null)}
      >
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.25)" }}
          onPress={() => setSelectedBadge(null)}
        >
          <Pressable
            className="rounded-t-2xl border px-5 pb-6 pt-5"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
            onPress={() => undefined}
          >
            <View className="flex-row items-center justify-between">
              <Text
                className="text-lg font-semibold"
                style={{ color: theme.text }}
              >
                {selectedBadge?.title}
              </Text>
              {selectedBadge ? (
                <Ionicons
                  name={selectedBadge.icon}
                  size={20}
                  color={theme.accent}
                />
              ) : null}
            </View>

            <Text className="mt-3 text-sm" style={{ color: theme.textMuted }}>
              {selectedBadge?.description}
            </Text>

            <View className="mt-5">
              <NeonButton
                label="Close"
                onPress={() => setSelectedBadge(null)}
                variant="secondary"
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}
