import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { DoctorCard } from "@/src/components/doctors/DoctorCard";
import { Screen } from "@/src/components/Screen";
import {
  useDoctorsLocalStore,
  type CareType,
} from "@/src/store/doctors-local-store";
import { useAppTheme } from "@/src/store/ui-store";

type CareFilter = "all" | CareType;

export default function DoctorsNearbyScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const doctors = useDoctorsLocalStore((state) => state.doctors);
  const appointments = useDoctorsLocalStore((state) => state.appointments);
  const bookAppointment = useDoctorsLocalStore((state) => state.bookAppointment);

  const [query, setQuery] = useState("");
  const [careFilter, setCareFilter] = useState<CareFilter>("all");
  const [specialtyFilter, setSpecialtyFilter] = useState("All");

  const specialtyOptions = useMemo(
    () => ["All", ...new Set(doctors.map((doctor) => doctor.specialty))],
    [doctors],
  );

  const filteredDoctors = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return doctors.filter((doctor) => {
      const matchesQuery =
        !normalizedQuery ||
        doctor.name.toLowerCase().includes(normalizedQuery) ||
        doctor.specialty.toLowerCase().includes(normalizedQuery) ||
        doctor.clinicName.toLowerCase().includes(normalizedQuery) ||
        doctor.qualification.toLowerCase().includes(normalizedQuery);

      const matchesCare =
        careFilter === "all" ? true : doctor.careType === careFilter;

      const matchesSpecialty =
        specialtyFilter === "All" ? true : doctor.specialty === specialtyFilter;

      return matchesQuery && matchesCare && matchesSpecialty;
    });
  }, [careFilter, doctors, query, specialtyFilter]);

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
            Nearby Doctors
          </Text>

          <View className="h-10 w-10" />
        </View>

        <View
          className="rounded-3xl border p-4"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          <Text className="text-2xl font-bold" style={{ color: theme.text }}>
            Find doctors and clinics nearby
          </Text>
          <Text className="mt-2 text-sm leading-6" style={{ color: theme.textMuted }}>
            Search trusted medical support around your area, review profiles, and keep booked appointments in one place.
          </Text>

          <View
            className="mt-4 flex-row items-center gap-3 rounded-2xl border px-4 py-3"
            style={{
              borderColor: theme.border,
              backgroundColor: theme.surfaceMuted,
            }}
          >
            <Ionicons name="search" size={18} color={theme.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search doctors, clinics, or specialties"
              placeholderTextColor={theme.textMuted}
              className="flex-1 text-sm"
              style={{ color: theme.text }}
            />
          </View>

          <View className="mt-4 flex-row gap-2">
            {[
              { label: "All", value: "all" as CareFilter },
              { label: "Doctors", value: "doctor" as CareFilter },
              { label: "Clinics", value: "clinic" as CareFilter },
            ].map((option) => {
              const active = careFilter === option.value;

              return (
                <Pressable
                  key={option.value}
                  className="rounded-full px-4 py-2"
                  style={{
                    backgroundColor: active ? theme.accent : theme.surfaceMuted,
                  }}
                  onPress={() => setCareFilter(option.value)}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: active ? "#FFFFFF" : theme.textMuted }}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-4"
          >
            <View className="flex-row gap-2">
              {specialtyOptions.map((option) => {
                const active = specialtyFilter === option;

                return (
                  <Pressable
                    key={option}
                    className="rounded-full border px-4 py-2"
                    style={{
                      borderColor: active ? theme.accent : theme.border,
                      backgroundColor: active ? theme.accentSoft : theme.surface,
                    }}
                    onPress={() => setSpecialtyFilter(option)}
                  >
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: active ? theme.text : theme.textMuted }}
                    >
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <View
          className="rounded-3xl border p-4"
          style={{ borderColor: theme.border, backgroundColor: theme.surface }}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-semibold" style={{ color: theme.text }}>
                Booked Appointments
              </Text>
              <Text className="mt-1 text-xs" style={{ color: theme.textMuted }}>
                {appointments.length} confirmed
              </Text>
            </View>

            <View
              className="rounded-full px-3 py-1"
              style={{ backgroundColor: theme.surfaceMuted }}
            >
              <Text className="text-[11px]" style={{ color: theme.textMuted }}>
                Delhi zone
              </Text>
            </View>
          </View>

          <View className="mt-4 gap-3">
            {appointments.length === 0 ? (
              <View
                className="rounded-2xl border p-3"
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.surfaceMuted,
                }}
              >
                <Text className="text-sm" style={{ color: theme.textMuted }}>
                  No appointments booked yet. Choose a doctor below to reserve your first slot.
                </Text>
              </View>
            ) : null}

            {appointments.map((appointment) => (
              <Pressable
                key={appointment.id}
                className="rounded-2xl border p-3"
                style={{
                  borderColor: theme.border,
                  backgroundColor: theme.surfaceMuted,
                }}
                onPress={() =>
                  router.push({
                    pathname: "/doctors/[id]",
                    params: { id: appointment.doctorId },
                  })
                }
              >
                <View className="flex-row items-center justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-sm font-semibold" style={{ color: theme.text }}>
                      {appointment.doctorName}
                    </Text>
                    <Text className="mt-1 text-xs" style={{ color: theme.textMuted }}>
                      {appointment.specialty} | {appointment.clinicName}
                    </Text>
                    <Text className="mt-2 text-xs" style={{ color: theme.text }}>
                      {appointment.slotLabel}
                    </Text>
                  </View>

                  <View className="items-end">
                    <Text
                      className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
                      style={{ backgroundColor: theme.accent, color: "#FFFFFF" }}
                    >
                      {appointment.status}
                    </Text>
                    <Text className="mt-2 text-[11px]" style={{ color: theme.textMuted }}>
                      {appointment.bookedAtLabel}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold" style={{ color: theme.text }}>
              Doctors and Clinics
            </Text>
            <Text className="mt-1 text-sm" style={{ color: theme.textMuted }}>
              {filteredDoctors.length} profiles matched
            </Text>
          </View>
        </View>

        <View className="gap-3">
          {filteredDoctors.map((doctor) => {
            const isBooked = appointments.some(
              (appointment) => appointment.doctorId === doctor.id,
            );

            return (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                isBooked={isBooked}
                onViewDetails={() =>
                  router.push({
                    pathname: "/doctors/[id]",
                    params: { id: doctor.id },
                  })
                }
                onBook={() => {
                  bookAppointment(doctor.id);
                }}
              />
            );
          })}

          {filteredDoctors.length === 0 ? (
            <View
              className="rounded-3xl border p-5"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surface,
              }}
            >
              <Text className="text-base font-semibold" style={{ color: theme.text }}>
                No doctor profile matched
              </Text>
              <Text className="mt-2 text-sm leading-6" style={{ color: theme.textMuted }}>
                Try another specialty, switch between doctors and clinics, or clear the search field.
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}
