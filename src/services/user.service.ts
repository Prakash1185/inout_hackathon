import { api } from "./api";

import type { UserProfile } from "@/shared/types";

export async function getMyProfile(): Promise<UserProfile> {
  const response = await api.get<UserProfile>("/user/profile");
  return response.data;
}

export async function updateProfile(payload: {
  name: string;
}): Promise<UserProfile> {
  const response = await api.patch<UserProfile>("/user/update", payload);
  return response.data;
}
