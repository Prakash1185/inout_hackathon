import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { useAppTheme } from "@/src/store/ui-store";

interface SuggestionCardProps {
  suggestion: string;
}

export function SuggestionCard({ suggestion }: SuggestionCardProps) {
  const { theme } = useAppTheme();

  return (
    <View
      className="rounded-3xl border px-5 py-5"
      style={{ borderColor: theme.border, backgroundColor: theme.surface }}
    >
      <View className="flex-row items-center gap-3">
        <View
          className="h-10 w-10 items-center justify-center rounded-full border"
          style={{ borderColor: theme.border, backgroundColor: theme.surfaceMuted }}
        >
          <Ionicons name="bulb-outline" size={18} color={theme.text} />
        </View>
        <View>
          <Text className="text-sm font-semibold" style={{ color: theme.text }}>
            Smart suggestion
          </Text>
          <Text className="text-xs" style={{ color: theme.textMuted }}>
            Based on your meal
          </Text>
        </View>
      </View>

      <Text className="mt-4 text-sm leading-6" style={{ color: theme.textMuted }}>
        {suggestion}
      </Text>
    </View>
  );
}
