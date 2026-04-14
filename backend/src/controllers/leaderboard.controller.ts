import type { Request, Response } from "express";
import { Types } from "mongoose";

import { ActivityModel } from "../models/Activity";
import { UserModel } from "../models/User";
import { ApiError } from "../utils/api-error";
import { asyncHandler } from "../utils/async-handler";

export const getLeaderboardController = asyncHandler(
  async (req: Request, res: Response) => {
    const eventId =
      typeof req.query.eventId === "string" ? req.query.eventId : undefined;

    if (!eventId) {
      const globalLeaderboard = await UserModel.find()
        .sort({ xp: -1, createdAt: 1 })
        .limit(100)
        .select("name xp level streak badges");

      res.json({
        type: "global",
        rankings: globalLeaderboard.map((user, index) => ({
          rank: index + 1,
          userId: user._id,
          name: user.name,
          xp: user.xp,
          level: user.level,
          streak: user.streak,
          badges: user.badges,
        })),
      });
      return;
    }

    if (!Types.ObjectId.isValid(eventId)) {
      throw new ApiError(400, "Invalid eventId");
    }

    const eventObjectId = new Types.ObjectId(eventId);

    const eventLeaderboard = await ActivityModel.aggregate([
      { $match: { eventId: eventObjectId } },
      {
        $group: {
          _id: "$userId",
          totalAreaCaptured: { $sum: "$areaCaptured" },
          totalDistance: { $sum: "$distance" },
          totalXp: { $sum: "$xpEarned" },
        },
      },
      { $sort: { totalXp: -1, totalAreaCaptured: -1 } },
      { $limit: 100 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
    ]);

    res.json({
      type: "event",
      eventId,
      rankings: eventLeaderboard.map((entry, index) => ({
        rank: index + 1,
        userId: entry._id,
        name: entry.user?.name ?? "Unknown",
        totalAreaCaptured: Number(entry.totalAreaCaptured.toFixed(2)),
        totalDistance: Number(entry.totalDistance.toFixed(3)),
        totalXp: entry.totalXp,
      })),
    });
  },
);
