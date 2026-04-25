import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import type { LeaderboardEntry } from "@/shared/types";
import { BottomActionSheet } from "@/src/components/BottomActionSheet";
import { HomeTerritoryMap } from "@/src/components/maps/HomeTerritoryMap.native";
import { NeonButton } from "@/src/components/NeonButton";
import { Screen } from "@/src/components/Screen";
import { demoNotifications } from "@/src/constants/notifications";
import { getMapOverview } from "@/src/services/activity.service";
import { getActiveEvent } from "@/src/services/event.service";
import {
  getEventLeaderboard,
  getGlobalLeaderboard,
} from "@/src/services/leaderboard.service";
import { getMyProfile } from "@/src/services/user.service";
import { useAuthStore } from "@/src/store/auth-store";
import { useAppTheme } from "@/src/store/ui-store";

type DrawerItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

function MiniStatCard({
  label,
  value,
  icon,
  theme,
  mode,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  theme: ReturnType<typeof useAppTheme>["theme"];
  mode: ReturnType<typeof useAppTheme>["mode"];
}) {
  return (
    <View
      className="flex-1 rounded-2xl border px-3 py-3"
      style={getInnerCardStyle(theme, mode)}
    >
      {/* ICON */}
      <View
        className="h-10 w-10 items-center justify-center rounded-xl border"
        style={{
          borderColor: theme.border,
          backgroundColor: theme.surfaceMuted,
        }}
      >
        <Ionicons name={icon} size={16} color={theme.text} />
      </View>

      {/* LABEL */}
      <Text className="mt-3 text-[12px]" style={{ color: theme.textMuted }}>
        {label}
      </Text>

      {/* VALUE */}
      <Text
        className="mt-1 text-lg font-semibold"
        style={{ color: theme.text }}
      >
        {value}
      </Text>
    </View>
  );
}

function getGreetingByHour(date: Date) {
  const hour = date.getHours();
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 17) {
    return "Good afternoon";
  }
  return "Good evening";
}

function getWeatherLabel(code: number | null) {
  if (code === null) {
    return "Unavailable";
  }

  if (code === 0) {
    return "Clear";
  }
  if ([1, 2, 3].includes(code)) {
    return "Cloudy";
  }
  if ([45, 48].includes(code)) {
    return "Fog";
  }
  if ([51, 53, 55, 56, 57].includes(code)) {
    return "Drizzle";
  }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return "Rain";
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return "Snow";
  }
  if ([95, 96, 99].includes(code)) {
    return "Storm";
  }

  return "Mixed";
}

function getAqiLabel(aqi: number) {
  if (aqi <= 100) {
    return "Good";
  }
  if (aqi <= 200) {
    return "Moderate";
  }
  return "Poor";
}

function getAqiInsight(aqi: number) {
  if (aqi <= 100) {
    return "Air quality is steady for an outdoor walk window.";
  }
  if (aqi <= 200) {
    return "Conditions are moderate. Keep the route shorter and stay local.";
  }
  return "Air quality is poor right now. Prefer a short loop or indoor session.";
}

function toAreaM2(entry: LeaderboardEntry) {
  return Math.max(0, entry.totalAreaCaptured ?? 0);
}

function formatAreaKm2(areaM2: number) {
  return (areaM2 / 1_000_000).toFixed(1);
}

function resolveLocalityLabel(
  address: Location.LocationGeocodedAddress | null,
  fallback: string,
) {
  if (!address) {
    return fallback;
  }

  const chunks = [
    address.name,
    address.street,
    address.city,
    address.region,
  ].filter(Boolean);

  if (!chunks.length) {
    return fallback;
  }

  return chunks.slice(0, 3).join(", ");
}

function getRaisedCardStyle(
  theme: ReturnType<typeof useAppTheme>["theme"],
  mode: ReturnType<typeof useAppTheme>["mode"],
) {
  return {
    borderColor: theme.border,
    backgroundColor: theme.surface,
    shadowColor: mode === "light" ? "#160F14" : "#000000",
    shadowOpacity: mode === "light" ? 0.08 : 0.14,
    shadowRadius: mode === "light" ? 14 : 16,
    shadowOffset: { width: 0, height: mode === "light" ? 6 : 8 },
    elevation: mode === "light" ? 4 : 5,
  } as const;
}

function getInnerCardStyle(
  theme: ReturnType<typeof useAppTheme>["theme"],
  mode: ReturnType<typeof useAppTheme>["mode"],
) {
  return {
    borderColor: theme.border,
    backgroundColor: theme.surfaceMuted,
    shadowColor: mode === "light" ? "#25171E" : "#000000",
    shadowOpacity: mode === "light" ? 0.04 : 0.08,
    shadowRadius: mode === "light" ? 8 : 10,
    shadowOffset: { width: 0, height: mode === "light" ? 3 : 4 },
    elevation: mode === "light" ? 2 : 3,
  } as const;
}

