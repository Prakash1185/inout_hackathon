import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/src/store/ui-store";

interface UploadCardProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

export function UploadCard({
  title,
  description,
  icon,
  onPress,
}: UploadCardProps) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      className="rounded-3xl border px-5 py-5"
      style={({ hovered, pressed }) => ({
        borderColor: theme.border,
        backgroundColor: theme.surface,
        transform: [
          { scale: hovered ? 1.02 : pressed ? 0.98 : 1 },
          { translateY: pressed ? 1 : 0 },
        ],
        shadowColor: "#20171E",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 3,
      })}
    >
      <View
        className="h-14 w-14 items-center justify-center rounded-2xl border"
        style={{ borderColor: theme.border, backgroundColor: theme.surfaceMuted }}
      >
        <Ionicons name={icon} size={22} color={theme.text} />
      </View>

      <Text className="mt-4 text-lg font-semibold" style={{ color: theme.text }}>
        {title}
      </Text>
      <Text
        className="mt-2 text-sm leading-6"
        style={{ color: theme.textMuted }}
      >
        {description}
      </Text>
    </Pressable>
  );
}
