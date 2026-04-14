import { Router } from "express";

import {
    getActiveEventController,
    getEventsController,
} from "../controllers/event.controller";

const router = Router();

router.get("/", getEventsController);
router.get("/active", getActiveEventController);

export const eventRoutes = router;
