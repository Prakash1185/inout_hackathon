import { Router } from "express";

import { generateTrainerPlanController } from "../controllers/ai.controller";
import {
    analyzeFoodMealController,
    detectFoodFromImageController,
} from "../controllers/food-intelligence.controller";
import { analyzeRecoveryConditionController } from "../controllers/recovery-ai.controller";

const router = Router();

router.post("/trainer/plan", generateTrainerPlanController);
router.post("/food/detect", detectFoodFromImageController);
router.post("/food/analyze", analyzeFoodMealController);
router.post("/recovery/analyze", analyzeRecoveryConditionController);

export const aiRoutes = router;
