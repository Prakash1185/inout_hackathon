import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import type { Coordinate } from "@/shared/types";
import { NeonButton } from "@/src/components/NeonButton";
import { Screen } from "@/src/components/Screen";
import {
  createActivity,
  getMapOverview,
} from "@/src/services/activity.service";
import { getActiveEvent } from "@/src/services/event.service";
import { useActivityStore } from "@/src/store/activity-store";
import { useAuthStore } from "@/src/store/auth-store";
import { useAppTheme } from "@/src/store/ui-store";
import {
  approximatePolygonAreaSqMeters,
  calculateDistanceKm,
} from "@/src/utils/geo";
import { ActivityTrackingMap } from "../../../src/components/maps/ActivityTrackingMap";

const GREATER_NOIDA_JAGAT_FARM: Coordinate = {
  latitude: 28.4689,
  longitude: 77.5041,
};

const GALGOTIAS_COLLEGE: Coordinate = {
  latitude: 28.4747,
  longitude: 77.5002,
};

const demoUserPolygon: Coordinate[] = [
  { latitude: 28.4709, longitude: 77.5002 },
  { latitude: 28.4748, longitude: 77.5039 },
  { latitude: 28.4712, longitude: 77.5075 },
  { latitude: 28.4671, longitude: 77.5036 },
];

const demoRivalTerritories = [
  {
    ownerName: "Arya",
    center: { latitude: 28.4739, longitude: 77.4987 },
    polygon: [
      { latitude: 28.4761, longitude: 77.4969 },
      { latitude: 28.4778, longitude: 77.4998 },
      { latitude: 28.4741, longitude: 77.5024 },
      { latitude: 28.4722, longitude: 77.4993 },
    ] as Coordinate[],
    color: "rgba(255,120,120,0.92)",
  },
  {
    ownerName: "Vihaan",
    center: { latitude: 28.4664, longitude: 77.5096 },
    polygon: [
      { latitude: 28.4689, longitude: 77.5076 },
      { latitude: 28.4704, longitude: 77.5118 },
      { latitude: 28.4666, longitude: 77.5142 },
      { latitude: 28.4638, longitude: 77.5101 },
    ] as Coordinate[],
    color: "rgba(143,110,255,0.92)",
  },
  {
    ownerName: "Meera",
    center: { latitude: 28.4625, longitude: 77.4997 },
    polygon: [
      { latitude: 28.4644, longitude: 77.4966 },
      { latitude: 28.4664, longitude: 77.5001 },
      { latitude: 28.4626, longitude: 77.5032 },
      { latitude: 28.4599, longitude: 77.4996 },
    ] as Coordinate[],
    color: "rgba(66,185,131,0.92)",
  },
];

function estimateXp(distanceKm: number, areaSqMeters: number): number {
  return Math.round(distanceKm * 35 + (areaSqMeters / 100) * 6);
}

