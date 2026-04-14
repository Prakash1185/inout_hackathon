import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

interface NeonButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: ReactNode;
}

export function NeonButton({
  label,
  onPress,
  disabled,
  icon,
}: NeonButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="rounded-2xl"
      style={{
        shadowColor: "#38ff9c",
        shadowOpacity: 0.45,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
      }}
    >
      <View className="flex-row items-center justify-center gap-2 rounded-2xl border border-[#38ff9c]/40 bg-[#0f251b] px-5 py-4">
        {icon}
        <Text className="text-base font-semibold tracking-wide text-[#d8ffe9]">
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
