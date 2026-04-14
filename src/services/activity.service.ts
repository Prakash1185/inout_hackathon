import { api } from "./api";

import type { ActivityItem, Coordinate, UserProfile } from "@/shared/types";

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
