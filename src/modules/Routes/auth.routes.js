import { Router } from "express";
import * as authController from "../Controllers/auth.controller.js";
import expressAsyncHandler from "express-async-handler";
const router = Router();

router.post("/sign-up", expressAsyncHandler(authController.signUp));
router.get("/verify-email", expressAsyncHandler(authController.verifyEmail));
router.post("/sign-in", expressAsyncHandler(authController.signIn));

export default router;
