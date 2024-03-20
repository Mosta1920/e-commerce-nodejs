import { Router } from "express";
const router = Router();

import * as orderController from "../Controllers/order.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { systemRoles } from "../../utils/system-roles.js";
import expressAsyncHandler from "express-async-handler";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import * as validators from "../../modules/Validation/order.validationSchema.js";

router.post(
  "/",
  auth([systemRoles.USER]),
  validationMiddleware(validators.addOrderValid),
  expressAsyncHandler(orderController.createOrder)
);

router.post(
  "/cartToOrder",
  auth([systemRoles.USER]),
  validationMiddleware(validators.addOrderValid),
  expressAsyncHandler(orderController.cartToOrder)
);

router.post(
  "/cancel/:orderId",
  auth([systemRoles.USER]),
  expressAsyncHandler(orderController.cancelOrder)
);


router.put(
  "/:orderId",
  auth([systemRoles.DELIVERY_ROLE]),
  expressAsyncHandler(orderController.delieverOrder)
);

export default router;
