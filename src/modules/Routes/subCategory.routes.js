import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import { multerMiddleHost } from "../../middlewares/multer.js";
import * as subCategoryController from "../Controllers/subCategory.controller.js";
import { endPointsRoles } from "../Endpoints/subCategory.endpoints.js";
import { allowedExtensions } from "../../utils/allowed-extensions.js";
import { auth } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/:categoryId",
  auth(endPointsRoles.ADD_SUBCATEGORY),
  multerMiddleHost({ extensions: allowedExtensions.image }).single("image"),
  expressAsyncHandler(subCategoryController.addSubCategory)
);

router.put(
  "/:subCategoryId",
  auth(endPointsRoles.UPDATE_SUBCATEGORY),
  multerMiddleHost({ extensions: allowedExtensions.image }).single("image"),
  expressAsyncHandler(subCategoryController.updateSubCategory)
);

router.delete(
  "/:subCategoryId",
  auth(endPointsRoles.DELETE_SUBCATEGORY),
  multerMiddleHost({ extensions: allowedExtensions.image }).single("image"),
  expressAsyncHandler(subCategoryController.deleteSubCategory)
);

router.get("/", expressAsyncHandler(subCategoryController.getAllSubCategory));

export default router;
