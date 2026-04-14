import { Router } from "express";

import { getActiveEventController } from "../controllers/event.controller";

const router = Router();

router.get("/active", getActiveEventController);

export const eventRoutes = router;
