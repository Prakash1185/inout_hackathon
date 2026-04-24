import type { Request, Response } from "express";
import { z } from "zod";

import { analyzeRecoveryCondition } from "../services/recovery-ai.service";
import { ApiError } from "../utils/api-error";
import { asyncHandler } from "../utils/async-handler";

const recoverySchema = z.object({
  mode: z.enum(["upload", "scan", "describe"]),
  fileName: z.string().optional(),
  fileUri: z.string().optional(),
  fileType: z.string().optional(),
  area: z.enum(["knee", "shoulder", "back", "neck"]).optional(),
  painLevel: z.coerce.number().min(1).max(10).optional(),
  symptoms: z
    .object({
      swelling: z.boolean(),
      stiffness: z.boolean(),
      sharpPain: z.boolean(),
    })
    .optional(),
  notes: z.string().max(300).optional(),
  imageBase64: z.string().optional(),
});

export const analyzeRecoveryConditionController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.authUser) {
      throw new ApiError(401, "Unauthorized");
    }

    const body = recoverySchema.parse(req.body);
    const result = await analyzeRecoveryCondition(body);
    res.json(result);
  },
);
