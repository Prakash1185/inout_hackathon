import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

import type { DoctorProfile } from "@/src/store/doctors-local-store";
import { useAppTheme } from "@/src/store/ui-store";

interface DoctorCardProps {
  doctor: DoctorProfile;
  isBooked?: boolean;
  onViewDetails: () => void;
  onBook: () => void;
}

export function DoctorCard({
  doctor,
  isBooked = false,
  onViewDetails,
  onBook,
}: DoctorCardProps) {
  const { theme } = useAppTheme();

  return (
    <View
      className="rounded-[28px] border px-3 py-3"
      style={{
        borderColor: theme.border,
        backgroundColor: theme.surface,
      }}
    >
      <View className="flex-row items-start gap-4">
        <Image
          source={{ uri: doctor.imageUrl }}
          contentFit="cover"
          style={{
            width: 96,
            height: 96,
            borderRadius: 22,
            backgroundColor: theme.surfaceMuted,
          }}
        />

        <View className="flex-1">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text
                className="text-base font-semibold"
                style={{ color: theme.text }}
                numberOfLines={2}
              >
                {doctor.name}
              </Text>
              <Text className="mt-1 text-xs" style={{ color: theme.textMuted }}>
                {doctor.specialty} | {doctor.qualification}
              </Text>
            </View>

            <Text
              className="rounded-full px-2 py-1 text-[10px] font-semibold uppercase"
              style={{
                color: doctor.careType === "clinic" ? theme.text : "#FFFFFF",
                backgroundColor:
                  doctor.careType === "clinic"
                    ? theme.accentSoft
                    : theme.accent,
              }}
            >
              {doctor.careType}
            </Text>
          </View>

          <Text
            className="mt-2 text-xs leading-5"
            style={{ color: theme.textMuted }}
            numberOfLines={2}
          >
            {doctor.clinicName} | {doctor.address}
          </Text>

          <View className="mt-3 flex-row flex-wrap gap-2">
            <View
              className="flex-row items-center gap-1 rounded-full px-2.5 py-1"
              style={{ backgroundColor: theme.surfaceMuted }}
            >
              <Ionicons name="star" size={12} color={theme.accent} />
              <Text className="text-[11px] font-semibold" style={{ color: theme.text }}>
                {doctor.rating.toFixed(1)}
              </Text>
            </View>

            <View
              className="rounded-full px-2.5 py-1"
              style={{ backgroundColor: theme.surfaceMuted }}
            >
              <Text className="text-[11px]" style={{ color: theme.textMuted }}>
                {doctor.distanceKm.toFixed(1)} km away
              </Text>
            </View>

            <View
              className="rounded-full px-2.5 py-1"
              style={{ backgroundColor: theme.surfaceMuted }}
            >
              <Text className="text-[11px]" style={{ color: theme.textMuted }}>
                {doctor.experienceYears} yrs exp
              </Text>
            </View>
          </View>

          <Text className="mt-3 text-xs" style={{ color: theme.textMuted }}>
            {doctor.availability}
          </Text>

          <View className="mt-3 flex-row items-center justify-between gap-3">
            <Text className="text-sm font-semibold" style={{ color: theme.text }}>
              Rs. {doctor.consultationFee}
            </Text>

            <View className="flex-row gap-2">
              <Pressable
                className="rounded-xl border px-3 py-2"
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.surfaceMuted,
                }}
                onPress={onViewDetails}
              >
                <Text className="text-xs font-semibold" style={{ color: theme.text }}>
                  View Details
                </Text>
              </Pressable>

              <Pressable
                className="rounded-xl border px-3 py-2"
                style={{
                  borderColor: isBooked ? theme.border : theme.accent,
                  backgroundColor: isBooked ? theme.surfaceMuted : theme.accent,
                }}
                onPress={onBook}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: isBooked ? theme.text : "#FFFFFF" }}
                >
                  {isBooked ? "Booked" : "Book"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
