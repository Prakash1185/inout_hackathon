import MapView, { Polyline } from "react-native-maps";

import type { Coordinate } from "@/shared/types";

interface ActivityTrackingMapProps {
  initialCoordinate: Coordinate;
  coordinates: Coordinate[];
}

export function ActivityTrackingMap({
  initialCoordinate,
  coordinates,
}: ActivityTrackingMapProps) {
  return (
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
  );
}
