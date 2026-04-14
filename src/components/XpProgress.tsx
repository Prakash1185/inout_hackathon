import { Text, View } from "react-native";

interface XpProgressProps {
  currentXp: number;
  nextLevelXp: number;
}

export function XpProgress({ currentXp, nextLevelXp }: XpProgressProps) {
  const safeNext = Math.max(nextLevelXp, 1);
  const progress = Math.min(100, (currentXp / safeNext) * 100);

  return (
    <View className="rounded-2xl border border-[#1F2937] bg-[#121821] p-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-sm text-[#9CA3AF]">XP Progress</Text>
        <Text className="text-xs text-[#9CA3AF]">
          {currentXp} / {safeNext}
        </Text>
      </View>
      <View className="h-2 w-full overflow-hidden rounded-full bg-[#1F2937]">
        <View
          className="h-2 rounded-full bg-[#00FF9D]"
          style={{ width: `${progress}%` }}
        />
      </View>
    </View>
  );
}