function HeaderActionButton({
  icon,
  onPress,
  theme,
  badge,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  theme: ReturnType<typeof useAppTheme>["theme"];
  badge?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="h-11 w-11 items-center justify-center rounded-full border"
      style={{ borderColor: theme.border, backgroundColor: theme.surfaceMuted }}
    >
      <Ionicons name={icon} size={18} color={theme.text} />
      {badge ? (
        <View
          className="absolute right-2 top-2 min-w-[16px] rounded-full px-1"
          style={{ backgroundColor: theme.text }}
        >
          <Text
            className="text-center text-[10px] font-semibold"
            style={{ color: theme.background }}
          >
            {badge > 9 ? "9+" : badge}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function SnapshotCard({
  label,
  value,
  meta,
  iconSource,
  theme,
  mode,
}: {
  label: string;
  value: string;
  meta: string;
  iconSource: number;
  theme: ReturnType<typeof useAppTheme>["theme"];
  mode: ReturnType<typeof useAppTheme>["mode"];
}) {
  return (
    <View
      className="w-[48%] rounded-3xl border px-4 py-4"
      style={getRaisedCardStyle(theme, mode)}
    >
      <View
        className="h-14 w-14 items-center justify-center rounded-full border"
        style={{
          borderColor: theme.border,
          backgroundColor: theme.surfaceMuted,
        }}
      >
        <Image
          source={iconSource}
          style={{ width: 40, height: 40 }}
          contentFit="contain"
        />
      </View>
      <Text className="mt-4 text-[12px]" style={{ color: theme.textMuted }}>
        {label}
      </Text>
      <Text
        className="mt-1.5 text-2xl font-semibold"
        style={{ color: theme.text }}
      >
        {value}
      </Text>
      <Text
        className="mt-2 text-[11px] hidden"
        style={{ color: theme.textMuted }}
      >
        {meta}
      </Text>
    </View>
  );
}

function SectionHeader({
  title,
  actionLabel,
  onPress,
  theme,
}: {
  title: string;
  actionLabel?: string;
  onPress?: () => void;
  theme: ReturnType<typeof useAppTheme>["theme"];
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text
        className="text-lg font-semibold px-3.5 py-1 rounded-xl border border-gray-800/10"
        style={{ color: theme.text, backgroundColor: theme.accentSoft }}
      >
        {title}
      </Text>
      {actionLabel && onPress ? (
        <Pressable onPress={onPress}>
          <Text
            className="text-xs font-medium"
            style={{ color: theme.textMuted }}
          >
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

type FeatureBannerProps = {
  title: string;
  label: string;
  description: string;
  ctaLabel: string;
  variant: "food" | "recovery" | "trainer";
  onPress: () => void;
  theme: ReturnType<typeof useAppTheme>["theme"];
  mode: ReturnType<typeof useAppTheme>["mode"];
};

function FeatureBanner({
  title,
  label,
  description,
  ctaLabel,
  variant,
  onPress,
  theme,
  mode,
}: FeatureBannerProps) {
  const isFood = variant === "food";
  const isRecovery = variant === "recovery";
  const isTrainer = variant === "trainer";

  const containerStyle = {
    backgroundColor: isFood
      ? theme.surface
      : isRecovery
        ? theme.accentSoft
        : theme.surfaceMuted,
    shadowColor: theme.button.primaryDepth,
    shadowOpacity: mode === "dark" ? 0.3 : 0.12,
    shadowRadius: isTrainer ? 20 : 18,
    shadowOffset: { width: 0, height: isTrainer ? 12 : 10 },
    elevation: isTrainer ? 7 : 6,
  } as const;

  const labelStyle = isRecovery
    ? { color: theme.background, backgroundColor: theme.button.primaryEnd }
    : {
        color: theme.text,
        backgroundColor: isFood ? theme.background : theme.surface,
      };

  const helperChips = isFood
    ? ["Meal scan", "Macro balance", "Recovery fuel"]
    : isRecovery
      ? ["Scan report", "Pain notes", "Safe movement"]
      : ["Custom plan", "Next step", "Adaptive reps"];

  return (
    <Pressable
      onPress={onPress}
      className="overflow-hidden rounded-3xl"
      style={({ pressed }) => ({
        ...containerStyle,
        transform: [{ scale: pressed ? 0.985 : 1 }],
      })}
    >
      {isFood ? (
        <View
          className="gap-5 p-3 border border-dashed rounded-[28px]"
          style={{
            borderColor: theme.border,
            backgroundColor: theme.accentSoft,
          }}
        >
          {/* TOP LABEL ROW */}
          <View className="flex-row items-center justify-between gap-3">
            <View
              className="rounded-full px-3 py-1"
              style={{
                backgroundColor: theme.surface,
              }}
            >
              <Text
                className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: theme.text }}
              >
                {label}
              </Text>
            </View>

            <View
              className="rounded-full px-3 py-1"
              style={{
                backgroundColor: theme.surface,
              }}
            >
              <Text
                className="text-[10px] font-semibold"
                style={{ color: theme.textMuted }}
              >
                Quick scan loop
              </Text>
            </View>
          </View>

          {/* MAIN CONTENT CARD */}
          <View
            className="rounded-[28px] p-5"
            style={{
              backgroundColor: theme.surface,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <Text
              className="text-[22px] font-semibold leading-7"
              style={{ color: theme.text }}
            >
              {title}
            </Text>

            <Text
              className="mt-2 text-sm leading-6"
              style={{ color: theme.textMuted }}
            >
              {description}
            </Text>
          </View>

          {/* CHIPS */}
          <View className="flex-row flex-wrap gap-2">
            {helperChips.map((chip) => (
              <View
                key={chip}
                className="rounded-full px-3 py-2 border"
                style={{
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                }}
              >
                <Text
                  className="text-xs font-medium"
                  style={{ color: theme.text }}
                >
                  {chip}
                </Text>
              </View>
            ))}
          </View>

          {/* CTA */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <NeonButton label={ctaLabel} onPress={onPress} />
            </View>
            <View className="flex-1">
              <NeonButton
                label="Open now"
                onPress={onPress}
                variant="secondary"
              />
            </View>
          </View>
        </View>
      ) : null}

      {isRecovery ? (
        <View
          className="gap-5 p-3 border rounded-[28px]"
          style={{
            borderColor: theme.border,
            backgroundColor: theme.surface,
          }}
        >
          {/* TOP ROW */}
          <View className="flex-row items-center justify-between gap-3">
            <View
              className="rounded-full px-3 py-1"
              style={{
                backgroundColor: theme.surfaceMuted,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Text
                className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: theme.text }}
              >
                {label}
              </Text>
            </View>

            <Text
              className="text-xs font-medium"
              style={{ color: theme.textMuted }}
            >
              safer movement
            </Text>
          </View>

          {/* MAIN CONTENT */}
          <View
            className="rounded-[28px] p-5 border"
            style={{
              backgroundColor: theme.surfaceMuted,
              borderColor: theme.border,
            }}
          >
            <Text
              className="text-[22px] font-semibold leading-7"
              style={{ color: theme.text }}
            >
              {title}
            </Text>

            <Text
              className="mt-2 text-sm leading-6"
              style={{ color: theme.textMuted }}
            >
              {description}
            </Text>

            {/* CHIPS */}
            <View className="mt-5 gap-2">
              {helperChips.map((chip) => (
                <View
                  key={chip}
                  className="rounded-2xl px-3 py-3 border"
                  style={{
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  }}
                >
                  <Text
                    className="text-sm font-medium"
                    style={{ color: theme.text }}
                  >
                    {chip}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* CTA */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <NeonButton label={ctaLabel} onPress={onPress} />
            </View>
            <View className="flex-1">
              <NeonButton
                label="Open now"
                onPress={onPress}
                variant="secondary"
              />
            </View>
          </View>
        </View>
      ) : null}

      {isTrainer ? (
        <View
          className="gap-5 p-3 border border-dashed rounded-[28px]"
          style={{
            borderColor: theme.border,
            backgroundColor: theme.accentSoft,
          }}
        >
          {/* TOP ROW */}
          <View className="flex-row items-center justify-between gap-3">
            <View
              className="rounded-full px-3 py-1"
              style={{
                backgroundColor: theme.surface,
              }}
            >
              <Text
                className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: theme.text }}
              >
                {label}
              </Text>
            </View>

            <View
              className="rounded-full px-3 py-1"
              style={{
                backgroundColor: theme.surface,
              }}
            >
              <Text
                className="text-[10px] font-semibold"
                style={{ color: theme.textMuted }}
              >
                adaptive plan
              </Text>
            </View>
          </View>

          {/* MAIN CONTENT */}
          <View
            className="rounded-[28px] p-5 border"
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
            }}
          >
            <Text
              className="text-[22px] font-semibold leading-7"
              style={{ color: theme.text }}
            >
              {title}
            </Text>

            <Text
              className="mt-2 text-sm leading-6"
              style={{ color: theme.textMuted }}
            >
              {description}
            </Text>

            {/* PROGRESS BAR */}
            <View
              className="mt-5 h-2 overflow-hidden rounded-full"
              style={{ backgroundColor: theme.surfaceMuted }}
            >
              <View
                className="h-full w-[68%] rounded-full"
                style={{ backgroundColor: theme.accent }}
              />
            </View>

            {/* CHIPS */}
            <View className="mt-5 flex-row flex-wrap gap-2">
              {helperChips.map((chip) => (
                <View
                  key={chip}
                  className="rounded-full px-3 py-2 border"
                  style={{
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  }}
                >
                  <Text
                    className="text-xs font-medium"
                    style={{ color: theme.text }}
                  >
                    {chip}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* CTA */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <NeonButton label={ctaLabel} onPress={onPress} />
            </View>
            <View className="flex-1">
              <NeonButton
                label="Open now"
                onPress={onPress}
                variant="secondary"
              />
            </View>
          </View>
        </View>
      ) : null}
    </Pressable>
  );
}

function FeatureBannerStack({
  theme,
  mode,
}: {
  theme: ReturnType<typeof useAppTheme>["theme"];
  mode: ReturnType<typeof useAppTheme>["mode"];
}) {
  return (
    <View className="gap-4">
      <FeatureBanner
        label="Food IQ"
        title="Scan meals, compare intake, and get smarter recovery fuel."
        description="Fast meal analysis built for your activity loop, with cleaner guidance for calories, balance, and safer choices."
        ctaLabel="Open Food IQ"
        variant="food"
        onPress={() => router.push("/(app)/(tabs)/food-intelligence")}
        theme={theme}
        mode={mode}
      />
      <FeatureBanner
        label="Recovery AI"
        title="Turn injury symptoms into safer exercise guidance."
        description="Upload a report, scan the affected area, or describe pain to get step-by-step recovery support."
        ctaLabel="Recovery AI"
        variant="recovery"
        onPress={() => router.push("/(app)/recovery-ai")}
        theme={theme}
        mode={mode}
      />
      <FeatureBanner
        label="AI Trainer"
        title="Build a personalized workout plan from your goal and energy."
        description="Generate a smarter session, follow the next step, and keep your training flow tight and adaptive."
        ctaLabel="AI Trainer"
        variant="trainer"
        onPress={() => router.push("/(app)/(tabs)/ai-trainer")}
        theme={theme}
        mode={mode}
      />
    </View>
  );
}

export default function HomeScreen() {
  const { user } = useUser();
  const { mode, theme, toggleTheme } = useAppTheme();
  const { width: windowWidth } = useWindowDimensions();
  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [resolvedAddress, setResolvedAddress] =
    useState<Location.LocationGeocodedAddress | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [aqi, setAqi] = useState<number | null>(null);
  const [temperatureC, setTemperatureC] = useState<number | null>(null);
  const [weatherCode, setWeatherCode] = useState<number | null>(null);
  const [weatherUpdating, setWeatherUpdating] = useState(false);
  const drawerWidth = Math.min(windowWidth * 0.78, 340);
  const drawerTranslateX = useRef(new Animated.Value(-360)).current;
  const drawerOverlayOpacity = useRef(new Animated.Value(0)).current;

  const setUser = useAuthStore((state) => state.setUser);
  const currentUserId = useAuthStore((state) => state.user?.id);

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: getMyProfile,
  });

  const eventQuery = useQuery({
    queryKey: ["active-event"],
    queryFn: getActiveEvent,
  });

  const mapOverviewQuery = useQuery({
    queryKey: ["map-overview"],
    queryFn: getMapOverview,
  });

  const globalLeaderboardQuery = useQuery({
    queryKey: ["leaderboard", "global"],
    queryFn: getGlobalLeaderboard,
  });

  const eventLeaderboardQuery = useQuery({
    queryKey: ["leaderboard", "event", eventQuery.data?.id],
    enabled: Boolean(eventQuery.data?.id),
    queryFn: () => getEventLeaderboard(eventQuery.data!.id),
  });

  useEffect(() => {
    if (profileQuery.data) {
      setUser(profileQuery.data);
    }
  }, [profileQuery.data, setUser]);

  useEffect(() => {
    let mounted = true;

    async function loadLocation() {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      if (!mounted) {
        return;
      }

      setCurrentLocation(location.coords);

      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (mounted) {
        setResolvedAddress(address ?? null);
      }
    }

    loadLocation().catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!currentLocation) {
      return;
    }

    const activeLocation = currentLocation;
    const controller = new AbortController();

    async function loadWeatherAndAir() {
      setWeatherUpdating(true);

      const { latitude, longitude } = activeLocation;

      const weatherUrl =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}` +
        `&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`;

      const aqiUrl =
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}` +
        `&longitude=${longitude}&current=us_aqi&timezone=auto`;

      const [weatherResponse, aqiResponse] = await Promise.all([
        fetch(weatherUrl, { signal: controller.signal }),
        fetch(aqiUrl, { signal: controller.signal }),
      ]);

      if (!weatherResponse.ok || !aqiResponse.ok) {
        return;
      }

      const weatherJson = await weatherResponse.json();
      const aqiJson = await aqiResponse.json();

      const nextTemp = Number(weatherJson?.current?.temperature_2m);
      const nextCode = Number(weatherJson?.current?.weather_code);
      const nextAqi = Number(aqiJson?.current?.us_aqi);

      if (Number.isFinite(nextTemp)) {
        setTemperatureC(nextTemp);
      }

      if (Number.isFinite(nextCode)) {
        setWeatherCode(nextCode);
      }

      if (Number.isFinite(nextAqi)) {
        setAqi(Math.round(nextAqi));
      }
    }

    loadWeatherAndAir()
      .catch(() => undefined)
      .finally(() => {
        setWeatherUpdating(false);
      });

    return () => {
      controller.abort();
    };
  }, [currentLocation]);

  const region = useMemo(
    () => ({
      latitude: currentLocation?.latitude ?? 28.6139,
      longitude: currentLocation?.longitude ?? 77.209,
      latitudeDelta: 0.035,
      longitudeDelta: 0.035,
    }),
    [currentLocation],
  );

  const territoryCenters = useMemo(
    () => mapOverviewQuery.data?.userCenters ?? [],
    [mapOverviewQuery.data?.userCenters],
  );

  const territoryPolygons = useMemo(
    () => mapOverviewQuery.data?.userPolygons ?? [],
    [mapOverviewQuery.data?.userPolygons],
  );

  const othersCenters = useMemo(
    () => mapOverviewQuery.data?.othersCenters ?? [],
    [mapOverviewQuery.data?.othersCenters],
  );

  const othersPolygons = useMemo(
    () => mapOverviewQuery.data?.othersPolygons ?? [],
    [mapOverviewQuery.data?.othersPolygons],
  );

  const profile = profileQuery.data;
  const userArea = mapOverviewQuery.data?.stats.userCapturedArea ?? 0;
  const rivalsCount = mapOverviewQuery.data?.stats.othersCount ?? 0;
  const fallbackLocality = eventQuery.data?.location ?? "Local territory";
  const locality = resolveLocalityLabel(resolvedAddress, fallbackLocality);
  const city = resolvedAddress?.city ?? fallbackLocality.split(",")[0];

  const displayName =
    user?.fullName?.trim() ||
    profile?.name?.trim() ||
    user?.firstName?.trim() ||
    "Territory runner";
  const firstName = displayName.split(" ")[0];
  const greeting = getGreetingByHour(new Date());
  const weatherLabel = getWeatherLabel(weatherCode);
  const liveAqi = aqi ?? 142;
  const aqiLabel = getAqiLabel(liveAqi);
  const aqiInsight = getAqiInsight(liveAqi);

  const steps = Math.max(4200, Math.round((profile?.xp ?? 880) * 8.7));
  const zonesCaptured = Math.max(6, Math.round(userArea / 180));
  const streak = Math.max(1, profile?.streak ?? 9);
  const activeSafeZones = Math.max(2, territoryCenters.length);
  const notificationCount = demoNotifications.filter(
    (item) => item.unread,
  ).length;

  const rankingSource = useMemo(() => {
    if (eventLeaderboardQuery.data?.rankings?.length) {
      return eventLeaderboardQuery.data.rankings;
    }

    return globalLeaderboardQuery.data?.rankings ?? [];
  }, [
    eventLeaderboardQuery.data?.rankings,
    globalLeaderboardQuery.data?.rankings,
  ]);

  const sortedRankings = useMemo(() => {
    return [...rankingSource].sort((a, b) => toAreaM2(b) - toAreaM2(a));
  }, [rankingSource]);

  const topRows = useMemo(() => sortedRankings.slice(0, 3), [sortedRankings]);
  const userRanking = useMemo(
    () => sortedRankings.find((item) => item.userId === currentUserId),
    [currentUserId, sortedRankings],
  );
  const fallbackRank = Math.max(2, rivalsCount + 4);
  const userRank = userRanking?.rank ?? fallbackRank;
  const mapCurrentLocation = currentLocation
    ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      }
    : null;

  const drawerItems: DrawerItem[] = [
    {
      label: "Leaderboard",
      icon: "trophy-outline",
      onPress: () => router.push("/(app)/(tabs)/leaderboard"),
    },
    {
      label: "Recovery AI",
      icon: "fitness-outline",
      onPress: () => router.push("/(app)/recovery-ai"),
    },
    {
      label: "AI Chat",
      icon: "chatbubble-ellipses-outline",
      onPress: () => router.push("/(app)/chatbot"),
    },
    {
      label: "Events",
      icon: "calendar-outline",
      onPress: () => router.push("/(app)/(tabs)/events"),
    },
    {
      label: "Doctors",
      icon: "medkit-outline",
      onPress: () => router.push("/doctors"),
    },
    {
      label: "Updates",
      icon: "newspaper-outline",
      onPress: () =>
        router.push({
          pathname: "/(app)/(tabs)/feed",
          params: { tab: "updates" },
        }),
    },
  ];

  useEffect(() => {
    if (!drawerVisible) {
      drawerTranslateX.setValue(-drawerWidth);
      drawerOverlayOpacity.setValue(0);
    }
  }, [drawerOverlayOpacity, drawerTranslateX, drawerVisible, drawerWidth]);

  function openDrawer() {
    setDrawerVisible(true);

    Animated.parallel([
      Animated.timing(drawerTranslateX, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.timing(drawerOverlayOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function closeDrawer(onClosed?: () => void) {
    Animated.parallel([
      Animated.timing(drawerTranslateX, {
        toValue: -drawerWidth,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(drawerOverlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setDrawerVisible(false);
      onClosed?.();
    });
  }

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 36, gap: 18 }}
      >
        <View
          className="rounded-3xl border px-4 py-4"
          style={getRaisedCardStyle(theme, mode)}
        >
          <View className="flex-row items-center justify-between gap-3">
            <Pressable
              onPress={openDrawer}
              className="h-11 w-11 items-center justify-center rounded-full border"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <Ionicons name="menu-outline" size={20} color={theme.text} />
            </Pressable>

            <View className="flex-1 flex-row items-center gap-3">
              {/* {user?.imageUrl ? (
                <Image
                  source={{ uri: user.imageUrl }}
                  style={{ width: 44, height: 44, borderRadius: 999 }}
                />
              ) : (
                <View
                  className="h-11 w-11 items-center justify-center rounded-full border"
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.surfaceMuted,
                  }}
                >
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: theme.text }}
                  >
                    {firstName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )} */}

              <View className="flex-1">
                <Text className="text-xs" style={{ color: theme.textMuted }}>
                  Welcome back
                </Text>
                <Text
                  className="mt-0.5 text-base font-semibold"
                  style={{ color: theme.text }}
                  numberOfLines={1}
                >
                  {displayName}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-2">
              <HeaderActionButton
                icon="notifications-outline"
                badge={notificationCount}
                onPress={() => router.push("/(app)/notifications")}
                theme={theme}
              />
              <HeaderActionButton
                icon={mode === "dark" ? "sunny-outline" : "moon-outline"}
                onPress={toggleTheme}
                theme={theme}
              />
            </View>
          </View>
        </View>

        <View
          className="rounded-3xl border px-5 py-5"
          style={getRaisedCardStyle(theme, mode)}
        >
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-xs" style={{ color: theme.textMuted }}>
                Active territory overview
              </Text>
              <Text
                className="mt-1 text-[28px] font-semibold"
                style={{ color: theme.text }}
              >
                {greeting}
              </Text>
              <Text
                className="mt-3 text-sm leading-6"
                style={{ color: theme.textMuted }}
              >
                {weatherUpdating
                  ? "Syncing live weather and air quality for your nearby route."
                  : `${firstName}, ${city} is ${weatherLabel.toLowerCase()} right now. ${aqiInsight}`}
              </Text>
            </View>

            <View
              className="rounded-3xl border px-4 py-3"
              style={getInnerCardStyle(theme, mode)}
            >
              <Text className="text-[11px]" style={{ color: theme.textMuted }}>
                Level
              </Text>
              <Text
                className="mt-1 text-xl font-semibold text-center"
                style={{ color: theme.text }}
              >
                {profile?.level ?? 1}
              </Text>
            </View>
          </View>

          <View className="mt-5 flex-row flex-wrap gap-2">
            {[
              `${locality}`,
              `${temperatureC !== null ? `${Math.round(temperatureC)}C` : "--"} ${weatherLabel}`,
              `AQI ${liveAqi} ${aqiLabel}`,
              eventQuery.data?.name ?? "No active event",
            ].map((item) => (
              <View
                key={item}
                className="rounded-full border px-3 py-2"
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.surfaceMuted,
                }}
              >
                <Text className="text-xs" style={{ color: theme.textMuted }}>
                  {item}
                </Text>
              </View>
            ))}
          </View>

          <View className="mt-5 flex gap-1.5">
            <View className="flex-1">
              <NeonButton
                label="Start Walk"
                onPress={() => router.push("/(app)/activity")}
              />
            </View>
            <View className="flex-1">
              <NeonButton
                label="Safe Zones"
                onPress={() => setActionsOpen(true)}
                variant="secondary"
              />
            </View>
          </View>
        </View>

        <View className="flex-row flex-wrap gap-3">
          <SnapshotCard
            label="Daily steps"
            value={steps.toLocaleString()}
            meta="Estimated from your recent movement"
            iconSource={require("../../../assets/icons/steps.png")}
            theme={theme}
            mode={mode}
          />
          <SnapshotCard
            label="Captured zones"
            value={`${zonesCaptured}`}
            meta="Territory points secured nearby"
            iconSource={require("../../../assets/icons/area.png")}
            theme={theme}
            mode={mode}
          />
          <SnapshotCard
            label="Current streak"
            value={`${streak} days`}
            meta="Keep the chain active today"
            iconSource={require("../../../assets/icons/streak.png")}
            theme={theme}
            mode={mode}
          />
          <SnapshotCard
            label="Local rank"
            value={`#${userRank}`}
            meta={`${rivalsCount} active rivals around you`}
            iconSource={require("../../../assets/icons/rank.png")}
            theme={theme}
            mode={mode}
          />
        </View>

        <FeatureBannerStack theme={theme} mode={mode} />

        <View
          className="rounded-3xl border p-3"
          style={getRaisedCardStyle(theme, mode)}
        >
          <SectionHeader title="Territory intelligence" theme={theme} />

          {/* 🗺️ MAP (still the hero) */}
          <View
            className="mt-3 h-48 overflow-hidden rounded-2xl border"
            style={getInnerCardStyle(theme, mode)}
          >
            <HomeTerritoryMap
              region={region}
              currentLocation={mapCurrentLocation}
              userPolygons={territoryPolygons}
              userCenters={territoryCenters}
              othersPolygons={othersPolygons}
              othersCenters={othersCenters}
            />
          </View>

          {/* 📊 MINI STAT CARDS */}
          <View className="mt-3 flex-row gap-2">
            <MiniStatCard
              label="Captured"
              value={`${formatAreaKm2(userArea)} km²`}
              icon="map-outline"
              theme={theme}
              mode={mode}
            />

            <MiniStatCard
              label="Safe zones"
              value={`${activeSafeZones}`}
              icon="shield-checkmark-outline"
              theme={theme}
              mode={mode}
            />

            <MiniStatCard
              label="Rivals"
              value={`${rivalsCount}`}
              icon="people-outline"
              theme={theme}
              mode={mode}
            />
          </View>

          {/* 📈 PROGRESS / INSIGHT */}
          <View
            className="mt-3 rounded-2xl border px-4 py-3"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
          >
            <Text className="text-[11px]" style={{ color: theme.textMuted }}>
              Territory progress
            </Text>

            <Text
              className="mt-1 text-sm font-medium"
              style={{ color: theme.text }}
            >
              You're ahead of {Math.max(0, rivalsCount - 2)} nearby players
            </Text>

            <View
              className="mt-2 h-2 overflow-hidden rounded-full"
              style={{ backgroundColor: theme.surfaceMuted }}
            >
              <View
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, (userArea / 5000) * 100)}%`,
                  backgroundColor: theme.accent,
                }}
              />
            </View>

            <Text
              className="mt-2 text-[11px]"
              style={{ color: theme.textMuted }}
            >
              Expand 1.2 km² more to reach next zone tier
            </Text>
          </View>
        </View>

        <View
          className="rounded-3xl border p-4"
          style={getRaisedCardStyle(theme, mode)}
        >
          <SectionHeader
            title="Leaderboard preview"
            actionLabel="Open"
            onPress={() => router.push("/(app)/(tabs)/leaderboard")}
            theme={theme}
          />

          <View className="mt-4 gap-3">
            {(topRows.length ? topRows : rankingSource.slice(0, 3)).map(
              (entry, index) => (
                <View
                  key={`${entry.userId}-${index}`}
                  className="flex-row items-center justify-between rounded-2xl border px-4 py-3"
                  style={{
                    ...getInnerCardStyle(theme, mode),
                    borderColor:
                      entry.userId === currentUserId
                        ? theme.text
                        : theme.border,
                  }}
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      className="h-9 w-9 items-center justify-center rounded-2xl border"
                      style={getInnerCardStyle(theme, mode)}
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: theme.text }}
                      >
                        #{entry.rank || index + 1}
                      </Text>
                    </View>

                    <View>
                      <Text
                        className="text-sm font-semibold"
                        style={{ color: theme.text }}
                      >
                        {entry.name}
                      </Text>
                      <Text
                        className="text-xs"
                        style={{ color: theme.textMuted }}
                      >
                        Territory covered
                      </Text>
                    </View>
                  </View>

                  <Text
                    className="text-sm font-medium"
                    style={{ color: theme.textMuted }}
                  >
                    {formatAreaKm2(toAreaM2(entry))} km2
                  </Text>
                </View>
              ),
            )}
          </View>
        </View>

        <View
          className="rounded-3xl border p-4"
          style={getRaisedCardStyle(theme, mode)}
        >
          <SectionHeader
            title="Recent alerts"
            actionLabel="See all"
            onPress={() => router.push("/(app)/notifications")}
            theme={theme}
          />

          <View className="mt-4 gap-3">
            {demoNotifications.slice(0, 3).map((item) => (
              <View
                key={item.id}
                className="rounded-2xl border px-4 py-3"
                style={{
                  ...getInnerCardStyle(theme, mode),
                  borderColor: item.unread ? theme.text : theme.border,
                }}
              >
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: theme.text }}
                    >
                      {item.title}
                    </Text>
                    <Text
                      className="mt-1 text-sm leading-6"
                      style={{ color: theme.textMuted }}
                    >
                      {item.description}
                    </Text>
                  </View>
                  <Text
                    className="text-[11px]"
                    style={{ color: theme.textMuted }}
                  >
                    {item.timeLabel}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={drawerVisible}
        transparent
        animationType="none"
        onRequestClose={() => closeDrawer()}
      >
        <Animated.View
          className="flex-1 flex-row"
          style={{
            backgroundColor: "rgba(0,0,0,0.16)",
            opacity: drawerOverlayOpacity,
          }}
        >
          <Pressable className="flex-1 flex-row" onPress={() => closeDrawer()}>
            <Animated.View
              className="h-full border-r px-5 pb-8 pt-16"
              style={{
                width: drawerWidth,
                borderColor: theme.border,
                backgroundColor: theme.surface,
                transform: [{ translateX: drawerTranslateX }],
              }}
            >
              <Pressable onPress={() => undefined}>
                <View className="flex-row items-center gap-3">
                  {user?.imageUrl ? (
                    <Image
                      source={{ uri: user.imageUrl }}
                      style={{ width: 48, height: 48, borderRadius: 999 }}
                    />
                  ) : (
                    <View
                      className="h-12 w-12 items-center justify-center rounded-full border"
                      style={{
                        borderColor: theme.border,
                        backgroundColor: theme.surfaceMuted,
                      }}
                    >
                      <Text
                        className="text-base font-semibold"
                        style={{ color: theme.text }}
                      >
                        {firstName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}

                  <View className="flex-1">
                    <Text
                      className="text-xs"
                      style={{ color: theme.textMuted }}
                    >
                      Signed in
                    </Text>
                    <Text
                      className="mt-0.5 text-base font-semibold"
                      style={{ color: theme.text }}
                      numberOfLines={1}
                    >
                      {displayName}
                    </Text>
                  </View>
                </View>

                <View
                  className="mt-8 rounded-3xl border p-3"
                  style={getInnerCardStyle(theme, mode)}
                >
                  {/* <Text className="text-xs" style={{ color: theme.textMuted }}>
                    Quick navigation
                  </Text> */}

                  <View className="mt-3 gap-2">
                    {drawerItems.map((item) => (
                      <Pressable
                        key={item.label}
                        className="flex-row items-center gap-3 rounded-full border px-4 py-3"
                        style={{
                          borderColor: theme.border,
                          backgroundColor: theme.surface,
                        }}
                        onPress={() => {
                          closeDrawer(item.onPress);
                        }}
                      >
                        <View
                          className="h-10 w-10 items-center justify-center rounded-full border"
                          style={{
                            borderColor: theme.border,
                            backgroundColor: theme.surfaceMuted,
                          }}
                        >
                          <Ionicons
                            name={item.icon}
                            size={17}
                            color={theme.text}
                          />
                        </View>

                        <Text
                          className="flex-1 text-sm font-medium"
                          style={{ color: theme.text }}
                        >
                          {item.label}
                        </Text>

                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color={theme.textMuted}
                        />
                      </Pressable>
                    ))}
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </Modal>

      <BottomActionSheet
        visible={actionsOpen}
        onClose={() => setActionsOpen(false)}
        title="Safe zone briefing"
        subtitle="Lower exposure route suggestions"
      >
        <View
          className="rounded-2xl border p-4"
          style={{
            borderColor: theme.border,
            backgroundColor: theme.surfaceMuted,
          }}
        >
          <Text className="text-sm font-semibold" style={{ color: theme.text }}>
            Sector 12 park ring
          </Text>
          <Text className="mt-1 text-sm" style={{ color: theme.textMuted }}>
            22-minute loop with calmer traffic and cleaner air pockets.
          </Text>
        </View>
        <View
          className="rounded-2xl border p-4"
          style={{
            borderColor: theme.border,
            backgroundColor: theme.surfaceMuted,
          }}
        >
          <Text className="text-sm font-semibold" style={{ color: theme.text }}>
            Metro walk link
          </Text>
          <Text className="mt-1 text-sm" style={{ color: theme.textMuted }}>
            Short corridor with dense tiles and a lower-exposure route.
          </Text>
        </View>
      </BottomActionSheet>
    </Screen>
  );
}
