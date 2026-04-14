import { api } from "./api";

import type { LeaderboardResponse } from "@/shared/types";

export async function getGlobalLeaderboard(): Promise<LeaderboardResponse> {
  const response = await api.get<LeaderboardResponse>("/leaderboard");
  return response.data;
}

export async function getEventLeaderboard(
  eventId: string,
): Promise<LeaderboardResponse> {
  const response = await api.get<LeaderboardResponse>("/leaderboard", {
    params: { eventId },
  });
  return response.data;
}
