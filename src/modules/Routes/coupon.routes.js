import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import { multerMiddleHost } from "../../middlewares/multer.js";
import * as couponController from "../Controllers/coupon.controller.js";
import { endPointsRoles } from "../Endpoints/coupon.endpoints.js";
import { allowedExtensions } from "../../utils/allowed-extensions.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import * as validators from "../../modules/Validation/coupon.validationSchema.js";


const router = Router();

router.post(
  "/",
  auth(endPointsRoles.ADD_COUPON),
  validationMiddleware(validators.addCouponValid),
  expressAsyncHandler(couponController.addCoupon)
);

router.post(
  "/valid",
  auth(endPointsRoles.ADD_COUPON),
  validationMiddleware(validators.CouponValid),
  expressAsyncHandler(couponController.validateCoupon)
);

router.put(
  "/:couponId",
  auth(endPointsRoles.UPDATE_COUPON),
  expressAsyncHandler(couponController.updateCoupon)
);

router.put(
  "/:couponId/enable",
  auth(endPointsRoles.UPDATE_COUPON),
  expressAsyncHandler(couponController.enableCoupon)
);

router.put(
  "/:couponId/disable",
  auth(endPointsRoles.UPDATE_COUPON),
  expressAsyncHandler(couponController.disableCoupon)
);

router.delete(
  "/:couponId",
  auth(endPointsRoles.DELETE_COUPON),
  expressAsyncHandler(couponController.deleteCoupon)
);

router.get("/enabled", expressAsyncHandler(couponController.getAllEnabledCoupon));

router.get("/disabled", expressAsyncHandler(couponController.getAllDisabledCoupon));

router.get("/:couponId", expressAsyncHandler(couponController.getCouponById));

router.get("/", expressAsyncHandler(couponController.getAllCoupons));

export default router;
