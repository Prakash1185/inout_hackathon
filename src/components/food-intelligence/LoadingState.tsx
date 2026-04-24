import { ActivityIndicator, Text, View } from "react-native";

import { useAppTheme } from "@/src/store/ui-store";

export function LoadingState() {
  const { theme } = useAppTheme();

  return (
    <View
      className="rounded-3xl border px-5 py-8"
      style={{ borderColor: theme.border, backgroundColor: theme.surface }}
    >
      <View className="items-center">
        <ActivityIndicator color={theme.accent} />
        <Text
          className="mt-4 text-base font-semibold"
          style={{ color: theme.text }}
        >
          Analyzing your meal...
        </Text>
        <Text
          className="mt-2 text-center text-sm leading-6"
          style={{ color: theme.textMuted }}
        >
          Looking at likely ingredients, portion balance, and glycemic impact.
        </Text>
      </View>
    </View>
  );
}
