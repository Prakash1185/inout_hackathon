import { Router } from "express";

import {
    createActivityController,
    getUserActivitiesController,
} from "../controllers/activity.controller";

const router = Router();

router.post("/", createActivityController);
router.get("/user", getUserActivitiesController);

export const activityRoutes = router;
