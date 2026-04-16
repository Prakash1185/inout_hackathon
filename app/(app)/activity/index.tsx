import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker, Polygon, Polyline } from "react-native-maps";

import { Screen } from "@/src/components/Screen";
import { useAppTheme } from "@/src/store/ui-store";

export default function ActivityTrackingScreen() {
  const { theme } = useAppTheme();
  const initialRegion = useMemo(
    () => ({
      latitude: 28.4744,
      longitude: 77.504,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }),
    [],
  );

  const currentLocation = useMemo(
    () => ({
      latitude: 28.4744,
      longitude: 77.504,
    }),
    [],
  );

  const samplePath = useMemo(
    () => [
      { latitude: 28.4728, longitude: 77.4972 },
      { latitude: 28.4736, longitude: 77.4991 },
      { latitude: 28.4744, longitude: 77.5017 },
      { latitude: 28.4756, longitude: 77.504 },
      { latitude: 28.4771, longitude: 77.5061 },
      { latitude: 28.4784, longitude: 77.5082 },
      { latitude: 28.4792, longitude: 77.5101 },
    ],
    [],
  );

  const greenTerritory = useMemo(
    () => [
      { latitude: 28.4767, longitude: 77.5002 },
      { latitude: 28.4776, longitude: 77.5025 },
      { latitude: 28.4754, longitude: 77.5035 },
      { latitude: 28.4746, longitude: 77.5013 },
    ],
    [],
  );

  const redTerritory = useMemo(
    () => [
      { latitude: 28.4729, longitude: 77.5054 },
      { latitude: 28.4737, longitude: 77.5073 },
      { latitude: 28.4719, longitude: 77.5084 },
      { latitude: 28.4712, longitude: 77.5062 },
    ],
    [],
  );

  return (
    <Screen>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.background,
          },
        ]}
      >
        <View style={styles.header}>
          <Pressable
            style={[
              styles.iconButton,
              {
                borderColor: theme.border,
                backgroundColor: theme.surface,
              },
            ]}
          >
            <Ionicons name="settings-outline" size={18} color={theme.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text }]}>ACTIVITY</Text>
          <Pressable
            style={[
              styles.iconButton,
              {
                borderColor: theme.border,
                backgroundColor: theme.surface,
              },
            ]}
          >
            <Ionicons name="time-outline" size={18} color={theme.text} />
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCard,
              {
                borderColor: theme.border,
                backgroundColor: theme.surface,
              },
            ]}
          >
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>
              Distance
            </Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              2.4 km
            </Text>
          </View>
          <View
            style={{
              ...styles.statCard,
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
          >
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>
              Points / XP
            </Text>
            <Text style={[styles.statValue, { color: theme.text }]}>120 XP</Text>
          </View>
        </View>

        <View
          style={[
            styles.mapCard,
            {
              borderColor: theme.border,
            },
          ]}
        >
          <MapView style={styles.map} initialRegion={initialRegion}>
            <Polygon
              coordinates={greenTerritory}
              strokeColor="rgba(34,197,94,0.35)"
              fillColor="rgba(34,197,94,0.12)"
              strokeWidth={1}
            />
            <Polygon
              coordinates={redTerritory}
              strokeColor="rgba(239,68,68,0.35)"
              fillColor="rgba(239,68,68,0.10)"
              strokeWidth={1}
            />
            <Polyline
              coordinates={samplePath}
              strokeColor={theme.accent}
              strokeWidth={4}
            />
            <Marker coordinate={currentLocation} title="Current Location">
              <View style={styles.markerOuter}>
                <View style={styles.markerInner} />
              </View>
            </Marker>
          </MapView>
        </View>

        <Pressable
          style={[
            styles.ctaButton,
            {
              borderColor: theme.border,
              backgroundColor: theme.accent,
            },
          ]}
        >
          <Text style={[styles.ctaText, { color: theme.background }]}>
            Start Tracking
          </Text>
        </Pressable>
      </View>
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
    justifyContent: "space-between",
    marginBottom: 14,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 6,
  },
  mapCard: {
    flex: 1,
    overflow: "hidden",
    borderWidth: 1,
    borderRadius: 20,
    marginBottom: 14,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(59,130,246,0.24)",
  },
  markerInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: "#3B82F6",
  },
  ctaButton: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    fontSize: 15,
    fontWeight: "700",
  },
});
