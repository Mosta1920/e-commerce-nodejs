import { Router } from "express";
const router = Router();

import * as reviewController from "../Controllers/review.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { endPointsRoles } from "../Endpoints/review.endpoints.js";
import expressAsyncHandler from "express-async-handler";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import * as validators from "../../modules/Validation/review.validationSchema.js";

router.post(
  "/",
  auth(endPointsRoles.ADD_REVIEW),
  validationMiddleware(validators.addReviewValid),
  expressAsyncHandler(reviewController.addReview)
);


router.put(
  "/:reviewId",
  auth(endPointsRoles.UPDATE_REVIEW),
  validationMiddleware(validators.addReviewValid),
  expressAsyncHandler(reviewController.updateReview)
);


router.get(
  "/:productId",
  // auth(endPointsRoles.ADD_REVIEW),
  validationMiddleware(validators.addReviewValid),
  expressAsyncHandler(reviewController.getAllReviewsForSpecificProduct)
);



export default router;
