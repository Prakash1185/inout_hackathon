import { create } from "zustand";

export interface LocalEvent {
  id: string;
  name: string;
  location: string;
  duration: string;
  dateLabel: string;
  imageUrl: string;
  description: string;
  hostedBy: string;
  participants: number;
}

interface CreateEventInput {
  name: string;
  location: string;
  duration: string;
  dateLabel: string;
  description: string;
  hostedBy: string;
  imageUrl?: string;
}

interface EventsLocalState {
  events: LocalEvent[];
  joinedEventIds: string[];
  joinEvent: (eventId: string) => void;
  createEvent: (input: CreateEventInput) => string;
}

const defaultEventImage =
  "https://images.unsplash.com/photo-1571019613914-85f342c6a11e?auto=format&fit=crop&w=1200&q=80";

const initialEvents: LocalEvent[] = [
  {
    id: "event-runclub-01",
    name: "Sunrise Run Club",
    location: "Lodhi Garden, Delhi",
    duration: "60 min",
    dateLabel: "Sat, 6:30 AM",
    imageUrl:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80",
    description:
      "A guided community run focused on warm-up, interval pacing, and cooldown. Suitable for beginner and intermediate runners.",
    hostedBy: "Delhi Stride Crew",
    participants: 44,
  },
  {
    id: "event-yoga-02",
    name: "Riverside Yoga Flow",
    location: "Yamuna Biodiversity Park",
    duration: "45 min",
    dateLabel: "Sun, 7:00 AM",
    imageUrl:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
    description:
      "Mobility-focused yoga with breathing drills, flexibility blocks, and posture correction. Bring your own mat.",
    hostedBy: "Move Better Circle",
    participants: 31,
  },
  {
    id: "event-cycle-03",
    name: "Weekend Cycle Sprint",
    location: "India Gate Loop",
    duration: "90 min",
    dateLabel: "Sun, 5:30 PM",
    imageUrl:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
    description:
      "Group cycling event with tempo rounds and sprint blocks. Helmets required, hydration point available.",
    hostedBy: "Pedal Social",
    participants: 52,
  },
];

export const useEventsLocalStore = create<EventsLocalState>((set) => ({
  events: initialEvents,
  joinedEventIds: ["event-cycle-03"],

  joinEvent: (eventId) => {
    set((state) => {
      if (state.joinedEventIds.includes(eventId)) {
        return state;
      }

      return {
        joinedEventIds: [...state.joinedEventIds, eventId],
        events: state.events.map((event) =>
          event.id === eventId
            ? { ...event, participants: event.participants + 1 }
            : event,
        ),
      };
    });
  },

  createEvent: (input) => {
    const id = `event-hosted-${Date.now()}`;
    const newEvent: LocalEvent = {
      id,
      name: input.name,
      location: input.location,
      duration: input.duration,
      dateLabel: input.dateLabel,
      description: input.description,
      hostedBy: input.hostedBy,
      imageUrl: input.imageUrl?.trim() ? input.imageUrl : defaultEventImage,
      participants: 1,
    };

    set((state) => ({
      events: [newEvent, ...state.events],
    }));

    return id;
  },
}));
