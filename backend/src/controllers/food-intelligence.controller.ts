import type { Request, Response } from "express";
import { z } from "zod";

import {
    analyzeMealItemsWithAI,
    detectFoodsFromImage,
} from "../services/food-intelligence.service";
import { ApiError } from "../utils/api-error";
import { asyncHandler } from "../utils/async-handler";

const detectSchema = z.object({
  imageBase64: z.string().min(20, "imageBase64 is required"),
});

const analyzeSchema = z.object({
  source: z.enum(["vision", "manual", "fallback"]).optional(),
  preference: z.string().max(220).optional(),
  labels: z
    .array(
      z.object({
        label: z.string().min(1),
        confidence: z.number().min(0).max(1),
      }),
    )
    .optional(),
  items: z
    .array(
      z.object({
        foodName: z.string().min(1),
        quantity: z.coerce.number().min(0.5).max(4),
        notes: z.string().max(150).optional(),
      }),
    )
    .min(1),
});

export const detectFoodFromImageController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.authUser) {
      throw new ApiError(401, "Unauthorized");
    }

    const body = detectSchema.parse(req.body);
    const result = await detectFoodsFromImage({
      imageBase64: body.imageBase64,
    });

    res.json(result);
  },
);

export const analyzeFoodMealController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.authUser) {
      throw new ApiError(401, "Unauthorized");
    }

    const body = analyzeSchema.parse(req.body);

    const result = await analyzeMealItemsWithAI(body.items, {
      source: body.source,
      labels: body.labels,
      preference: body.preference,
    });

    res.json(result);
  },
);
