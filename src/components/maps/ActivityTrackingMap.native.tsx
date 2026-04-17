import MapView, { Circle, Marker, Polygon, Polyline } from "react-native-maps";

import type { Coordinate } from "@/shared/types";

interface ActivityTrackingMapProps {
  initialCoordinate: Coordinate;
  currentLocation: Coordinate | null;
  coordinates: Coordinate[];
  userPolygons: Coordinate[][];
  userCenters: Coordinate[];
  othersPolygons: Coordinate[][];
  othersCenters: Coordinate[];
  userOwnerName: string;
  otherOwnerNames: string[];
  otherTerritoryColors?: string[];
  onTerritoryPress?: (payload: {
    territoryId: string;
    ownerName: string;
    ownerType: "you" | "rival";
  }) => void;
}

export function ActivityTrackingMap({
  initialCoordinate,
  currentLocation,
  coordinates,
  userPolygons,
  userCenters,
  othersPolygons,
  othersCenters,
  userOwnerName,
  otherOwnerNames,
  otherTerritoryColors,
  onTerritoryPress,
}: ActivityTrackingMapProps) {
  const fallbackPalette = [
    { stroke: "rgba(255,120,120,0.9)", fill: "rgba(255,120,120,0.22)" },
    { stroke: "rgba(143,110,255,0.9)", fill: "rgba(143,110,255,0.20)" },
    { stroke: "rgba(66,185,131,0.9)", fill: "rgba(66,185,131,0.20)" },
    { stroke: "rgba(246,174,45,0.92)", fill: "rgba(246,174,45,0.20)" },
  ];

  function getOtherColor(index: number) {
    const custom = otherTerritoryColors?.[index];
    if (custom) {
      return {
        stroke: custom,
        fill: custom.replace("0.9", "0.2").replace("1)", "0.2)"),
      };
    }

    return fallbackPalette[index % fallbackPalette.length];
  }

  return (
    <MapView
      style={{ flex: 1 }}
      region={{
        ...initialCoordinate,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      }}
      showsUserLocation
      showsMyLocationButton
    >
      {userPolygons.map((polygon, index) => (
        <Polygon
          key={`user-zone-${polygon[0]?.latitude}-${polygon[0]?.longitude}-${index}`}
          coordinates={polygon}
          strokeWidth={2}
          strokeColor="rgba(68,121,255,0.95)"
          fillColor="rgba(68,121,255,0.28)"
          tappable
          onPress={() =>
            onTerritoryPress?.({
              territoryId: `user-${index}`,
              ownerName: userOwnerName,
              ownerType: "you",
            })
          }
        />
      ))}

      {othersPolygons.map((polygon, index) => (
        <Polygon
          key={`others-zone-${polygon[0]?.latitude}-${polygon[0]?.longitude}-${index}`}
          coordinates={polygon}
          strokeWidth={2}
          strokeColor={getOtherColor(index).stroke}
          fillColor={getOtherColor(index).fill}
          tappable
          onPress={() =>
            onTerritoryPress?.({
              territoryId: `others-${index}`,
              ownerName: otherOwnerNames[index] ?? `Rival ${index + 1}`,
              ownerType: "rival",
            })
          }
        />
      ))}

      {othersCenters.map((center, index) => (
        <Circle
          key={`others-center-${center.latitude}-${center.longitude}-${index}`}
          center={center}
          radius={42}
          strokeColor={getOtherColor(index).stroke}
          fillColor={getOtherColor(index).fill}
          onPress={() =>
            onTerritoryPress?.({
              territoryId: `others-center-${index}`,
              ownerName: otherOwnerNames[index] ?? `Rival ${index + 1}`,
              ownerType: "rival",
            })
          }
        />
      ))}

      {userCenters.map((center, index) => (
        <Circle
          key={`user-center-${center.latitude}-${center.longitude}-${index}`}
          center={center}
          radius={36}
          strokeColor="rgba(68,121,255,0.95)"
          fillColor="rgba(68,121,255,0.25)"
          onPress={() =>
            onTerritoryPress?.({
              territoryId: `user-center-${index}`,
              ownerName: userOwnerName,
              ownerType: "you",
            })
          }
        />
      ))}

      {coordinates.length > 1 ? (
        <Polyline
          coordinates={coordinates}
          strokeColor="#FF7A00"
          strokeWidth={5}
        />
      ) : null}

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
    </MapView>
  );
}
