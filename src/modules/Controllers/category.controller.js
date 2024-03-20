import slugify from "slugify";

import Category from "../../../DB/Models/category.model.js";
import SubCategory from "../../../DB/Models/sub-category.model.js";
import Brand from "../../../DB/Models/brand.model.js";

import cloudinaryConnection from "../../utils/cloudinary.js";
import generateUniqueString from "../../utils/generate-unique-string.js";
import ApiFeatures from "../../utils/api-features.js";

// ========================================= addCategory ================================//

/**
 * destructuring the required data from the request body
 * create new document in the database
 * check user login
 * check if the category already exists
 * generate slug
 * upload image to cloudinary
 * generate the category object
 * save the category
 * add category to the user
 * return the response
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
    Image: {
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
 * check if the category exists
 * check if the user want to update the name
 * check if the user want to update the image
 * update the category
 * set value of updatedBy
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
 * destructuring the request params
 * delete category
 * delete subcategories
 * delete brand
 * delete image from cloudinary
 * delete folder from cloudinary
 * return the response
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

// ========================================= Get All Categories ================================//

/**
 * destructuring the request query
 * get all categories
 */

export const getAllCategories = async (req, res, next) => {
  
  const { page, size, sort, ...search } = req.query;

  const features = new ApiFeatures(req.query, Category.find())
    .sort(sort)
    .pagination({ page, size })
    .search(search);

  const categories = await features.mongooseQuery;

  res.status(200).json({
    success: true,
    message: "Categories fetched successfully",
    data: categories,
  });
};


// ========================================= Get Category By Id ================================//

/**
 * destructuring the request query
 * get category by id
 */

export const getCategoryById = async (req, res, next) => {
  const { categoryId } = req.params;

  const category = await Category.findById(categoryId);

  if (!category) {
    return next({ message: "Category not found", cause: 404 });
  }

  res.status(200).json({ category });
  next({ message: "Failed to fetch Category", cause: 500 });
};


