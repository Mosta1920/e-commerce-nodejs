import slugify from "slugify";

import User from "../../../DB/Models/user.model.js";
import Category from "../../../DB/Models/category.model.js";
import SubCategory from "../../../DB/Models/sub-category.model.js";
import Brand from "../../../DB/Models/brand.model.js";
import Product from "../../../DB/Models/product.model.js";

import { systemRoles } from "../../utils/system-roles.js";
import cloudinaryConnection from "../../utils/cloudinary.js";
import generateUniqueString from "../../utils/generate-unique-string.js";

// ========================================= addCategory ================================//

/**
 * destructuring the required data from the request body
 * create new document in the database
 *
 */

export const addCategory = async (req, res) => {
  // destructuring the required data from the request body
  const { name } = req.body;
  // check user login
  const { _id } = req.authUser;

  // check if the category already exists
  const isNameDuplicated = await Category.findOne({ name });
  if (isNameDuplicated)
    return res.status(409).json({ message: "Category already exist" });

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
      folder: `${process.env.MAIN_FOLDER}/Categories/${folderId}`,
    });

  req.folder = `${process.env.MAIN_FOLDER}/Categories/${folderId}`;

  // generate the category object
  const category = {
    name,
    slug,
    image: {
      secure_url,
      public_id,
    },
    folderId,
    addedBy: _id,
  };

  const categoryCreated = await Category.create(category);
  req.savedDocument = { model: Category, _id: categoryCreated._id };
  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: categoryCreated,
  });
};

// ========================================= updateCategory ================================//

/**
 * destructuring the required data from the request body
 * destructuring the request params
 */

export const updateCategory = async (req, res) => {
  // destructuring the required data from the request body
  const { name, oldPublicId } = req.body;
  const { categoryId } = req.params;
  const { _id } = req.authUser;

  // check if the category already exists by using categoryId
  const category = await Category.findById(categoryId);
  if (!category) return res.status(404).json({ message: "Category not found" });

  // check if the user want to update the name
  if (name) {
    // check if the category name is different and not duplicated
    if (name === category.name) {
      return res.status(400).json({ message: "Please enter a different name" });
    }
    const isNameDuplicated = await Category.findOne({ name });
    if (isNameDuplicated) {
      return res.status(409).json({ message: "Category name already exist" });
    }

    category.name = name;
    category.slug = slugify(name, "-");
  }

  // check if the user want to update the image
  if (oldPublicId) {
    if (!req.file) return next({ cause: 400, message: "Image is required" });
    const newPublicId = oldPublicId.split(`/${category.folderId}`)[1];
    const { secure_url, public_id } =
      await cloudinaryConnection().uploader.upload(req.file.path, {
        folder: `${process.env.MAIN_FOLDER}/Categories/${category.folderId}`,
        public_id: newPublicId,
      });
    category.image.secure_url = secure_url;
  }

  // set value of updatedBy
  category.updatedBy = _id;
  await category.save();
  res.status(201).json({
    success: true,
    message: "Category updated successfully",
    data: category,
  });
};

// ========================================= deleteCategory ================================//

/**
 *
 */

export const deleteCategory = async (req, res) => {
  const { categoryId } = req.params;

  // delete category
  const category = await Category.findByIdAndDelete(categoryId);
  if (!category) return res.status(404).json({ message: "Category not found" });

  //delete subcategories
  const subCategories = await SubCategory.deleteMany({ categoryId });
  if (!subCategories.deletedCount < 0)
    console.log("There are no subcategories");

  //delete brand
  const brand = await Brand.deleteMany({ categoryId });
  if (!brand.deletedCount < 0) console.log("There are no brand");

  await cloudinaryConnection().api.delete_resources_by_prefix(
    `${process.env.MAIN_FOLDER}/Categories/${category.folderId}`
  );

  await cloudinaryConnection().api.delete_folder(
    `${process.env.MAIN_FOLDER}/Categories/${category.folderId}`
  );

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
};

// ========================================= getAllCategories ================================//

/**
 */

export const getAllCategories = async (req, res, next) => {
  // nested populate
  const categories = await Category.find().populate([
    {
      path: "subcategories",
      populate: [
        {
          path: "Brands",
        },
      ],
    },
  ]);
  // console.log(categories);
  res
    .status(200)
    .json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    });
};
