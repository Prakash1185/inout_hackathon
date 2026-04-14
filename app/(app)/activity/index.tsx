import * as Location from "expo-location";
import { router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Alert, Text, View } from "react-native";

import { NeonButton } from "@/src/components/NeonButton";
import { Screen } from "@/src/components/Screen";
import { useActivityStore } from "@/src/store/activity-store";
import { calculateDistanceKm } from "@/src/utils/geo";

import type { Coordinate } from "@/shared/types";

export default function ActivityTrackingScreen() {
  const mapsModule = useMemo(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require("react-native-maps");
    } catch {
      return null;
    }
  }, []);

  const MapView = mapsModule?.default;
  const Polyline = mapsModule?.Polyline;
  const isMapsAvailable = Boolean(MapView && Polyline);

  const [isTracking, setIsTracking] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const setActivityDraft = useActivityStore((state) => state.setActivityDraft);

  const distanceKm = useMemo(
    () => calculateDistanceKm(coordinates),
    [coordinates],
  );

  async function startTracking() {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== "granted") {
      Alert.alert(
        "Permission required",
        "Location permission is required to track activity.",
      );
      return;
    }

    const initial = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    setCoordinates([
      {
        latitude: initial.coords.latitude,
        longitude: initial.coords.longitude,
      },
    ]);

    subscriptionRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 3000,
        distanceInterval: 4,
      },
      (loc) => {
        setCoordinates((prev) => [
          ...prev,
          { latitude: loc.coords.latitude, longitude: loc.coords.longitude },
        ]);
      },
    );

    setIsTracking(true);
  }

  function stopTracking() {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
    setIsTracking(false);

    if (coordinates.length < 2) {
      Alert.alert(
        "Not enough data",
        "Move a bit more before stopping the activity.",
      );
      return;
    }

    setActivityDraft(coordinates, distanceKm);
    router.push("/(app)/activity/result");
  }

  const initialCoordinate = coordinates[0] ?? {
    latitude: 19.076,
    longitude: 72.8777,
  };

  return (
    <Screen>
      <View className="flex-1 p-4">
        <Text className="text-2xl font-bold text-white">Activity Tracking</Text>
        <Text className="mt-1 text-sm text-[#8ea0b0]">
          Start moving to draw your path in real time.
        </Text>

        <View className="mt-4 flex-row gap-3">
          <View className="flex-1 rounded-xl border border-[#25313a] bg-[#12181d] p-3">
            <Text className="text-xs uppercase tracking-wider text-[#7f8f9d]">
              Distance
            </Text>
            <Text className="mt-2 text-xl font-bold text-[#38ff9c]">
              {distanceKm.toFixed(2)} km
            </Text>
          </View>
          <View className="flex-1 rounded-xl border border-[#25313a] bg-[#12181d] p-3">
            <Text className="text-xs uppercase tracking-wider text-[#7f8f9d]">
              Points
            </Text>
            <Text className="mt-2 text-xl font-bold text-[#ff8a33]">
              {coordinates.length}
            </Text>
          </View>
        </View>

        <View className="mt-4 flex-1 overflow-hidden rounded-2xl border border-[#22303a]">
          {isMapsAvailable ? (
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                ...initialCoordinate,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
              showsUserLocation
              followsUserLocation
            >
              {coordinates.length > 1 ? (
                <Polyline
                  coordinates={coordinates}
                  strokeColor="#38ff9c"
                  strokeWidth={5}
                />
              ) : null}
            </MapView>
          ) : (
            <View className="flex-1 items-center justify-center bg-[#0e1317] px-4">
              <Text className="text-center text-sm text-[#c1ceda]">
                Map native module unavailable in this client.
              </Text>
              <Text className="mt-2 text-center text-xs text-[#8fa0b0]">
                Run this app in a development build to use GPS map tracking.
              </Text>
            </View>
          )}
        </View>

        <View className="mt-5">
          {!isTracking ? (
            <NeonButton
              label="Start Tracking"
              onPress={() => void startTracking()}
            />
          ) : (
            <NeonButton label="Stop & Review" onPress={stopTracking} />
          )}
        </View>
      </View>
    </Screen>
  );
}
