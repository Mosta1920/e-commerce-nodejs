import slugify from "slugify";

import User from "../../../DB/Models/user.model.js";
import Category from "../../../DB/Models/category.model.js";
import SubCategory from "../../../DB/Models/sub-category.model.js";
import Brand from "../../../DB/Models/brand.model.js";
import Product from "../../../DB/Models/product.model.js";

import { systemRoles } from "../../utils/system-roles.js";
import cloudinaryConnection from "../../utils/cloudinary.js";
import generateUniqueString from "../../utils/generate-unique-string.js";

// ========================================= addSubCategory ================================//

/**
 * destructuring the required data from the request body
 * create new document in the database
 *
 */

export const addSubCategory = async (req, res) => {
  // destructuring the required data from the request body
  const { name } = req.body;
  const { categoryId } = req.params;

  // check user login
  const { _id } = req.authUser;

  // check if the subcategory already exists
  const isNameDuplicated = await SubCategory.findOne({ name });
  if (isNameDuplicated)
    return res.status(409).json({ message: "SubCategory already exist" });

  // check if the category is exist by using categoryId
  const category = await Category.findById(categoryId);
  if (!category) return res.status(404).json({ message: "Category not found" });

  // generate slug
  const slug = slugify(name, "-");

  // upload image to cloudinary
  if (!req.file)
    return next({
      cause: 400,
      message: "Image is required",
    });

  const folderId = generateUniqueString(4);
  const { secure_url, public_id } =
    await cloudinaryConnection().uploader.upload(req.file.path, {
      folder: `${process.env.MAIN_FOLDER}/Categories/${category.folderId}/SubCategories/${folderId}`,
    });

  // generate the subcategory object
  const subCategory = {
    name,
    slug,
    image: {
      secure_url,
      public_id,
    },
    folderId,
    addedBy: _id,
    categoryId,
  };

  const subCategoryCreated = await SubCategory.create(subCategory);
  res.status(201).json({
    success: true,
    message: "subCategory created successfully",
    data: subCategoryCreated,
  });
};

// ========================================= updateSubCategory ================================//

/**
 * destructuring the required data from the request body
 * update the document in the database
 *
 */

export const updateSubCategory = async (req, res) => {
  const { name, oldPublicId } = req.body;
  const { _id } = req.authUser;
  const { subCategoryId } = req.params;

  // Check if the subcategory exists
  const subCategory = await SubCategory.findById(subCategoryId);
  if (!subCategory) {
    return res.status(404).json({ message: "Subcategory not found" });
  }

  // Check if the category exists
  const subCategoryCheck = await SubCategory.findById(subCategoryId).populate(
    "categoryId",
    "folderId"
  );

  if (!subCategoryCheck) {
    return res.status(404).json({ message: "SubCategory not found" });
  }

  // Update the brand properties
  subCategory.name = name;
  subCategory.slug = slugify(name, "-");

  if (oldPublicId) {
    if (!req.file) return next({ cause: 400, message: "Image is required" });
    const newPublicId = oldPublicId.split(`/${subCategory.folderId}`)[1];
    const { secure_url, public_id } =
      await cloudinaryConnection().uploader.upload(req.file.path, {
        folder: `${process.env.MAIN_FOLDER}/Categories/${subCategoryCheck.categoryId.folderId}/SubCategories/${subCategoryCheck.folderId}`,
        public_id: newPublicId,
      });
    subCategory.image.secure_url = secure_url;
  }

  subCategory.updatedBy = _id;

  // Save the updated brand to the database
  const updatedBrand = await subCategory.save();

  res.status(200).json({
    success: true,
    message: "SubCategory updated successfully",
    data: updatedBrand,
  });
};

// ========================================= deleteSubCategory ================================//

/**
 * destructuring the required data from the request params
 * Check if the subcategory exists
 * delete subCategory
 * delete brand
 * delete image from cloudinary
 * delete folder from cloudinary
 */

export const deleteSubCategory = async (req, res) => {
  const { subCategoryId } = req.params;

  // Check if the subcategory exists
  const subCategoryCheck = await SubCategory.findById(subCategoryId).populate(
    "categoryId",
    "folderId"
  );

  if (!subCategoryCheck) {
    return res.status(404).json({ message: "SubCategory not found" });
  }

  // delete subCategory
  const subCategoryDelete = await SubCategory.findByIdAndDelete(subCategoryId);
  if (!subCategoryDelete)
    return res.status(404).json({ message: "SubCategory not found" });

  //delete brand
  const brand = await Brand.deleteMany({ subCategoryId });
  if (!brand.deletedCount < 0) console.log("There are no brand");

  //delete image from cloudinary
  await cloudinaryConnection().api.delete_resources_by_prefix(
    `${process.env.MAIN_FOLDER}/Categories/${subCategoryCheck.categoryId.folderId}/SubCategories/${subCategoryCheck.folderId}`
  );

  // delete folder from cloudinary
  await cloudinaryConnection().api.delete_folder(
    `${process.env.MAIN_FOLDER}/Categories/${subCategoryCheck.categoryId.folderId}/SubCategories/${subCategoryCheck.folderId}`
  );

  res.status(200).json({
    success: true,
    message: "SubCategory deleted successfully",
  });
};

// ========================================= getAllSubCategory ================================//

/**
 * get the document in the database
 */

export const getAllSubCategory = async (req, res) => {
  const subCategories = await SubCategory.find().populate([
    {
      path: "Brands",
    },
  ]);
  res.status(200).json({
    success: true,
    message: "Categories fetched successfully",
    data: subCategories,
  });
};
