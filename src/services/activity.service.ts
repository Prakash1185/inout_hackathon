import { api } from "./api";

import type {
    ActivityItem,
    Coordinate,
    MapOverviewResponse,
    UserProfile,
} from "@/shared/types";

interface CreateActivityPayload {
  coordinates: Coordinate[];
  eventId?: string;
}

interface CreateActivityResponse {
  activity: ActivityItem;
  user: Pick<UserProfile, "id" | "xp" | "level" | "streak" | "badges">;
}

export async function createActivity(
  payload: CreateActivityPayload,
): Promise<CreateActivityResponse> {
  const response = await api.post<CreateActivityResponse>("/activity", payload);
  return response.data;
}

export async function getUserActivities(): Promise<ActivityItem[]> {
  const response = await api.get<ActivityItem[]>("/activity/user");
  return response.data;
}

export async function getMapOverview(): Promise<MapOverviewResponse> {
  const response = await api.get<MapOverviewResponse>("/activity/map-overview");
  return response.data;
}
