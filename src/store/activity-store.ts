import { create } from "zustand";

import type { Coordinate } from "@/shared/types";

interface ActivityState {
  coordinates: Coordinate[];
  distanceKm: number;
  setActivityDraft: (coordinates: Coordinate[], distanceKm: number) => void;
  resetDraft: () => void;
}

export const useActivityStore = create<ActivityState>((set) => ({
  coordinates: [],
  distanceKm: 0,
  setActivityDraft: (coordinates, distanceKm) =>
    set({
      coordinates,
      distanceKm,
    }),
  resetDraft: () =>
    set({
      coordinates: [],
      distanceKm: 0,
    }),
}));
