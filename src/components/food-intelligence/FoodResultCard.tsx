import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import type { MealAnalysisResult } from "@/src/constants/food-intelligence";
import { useAppTheme } from "@/src/store/ui-store";

interface FoodResultCardProps {
  result: MealAnalysisResult;
}

export function FoodResultCard({ result }: FoodResultCardProps) {
  const { theme } = useAppTheme();

  return (
    <View
      className="rounded-3xl border px-5 py-5"
      style={{ borderColor: theme.border, backgroundColor: theme.surface }}
    >
      <Text className="text-lg font-semibold" style={{ color: theme.text }}>
        {result.title}
      </Text>
      <Text className="mt-1 text-sm" style={{ color: theme.textMuted }}>
        {result.subtitle}
      </Text>

      <View className="mt-5 gap-3">
        {result.detectedItems.map((item) => (
          <View
            key={item}
            className="flex-row items-center gap-3 rounded-2xl border px-4 py-3"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surfaceMuted,
            }}
          >
            <View
              className="h-9 w-9 items-center justify-center rounded-full border"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surface,
              }}
            >
              <Ionicons name="restaurant-outline" size={16} color={theme.text} />
            </View>
            <Text className="text-sm font-medium" style={{ color: theme.text }}>
              {item}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
