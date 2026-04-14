import { Text, View } from "react-native";

import { useAppTheme } from "@/src/store/ui-store";

interface XpProgressProps {
  currentXp: number;
  nextLevelXp: number;
}

export function XpProgress({ currentXp, nextLevelXp }: XpProgressProps) {
  const { theme } = useAppTheme();
  const safeNext = Math.max(nextLevelXp, 1);
  const progress = Math.min(100, (currentXp / safeNext) * 100);

  return (
    <View
      className="rounded-2xl border p-4"
      style={{ borderColor: theme.border, backgroundColor: theme.surface }}
    >
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-sm" style={{ color: theme.textMuted }}>
          XP Progress
        </Text>
        <Text className="text-xs" style={{ color: theme.textMuted }}>
          {currentXp} / {safeNext}
        </Text>
      </View>
      <View
        className="h-2 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: theme.surfaceMuted }}
      >
        <View
          className="h-2 rounded-full"
          style={{ backgroundColor: theme.accent, width: `${progress}%` }}
        />
      </View>
    </View>
  );
}
