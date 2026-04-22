import { Router } from "express";

import { generateTrainerPlanController } from "../controllers/ai.controller";

const router = Router();

router.post("/trainer/plan", generateTrainerPlanController);

export const aiRoutes = router;
