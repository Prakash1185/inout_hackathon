import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CareType = "doctor" | "clinic";

export interface DoctorReview {
  id: string;
  author: string;
  rating: number;
  dateLabel: string;
  comment: string;
}

export interface DoctorProfile {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  experienceYears: number;
  clinicName: string;
  address: string;
  distanceKm: number;
  availability: string;
  consultationFee: number;
  rating: number;
  reviewCount: number;
  careType: CareType;
  imageUrl: string;
  about: string;
  languages: string[];
  services: string[];
  availableSlots: string[];
  reviews: DoctorReview[];
}

export interface BookedAppointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  clinicName: string;
  imageUrl: string;
  slotLabel: string;
  status: "Confirmed";
  bookedAtLabel: string;
}

interface DoctorsLocalState {
  doctors: DoctorProfile[];
  appointments: BookedAppointment[];
  bookAppointment: (doctorId: string) => string | null;
}

const initialDoctors: DoctorProfile[] = [
  {
    id: "doctor-sports-01",
    name: "Dr. Aanya Mehra",
    specialty: "Sports Medicine",
    qualification: "MBBS, MD Sports Medicine",
    experienceYears: 9,
    clinicName: "Velocity Sports Clinic",
    address: "Sector 18, Dwarka, Delhi",
    distanceKm: 1.8,
    availability: "Available today",
    consultationFee: 900,
    rating: 4.8,
    reviewCount: 124,
    careType: "doctor",
    imageUrl:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1200&q=80",
    about:
      "Focused on training-related pain, return-to-sport planning, and movement-safe recovery protocols for active adults.",
    languages: ["English", "Hindi"],
    services: ["Sports injury review", "Post-workout pain consult", "Mobility plan"],
    availableSlots: ["Today, 6:30 PM", "Tomorrow, 10:00 AM", "Tomorrow, 5:30 PM"],
    reviews: [
      {
        id: "rev-sports-01",
        author: "Rohit S.",
        rating: 5,
        dateLabel: "2 days ago",
        comment:
          "Very clear guidance on knee pain after running. The rehab advice felt practical and easy to follow.",
      },
      {
        id: "rev-sports-02",
        author: "Neha A.",
        rating: 4,
        dateLabel: "1 week ago",
        comment:
          "Helpful consultation and great explanation of recovery load. The clinic follow-up was smooth.",
      },
    ],
  },
  {
    id: "doctor-ortho-02",
    name: "Dr. Karan Malhotra",
    specialty: "Orthopedics",
    qualification: "MBBS, MS Orthopedics",
    experienceYears: 12,
    clinicName: "Joint & Motion Care",
    address: "Janakpuri, Delhi",
    distanceKm: 3.1,
    availability: "Next slot tomorrow",
    consultationFee: 1100,
    rating: 4.7,
    reviewCount: 89,
    careType: "doctor",
    imageUrl:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=1200&q=80",
    about:
      "Treats joint strain, shoulder discomfort, ankle issues, and recurrent load-related pain in active lifestyles.",
    languages: ["English", "Hindi", "Punjabi"],
    services: ["Shoulder pain", "Ankle instability", "Joint strain consult"],
    availableSlots: ["Tomorrow, 11:30 AM", "Tomorrow, 7:00 PM", "Fri, 9:30 AM"],
    reviews: [
      {
        id: "rev-ortho-01",
        author: "Aditya P.",
        rating: 5,
        dateLabel: "3 days ago",
        comment:
          "Diagnosis was quick and the doctor explained what movements to avoid without making it feel overwhelming.",
      },
      {
        id: "rev-ortho-02",
        author: "Sanya K.",
        rating: 4,
        dateLabel: "9 days ago",
        comment:
          "Strong experience overall. Good for workout-related shoulder pain and posture-linked discomfort.",
      },
    ],
  },
  {
    id: "clinic-heart-03",
    name: "Dr. Ishita Rao",
    specialty: "Cardiology",
    qualification: "MBBS, DM Cardiology",
    experienceYears: 14,
    clinicName: "PulseCare Heart Clinic",
    address: "Vasant Kunj, Delhi",
    distanceKm: 5.4,
    availability: "Appointments open this week",
    consultationFee: 1500,
    rating: 4.9,
    reviewCount: 173,
    careType: "clinic",
    imageUrl:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=1200&q=80",
    about:
      "Supports preventive cardiometabolic checkups, exercise-readiness consultations, and long-term heart-health monitoring.",
    languages: ["English", "Hindi"],
    services: ["Heart screening", "Exercise readiness", "Preventive consult"],
    availableSlots: ["Thu, 9:00 AM", "Thu, 1:30 PM", "Sat, 10:30 AM"],
    reviews: [
      {
        id: "rev-cardio-01",
        author: "Vikram T.",
        rating: 5,
        dateLabel: "4 days ago",
        comment:
          "Excellent preventive consultation. Very calm explanation about fitness, heart load, and next steps.",
      },
      {
        id: "rev-cardio-02",
        author: "Mitali J.",
        rating: 5,
        dateLabel: "12 days ago",
        comment:
          "The clinic setup felt organized and the review of my reports was detailed without feeling rushed.",
      },
    ],
  },
  {
    id: "clinic-derma-04",
    name: "Dr. Rhea Kapoor",
    specialty: "Dermatology",
    qualification: "MBBS, MD Dermatology",
    experienceYears: 8,
    clinicName: "SkinSync Clinic",
    address: "Rajouri Garden, Delhi",
    distanceKm: 4.2,
    availability: "Available this evening",
    consultationFee: 850,
    rating: 4.6,
    reviewCount: 66,
    careType: "clinic",
    imageUrl:
      "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=1200&q=80",
    about:
      "Helps with workout-related skin irritation, sweat-triggered issues, and practical skincare routines for active users.",
    languages: ["English", "Hindi"],
    services: ["Skin irritation", "Sweat-related rash", "Dermatology consult"],
    availableSlots: ["Today, 8:00 PM", "Tomorrow, 6:00 PM", "Fri, 11:00 AM"],
    reviews: [
      {
        id: "rev-derma-01",
        author: "Pooja M.",
        rating: 4,
        dateLabel: "1 day ago",
        comment:
          "Good advice for gym-related skin irritation. Prescribed a simple routine and explained what to avoid.",
      },
      {
        id: "rev-derma-02",
        author: "Aman R.",
        rating: 5,
        dateLabel: "6 days ago",
        comment:
          "Very practical consultation. Felt modern, efficient, and easy to follow.",
      },
    ],
  },
];

