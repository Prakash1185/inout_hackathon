import type { NextFunction, Request, Response } from "express";

import { ApiError } from "../utils/api-error";

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const clerkUserId = req.header("x-clerk-user-id")?.trim();
  const email = req.header("x-clerk-email")?.trim();
  const name = req.header("x-clerk-name")?.trim();

  if (!clerkUserId) {
    throw new ApiError(401, "Missing Clerk user identity");
  }

  req.authUser = {
    userId: clerkUserId,
    clerkUserId,
    email: email && email.length > 0 ? email : `${clerkUserId}@clerk.local`,
    name: name && name.length > 0 ? name : "BitBox Athlete",
  };

  next();
}
