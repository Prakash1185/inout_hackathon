import { Router } from "express";

import {
    createActivityController,
    getMapOverviewController,
    getUserActivitiesController,
} from "../controllers/activity.controller";

const router = Router();

router.post("/", createActivityController);
router.get("/user", getUserActivitiesController);
router.get("/map-overview", getMapOverviewController);

export const activityRoutes = router;
