import { Text, View } from "react-native";

import {
  getGlycemicBarWidth,
  getGlycemicLabel,
} from "@/src/constants/food-intelligence";
import { useAppTheme } from "@/src/store/ui-store";

interface GlycemicScoreBarProps {
  score: number;
}

export function GlycemicScoreBar({ score }: GlycemicScoreBarProps) {
  const { theme } = useAppTheme();
  const label = getGlycemicLabel(score);

  return (
    <View>
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold" style={{ color: theme.text }}>
          Glycemic impact score
        </Text>
        <Text className="text-sm font-semibold" style={{ color: theme.text }}>
          {score}/100
        </Text>
      </View>

      <View
        className="mt-3 h-3 overflow-hidden rounded-full"
        style={{ backgroundColor: theme.surfaceMuted }}
      >
        <View
          className="h-3 rounded-full"
          style={{
            width: getGlycemicBarWidth(score) as `${number}%`,
            backgroundColor:
              label === "Low"
                ? "#74C69D"
                : label === "Medium"
                  ? "#B7A4FF"
                  : "#F59E8B",
          }}
        />
      </View>

      <Text className="mt-2 text-xs font-medium" style={{ color: theme.textMuted }}>
        {label} impact
      </Text>
    </View>
  );
}
