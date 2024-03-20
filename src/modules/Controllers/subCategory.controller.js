import slugify from "slugify";

import Category from "../../../DB/Models/category.model.js";
import SubCategory from "../../../DB/Models/sub-category.model.js";
import Brand from "../../../DB/Models/brand.model.js";

import cloudinaryConnection from "../../utils/cloudinary.js";
import generateUniqueString from "../../utils/generate-unique-string.js";
import { ApiFeatures } from "../../utils/api-features.js";
// ========================================= addSubCategory ================================//

/**
 * destructuring the required data from the request body
 * create new document in the database
 * check user login
 * check if the subcategory already exists
 * check if the category exists
 * generate slug
 * upload image to cloudinary
 * generate the subcategory object
 *  save the subcategory
 * add subcategory to the category
 * add subcategory to the brand
 * add subcategory to the user
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
 * check if the subcategory exists
 * check if the category exists
 * return the response
 * upload image to cloudinary
 * update the subcategory
 * return the response
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

// ========================================= getSubCategoryById ================================//

/**
 * get the document in the database
 * return the response
 */

export const getSubCategoryById = async (req, res, next) => {
  const { subCategoryId } = req.params;

  const subCategory = await SubCategory.findById(subCategoryId);

  if (!subCategory) {
    return next({ message: "SubCategory not found", cause: 404 });
  }

  res.status(200).json({ subCategory });
  next({ message: "Failed to fetch SubCategory", cause: 500 });
};

// ========================================= getAllSubCategory ================================//

/**
 * get the document in the database
 * return the response
 */

export const getAllSubCategory = async (req, res) => {
  const { page, size, sort, ...search } = req.query;

  const features = new ApiFeatures(req.query, SubCategory.find())
    .sort(sort)
    .pagination({ page, size })
    .search(search);

  const subCategories = await features.mongooseQuery;

  res.status(200).json({
    success: true,
    message: "SubCategories fetched successfully",
    data: subCategories,
  });
};

// ========================================= getAllSubCategoriesForCategory ================================//

/**
 * get the document in the database
 * return the response
 * Check if the category exists
 * get subCategories
 * return the response
 */

export const getAllSubCategoriesForCategory = async (req, res, next) => {
  const { categoryId } = req.params;

  const category = await Category.findById(categoryId);
  if (!category) {
    return next({ message: "Category not found", cause: 404 });
  }

  const subCategories = await SubCategory.find({ categoryId });

  res.status(200).json({ subCategories });
};
