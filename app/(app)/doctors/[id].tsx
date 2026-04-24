import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { NeonButton } from "@/src/components/NeonButton";
import { Screen } from "@/src/components/Screen";
import {
  getDoctorById,
  useDoctorsLocalStore,
} from "@/src/store/doctors-local-store";
import { useAppTheme } from "@/src/store/ui-store";

export default function DoctorDetailScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const bookAppointment = useDoctorsLocalStore((state) => state.bookAppointment);
  const appointments = useDoctorsLocalStore((state) => state.appointments);

  const doctor = getDoctorById(id);

  if (!doctor) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-lg font-semibold" style={{ color: theme.text }}>
            Doctor not found
          </Text>
          <Pressable
            className="mt-4 rounded-2xl border px-4 py-2"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
            onPress={() => router.back()}
          >
            <Text className="font-semibold" style={{ color: theme.text }}>
              Go back
            </Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const appointment = appointments.find((item) => item.doctorId === doctor.id);

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 36, gap: 16 }}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-2xl border"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={18} color={theme.text} />
          </Pressable>

          <Text className="text-xl font-semibold" style={{ color: theme.text }}>
            Doctor Profile
          </Text>

          <View className="h-10 w-10" />
        </View>

        <View
          className="rounded-3xl border p-4"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          <View
            className="overflow-hidden rounded-[28px] border px-4 py-5"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surfaceMuted,
            }}
          >
            <Image
              source={{ uri: doctor.imageUrl }}
              contentFit="cover"
              style={{
                alignSelf: "center",
                width: 240,
                height: 240,
                borderRadius: 24,
                backgroundColor: theme.surface,
              }}
            />

            <View className="mt-5 items-center">
              <Text
                className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase"
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
              <Text
                className="mt-4 text-center text-2xl font-bold"
                style={{ color: theme.text }}
              >
                {doctor.name}
              </Text>
              <Text className="mt-1 text-sm" style={{ color: theme.textMuted }}>
                {doctor.specialty} | {doctor.qualification}
              </Text>
              <Text
                className="mt-3 text-center text-sm leading-6"
                style={{ color: theme.textMuted }}
              >
                {doctor.about}
              </Text>
            </View>
          </View>

          <View className="mt-4 flex-row flex-wrap gap-2">
            {[
              `${doctor.experienceYears} yrs exp`,
              `${doctor.distanceKm.toFixed(1)} km away`,
              `Rs. ${doctor.consultationFee}`,
              `${doctor.rating.toFixed(1)} rating`,
            ].map((value) => (
              <View
                key={value}
                className="rounded-xl border px-3 py-2"
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.surfaceMuted,
                }}
              >
                <Text className="text-xs font-semibold" style={{ color: theme.text }}>
                  {value}
                </Text>
              </View>
            ))}
          </View>

          <View
            className="mt-5 rounded-2xl border p-4"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surfaceMuted,
            }}
          >
            <Text className="text-sm font-semibold" style={{ color: theme.text }}>
              Clinic and Availability
            </Text>
            <Text className="mt-2 text-sm" style={{ color: theme.text }}>
              {doctor.clinicName}
            </Text>
            <Text className="mt-1 text-sm" style={{ color: theme.textMuted }}>
              {doctor.address}
            </Text>
            <Text className="mt-3 text-xs" style={{ color: theme.textMuted }}>
              Current availability
            </Text>
            <Text className="mt-1 text-sm font-semibold" style={{ color: theme.text }}>
              {doctor.availability}
            </Text>

            <Text className="mt-4 text-xs" style={{ color: theme.textMuted }}>
              Next available slots
            </Text>
            <View className="mt-2 flex-row flex-wrap gap-2">
              {doctor.availableSlots.map((slot) => (
                <View
                  key={slot}
                  className="rounded-full border px-3 py-1.5"
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.surface,
                  }}
                >
                  <Text className="text-[11px]" style={{ color: theme.text }}>
                    {slot}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View
            className="mt-4 rounded-2xl border p-4"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surfaceMuted,
            }}
          >
            <Text className="text-sm font-semibold" style={{ color: theme.text }}>
              Services and Languages
            </Text>

            <Text className="mt-3 text-xs" style={{ color: theme.textMuted }}>
              Services
            </Text>
            <View className="mt-2 flex-row flex-wrap gap-2">
              {doctor.services.map((service) => (
                <View
                  key={service}
                  className="rounded-full px-3 py-1.5"
                  style={{ backgroundColor: theme.surface }}
                >
                  <Text className="text-[11px]" style={{ color: theme.text }}>
                    {service}
                  </Text>
                </View>
              ))}
            </View>

            <Text className="mt-4 text-xs" style={{ color: theme.textMuted }}>
              Languages
            </Text>
            <Text className="mt-1 text-sm" style={{ color: theme.text }}>
              {doctor.languages.join(", ")}
            </Text>
          </View>

          {appointment ? (
            <View
              className="mt-4 rounded-2xl border p-4"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surfaceMuted,
              }}
            >
              <Text className="text-sm font-semibold" style={{ color: theme.text }}>
                Booked Appointment
              </Text>
              <Text className="mt-2 text-sm" style={{ color: theme.text }}>
                {appointment.slotLabel}
              </Text>
              <Text className="mt-1 text-xs" style={{ color: theme.textMuted }}>
                {appointment.status} | {appointment.bookedAtLabel}
              </Text>
            </View>
          ) : null}

          <View
            className="mt-4 rounded-2xl border p-4"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surfaceMuted,
            }}
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold" style={{ color: theme.text }}>
                Reviews
              </Text>
              <Text className="text-xs" style={{ color: theme.textMuted }}>
                {doctor.reviewCount} total
              </Text>
            </View>

            <View className="mt-3 gap-3">
              {doctor.reviews.map((review) => (
                <View
                  key={review.id}
                  className="rounded-2xl border p-3"
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.surface,
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-semibold" style={{ color: theme.text }}>
                      {review.author}
                    </Text>
                    <Text className="text-xs" style={{ color: theme.textMuted }}>
                      {review.dateLabel}
                    </Text>
                  </View>
                  <Text className="mt-1 text-xs" style={{ color: theme.accent }}>
                    {`Rating ${review.rating}/5`}
                  </Text>
                  <Text className="mt-2 text-sm leading-6" style={{ color: theme.textMuted }}>
                    {review.comment}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="mt-5">
            <NeonButton
              label={appointment ? "Appointment Confirmed" : "Book Appointment"}
              onPress={() => {
                bookAppointment(doctor.id);
              }}
              disabled={Boolean(appointment)}
            />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
