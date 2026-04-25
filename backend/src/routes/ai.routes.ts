import { Router } from "express";

import { generateTrainerPlanController, analyzeTrainerPostureController } from "../controllers/ai.controller";
import { chatbotController } from "../controllers/chatbot.controller";
import {
    analyzeFoodMealController,
    detectFoodFromImageController,
} from "../controllers/food-intelligence.controller";
import { analyzeRecoveryConditionController } from "../controllers/recovery-ai.controller";

const router = Router();

router.post("/trainer/plan", generateTrainerPlanController);
router.post("/trainer/posture", analyzeTrainerPostureController);
router.post("/food/detect", detectFoodFromImageController);
router.post("/food/analyze", analyzeFoodMealController);
router.post("/recovery/analyze", analyzeRecoveryConditionController);
router.post("/chat", chatbotController);

export const aiRoutes = router;
