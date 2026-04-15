import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/src/store/ui-store";

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
  const { theme } = useAppTheme();
  const primary = variant === "primary";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="rounded-2xl"
      style={{
        shadowColor: theme.accent,
        shadowOpacity: primary ? 0.28 : 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
        elevation: primary ? 8 : 2,
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <View
        className="flex-row items-center justify-center gap-2 rounded-2xl border px-5 py-4"
        style={{
          borderColor: theme.border,
          backgroundColor: primary ? theme.accent : theme.surface,
        }}
      >
        {icon}
        <Text
          className="text-base font-semibold tracking-wide"
          style={{ color: primary ? "#2D2308" : theme.text }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
