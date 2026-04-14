import { Router } from "express";

import { activityRoutes } from "./activity.routes";
import { authRoutes } from "./auth.routes";
import { eventRoutes } from "./event.routes";
import { leaderboardRoutes } from "./leaderboard.routes";
import { userRoutes } from "./user.routes";

import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/events", requireAuth, eventRoutes);
router.use("/user", requireAuth, userRoutes);
router.use("/activity", requireAuth, activityRoutes);
router.use("/leaderboard", requireAuth, leaderboardRoutes);

export const apiRouter = router;
