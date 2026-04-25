import type { Request, Response } from "express";
import { z } from "zod";

import {
  generateTrainerPlan, analyzePostureScan,
  type TrainerPlanInput,
} from "../services/ai-trainer.service";
import { ApiError } from "../utils/api-error";
import { asyncHandler } from "../utils/async-handler";

const planRequestSchema = z.object({
  targetMuscle: z.enum([
    "Full Body",
    "Chest",
    "Back",
    "Legs",
    "Core",
    "Shoulders",
    "Arms",
  ]),
  minutes: z.coerce.number().min(10).max(90),
  repetitions: z.coerce.number().min(6).max(30),
  extraContext: z.string().max(300).optional().default(""),
  userLevel: z.coerce.number().min(1).max(50).optional(),
});

export const generateTrainerPlanController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.authUser) {
      throw new ApiError(401, "Unauthorized");
    }

    const body = planRequestSchema.parse(req.body);
    const input: TrainerPlanInput = {
      targetMuscle: body.targetMuscle,
      minutes: body.minutes,
      repetitions: body.repetitions,
      extraContext: body.extraContext,
      userLevel: body.userLevel,
    };

    const result = await generateTrainerPlan(input);

    res.json({
      plan: result.plan,
      summary: result.summary,
      source: result.source,
    });
  },
);
const postureRequestSchema = z.object({
  imageBase64: z.string().min(1),
  exerciseTarget: z.string(),
  exerciseTitle: z.string(),
});

export const analyzeTrainerPostureController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.authUser) {
      throw new ApiError(401, "Unauthorized");
    }

    const body = postureRequestSchema.parse(req.body);
    const result = await analyzePostureScan(
      body.imageBase64,
      body.exerciseTarget,
      body.exerciseTitle
    );

    res.json(result);
  }
);
