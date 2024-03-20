import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import { multerMiddleHost } from "../../middlewares/multer.js";
import * as productController from "../Controllers/product.controller.js";
import { endPointsRoles } from "../Endpoints/product.endpoints.js";
import { allowedExtensions } from "../../utils/allowed-extensions.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import * as validators from "../../modules/Validation/product.validationSchema.js";

const router = Router();

router.post(
  "/",
  auth(endPointsRoles.ADD_PRODUCT),
  validationMiddleware(validators.addProductValid),
  multerMiddleHost({ extensions: allowedExtensions.image }).array("image", 5),
  expressAsyncHandler(productController.addProduct)
);

router.put(
  "/:productId",
  auth(endPointsRoles.UPDATE_PRODUCT),
  validationMiddleware(validators.addProductValid),
  multerMiddleHost({ extensions: allowedExtensions.image }).single("image"),
  expressAsyncHandler(productController.updateProduct)
);

router.delete(
  "/:productId",
  auth(endPointsRoles.DELETE_PRODUCT),
  validationMiddleware(validators.addProductValid),
  multerMiddleHost({ extensions: allowedExtensions.image }).single("image"),
  expressAsyncHandler(productController.deleteProduct)
);

router.get("/", expressAsyncHandler(productController.getAllProduct));

export default router;
