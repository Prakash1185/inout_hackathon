import type { Request, Response } from "express";
import { z } from "zod";

import { ActivityModel } from "../models/Activity";
import { UserModel } from "../models/User";
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

const starterCapturePolygon = [
  { latitude: 19.073, longitude: 72.877 },
  { latitude: 19.075, longitude: 72.879 },
  { latitude: 19.072, longitude: 72.882 },
  { latitude: 19.07, longitude: 72.879 },
];

const demoCaptureBlueprints = [
  {
    clerkUserId: "demo-runner-1",
    email: "arya@demo.local",
    name: "Arya",
    coordinates: [
      { latitude: 19.0792, longitude: 72.8723 },
      { latitude: 19.0826, longitude: 72.8749 },
      { latitude: 19.0809, longitude: 72.8794 },
      { latitude: 19.0771, longitude: 72.8772 },
    ],
  },
  {
    clerkUserId: "demo-runner-2",
    email: "vihaan@demo.local",
    name: "Vihaan",
    coordinates: [
      { latitude: 19.0674, longitude: 72.8899 },
      { latitude: 19.0711, longitude: 72.8928 },
      { latitude: 19.0688, longitude: 72.8984 },
      { latitude: 19.0649, longitude: 72.8951 },
    ],
  },
  {
    clerkUserId: "demo-runner-3",
    email: "meera@demo.local",
    name: "Meera",
    coordinates: [
      { latitude: 19.0611, longitude: 72.8658 },
      { latitude: 19.0645, longitude: 72.8682 },
      { latitude: 19.0632, longitude: 72.8736 },
      { latitude: 19.0589, longitude: 72.8703 },
    ],
  },
];

function centerFromCoordinates(
  coordinates: { latitude: number; longitude: number }[],
) {
  if (coordinates.length === 0) {
    return null;
  }

  const sum = coordinates.reduce(
    (acc, point) => {
      acc.latitude += point.latitude;
      acc.longitude += point.longitude;
      return acc;
    },
    { latitude: 0, longitude: 0 },
  );

  return {
    latitude: Number((sum.latitude / coordinates.length).toFixed(6)),
    longitude: Number((sum.longitude / coordinates.length).toFixed(6)),
  };
}

async function seedDemoCaptures(eventId: string) {
  for (const demo of demoCaptureBlueprints) {
    const user = await UserModel.findOneAndUpdate(
      { clerkUserId: demo.clerkUserId },
      {
        $setOnInsert: {
          name: demo.name,
          email: demo.email,
          clerkUserId: demo.clerkUserId,
          xp: 0,
          level: 1,
          streak: 0,
          badges: ["Rookie"],
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    const existingActivity = await ActivityModel.findOne({
      userId: user._id,
      eventId,
    });

    if (existingActivity) {
      continue;
    }

    const distance = Number(calculateDistanceKm(demo.coordinates).toFixed(3));
    const areaCaptured = Number(
      approximatePolygonAreaSqMeters(demo.coordinates).toFixed(2),
    );
    const xpEarned = computeXp(distance, areaCaptured);

    await ActivityModel.create({
      userId: user._id,
      coordinates: demo.coordinates,
      distance,
      areaCaptured,
      xpEarned,
      eventId,
    });

    if (user.xp < xpEarned) {
      user.xp = xpEarned;
      user.level = computeLevelFromXp(user.xp);
      if (!user.badges.includes("City Scout")) {
        user.badges.push("City Scout");
      }
      await user.save();
    }
  }
}

async function ensureStarterCaptureForUser(userId: string, eventId: string) {
  const existingUserCapture = await ActivityModel.findOne({
    userId,
    eventId,
  });

  if (existingUserCapture) {
    return;
  }

  const distance = Number(
    calculateDistanceKm(starterCapturePolygon).toFixed(3),
  );
  const areaCaptured = Number(
    approximatePolygonAreaSqMeters(starterCapturePolygon).toFixed(2),
  );

  await ActivityModel.create({
    userId,
    coordinates: starterCapturePolygon,
    distance,
    areaCaptured,
    xpEarned: 0,
    eventId,
  });
}

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

export const getMapOverviewController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.authUser) {
      throw new ApiError(401, "Unauthorized");
    }

    const [user, activeEvent] = await Promise.all([
      getOrCreateUserFromAuth(req.authUser),
      getOrCreateActiveEvent(),
    ]);

    const eventId = activeEvent._id.toString();

    await seedDemoCaptures(eventId);
    await ensureStarterCaptureForUser(user._id.toString(), eventId);

    const [userActivities, othersActivities] = await Promise.all([
      ActivityModel.find({ userId: user._id, eventId }).sort({ createdAt: -1 }),
      ActivityModel.find({ userId: { $ne: user._id }, eventId })
        .sort({ createdAt: -1 })
        .limit(24),
    ]);

    const userPolygons = userActivities
      .filter((activity) => activity.coordinates.length >= 3)
      .slice(0, 10)
      .map((activity) => activity.coordinates);

    const userCenters = userActivities
      .map((activity) => centerFromCoordinates(activity.coordinates))
      .filter(Boolean)
      .slice(0, 12);

    const othersPolygons = othersActivities
      .filter((activity) => activity.coordinates.length >= 3)
      .slice(0, 14)
      .map((activity) => activity.coordinates);

    const othersCenters = othersActivities
      .map((activity) => centerFromCoordinates(activity.coordinates))
      .filter(Boolean)
      .slice(0, 16);

    const userCapturedArea = userActivities.reduce(
      (total, activity) => total + activity.areaCaptured,
      0,
    );
    const othersCapturedArea = othersActivities.reduce(
      (total, activity) => total + activity.areaCaptured,
      0,
    );

    res.json({
      eventId,
      userPolygons,
      userCenters,
      othersPolygons,
      othersCenters,
      stats: {
        userCapturedArea: Number(userCapturedArea.toFixed(2)),
        othersCapturedArea: Number(othersCapturedArea.toFixed(2)),
        othersCount: new Set(
          othersActivities.map((activity) => activity.userId.toString()),
        ).size,
      },
    });
  },
);
