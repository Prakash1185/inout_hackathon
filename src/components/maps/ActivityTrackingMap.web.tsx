import { Text, View } from "react-native";

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

export function ActivityTrackingMap(props: ActivityTrackingMapProps) {
  const zoneCount = props.userPolygons.length + props.othersPolygons.length;

  return (
    <View className="flex-1 items-center justify-center bg-[#0e1317] px-4">
      <Text className="text-center text-sm text-[#c1ceda]">
        GPS map tracking is available on native builds.
      </Text>
      <Text className="mt-2 text-center text-xs text-[#8fa0b0]">
        Use Android or iOS development build for live path drawing.
      </Text>
      <Text className="mt-2 text-center text-xs text-[#8fa0b0]">
        Territories loaded: {zoneCount} | Your points:{" "}
        {props.coordinates.length}
      </Text>
      <Text
        className="mt-3 text-center text-xs text-[#66a7ff]"
        onPress={() =>
          props.onTerritoryPress?.({
            territoryId: "web-preview",
            ownerName: props.userOwnerName,
            ownerType: "you",
          })
        }
      >
        Tap here to preview territory owner interaction on web.
      </Text>
    </View>
  );
}