function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const hh = String(Math.floor(safe / 3600)).padStart(2, "0");
  const mm = String(Math.floor((safe % 3600) / 60)).padStart(2, "0");
  const ss = String(safe % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function isLikelyDelhiCoordinate(point?: Coordinate | null): boolean {
  if (!point) {
    return false;
  }

  return point.latitude > 27.5 && point.latitude < 29.2;
}

function buildCaptureCoordinates(path: Coordinate[]): Coordinate[] {
  if (path.length < 3) {
    return path;
  }

  const first = path[0];
  const last = path[path.length - 1];
  const loopGapMeters = calculateDistanceKm([first, last]) * 1000;

  if (loopGapMeters < 4) {
    return path;
  }

  return [...path, first];
}

export default function ActivityTrackingScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { height: windowHeight } = useWindowDimensions();
  const queryClient = useQueryClient();

  const authUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const setActivityDraft = useActivityStore((state) => state.setActivityDraft);

  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(
    null,
  );
  const [manualFocus, setManualFocus] = useState<Coordinate | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [durationSec, setDurationSec] = useState(0);
  const [movementStatus, setMovementStatus] = useState<
    "Idle" | "Walking" | "Paused"
  >("Idle");
  const [stopConfirmOpen, setStopConfirmOpen] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [ownerInfo, setOwnerInfo] = useState<{
    ownerName: string;
    ownerType: "you" | "rival";
  } | null>(null);
  const [lastLogged, setLastLogged] = useState<{
    distanceKm: number;
    areaSqMeters: number;
    xpEarned: number;
    durationSec: number;
  } | null>(null);

  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const eventQuery = useQuery({
    queryKey: ["active-event"],
    queryFn: getActiveEvent,
  });

  const mapOverviewQuery = useQuery({
    queryKey: ["map-overview"],
    queryFn: getMapOverview,
  });

  const saveMutation = useMutation({
    mutationFn: createActivity,
    onSuccess: async (result) => {
      if (authUser) {
        setUser({
          ...authUser,
          xp: result.user.xp,
          level: result.user.level,
          streak: result.user.streak,
          badges: result.user.badges,
        });
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["my-activities"] }),
        queryClient.invalidateQueries({ queryKey: ["profile"] }),
        queryClient.invalidateQueries({ queryKey: ["map-overview"] }),
        queryClient.invalidateQueries({ queryKey: ["leaderboard"] }),
      ]);

      setLastLogged({
        distanceKm: result.activity.distance,
        areaSqMeters: result.activity.areaCaptured,
        xpEarned: result.activity.xpEarned,
        durationSec,
      });

      setCoordinates([]);
      setDurationSec(0);
      setMovementStatus("Paused");
      setOwnerInfo(null);
      setStopConfirmOpen(false);
    },
    onError: () => {
      Alert.alert("Save failed", "Could not save activity. Please try again.");
    },
  });

  useEffect(() => {
    let mounted = true;

    async function prepareLocation() {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          "Location permission needed",
          "Enable location access to track your walk and capture territory.",
        );
        return;
      }

      const current = await Location.getCurrentPositionAsync({});
      if (!mounted) {
        return;
      }

      setCurrentLocation({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });
    }

    prepareLocation().catch(() => undefined);

    return () => {
      mounted = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isTracking) {
      return;
    }

    const timerId = setInterval(() => {
      setDurationSec((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [isTracking]);

  const backendUserPolygons = mapOverviewQuery.data?.userPolygons ?? [];
  const backendUserCenters = mapOverviewQuery.data?.userCenters ?? [];
  const backendOthersPolygons = mapOverviewQuery.data?.othersPolygons ?? [];
  const backendOthersCenters = mapOverviewQuery.data?.othersCenters ?? [];

  const backendAnchor =
    backendUserCenters[0] ?? backendOthersCenters[0] ?? null;
  const useBackendTerritories = isLikelyDelhiCoordinate(backendAnchor);

  const userPolygons = useMemo(() => {
    if (useBackendTerritories) {
      return [...backendUserPolygons, demoUserPolygon];
    }

    return [demoUserPolygon];
  }, [backendUserPolygons, useBackendTerritories]);

  const userCenters = useMemo(() => {
    if (useBackendTerritories) {
      return [...backendUserCenters, GALGOTIAS_COLLEGE];
    }

    return [GALGOTIAS_COLLEGE];
  }, [backendUserCenters, useBackendTerritories]);

  const othersPolygons = useMemo(() => {
    const demo = demoRivalTerritories.map((item) => item.polygon);
    if (useBackendTerritories) {
      return [...demo, ...backendOthersPolygons];
    }

    return demo;
  }, [backendOthersPolygons, useBackendTerritories]);

  const othersCenters = useMemo(() => {
    const demo = demoRivalTerritories.map((item) => item.center);
    if (useBackendTerritories) {
      return [...demo, ...backendOthersCenters];
    }

    return demo;
  }, [backendOthersCenters, useBackendTerritories]);

  const rivalNames = useMemo(() => {
    const demoNames = demoRivalTerritories.map((item) => item.ownerName);
    const backendNames = ["Kabir", "Naina", "Aarav", "Zoya", "Ira"];

    const totalCount = othersPolygons.length;
    return Array.from({ length: totalCount }, (_, index) => {
      if (index < demoNames.length) {
        return demoNames[index];
      }

      return backendNames[index - demoNames.length] ?? `Rival ${index + 1}`;
    });
  }, [othersPolygons.length]);

  const rivalColors = useMemo(() => {
    const demoColors = demoRivalTerritories.map((item) => item.color);
    const extra = [
      "rgba(246,174,45,0.92)",
      "rgba(235,99,157,0.92)",
      "rgba(87,141,255,0.92)",
      "rgba(92,208,192,0.92)",
    ];

    return [...demoColors, ...extra];
  }, []);

  const region = useMemo(() => {
    return manualFocus ?? currentLocation ?? GREATER_NOIDA_JAGAT_FARM;
  }, [currentLocation, manualFocus]);

  const distanceKm = useMemo(
    () => calculateDistanceKm(coordinates),
    [coordinates],
  );
  const areaCaptured = useMemo(
    () => approximatePolygonAreaSqMeters(buildCaptureCoordinates(coordinates)),
    [coordinates],
  );
  const liveXp = useMemo(
    () => estimateXp(distanceKm, areaCaptured),
    [distanceKm, areaCaptured],
  );
  const mapHeight = useMemo(
    () => Math.round(windowHeight * 0.55),
    [windowHeight],
  );

  async function locateMe() {
    const current = await Location.getCurrentPositionAsync({});
    const point: Coordinate = {
      latitude: current.coords.latitude,
      longitude: current.coords.longitude,
    };

    setCurrentLocation(point);
    setManualFocus(point);
    setOwnerInfo({
      ownerName: authUser?.name?.split(" ")[0] ?? "You",
      ownerType: "you",
    });
  }

  async function startTracking() {
    if (isTracking) {
      return;
    }

    const permission = await Location.getForegroundPermissionsAsync();
    if (permission.status !== "granted") {
      const requested = await Location.requestForegroundPermissionsAsync();
      if (requested.status !== "granted") {
        Alert.alert(
          "Permission required",
          "Allow location access to start tracking this walk.",
        );
        return;
      }
    }

    const current = await Location.getCurrentPositionAsync({});
    const point: Coordinate = {
      latitude: current.coords.latitude,
      longitude: current.coords.longitude,
    };

    setCurrentLocation(point);
    setManualFocus(point);
    setCoordinates([point]);
    setDurationSec(0);
    setLastLogged(null);
    setMovementStatus("Walking");
    setIsTracking(true);

    subscriptionRef.current?.remove();
    subscriptionRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 3,
        timeInterval: 2500,
      },
      (location) => {
        const nextPoint: Coordinate = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setCurrentLocation(nextPoint);
        setCoordinates((prev) => {
          if (!prev.length) {
            return [nextPoint];
          }

          const last = prev[prev.length - 1];
          const hopMeters = calculateDistanceKm([last, nextPoint]) * 1000;
          if (hopMeters < 2.5) {
            return prev;
          }

          return [...prev, nextPoint];
        });
      },
    );
  }

  function stopTrackingOnly() {
    setIsTracking(false);
    setMovementStatus("Paused");
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
  }

  function confirmStopAndSave() {
    stopTrackingOnly();

    if (coordinates.length < 2) {
      setStopConfirmOpen(false);
      Alert.alert(
        "Too short",
        "Track a few points before stopping to log activity.",
      );
      return;
    }

    const capturedCoordinates = buildCaptureCoordinates(coordinates);
    setActivityDraft(capturedCoordinates, distanceKm);

    saveMutation.mutate({
      coordinates: capturedCoordinates,
      eventId: eventQuery.data?.id,
    });
  }

  const userName = authUser?.name?.split(" ")[0] ?? "You";
  const trackingStatus = isTracking ? movementStatus : "Idle";

  return (
    <Screen>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Pressable
            style={[
              styles.backButton,
              { borderColor: theme.border, backgroundColor: theme.surface },
            ]}
            onPress={() => router.replace("/(app)/(tabs)/home")}
          >
            <Ionicons name="chevron-back" size={18} color={theme.text} />
          </Pressable>

          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Activity Walk
          </Text>

          <View
            style={[
              styles.livePill,
              {
                borderColor: isTracking ? theme.accent : theme.border,
                backgroundColor: theme.surface,
              },
            ]}
          >
            <View
              style={{
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: isTracking ? theme.accent : theme.textMuted,
              }}
            />
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: theme.textMuted,
              }}
            >
              {trackingStatus.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCard,
              { borderColor: theme.border, backgroundColor: theme.surface },
            ]}
          >
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>
              Timer
            </Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {formatDuration(durationSec)}
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              { borderColor: theme.border, backgroundColor: theme.surface },
            ]}
          >
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>
              Distance
            </Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {distanceKm.toFixed(2)} km
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              { borderColor: theme.border, backgroundColor: theme.surface },
            ]}
          >
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>
              Area
            </Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {areaCaptured.toFixed(0)} m2
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.mapCard,
            {
              borderColor: theme.border,
              height: mapHeight,
            },
          ]}
        >
          <ActivityTrackingMap
            initialCoordinate={region}
            currentLocation={currentLocation}
            coordinates={coordinates}
            userPolygons={userPolygons}
            userCenters={userCenters}
            othersPolygons={othersPolygons}
            othersCenters={othersCenters}
            userOwnerName={userName}
            otherOwnerNames={rivalNames}
            otherTerritoryColors={rivalColors}
            onTerritoryPress={(payload) => {
              setOwnerInfo({
                ownerName: payload.ownerName,
                ownerType: payload.ownerType,
              });
            }}
          />

          <View style={styles.floatingActions}>
            <Pressable
              style={[
                styles.mapAction,
                { borderColor: theme.border, backgroundColor: theme.surface },
              ]}
              onPress={() => setShowLegend((prev) => !prev)}
            >
              <Ionicons name="layers-outline" size={16} color={theme.text} />
            </Pressable>

            <Pressable
              style={[
                styles.mapAction,
                { borderColor: theme.border, backgroundColor: theme.surface },
              ]}
              onPress={() => locateMe().catch(() => undefined)}
            >
              <Ionicons name="locate-outline" size={16} color={theme.text} />
            </Pressable>

            <Pressable
              style={[
                styles.mapAction,
                { borderColor: theme.border, backgroundColor: theme.surface },
              ]}
              onPress={() => {
                setManualFocus(GREATER_NOIDA_JAGAT_FARM);
                setOwnerInfo({
                  ownerName: "Zone: Jagat Farm",
                  ownerType: "you",
                });
                mapOverviewQuery.refetch().catch(() => undefined);
              }}
            >
              <Ionicons name="compass-outline" size={16} color={theme.text} />
            </Pressable>
          </View>

          {showLegend ? (
            <View
              style={[
                styles.legend,
                { borderColor: theme.border, backgroundColor: theme.surface },
              ]}
            >
              <Text style={{ fontSize: 11, color: theme.textMuted }}>
                Territory Legend
              </Text>
              <View style={styles.legendRow}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: "rgba(68,121,255,0.92)" },
                  ]}
                />
                <Text style={{ fontSize: 11, color: theme.text }}>
                  Your captured area
                </Text>
              </View>
              {demoRivalTerritories.map((item) => (
                <View key={item.ownerName} style={styles.legendRow}>
                  <View
                    style={[styles.legendDot, { backgroundColor: item.color }]}
                  />
                  <Text style={{ fontSize: 11, color: theme.text }}>
                    {item.ownerName}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {ownerInfo ? (
            <View
              style={[
                styles.ownerInfo,
                { borderColor: theme.border, backgroundColor: theme.surface },
              ]}
            >
              <Text style={{ fontSize: 11, color: theme.textMuted }}>
                Territory Owner
              </Text>
              <Text
                style={{
                  marginTop: 2,
                  fontSize: 13,
                  fontWeight: "700",
                  color: theme.text,
                }}
              >
                {ownerInfo.ownerName}
              </Text>
              <Text style={{ fontSize: 11, color: theme.textMuted }}>
                {ownerInfo.ownerType === "you"
                  ? "This section is currently yours / focused"
                  : "This section is currently captured by rival"}
              </Text>
            </View>
          ) : null}
        </View>

        <View
          style={[
            styles.liveStrip,
            { borderColor: theme.border, backgroundColor: theme.surface },
          ]}
        >
          <View>
            <Text style={{ fontSize: 11, color: theme.textMuted }}>
              Live XP
            </Text>
            <Text
              style={{
                marginTop: 2,
                fontSize: 18,
                fontWeight: "700",
                color: theme.text,
              }}
            >
              {liveXp}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 11, color: theme.textMuted }}>
              Path points
            </Text>
            <Text
              style={{
                marginTop: 2,
                fontSize: 18,
                fontWeight: "700",
                color: theme.text,
              }}
            >
              {coordinates.length}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 11, color: theme.textMuted }}>Event</Text>
            <Text
              style={{
                marginTop: 2,
                fontSize: 13,
                fontWeight: "700",
                color: theme.text,
              }}
            >
              {eventQuery.data?.name?.split(" ")[0] ?? "Active"}
            </Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          {!isTracking ? (
            <NeonButton
              label="Start Tracking"
              onPress={startTracking}
              icon={<Ionicons name="play" size={16} color="#FFFFFF" />}
            />
          ) : (
            <NeonButton
              label="Stop & Log Walk"
              onPress={() => setStopConfirmOpen(true)}
              icon={<Ionicons name="stop" size={16} color="#FFFFFF" />}
            />
          )}
        </View>
        {/* 
        {lastLogged ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-2"
          >
            <View
              style={{
                borderWidth: 1,
                borderRadius: 14,
                borderColor: theme.border,
                backgroundColor: theme.surface,
                paddingHorizontal: 12,
                paddingVertical: 10,
                minWidth: 280,
              }}
            >
              <Text style={{ fontSize: 11, color: theme.textMuted }}>
                Last Logged Walk
              </Text>
              <Text
                style={{
                  marginTop: 2,
                  fontSize: 14,
                  fontWeight: "700",
                  color: theme.text,
                }}
              >
                {lastLogged.distanceKm.toFixed(2)} km |{" "}
                {lastLogged.areaSqMeters.toFixed(0)} m2 | +{lastLogged.xpEarned}{" "}
                XP
              </Text>
              <Text
                style={{ marginTop: 2, fontSize: 11, color: theme.textMuted }}
              >
                Duration {formatDuration(lastLogged.durationSec)}. Saved to
                profile activity log.
              </Text>
            </View>
          </ScrollView>
        ) : null} */}
      </View>

      <Modal
        visible={stopConfirmOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setStopConfirmOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setStopConfirmOpen(false)}
        >
          <Pressable
            style={{
              borderWidth: 1,
              borderRadius: 18,
              borderColor: theme.border,
              backgroundColor: theme.surface,
              padding: 16,
              width: "88%",
              alignSelf: "center",
              marginTop: "60%",
            }}
            onPress={() => undefined}
          >
            <Text
              style={{ fontSize: 18, fontWeight: "700", color: theme.text }}
            >
              Stop this walk?
            </Text>
            <Text
              style={{ marginTop: 8, fontSize: 13, color: theme.textMuted }}
            >
              We will log your current path, captured area, and XP to your
              profile.
            </Text>

            <View style={{ marginTop: 14, gap: 10 }}>
              <NeonButton
                label={saveMutation.isPending ? "Logging..." : "Yes, Stop & Save"}
                onPress={confirmStopAndSave}
                disabled={saveMutation.isPending}
                icon={<Ionicons name="stop" size={16} color="#FFFFFF" />}
              />

              <NeonButton
                label="Continue Walking"
                onPress={() => setStopConfirmOpen(false)}
                variant="secondary"
                icon={<Ionicons name="walk" size={16} color={theme.text} />}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 14,
    gap: 10,
  },
  backButton: {
    width: 38,
    height: 38,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: "800",
    flex: 1,
  },
  livePill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  contextCard: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 6,
  },
  mapCard: {
    overflow: "hidden",
    borderWidth: 1,
    borderRadius: 18,
    marginBottom: 10,
    position: "relative",
  },
  floatingActions: {
    position: "absolute",
    right: 10,
    top: 10,
    gap: 8,
  },
  mapAction: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  ownerInfo: {
    position: "absolute",
    left: 10,
    bottom: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    maxWidth: "80%",
  },
  legend: {
    position: "absolute",
    left: 10,
    top: 10,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 5,
    minWidth: 150,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveStrip: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionsRow: {
    marginTop: 10,
    marginBottom: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
});