const initialAppointments: BookedAppointment[] = [
  {
    id: "appointment-sports-01",
    doctorId: "doctor-sports-01",
    doctorName: "Dr. Aanya Mehra",
    specialty: "Sports Medicine",
    clinicName: "Velocity Sports Clinic",
    imageUrl:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1200&q=80",
    slotLabel: "Tomorrow, 10:00 AM",
    status: "Confirmed",
    bookedAtLabel: "Booked just now",
  },
];

function buildBookedAtLabel() {
  const now = new Date();
  const month = now.toLocaleDateString("en-IN", { month: "short" });
  return `Booked on ${month} ${now.getDate()}`;
}

export const useDoctorsLocalStore = create<DoctorsLocalState>()(
  persist(
    (set, get) => ({
      doctors: initialDoctors,
      appointments: initialAppointments,

      bookAppointment: (doctorId) => {
        const existing = get().appointments.find(
          (appointment) => appointment.doctorId === doctorId,
        );

        if (existing) {
          return existing.id;
        }

        const doctor = get().doctors.find((item) => item.id === doctorId);
        if (!doctor) {
          return null;
        }

        const appointment: BookedAppointment = {
          id: `appointment-${doctorId}`,
          doctorId: doctor.id,
          doctorName: doctor.name,
          specialty: doctor.specialty,
          clinicName: doctor.clinicName,
          imageUrl: doctor.imageUrl,
          slotLabel: doctor.availableSlots[0] ?? "Next available slot",
          status: "Confirmed",
          bookedAtLabel: buildBookedAtLabel(),
        };

        set((state) => ({
          appointments: [appointment, ...state.appointments],
        }));

        return appointment.id;
      },
    }),
    {
      name: "velora-doctors-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        appointments: state.appointments,
      }),
    },
  ),
);

export function getDoctorById(id: string | undefined) {
  if (!id) {
    return undefined;
  }

  return initialDoctors.find((doctor) => doctor.id === id);
}
