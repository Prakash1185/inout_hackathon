import { Text, View } from "react-native";

import type { Coordinate } from "@/shared/types";

interface HomeTerritoryMapProps {
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  currentLocation: Coordinate | null;
  territoryPolygons: Coordinate[][];
  territoryCenters: Coordinate[];
}

export function HomeTerritoryMap(_props: HomeTerritoryMapProps) {
  return (
    <View className="flex-1 items-center justify-center bg-[#0e1317] px-4">
      <Text className="text-center text-sm text-[#c1ceda]">
        Map view is available on native builds.
      </Text>
      <Text className="mt-2 text-center text-xs text-[#8fa0b0]">
        Continue using leaderboard, profile, and activity stats on web.
      </Text>
    </View>
  );
}
