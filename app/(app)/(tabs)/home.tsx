import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import type { LeaderboardEntry } from "@/shared/types";
import { BottomActionSheet } from "@/src/components/BottomActionSheet";
// eslint-disable-next-line import/no-unresolved
import { HomeTerritoryMap } from "@/src/components/maps/HomeTerritoryMap";
import { NeonButton } from "@/src/components/NeonButton";
import { Screen } from "@/src/components/Screen";
import { getMapOverview } from "@/src/services/activity.service";
import { getActiveEvent } from "@/src/services/event.service";
import {
    getEventLeaderboard,
    getGlobalLeaderboard,
} from "@/src/services/leaderboard.service";
import { getMyProfile } from "@/src/services/user.service";
import { useAuthStore } from "@/src/store/auth-store";
import { useAppTheme } from "@/src/store/ui-store";

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
    return "Air quality is stable. Best window for zone capture is early evening.";
  }
  if (aqi <= 200) {
    return "Air quality is moderate. Capture nearby tiles around 6:30 PM for safer movement.";
  }
  return "Air quality is poor. Switch to short metro and market micro-walk loops today.";
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
    return "--";
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

export default function HomeScreen() {
  const { mode, theme, toggleTheme } = useAppTheme();
  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [resolvedAddress, setResolvedAddress] =
    useState<Location.LocationGeocodedAddress | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [aqi, setAqi] = useState<number | null>(null);
  const [temperatureC, setTemperatureC] = useState<number | null>(null);
  const [weatherCode, setWeatherCode] = useState<number | null>(null);
  const [weatherUpdating, setWeatherUpdating] = useState(false);

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

    const controller = new AbortController();

    async function loadWeatherAndAir() {
      setWeatherUpdating(true);

      const { latitude, longitude } = currentLocation;

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

  const othersCenters = mapOverviewQuery.data?.othersCenters ?? [];
  const othersPolygons = mapOverviewQuery.data?.othersPolygons ?? [];

  const profile = profileQuery.data;
  const userArea = mapOverviewQuery.data?.stats.userCapturedArea ?? 0;
  const rivalsCount = mapOverviewQuery.data?.stats.othersCount ?? 0;

  const userName = profile?.name?.split(" ")[0] ?? "Rahul";
  const fallbackLocality =
    eventQuery.data?.location ?? "Dwarka Sector 12, Delhi";
  const locality = resolveLocalityLabel(resolvedAddress, fallbackLocality);

  const city = resolvedAddress?.city ?? fallbackLocality.split(",")[0];
  const greeting = getGreetingByHour(new Date());

  const liveAqi = aqi ?? 142;
  const aqiLabel = getAqiLabel(liveAqi);
  const aqiInsight = getAqiInsight(liveAqi);

  const weatherLabel = getWeatherLabel(weatherCode);

  const steps = Math.max(4200, Math.round((profile?.xp ?? 880) * 8.7));
  const zonesCaptured = Math.max(6, Math.round(userArea / 180));
  const streak = Math.max(1, profile?.streak ?? 9);
  const activeSafeZones = Math.max(2, territoryCenters.length);
  const lowActivityZones = Math.max(1, othersCenters.length);

  const rankingSource = eventLeaderboardQuery.data?.rankings?.length
    ? eventLeaderboardQuery.data.rankings
    : (globalLeaderboardQuery.data?.rankings ?? []);

  const sortedRankings = useMemo(() => {
    return [...rankingSource].sort((a, b) => toAreaM2(b) - toAreaM2(a));
  }, [rankingSource]);

  const top3 = sortedRankings.slice(0, 3);
  const userRanking = sortedRankings.find(
    (item) => item.userId === currentUserId,
  );
  const fallbackRank = Math.max(2, rivalsCount + 4);
  const userRank = userRanking?.rank ?? fallbackRank;

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 18, paddingBottom: 44 }}
      >
        <View
          className="rounded-3xl border px-4 py-3"
          style={{
            borderColor: theme.border,
            backgroundColor: theme.surface,
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="mr-3 flex-1">
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name="location-outline"
                  size={16}
                  color={theme.textMuted}
                />
                <Text
                  className="text-sm font-semibold"
                  style={{ color: theme.text }}
                >
                  {city}
                </Text>
              </View>
              <Text className="mt-1 text-xs" style={{ color: theme.textMuted }}>
                {locality}
              </Text>
            </View>

            <Pressable
              onPress={toggleTheme}
              className="rounded-2xl border p-2"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <Ionicons
                name={mode === "dark" ? "sunny-outline" : "moon-outline"}
                size={18}
                color={theme.text}
              />
            </Pressable>
          </View>

          <View className="mt-3 flex-row gap-2">
            <View
              className="flex-1 rounded-2xl border px-3 py-2"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <Text className="text-[10px]" style={{ color: theme.textMuted }}>
                AQI
              </Text>
              <Text
                className="mt-1 text-xs font-semibold"
                style={{ color: theme.text }}
              >
                {liveAqi} {aqiLabel}
              </Text>
            </View>
            <View
              className="flex-1 rounded-2xl border px-3 py-2"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <Text className="text-[10px]" style={{ color: theme.textMuted }}>
                Weather
              </Text>
              <Text
                className="mt-1 text-xs font-semibold"
                style={{ color: theme.text }}
              >
                {temperatureC !== null ? `${Math.round(temperatureC)}C` : "--"}{" "}
                {weatherLabel}
              </Text>
            </View>
          </View>
        </View>

        <View
          className="mt-5 rounded-3xl border px-5 py-5"
          style={{
            borderColor: theme.accentSoft,
            backgroundColor: theme.accent,
          }}
        >
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                Your Territory
              </Text>
              <Text
                className="mt-1 text-3xl font-bold"
                style={{ color: "#FFFFFF" }}
              >
                {greeting}, {userName}
              </Text>
              <View className="mt-2 flex-row items-center gap-2">
                <Ionicons
                  name="locate-outline"
                  size={13}
                  color="rgba(255,255,255,0.9)"
                />
                <Text
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.94)" }}
                >
                  {locality}
                </Text>
              </View>
            </View>

            <View className="items-center">
              <View
                className="h-14 w-14 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
              >
                <Ionicons name="person" size={24} color="#FFFFFF" />
              </View>
              <Text
                className="mt-2 text-[11px] font-semibold"
                style={{ color: "#FFFFFF" }}
              >
                LVL {profile?.level ?? 24}
              </Text>
            </View>
          </View>
        </View>

        <View
          className="mt-5 rounded-3xl border p-5"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          <View className="flex-row items-center justify-between">
            <Text
              className="text-lg font-semibold"
              style={{ color: theme.text }}
            >
              Territory Insight
            </Text>
            <Ionicons name="pulse-outline" size={16} color={theme.textMuted} />
          </View>
          <Text className="mt-2 text-sm" style={{ color: theme.textMuted }}>
            {aqiInsight}
          </Text>
          <Text className="mt-2 text-[11px]" style={{ color: theme.textMuted }}>
            {weatherUpdating
              ? "Refreshing weather and AQI..."
              : "Live location weather synced"}
          </Text>

          <View className="mt-5 flex-row flex-wrap gap-3">
            <View className="min-w-[140px] flex-1">
              <NeonButton
                label="Start Walk"
                onPress={() => router.push("/(app)/activity")}
                variant="primary"
              />
            </View>
            <View className="min-w-[140px] flex-1">
              <NeonButton
                label="View Safe Zones"
                onPress={() => setActionsOpen(true)}
                variant="secondary"
              />
            </View>
          </View>
        </View>

        <View className="mt-7 flex-row items-center justify-between">
          <Text className="text-2xl font-bold" style={{ color: theme.text }}>
            Today Snapshot
          </Text>
          <Text className="text-xs" style={{ color: theme.textMuted }}>
            live updates
          </Text>
        </View>

        <View className="mt-3 flex-row flex-wrap gap-3">
          <View
            className="w-[48%] rounded-3xl border px-4 py-4"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
          >
            <Text className="text-[11px]" style={{ color: theme.textMuted }}>
              Steps
            </Text>
            <Text
              className="mt-2 text-2xl font-semibold"
              style={{ color: theme.text }}
            >
              {steps.toLocaleString()}
            </Text>
            <View
              className="mt-3 h-1.5 overflow-hidden rounded-full"
              style={{ backgroundColor: theme.surfaceMuted }}
            >
              <View
                className="h-1.5 rounded-full"
                style={{ width: "74%", backgroundColor: theme.accent }}
              />
            </View>
          </View>

          <View
            className="w-[48%] rounded-3xl border px-4 py-4"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
          >
            <Text className="text-[11px]" style={{ color: theme.textMuted }}>
              Zones Captured
            </Text>
            <Text
              className="mt-2 text-2xl font-semibold"
              style={{ color: theme.text }}
            >
              {zonesCaptured}
            </Text>
            <Text
              className="mt-2 text-[10px]"
              style={{ color: theme.textMuted }}
            >
              +{Math.max(1, Math.round(zonesCaptured / 3))} today
            </Text>
          </View>

          <View
            className="w-[48%] rounded-3xl border px-4 py-4"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
          >
            <Text className="text-[11px]" style={{ color: theme.textMuted }}>
              Streak
            </Text>
            <Text
              className="mt-2 text-2xl font-semibold"
              style={{ color: theme.text }}
            >
              {streak} days
            </Text>
            <Text
              className="mt-2 text-[10px]"
              style={{ color: theme.textMuted }}
            >
              Keep it active tonight
            </Text>
          </View>

          <View
            className="w-[48%] rounded-3xl border px-4 py-4"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
          >
            <Text className="text-[11px]" style={{ color: theme.textMuted }}>
              Local Rank
            </Text>
            <Text
              className="mt-2 text-2xl font-semibold"
              style={{ color: theme.text }}
            >
              #{userRank}
            </Text>
            <Text
              className="mt-2 text-[10px]"
              style={{ color: theme.textMuted }}
            >
              {rivalsCount} rivals nearby
            </Text>
          </View>
        </View>

        <View className="mt-7 flex-row items-center justify-between">
          <Text className="text-2xl font-bold" style={{ color: theme.text }}>
            Live Map
          </Text>
          <Text className="text-xs" style={{ color: theme.textMuted }}>
            tactical preview
          </Text>
        </View>

        <View
          className="mt-3 rounded-3xl border p-4"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          <View
            className="h-56 overflow-hidden rounded-2xl border"
            style={{ borderColor: theme.border }}
          >
            <HomeTerritoryMap
              region={region}
              currentLocation={
                currentLocation
                  ? {
                      latitude: currentLocation.latitude,
                      longitude: currentLocation.longitude,
                    }
                  : null
              }
              userPolygons={territoryPolygons}
              userCenters={territoryCenters}
              othersPolygons={othersPolygons}
              othersCenters={othersCenters}
            />
          </View>

          <View className="mt-4 flex-row gap-2">
            <View
              className="flex-1 rounded-2xl border px-3 py-2"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <Text className="text-[11px]" style={{ color: theme.textMuted }}>
                Safe zones
              </Text>
              <Text
                className="mt-1 text-xs font-semibold"
                style={{ color: theme.text }}
              >
                {activeSafeZones} active
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
                Low activity
              </Text>
              <Text
                className="mt-1 text-xs font-semibold"
                style={{ color: theme.text }}
              >
                {lowActivityZones} pockets
              </Text>
            </View>
          </View>
        </View>

        <View
          className="mt-5 rounded-3xl border p-4"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          <View className="flex-row items-center justify-between">
            <Text
              className="text-lg font-semibold"
              style={{ color: theme.text }}
            >
              Territory Leaderboard
            </Text>
            <Pressable onPress={() => router.push("/(app)/(tabs)/feed")}>
              <Text
                className="text-xs font-semibold"
                style={{ color: theme.accent }}
              >
                see full
              </Text>
            </Pressable>
          </View>

          <View className="mt-3 gap-2">
            {(top3.length ? top3 : rankingSource.slice(0, 3)).map(
              (entry, index) => (
                <View
                  key={`${entry.userId}-${index}`}
                  className="flex-row items-center justify-between rounded-2xl border px-3 py-2"
                  style={{
                    borderColor: index === 0 ? theme.accentSoft : theme.border,
                    backgroundColor:
                      index === 0 ? theme.surfaceMuted : theme.surface,
                  }}
                >
                  <View className="flex-row items-center gap-2">
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: theme.text }}
                    >
                      #{entry.rank || index + 1}
                    </Text>
                    <Text className="text-sm" style={{ color: theme.text }}>
                      {entry.name}
                    </Text>
                  </View>
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: theme.textMuted }}
                  >
                    {formatAreaKm2(toAreaM2(entry))} km2
                  </Text>
                </View>
              ),
            )}
          </View>

          <View
            className="mt-3 rounded-2xl border px-3 py-3"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surfaceMuted,
            }}
          >
            <Text className="text-[11px]" style={{ color: theme.textMuted }}>
              Your Rank
            </Text>
            <View className="mt-1 flex-row items-center justify-between">
              <Text
                className="text-base font-semibold"
                style={{ color: theme.text }}
              >
                #{userRank}
              </Text>
              <Text className="text-xs" style={{ color: theme.textMuted }}>
                {userRanking
                  ? `${formatAreaKm2(toAreaM2(userRanking))} km2`
                  : "Keep capturing"}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-7 flex-row items-center justify-between">
          <Text className="text-2xl font-bold" style={{ color: theme.text }}>
            Operations
          </Text>
          <Text className="text-xs" style={{ color: theme.textMuted }}>
            2 active
          </Text>
        </View>

        <Pressable
          className="mt-3 rounded-3xl border p-5"
          style={{ borderColor: theme.accent, backgroundColor: theme.surface }}
          onPress={() => setActionsOpen(true)}
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-[11px]" style={{ color: theme.textMuted }}>
              Tactical Challenge
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.textMuted}
            />
          </View>
          <Text
            className="mt-2 text-lg font-semibold"
            style={{ color: theme.text }}
          >
            Metro Walk Challenge
          </Text>
          <Text className="mt-1 text-xs" style={{ color: theme.textMuted }}>
            Capture 3 station zones in 2 hours with short transfer walks.
          </Text>
          <Text
            className="mt-3 text-xs font-semibold"
            style={{ color: theme.accent }}
          >
            Pioneer badge
          </Text>
        </Pressable>

        <Pressable
          className="mt-3 rounded-3xl border p-5"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
          onPress={() => router.push("/(app)/activity")}
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-[11px]" style={{ color: theme.textMuted }}>
              Resource Run
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.textMuted}
            />
          </View>
          <Text
            className="mt-2 text-lg font-semibold"
            style={{ color: theme.text }}
          >
            Market Loop Mission
          </Text>
          <Text className="mt-1 text-xs" style={{ color: theme.textMuted }}>
            Survey the Sector 10 bazaar loop before evening rush.
          </Text>
          <Text
            className="mt-3 text-xs font-semibold"
            style={{ color: theme.accent }}
          >
            50 XP reward
          </Text>
        </Pressable>

        <View
          className="mt-5 rounded-3xl border p-4"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View
                className="h-10 w-10 items-center justify-center rounded-2xl"
                style={{ backgroundColor: theme.surfaceMuted }}
              >
                <Ionicons
                  name="people-outline"
                  size={18}
                  color={theme.textMuted}
                />
              </View>
              <View>
                <Text
                  className="text-sm font-semibold"
                  style={{ color: theme.text }}
                >
                  Dwarka Runners
                </Text>
                <Text className="text-xs" style={{ color: theme.textMuted }}>
                  {128 + rivalsCount} members active
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => router.push("/(app)/(tabs)/leaderboard")}
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
                Join
              </Text>
            </Pressable>
          </View>
        </View>

        <View
          className="mt-4 rounded-3xl border p-3"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="flame-outline" size={14} color={theme.textMuted} />
            <Text
              className="text-xs font-semibold"
              style={{ color: theme.text }}
            >
              Your streak expires in 3 hours
            </Text>
          </View>
        </View>

        <View
          className="mt-3 rounded-3xl border p-3"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons
              name="trending-up-outline"
              size={14}
              color={theme.textMuted}
            />
            <Text
              className="text-xs font-semibold"
              style={{ color: theme.text }}
            >
              Rohan overtook you in local rank
            </Text>
          </View>
        </View>
      </ScrollView>

      <BottomActionSheet
        visible={actionsOpen}
        onClose={() => setActionsOpen(false)}
        title="Safe Zone Briefing"
        subtitle="AQI-aware routes for evening movement"
      >
        <View
          className="rounded-2xl border p-4"
          style={{
            borderColor: theme.border,
            backgroundColor: theme.surfaceMuted,
          }}
        >
          <Text className="text-sm font-semibold" style={{ color: theme.text }}>
            Sector 12 Park Ring
          </Text>
          <Text className="mt-1 text-xs" style={{ color: theme.textMuted }}>
            22-minute stroll route with lower exposure pockets.
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
            Metro Walk Link
          </Text>
          <Text className="mt-1 text-xs" style={{ color: theme.textMuted }}>
            Two-station corridor with high tile density and low traffic.
          </Text>
        </View>
      </BottomActionSheet>
    </Screen>
  );
}
