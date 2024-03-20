import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import { multerMiddleHost } from "../../middlewares/multer.js";
import * as brandController from "../Controllers/brand.controller.js";
import { endPointsRoles } from "../Endpoints/brand.endpoints.js";
import { allowedExtensions } from "../../utils/allowed-extensions.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import * as validators from "../../modules/Validation/brand.validationSchema.js";

const router = Router();

router.post(
  "/",
  auth(endPointsRoles.ADD_BRAND),
  validationMiddleware(validators.addBrandValid),
  multerMiddleHost({ extensions: allowedExtensions.image }).single("image"),
  expressAsyncHandler(brandController.addBrand)
);

router.put(
  "/:brandId",
  auth(endPointsRoles.UPDATE_BRAND),
  multerMiddleHost({ extensions: allowedExtensions.image }).single("image"),
  expressAsyncHandler(brandController.updateBrand)
);

router.delete(
  "/:brandId",
  auth(endPointsRoles.DELETE_BRAND),
  multerMiddleHost({ extensions: allowedExtensions.image }).single("image"),
  expressAsyncHandler(brandController.deleteBrand)
);

router.get("/", expressAsyncHandler(brandController.getAllBrand));
router.get("/sub-category/:subCategoryId", expressAsyncHandler(brandController.getAllBrandsForSubCategory));
router.get("/category/:categoryId", expressAsyncHandler(brandController.getAllBrandsForCategory));

export default router;
