import slugify from "slugify";

import User from "../../../DB/Models/user.model.js";
import Category from "../../../DB/Models/category.model.js";
import SubCategory from "../../../DB/Models/sub-category.model.js";
import Brand from "../../../DB/Models/brand.model.js";
import Product from "../../../DB/Models/product.model.js";

import { systemRoles } from "../../utils/system-roles.js";
import cloudinaryConnection from "../../utils/cloudinary.js";
import generateUniqueString from "../../utils/generate-unique-string.js";

// ========================================= addBrand ================================//

/**
 * destructuring the required data from the request body
 * create new document in the database
 *
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

// ========================================= updateBrand ================================//

/**
 *
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

// ========================================= deleteBrand ================================//

/**
 *
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
  console.log(brand);
  if (!brand) {
    return res.status(404).json({ message: "Brand not found" });
  }

  // Delete brand
  const brandDelete = await Brand.findByIdAndDelete(brandId);
  if (!brandDelete) {
    return res.status(404).json({ message: "Brand not found" });
  }

  // console.log(`${process.env.MAIN_FOLDER}/Categories/${brand.subCategoryId.categoryId.folderId}/SubCategories/${brand.subCategoryId.folderId}/Brands/${brand.folderId}`)

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

// ========================================= getBrand ================================//

/**
 *
 */

export const getBrand = async (req, res) => {
  const brands = await Brand.find();
  res.status(200).json({
    success: true,
    message: "Categories fetched successfully",
    data: brands,
  });
};
