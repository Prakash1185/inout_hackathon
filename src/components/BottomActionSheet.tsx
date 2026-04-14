import { useEffect, useRef, type ReactNode } from "react";
import {
    Animated,
    Modal,
    Pressable,
    Text,
    View,
    type ViewStyle,
} from "react-native";

import { useAppTheme } from "@/src/store/ui-store";

interface BottomActionSheetProps {
  visible: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}

export function BottomActionSheet({
  visible,
  title,
  subtitle,
  onClose,
  children,
}: BottomActionSheetProps) {
  const { theme } = useAppTheme();
  const translateY = useRef(new Animated.Value(360)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 18,
        stiffness: 180,
      }).start();
      return;
    }

    Animated.timing(translateY, {
      toValue: 360,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [translateY, visible]);

  const sheetStyle: ViewStyle = {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderColor: theme.border,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 28,
    transform: [{ translateY }],
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-end"
        onPress={onClose}
        style={{ backgroundColor: "rgba(8, 14, 28, 0.42)" }}
      >
        <Animated.View style={sheetStyle}>
          <View
            className="mb-4 h-1.5 w-14 self-center rounded-full"
            style={{ backgroundColor: theme.border }}
          />
          <Text className="text-lg font-semibold" style={{ color: theme.text }}>
            {title}
          </Text>
          {subtitle ? (
            <Text className="mt-1 text-sm" style={{ color: theme.textMuted }}>
              {subtitle}
            </Text>
          ) : null}
          <View className="mt-4 gap-3">{children}</View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
