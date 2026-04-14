import { Router } from "express";

import {
    loginController,
    signUpController,
} from "../controllers/auth.controller";

const router = Router();

router.post("/signup", signUpController);
router.post("/login", loginController);

export const authRoutes = router;
