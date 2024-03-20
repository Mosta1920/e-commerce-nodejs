import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import { multerMiddleHost } from "../../middlewares/multer.js";
import * as userController from "../Controllers/user.controller.js";
import { endPointsRoles } from "../Endpoints/user.endpoints.js";
import { allowedExtensions } from "../../utils/allowed-extensions.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import * as validators from "../../modules/Validation/user.validationSchema.js";

const router = Router();

router.put(
  "/:userId",
  auth(endPointsRoles.UPDATE_USER),
  validationMiddleware(validators.addUserValid),
  expressAsyncHandler(userController.updateUser)
);



router.delete(
  "/:userId",
  auth(endPointsRoles.DELETE_USER),
  validationMiddleware(validators.addUserValid),
  expressAsyncHandler(userController.deleteUser)
);

router.get("/", expressAsyncHandler(userController.getAllUsers));

export default router;
