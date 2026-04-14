import { Router } from "express";

import { getLeaderboardController } from "../controllers/leaderboard.controller";

const router = Router();

router.get("/", getLeaderboardController);

export const leaderboardRoutes = router;
