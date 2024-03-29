import slugify from "slugify";

import Category from "../../../DB/Models/category.model.js";
import SubCategory from "../../../DB/Models/sub-category.model.js";
import Brand from "../../../DB/Models/brand.model.js";

import { systemRoles } from "../../utils/system-roles.js";
import cloudinaryConnection from "../../utils/cloudinary.js";
import generateUniqueString from "../../utils/generate-unique-string.js";
import ApiFeatures from "../../utils/api-features.js";

// ========================================= Add Brand ================================//

/**
 * destructuring the required data from the request body
 * create new document in the database
 * return the response
 * check user login
 * check if the brand already exists
 * check if the category exists
 * generate slug
 * upload brand logo to cloudinary
 * generate the brand object
 * save the brand
 * return the response
 */

export const addBrand = async (req, res, next) => {
  // destructuring the required data from the request body
  const { name } = req.body;
  const { categoryId, subCategoryId } = req.query;

  // check user login
  const { _id } = req.authUser;

  // check if the brand already exists
  const subCategoryCheck = await SubCategory.findById(subCategoryId).populate(
    "categoryId",
    "folderId"
  );

  if (!subCategoryCheck)
    return res.status(404).json({ message: "SubCategory not found" });

  const isBrandExists = await Brand.findOne({ name, subCategoryId });
  if (isBrandExists)
    return res
      .status(400)
      .json({ message: "Brand already exist for this subcategory" });

  // check if the category exists
  if (categoryId != subCategoryCheck.categoryId._id)
    return res.status(404).json({ message: "Category not found" });

  // generate slug
  const slug = slugify(name, "-");

  // upload brand logo to cloudinary
  if (!req.file)
    return next({
      cause: 400,
      message: "brand logo is required",
    });

  const folderId = generateUniqueString(4);
  const { secure_url, public_id } =
    await cloudinaryConnection().uploader.upload(req.file.path, {
      folder: `${process.env.MAIN_FOLDER}/Categories/${subCategoryCheck.categoryId.folderId}/SubCategories/${subCategoryCheck.folderId}/Brands/${folderId}`,
    });

  // generate the brand object
  const brand = {
    name,
    slug,
    image: {
      secure_url,
      public_id,
    },
    folderId,
    addedBy: _id,
    subCategoryId,
    categoryId,
  };

  const brandCreated = await Brand.create(brand);
  res.status(201).json({
    success: true,
    message: "Brand created successfully",
    data: brandCreated,
  });
};

// ========================================= Update Brand ================================//

/**
 * check if the brand exists
 * check if the brand belongs to the specified subcategory & category
 * check if the brand belongs to the user
 * check if the category exists
 * check if the subcategory exists
 * update the brand properties
 * return the response
 * upload brand logo to cloudinary
 * generate the brand object
 * update the brand
 * return the response
 */

