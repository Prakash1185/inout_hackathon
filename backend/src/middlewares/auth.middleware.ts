import type { NextFunction, Request, Response } from "express";

import { verifyAuthToken } from "../services/token.service";
import { ApiError } from "../utils/api-error";

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const raw = req.headers.authorization;

  if (!raw || !raw.startsWith("Bearer ")) {
    throw new ApiError(401, "Missing or invalid authorization token");
  }

  const token = raw.replace("Bearer ", "").trim();
  req.authUser = verifyAuthToken(token);
  next();
}
