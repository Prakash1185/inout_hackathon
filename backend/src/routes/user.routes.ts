import { Router } from "express";

import {
    getUserProfileController,
    updateUserController,
} from "../controllers/user.controller";

const router = Router();

router.get("/profile", getUserProfileController);
router.patch("/update", updateUserController);

export const userRoutes = router;
