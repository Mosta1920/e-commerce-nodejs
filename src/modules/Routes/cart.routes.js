import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import { multerMiddleHost } from "../../middlewares/multer.js";
import * as cartController from "../Controllers/cart.controller.js";
import { endPointsRoles } from "../Endpoints/cart.endpoints.js";
import { allowedExtensions } from "../../utils/allowed-extensions.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { systemRoles } from "../../utils/system-roles.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import * as validators from "../../modules/Validation/cart.validationSchema.js";

const router = Router();

router.post(
  "/",
  auth(systemRoles.USER),
  validationMiddleware(validators.addCartValid),
  expressAsyncHandler(cartController.addToCart)
);

router.put(
  "/:productId",
  auth(systemRoles.USER),
  validationMiddleware(validators.addCartValid),
  expressAsyncHandler(cartController.removeFromCart)
);


export default router;


