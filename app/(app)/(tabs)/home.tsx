import { useQuery } from "@tanstack/react-query";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

// eslint-disable-next-line import/no-unresolved
import { HomeTerritoryMap } from "@/src/components/maps/HomeTerritoryMap";
import { NeonButton } from "@/src/components/NeonButton";
import { Screen } from "@/src/components/Screen";
import { StatCard } from "@/src/components/StatCard";
import { XpProgress } from "@/src/components/XpProgress";
import { getUserActivities } from "@/src/services/activity.service";
import { getActiveEvent } from "@/src/services/event.service";
import { getMyProfile } from "@/src/services/user.service";
import { useAuthStore } from "@/src/store/auth-store";

export default function HomeScreen() {
  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const setUser = useAuthStore((state) => state.setUser);

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: getMyProfile,
  });
  const eventQuery = useQuery({
    queryKey: ["active-event"],
    queryFn: getActiveEvent,
  });
  const activitiesQuery = useQuery({
    queryKey: ["my-activities"],
    queryFn: getUserActivities,
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
    return (activitiesQuery.data ?? [])
      .slice(0, 8)
      .map((activity) => activity.coordinates[0])
      .filter(Boolean);
  }, [activitiesQuery.data]);

  const territoryPolygons = useMemo(() => {
    return (activitiesQuery.data ?? [])
      .filter((activity) => activity.coordinates.length >= 3)
      .slice(0, 4)
      .map((activity) => activity.coordinates);
  }, [activitiesQuery.data]);

  const profile = profileQuery.data;

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 36 }}
      >
        <Text className="text-3xl font-bold text-white">Map Dashboard</Text>
        <Text className="mt-1 text-sm text-[#8a9aab]">
          Capture territory with every run. Compete. Grow your streak.
        </Text>

        <View className="mt-4 rounded-2xl border border-[#22303a] bg-[#12181d] p-3">
          <Text className="text-xs uppercase tracking-[1.5px] text-[#7f8f9d]">
            Active Event
          </Text>
          <Text className="mt-2 text-lg font-semibold text-[#38ff9c]">
            {eventQuery.data?.name ?? "No active event"}
          </Text>
          <Text className="mt-1 text-sm text-[#9dafbf]">
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
            <StatCard
              label="Streak"
              value={`${profile?.streak ?? 0} days`}
              accent="orange"
            />
          </View>
        </View>

        <View className="mt-5 h-[300px] overflow-hidden rounded-2xl border border-[#22303a]">
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
            territoryPolygons={territoryPolygons}
            territoryCenters={territoryCenters}
          />
        </View>

        <View className="mt-5">
          <NeonButton
            label="Start Activity"
            onPress={() => router.push("/(app)/activity")}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
