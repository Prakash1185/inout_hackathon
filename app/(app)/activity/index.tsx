import * as Location from "expo-location";
import { router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Alert, Text, View } from "react-native";

// eslint-disable-next-line import/no-unresolved
import { ActivityTrackingMap } from "@/src/components/maps/ActivityTrackingMap";
import { NeonButton } from "@/src/components/NeonButton";
import { Screen } from "@/src/components/Screen";
import { useActivityStore } from "@/src/store/activity-store";
import { useAppTheme } from "@/src/store/ui-store";
import { calculateDistanceKm } from "@/src/utils/geo";

import type { Coordinate } from "@/shared/types";

export default function ActivityTrackingScreen() {
  const { theme } = useAppTheme();
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
        <Text className="text-2xl font-bold" style={{ color: theme.text }}>
          Activity Tracking
        </Text>
        <Text className="mt-1 text-sm" style={{ color: theme.textMuted }}>
          Start moving to draw your path in real time.
        </Text>

        <View className="mt-4 flex-row gap-3">
          <View
            className="flex-1 rounded-xl border p-3"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
          >
            <Text
              className="text-xs uppercase tracking-wider"
              style={{ color: theme.textMuted }}
            >
              Distance
            </Text>
            <Text
              className="mt-2 text-xl font-bold"
              style={{ color: theme.accent }}
            >
              {distanceKm.toFixed(2)} km
            </Text>
          </View>
          <View
            className="flex-1 rounded-xl border p-3"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
          >
            <Text
              className="text-xs uppercase tracking-wider"
              style={{ color: theme.textMuted }}
            >
              Points
            </Text>
            <Text
              className="mt-2 text-xl font-bold"
              style={{ color: theme.text }}
            >
              {coordinates.length}
            </Text>
          </View>
        </View>

        <View
          className="mt-4 flex-1 overflow-hidden rounded-2xl border"
          style={{ borderColor: theme.border }}
        >
          <ActivityTrackingMap
            initialCoordinate={initialCoordinate}
            coordinates={coordinates}
          />
        </View>

        <View className="mt-5">
          {!isTracking ? (
            <NeonButton
              label="Start Tracking"
              onPress={() => void startTracking()}
              variant="primary"
            />
          ) : (
            <NeonButton
              label="Stop & Review"
              onPress={stopTracking}
              variant="primary"
            />
          )}
        </View>
      </View>
    </Screen>
  );
}
