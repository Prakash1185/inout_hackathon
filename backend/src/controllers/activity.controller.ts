import type { Request, Response } from "express";
import { z } from "zod";

import { ActivityModel } from "../models/Activity";
import { getOrCreateActiveEvent } from "../services/event.service";
import { getOrCreateUserFromAuth } from "../services/user-auth.service";
import { ApiError } from "../utils/api-error";
import { asyncHandler } from "../utils/async-handler";
import {
    computeLevelFromXp,
    computeXp,
    updateDailyStreak,
} from "../utils/gamification";
import {
    approximatePolygonAreaSqMeters,
    calculateDistanceKm,
} from "../utils/geo";

const coordinateSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

const createActivitySchema = z.object({
  coordinates: z.array(coordinateSchema).min(2),
  eventId: z.string().optional(),
});

export const createActivityController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.authUser) {
      throw new ApiError(401, "Unauthorized");
    }

    const body = createActivitySchema.parse(req.body);

    const [user, activeEvent] = await Promise.all([
      getOrCreateUserFromAuth(req.authUser),
      getOrCreateActiveEvent(),
    ]);

    const eventId = body.eventId ?? activeEvent._id.toString();
    const distance = Number(calculateDistanceKm(body.coordinates).toFixed(3));
    const areaCaptured = Number(
      approximatePolygonAreaSqMeters(body.coordinates).toFixed(2),
    );
    const xpEarned = computeXp(distance, areaCaptured);

    user.xp += xpEarned;
    user.level = computeLevelFromXp(user.xp);
    user.streak = updateDailyStreak(user);
    user.lastActivityDate = new Date();

    if (user.level >= 5 && !user.badges.includes("Trailblazer")) {
      user.badges.push("Trailblazer");
    }
    if (user.streak >= 7 && !user.badges.includes("Consistency Pro")) {
      user.badges.push("Consistency Pro");
    }

    const activity = await ActivityModel.create({
      userId: user._id,
      coordinates: body.coordinates,
      distance,
      areaCaptured,
      xpEarned,
      eventId,
    });

    await user.save();

    res.status(201).json({
      activity: {
        id: activity._id,
        userId: activity.userId,
        coordinates: activity.coordinates,
        distance: activity.distance,
        areaCaptured: activity.areaCaptured,
        xpEarned: activity.xpEarned,
        eventId: activity.eventId,
        createdAt: activity.createdAt,
      },
      user: {
        id: user._id,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        badges: user.badges,
      },
    });
  },
);

export const getUserActivitiesController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.authUser) {
      throw new ApiError(401, "Unauthorized");
    }

    const user = await getOrCreateUserFromAuth(req.authUser);

    const activities = await ActivityModel.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(
      activities.map((activity) => ({
        id: activity._id,
        userId: activity.userId,
        coordinates: activity.coordinates,
        distance: activity.distance,
        areaCaptured: activity.areaCaptured,
        xpEarned: activity.xpEarned,
        eventId: activity.eventId,
        createdAt: activity.createdAt,
      })),
    );
  },
);
