import { Text, View } from "react-native";

import type { Coordinate } from "@/shared/types";

interface ActivityTrackingMapProps {
  initialCoordinate: Coordinate;
  coordinates: Coordinate[];
}

export function ActivityTrackingMap(_props: ActivityTrackingMapProps) {
  return (
    <View className="flex-1 items-center justify-center bg-[#0e1317] px-4">
      <Text className="text-center text-sm text-[#c1ceda]">
        GPS map tracking is available on native builds.
      </Text>
      <Text className="mt-2 text-center text-xs text-[#8fa0b0]">
        Use Android or iOS development build for live path drawing.
      </Text>
    </View>
  );
}
