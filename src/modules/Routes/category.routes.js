import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import { multerMiddleHost } from "../../middlewares/multer.js";
import * as categoryController from "../Controllers/category.controller.js";
import { endPointsRoles } from "../Endpoints/category.endpoints.js";
import { allowedExtensions } from "../../utils/allowed-extensions.js";
import { auth } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/",
  auth(endPointsRoles.ADD_CATEGORY),
  multerMiddleHost({ extensions: allowedExtensions.image }).single("image"),
  expressAsyncHandler(categoryController.addCategory)
);

router.put(
  "/:categoryId",
  auth(endPointsRoles.UPDATE_CATEGORY),
  multerMiddleHost({ extensions: allowedExtensions.image }).single("image"),
  expressAsyncHandler(categoryController.updateCategory)
);

router.delete(
  "/:categoryId",
  auth(endPointsRoles.DELETE_CATEGORY),
  multerMiddleHost({ extensions: allowedExtensions.image }).single("image"),
  expressAsyncHandler(categoryController.deleteCategory)
);

router.get("/", expressAsyncHandler(categoryController.getAllCategories));

export default router;
