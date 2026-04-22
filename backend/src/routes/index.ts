import { Router } from "express";

import { activityRoutes } from "./activity.routes";
import { aiRoutes } from "./ai.routes";
import { eventRoutes } from "./event.routes";
import { leaderboardRoutes } from "./leaderboard.routes";
import { userRoutes } from "./user.routes";

import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/events", requireAuth, eventRoutes);
router.use("/user", requireAuth, userRoutes);
router.use("/activity", requireAuth, activityRoutes);
router.use("/leaderboard", requireAuth, leaderboardRoutes);
router.use("/ai", requireAuth, aiRoutes);

export const apiRouter = router;
