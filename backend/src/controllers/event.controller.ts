import type { Request, Response } from "express";

import {
    getEventsFeed,
    getOrCreateActiveEvent,
} from "../services/event.service";
import { asyncHandler } from "../utils/async-handler";

export const getActiveEventController = asyncHandler(
  async (_req: Request, res: Response) => {
    const event = await getOrCreateActiveEvent();

    res.json({
      id: event._id,
      name: event.name,
      location: event.location,
      startDate: event.startDate,
      endDate: event.endDate,
      isActive: event.isActive,
    });
  },
);

export const getEventsController = asyncHandler(
  async (_req: Request, res: Response) => {
    const events = await getEventsFeed();

    res.json(
      events.map((event) => ({
        id: event._id,
        name: event.name,
        location: event.location,
        startDate: event.startDate,
        endDate: event.endDate,
        isActive: event.isActive,
      })),
    );
  },
);
