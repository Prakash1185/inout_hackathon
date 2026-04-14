import type { Request, Response } from "express";
import { z } from "zod";

import { UserModel } from "../models/User";
import { ApiError } from "../utils/api-error";
import { asyncHandler } from "../utils/async-handler";
import { nextLevelXpThreshold } from "../utils/gamification";

const updateSchema = z.object({
  name: z.string().min(2).max(40).optional(),
});

export const getUserProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.authUser?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      badges: user.badges,
      createdAt: user.createdAt,
      nextLevelXp: nextLevelXpThreshold(user.level + 1),
    });
  },
);

export const updateUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.authUser?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const body = updateSchema.parse(req.body);

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: body },
      { new: true, runValidators: true },
    );

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      badges: user.badges,
      createdAt: user.createdAt,
    });
  },
);
