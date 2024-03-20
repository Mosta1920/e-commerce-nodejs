import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import { multerMiddleHost } from "../../middlewares/multer.js";
import * as authController from "../Controllers/auth.controller.js";
import { endPointsRoles } from "../Endpoints/auth.endpoints.js";
import { allowedExtensions } from "../../utils/allowed-extensions.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import * as validators from "../../modules/Validation/auth.validationSchema.js";


const router = Router();

router.post(
  "/sign-up",
  validationMiddleware(validators.sginUpValid),
  expressAsyncHandler(authController.signUp)
);
router.get(
  "/verify-email",
  expressAsyncHandler(authController.verifyEmail)
);
router.post(
  "/sign-in",
  validationMiddleware(validators.signInValid),
  expressAsyncHandler(authController.signIn)
);

router.post(
  "/forgot-password",
  expressAsyncHandler(authController.forgotPassword)
);

router.post(
  "/reset-password",
  validationMiddleware(validators.updatePasswordValid),
  expressAsyncHandler(authController.resetPassword)
);

router.put(
  "/update-password",
  auth(endPointsRoles.UPDATE_USER),
  validationMiddleware(validators.updatePasswordValid),
  expressAsyncHandler(authController.updatePassword)
);

export default router;
