import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/src/store/ui-store";

interface ImageUploaderProps {
  imageUri: string | null;
  onPickCamera: () => void;
  onPickGallery: () => void;
  disabled?: boolean;
}

export function ImageUploader({
  imageUri,
  onPickCamera,
  onPickGallery,
  disabled,
}: ImageUploaderProps) {
  const { theme } = useAppTheme();

  return (
    <View className="gap-4">
      <View
        className="h-64 overflow-hidden rounded-3xl border"
        style={{ borderColor: theme.border, backgroundColor: theme.surface }}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={{ width: "100%", height: "100%" }} />
        ) : (
          <View className="flex-1 items-center justify-center px-6">
            <View
              className="h-14 w-14 items-center justify-center rounded-full border"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <Ionicons name="camera-outline" size={22} color={theme.text} />
            </View>
            <Text className="mt-4 text-base font-semibold" style={{ color: theme.text }}>
              No meal selected yet
            </Text>
            <Text
              className="mt-2 text-center text-sm leading-6"
              style={{ color: theme.textMuted }}
            >
              Capture a fresh meal photo or choose one from your gallery.
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row gap-3">
        <Pressable
          onPress={onPickCamera}
          disabled={disabled}
          className="flex-1 rounded-2xl border px-4 py-4"
          style={({ hovered, pressed }) => ({
            borderColor: theme.border,
            backgroundColor: theme.surface,
            opacity: disabled ? 0.6 : 1,
            transform: [{ scale: hovered ? 1.02 : pressed ? 0.98 : 1 }],
          })}
        >
          <View className="flex-row items-center gap-3">
            <View
              className="h-10 w-10 items-center justify-center rounded-full border"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <Ionicons name="camera-outline" size={18} color={theme.text} />
            </View>
            <View>
              <Text className="text-sm font-semibold" style={{ color: theme.text }}>
                Camera
              </Text>
              <Text className="text-xs" style={{ color: theme.textMuted }}>
                Capture a fresh meal
              </Text>
            </View>
          </View>
        </Pressable>

        <Pressable
          onPress={onPickGallery}
          disabled={disabled}
          className="flex-1 rounded-2xl border px-4 py-4"
          style={({ hovered, pressed }) => ({
            borderColor: theme.border,
            backgroundColor: theme.surface,
            opacity: disabled ? 0.6 : 1,
            transform: [{ scale: hovered ? 1.02 : pressed ? 0.98 : 1 }],
          })}
        >
          <View className="flex-row items-center gap-3">
            <View
              className="h-10 w-10 items-center justify-center rounded-full border"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <Ionicons name="images-outline" size={18} color={theme.text} />
            </View>
            <View>
              <Text className="text-sm font-semibold" style={{ color: theme.text }}>
                Gallery
              </Text>
              <Text className="text-xs" style={{ color: theme.textMuted }}>
                Upload from photos
              </Text>
            </View>
          </View>
        </Pressable>
      </View>
    </View>
  );
}
