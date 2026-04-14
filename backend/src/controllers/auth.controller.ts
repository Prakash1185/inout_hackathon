import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { z } from "zod";

import { UserModel } from "../models/User";
import { signAuthToken } from "../services/token.service";
import { ApiError } from "../utils/api-error";
import { asyncHandler } from "../utils/async-handler";

const signUpSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const signUpController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = signUpSchema.parse(req.body);

    const existingUser = await UserModel.findOne({ email: body.email });
    if (existingUser) {
      throw new ApiError(409, "User already exists");
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await UserModel.create({
      name: body.name,
      email: body.email,
      passwordHash,
    });

    const token = signAuthToken({
      userId: user._id.toString(),
      email: user.email,
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        badges: user.badges,
        createdAt: user.createdAt,
      },
    });
  },
);

export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = loginSchema.parse(req.body);

    const user = await UserModel.findOne({ email: body.email });
    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    const isMatch = await bcrypt.compare(body.password, user.passwordHash);
    if (!isMatch) {
      throw new ApiError(401, "Invalid credentials");
    }

    const token = signAuthToken({
      userId: user._id.toString(),
      email: user.email,
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        badges: user.badges,
        createdAt: user.createdAt,
      },
    });
  },
);