export const updateBrand = async (req, res) => {
  const { name, oldPublicId } = req.body;
  const { categoryId, subCategoryId } = req.query;
  const { _id } = req.authUser;
  const { brandId } = req.params;

  // Check if the brand exists
  const brand = await Brand.findById(brandId);

  if (!brand) {
    return res.status(404).json({ message: "Brand not found" });
  }

  // Check if the brand belongs to the specified subcategory & category
  if (brand.subCategoryId.toString() != subCategoryId) {
    return res.status(400).json({
      message: "Brand does not belong to the specified subcategory",
    });
  }

  if (brand.categoryId.toString() != categoryId)
    return next({
      cause: 400,
      message: "Brand does not belong to this category",
    });
  if (brand.subCategoryId.toString() != subCategoryId)
    return next({
      cause: 400,
      message: "Brand does not belong to this subcategory",
    });

  // Check if the brand belongs to the user
  if (
    req.authUser.role !== systemRoles.SUPER_ADMIN &&
    brand.addedBy.toString() != addedBy
  )
    return next({ cause: 400, message: "Brand does not belong to this user" });

  // Check if the category exists
  const subCategoryCheck = await SubCategory.findById(subCategoryId).populate(
    "categoryId",
    "folderId"
  );

  if (!subCategoryCheck) {
    return res.status(404).json({ message: "SubCategory not found" });
  }

  // Check if the category matches the subcategory
  if (categoryId !== subCategoryCheck.categoryId._id.toString()) {
    return res.status(404).json({ message: "Category not found" });
  }

  // Update the brand properties
  brand.name = name;
  brand.slug = slugify(name, "-");

  if (oldPublicId) {
    if (!req.file) return next({ cause: 400, message: "Image is required" });
    const newPublicId = oldPublicId.split(`/${brand.folderId}`)[1];
    const { secure_url, public_id } =
      await cloudinaryConnection().uploader.upload(req.file.path, {
        folder: `${process.env.MAIN_FOLDER}/Categories/${subCategoryCheck.categoryId.folderId}/SubCategories/${subCategoryCheck.folderId}/Brands/${brand.folderId}`,
        public_id: newPublicId,
      });
    brand.image.secure_url = secure_url;
  }

  brand.updatedBy = _id;

  // Save the updated brand to the database
  const updatedBrand = await brand.save();

  res.status(200).json({
    success: true,
    message: "Brand updated successfully",
    data: updatedBrand,
  });
};

// ========================================= Delete Brand ================================//

/**
 * check if the brand exists
 * check if the brand belongs to the user
 * delete the brand
 * return the response
 * delete image from cloudinary
 * delete folder from cloudinary
 * delete the brand
 * return the response
 */

export const deleteBrand = async (req, res) => {
  const { brandId } = req.params;

  // Check if the brand exists
  const brand = await Brand.findById(brandId).populate({
    path: "subCategoryId",
    populate: [
      {
        path: "categoryId",
      },
    ],
  });
  if (!brand) {
    return res.status(404).json({ message: "Brand not found" });
  }

  // Delete brand
  const brandDelete = await Brand.findByIdAndDelete(brandId);
  if (!brandDelete) {
    return res.status(404).json({ message: "Brand not found" });
  }

  // Delete image from cloudinary
  await cloudinaryConnection().api.delete_resources_by_prefix(
    `${process.env.MAIN_FOLDER}/Categories/${brand.subCategoryId.categoryId.folderId}/SubCategories/${brand.subCategoryId.folderId}/Brands/${brand.folderId}`
  );

  // Delete folder from cloudinary
  await cloudinaryConnection().api.delete_folder(
    `${process.env.MAIN_FOLDER}/Categories/${brand.subCategoryId.categoryId.folderId}/SubCategories/${brand.subCategoryId.folderId}/Brands/${brand.folderId}`
  );

  res.status(200).json({
    success: true,
    message: "Brand deleted successfully",
  });
};

// ========================================= Get Brand ================================//

/**
 * get all brands
 */

export const getAllBrand = async (req, res) => {
  const { page, size, sort, ...search } = req.query;

  const features = new ApiFeatures(req.query, Brand.find())
    .sort(sort)
    .pagination({ page, size })
    .search(search);

  const brands = await features.mongooseQuery;

  res.status(200).json({
    success: true,
    message: "Brands fetched successfully",
    data: brands,
  });
};

// ========================================= All Brands For SubCategory ================================//

/**
 * check if the subcategory exists
 * return the response
 */

export const getAllBrandsForSubCategory = async (req, res, next) => {
  const { subCategoryId } = req.params;

  const subcategory = await SubCategory.findById(subCategoryId);
  if (!subcategory) {
    return next({ message: "Subcategory not found", cause: 404 });
  }

  const brands = await Brand.find({ subCategoryId });

  res.status(200).json({ brands });
};

// ========================================= All Brands For Category ================================//

/**
 * check if the category exists
 * return the response
 */

export const getAllBrandsForCategory = async (req, res, next) => {
  const { categoryId } = req.params;

  const category = await Category.findById(categoryId);
  if (!category) {
    return next({ message: "Category not found", cause: 404 });
  }

  const brands = await Brand.find({ categoryId });

  res.status(200).json({ brands });
};
