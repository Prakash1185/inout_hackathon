import { Platform } from "react-native";
import MapView, {
    Circle,
    Marker,
    Polygon,
    type Region,
} from "react-native-maps";

import type { Coordinate } from "@/shared/types";

interface HomeTerritoryMapProps {
  region: Region;
  currentLocation: Coordinate | null;
  territoryPolygons: Coordinate[][];
  territoryCenters: Coordinate[];
}

export function HomeTerritoryMap({
  region,
  currentLocation,
  territoryPolygons,
  territoryCenters,
}: HomeTerritoryMapProps) {
  const mapType = Platform.OS === "ios" ? "mutedStandard" : "standard";

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={region}
      region={region}
      showsUserLocation
      showsMyLocationButton
      mapType={mapType}
    >
      {currentLocation ? (
        <Marker
          coordinate={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
          }}
          title="You"
        />
      ) : null}
      {territoryPolygons.map((polygon, index) => (
        <Polygon
          key={`polygon-${polygon[0]?.latitude}-${polygon[0]?.longitude}-${index}`}
          coordinates={polygon}
          strokeWidth={2}
          strokeColor="rgba(56,255,156,0.85)"
          fillColor="rgba(56,255,156,0.14)"
        />
      ))}
      {territoryCenters.map((center, index) => (
        <Circle
          key={`${center.latitude}-${center.longitude}-${index}`}
          center={center}
          radius={45}
          strokeColor="rgba(56,255,156,0.8)"
          fillColor="rgba(56,255,156,0.18)"
        />
      ))}
    </MapView>
  );
}
