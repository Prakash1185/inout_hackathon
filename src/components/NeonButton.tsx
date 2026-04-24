import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/src/store/ui-store";

type IoniconName = keyof typeof Ionicons.glyphMap;

interface NeonButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  variant?: "primary" | "secondary";
}

function resolveContextIconName(label: string): IoniconName | null {
  const normalized = label.trim().toLowerCase();

  if (
    normalized.includes("google") ||
    normalized.includes("apple") ||
    normalized.includes("facebook")
  ) {
    return null;
  }

  if (normalized.includes("start")) {
    return "play";
  }
  if (normalized.includes("stop")) {
    return "stop";
  }
  if (normalized.includes("save")) {
    return "checkmark";
  }
  if (normalized.includes("continue")) {
    return "arrow-forward";
  }
  if (normalized.includes("back")) {
    return "arrow-back";
  }
  if (normalized.includes("close")) {
    return "close";
  }
  if (normalized.includes("logout") || normalized.includes("sign out")) {
    return "log-out-outline";
  }
  if (
    normalized.includes("sign in") ||
    normalized.includes("login") ||
    normalized.includes("log in")
  ) {
    return "log-in-outline";
  }
  if (
    normalized.includes("create account") ||
    normalized.includes("sign up") ||
    normalized.includes("signup")
  ) {
    return "person-add-outline";
  }
  if (normalized.includes("walk")) {
    return "walk";
  }
  if (normalized.includes("generate")) {
    return "sparkles";
  }
  if (normalized.includes("finish")) {
    return "checkmark-done";
  }
  if (normalized.includes("discard") || normalized.includes("cancel")) {
    return "close-outline";
  }
  if (normalized.includes("skip")) {
    return "play-skip-forward";
  }
  if (normalized.includes("join")) {
    return "enter-outline";
  }

  return null;
}

export function NeonButton({
  label,
  onPress,
  disabled,
  icon,
  variant = "primary",
}: NeonButtonProps) {
  const { mode, theme } = useAppTheme();
  const primary = variant === "primary";
  const isLightMode = mode === "light";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      className="w-full"
      style={({ hovered, pressed }) => ({
        opacity: disabled ? 0.55 : 1,
        transform: [
          { translateY: pressed ? 1 : 0 },
          { scale: hovered && !pressed ? 1.01 : 1 },
        ],
      })}
    >
      {({ hovered, pressed }) => {
        const buttonTheme = theme.button;

        const gradientColors = primary
          ? [
              hovered
                ? buttonTheme.primaryHoverStart
                : buttonTheme.primaryStart,
              hovered ? buttonTheme.primaryHoverEnd : buttonTheme.primaryEnd,
            ] as const
          : [
              hovered
                ? buttonTheme.secondaryHoverStart
                : buttonTheme.secondaryStart,
              hovered
                ? buttonTheme.secondaryHoverEnd
                : buttonTheme.secondaryEnd,
            ] as const;

        const borderColor = primary
          ? buttonTheme.primaryStroke
          : buttonTheme.secondaryStroke;

        const highlightColor = primary
          ? buttonTheme.primaryHighlight
          : buttonTheme.secondaryHighlight;

        const labelColor = primary
          ? buttonTheme.primaryLabel
          : buttonTheme.secondaryLabel;
        const autoIconName = !icon ? resolveContextIconName(label) : null;
        const shadowColor = primary
          ? buttonTheme.primaryGlow
          : buttonTheme.secondaryDepth;
        const chipNode = icon ? (
          icon
        ) : autoIconName ? (
          <Ionicons name={autoIconName} size={14} color={labelColor} />
        ) : null;
        const chipBackground = primary
          ? "rgba(255,255,255,0.12)"
          : "rgba(17,24,39,0.05)";
        const chipBorder = primary
          ? "rgba(255,255,255,0.14)"
          : "rgba(17,24,39,0.06)";
        const shadowOpacity = isLightMode
          ? primary
            ? hovered
              ? 0.05
              : 0.035
            : hovered
              ? 0.035
              : 0.025
          : primary
            ? hovered
              ? 0.08
              : 0.06
            : hovered
              ? 0.05
              : 0.04;
        const shadowRadius = isLightMode
          ? hovered
            ? 7
            : 5
          : hovered
            ? 10
            : 8;
        const shadowHeight = pressed
          ? 2
          : hovered
            ? isLightMode
              ? 4
              : 5
            : isLightMode
              ? 3
              : 4;
        const underlayColor = primary
          ? buttonTheme.primaryStroke
          : theme.border;
        const underlayOpacity = pressed
          ? 0.05
          : primary
            ? isLightMode
              ? 0.08
              : 0.1
            : isLightMode
              ? 0.05
              : 0.07;
        const topHighlightOpacity = primary ? 0.46 : 0.24;
        const bottomShadeOpacity = pressed ? 0.08 : 0.04;

        return (
          <View className="relative w-full pb-1.5 pt-0.5">
            <View
              pointerEvents="none"
              className="absolute inset-x-1 bottom-0 rounded-full"
              style={{
                top: primary ? 6 : 4,
                backgroundColor: underlayColor,
                opacity: underlayOpacity,
              }}
            />

            <View
              className="rounded-full"
              style={{
                shadowColor,
                shadowOpacity,
                shadowRadius,
                shadowOffset: { width: 0, height: shadowHeight },
                elevation: primary
                  ? pressed
                    ? 4
                    : hovered
                      ? 9
                      : 7
                  : pressed
                    ? 2
                    : hovered
                      ? 5
                      : 4,
              }}
            >
              <LinearGradient
                colors={gradientColors}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                className="overflow-hidden rounded-full border px-6 py-3.5"
                style={{
                  borderColor,
                }}
              >
                <LinearGradient
                  pointerEvents="none"
                  colors={[
                    highlightColor,
                    "rgba(255,255,255,0.05)",
                    "transparent",
                  ] as const}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  className="absolute inset-x-[1px] top-[1px] h-[54%] rounded-full"
                />

                <View
                  pointerEvents="none"
                  className="absolute inset-x-5 top-px h-px"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.45)",
                    opacity: topHighlightOpacity,
                  }}
                />

                <View
                  pointerEvents="none"
                  className="absolute inset-x-4 bottom-1 h-3 rounded-b-full"
                  style={{
                    backgroundColor: "rgba(9,9,11,0.08)",
                    opacity: bottomShadeOpacity,
                  }}
                />

                <View className="flex-row items-center justify-center gap-2.5">
                  <Text
                    className="text-base font-semibold"
                    style={{ color: labelColor }}
                  >
                    {label}
                  </Text>

                  {chipNode ? (
                    <View
                      className="items-center justify-center rounded-full border"
                      style={{
                        width: 22,
                        height: 22,
                        backgroundColor: chipBackground,
                        borderColor: chipBorder,
                      }}
                    >
                      {chipNode}
                    </View>
                  ) : null}
                </View>
              </LinearGradient>
            </View>
          </View>
        );
      }}
    </Pressable>
  );
}
