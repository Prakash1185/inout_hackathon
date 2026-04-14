import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

interface NeonButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  variant?: "primary" | "secondary";
}

export function NeonButton({
  label,
  onPress,
  disabled,
  icon,
  variant = "primary",
}: NeonButtonProps) {
  const primary = variant === "primary";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="rounded-2xl"
      style={{
        shadowColor: primary ? "#FF7A00" : "#00FF9D",
        shadowOpacity: 0.35,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 8,
      }}
    >
      <View
        className={`flex-row items-center justify-center gap-2 rounded-2xl border px-5 py-4 ${
          primary
            ? "border-[#FFB347] bg-[#FF7A00]"
            : "border-[#00FF9D] bg-[#121821]"
        }`}
      >
        {icon}
        <Text
          className={`text-base font-semibold tracking-wide ${
            primary ? "text-[#0B0F14]" : "text-[#E7FFF6]"
          }`}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
