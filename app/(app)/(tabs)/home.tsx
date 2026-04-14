import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

// eslint-disable-next-line import/no-unresolved
import { BottomActionSheet } from "@/src/components/BottomActionSheet";
import { HomeTerritoryMap } from "@/src/components/maps/HomeTerritoryMap";
import { NeonButton } from "@/src/components/NeonButton";
import { Screen } from "@/src/components/Screen";
import { StatCard } from "@/src/components/StatCard";
import { XpProgress } from "@/src/components/XpProgress";
import { getMapOverview } from "@/src/services/activity.service";
import { getActiveEvent } from "@/src/services/event.service";
import { getMyProfile } from "@/src/services/user.service";
import { useAuthStore } from "@/src/store/auth-store";
import { useAppTheme } from "@/src/store/ui-store";

export default function HomeScreen() {
  const { theme } = useAppTheme();
  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);

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
      if (mounted) {
        setCurrentLocation(location.coords);
      }
    }

    loadLocation().catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  const region = useMemo(
    () => ({
      latitude: currentLocation?.latitude ?? 19.076,
      longitude: currentLocation?.longitude ?? 72.8777,
      latitudeDelta: 0.035,
      longitudeDelta: 0.035,
    }),
    [currentLocation],
  );

  const territoryCenters = useMemo(() => {
    return mapOverviewQuery.data?.userCenters ?? [];
  }, [mapOverviewQuery.data?.userCenters]);

  const territoryPolygons = useMemo(() => {
    return mapOverviewQuery.data?.userPolygons ?? [];
  }, [mapOverviewQuery.data?.userPolygons]);

  const othersCenters = mapOverviewQuery.data?.othersCenters ?? [];
  const othersPolygons = mapOverviewQuery.data?.othersPolygons ?? [];

  const profile = profileQuery.data;
  const userArea = mapOverviewQuery.data?.stats.userCapturedArea ?? 0;
  const othersArea = mapOverviewQuery.data?.stats.othersCapturedArea ?? 0;
  const rivalsCount = mapOverviewQuery.data?.stats.othersCount ?? 0;

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 36 }}
      >
        <Text className="text-3xl font-bold" style={{ color: theme.text }}>
          Territory Board
        </Text>
        <Text className="mt-1 text-sm" style={{ color: theme.textMuted }}>
          Your area vs community area, live from the map.
        </Text>

        <View
          className="mt-4 rounded-2xl border p-3"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          <Text
            className="text-xs uppercase tracking-[1.5px]"
            style={{ color: theme.textMuted }}
          >
            Active Event
          </Text>
          <Text
            className="mt-2 text-lg font-semibold"
            style={{ color: theme.text }}
          >
            {eventQuery.data?.name ?? "No active event"}
          </Text>
          <Text className="mt-1 text-sm" style={{ color: theme.textMuted }}>
            {eventQuery.data?.location ?? "India"}
          </Text>
        </View>

        <View className="mt-4 gap-3">
          <XpProgress
            currentXp={profile?.xp ?? 0}
            nextLevelXp={profile?.nextLevelXp ?? 200}
          />
          <View className="flex-row gap-3">
            <StatCard
              label="Level"
              value={`${profile?.level ?? 1}`}
              accent="green"
            />
            <StatCard label="Rivals" value={`${rivalsCount}`} accent="blue" />
          </View>
          <View className="flex-row gap-3">
            <StatCard
              label="Your Area"
              value={`${userArea.toFixed(0)} m2`}
              accent="green"
            />
            <StatCard
              label="Community"
              value={`${othersArea.toFixed(0)} m2`}
              accent="blue"
            />
          </View>
        </View>

        <View
          className="mt-5 h-[320px] overflow-hidden rounded-2xl border"
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

        <View className="mt-5 gap-3">
          <NeonButton
            label="Start Activity"
            onPress={() => router.push("/(app)/activity")}
            variant="primary"
          />
          <NeonButton
            label="Open Mission Sheet"
            onPress={() => setActionsOpen(true)}
            variant="secondary"
          />
        </View>
      </ScrollView>

      <BottomActionSheet
        visible={actionsOpen}
        onClose={() => setActionsOpen(false)}
        title="Daily Missions"
        subtitle="Demo features for hackathon storytelling"
      >
        <View
          className="rounded-2xl border p-4"
          style={{
            borderColor: theme.border,
            backgroundColor: theme.surfaceMuted,
          }}
        >
          <Text className="text-sm font-semibold" style={{ color: theme.text }}>
            Streak Shield
          </Text>
          <Text className="mt-1 text-xs" style={{ color: theme.textMuted }}>
            Complete one 1km session today to protect your streak.
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
            Community Raid
          </Text>
          <Text className="mt-1 text-xs" style={{ color: theme.textMuted }}>
            Beat 2 rival zones in the next 24 hours to unlock a bonus badge.
          </Text>
        </View>
      </BottomActionSheet>
    </Screen>
  );
}
