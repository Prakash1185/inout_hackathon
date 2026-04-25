import type { Request, Response } from "express";
import { z } from "zod";

import { chatWithVelora } from "../services/chatbot.service";
import { ApiError } from "../utils/api-error";
import { asyncHandler } from "../utils/async-handler";

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        content: z.string().min(1),
      }),
    )
    .max(50)
    .optional()
    .default([]),
});

export const chatbotController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.authUser) {
      throw new ApiError(401, "Unauthorized");
    }

    const body = chatSchema.parse(req.body);
    const result = await chatWithVelora(body.history, body.message);

    res.json(result);
  },
);
