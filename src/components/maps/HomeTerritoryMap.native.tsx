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
  userPolygons: Coordinate[][];
  userCenters: Coordinate[];
  othersPolygons: Coordinate[][];
  othersCenters: Coordinate[];
}

export function HomeTerritoryMap({
  region,
  currentLocation,
  userPolygons,
  userCenters,
  othersPolygons,
  othersCenters,
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
          pinColor="#38B6FF"
        />
      ) : null}
      {othersPolygons.map((polygon, index) => (
        <Polygon
          key={`others-polygon-${polygon[0]?.latitude}-${polygon[0]?.longitude}-${index}`}
          coordinates={polygon}
          strokeWidth={2}
          strokeColor="rgba(87,130,217,0.65)"
          fillColor="rgba(120,152,220,0.16)"
        />
      ))}
      {othersCenters.map((center, index) => (
        <Circle
          key={`others-center-${center.latitude}-${center.longitude}-${index}`}
          center={center}
          radius={52}
          strokeColor="rgba(87,130,217,0.65)"
          fillColor="rgba(120,152,220,0.14)"
        />
      ))}
      {userPolygons.map((polygon, index) => (
        <Polygon
          key={`user-polygon-${polygon[0]?.latitude}-${polygon[0]?.longitude}-${index}`}
          coordinates={polygon}
          strokeWidth={2}
          strokeColor="rgba(68,121,255,0.95)"
          fillColor="rgba(68,121,255,0.32)"
        />
      ))}
      {userCenters.map((center, index) => (
        <Circle
          key={`user-center-${center.latitude}-${center.longitude}-${index}`}
          center={center}
          radius={45}
          strokeColor="rgba(68,121,255,0.95)"
          fillColor="rgba(68,121,255,0.35)"
        />
      ))}
    </MapView>
  );
}
