import { api } from "./api";

import type { EventSummary } from "@/shared/types";

export async function getEvents(): Promise<EventSummary[]> {
  const response = await api.get<EventSummary[]>("/events");
  return response.data;
}

export async function getActiveEvent(): Promise<EventSummary> {
  const response = await api.get<EventSummary>("/events/active");
  return response.data;
}
