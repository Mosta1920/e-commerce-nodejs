import slugify from "slugify";

import User from "../../../DB/Models/user.model.js";
import Category from "../../../DB/Models/category.model.js";
import SubCategory from "../../../DB/Models/sub-category.model.js";
import Brand from "../../../DB/Models/brand.model.js";
import Product from "../../../DB/Models/product.model.js";

import { systemRoles } from "../../utils/system-roles.js";
import cloudinaryConnection from "../../utils/cloudinary.js";
import generateUniqueString from "../../utils/generate-unique-string.js";


// ========================================= addProduct ================================//

/**
 * destructuring the required data from the request body
 * create new document in the database
 *
 */

export const addProduct = async (req, res, next) => {
  //data
  const { title, desc, stock, basePrice, discount, specs } = req.body;
  const { brandId, categoryId, subCategoryId } = req.query;
  const addedBy = req.authUser._id;

  //brand check
  const brand = await Brand.findById(brandId);
  if (!brand) return next({ cause: 404, message: "Brand not found" });

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

  if (
    req.authUser.role !== systemRoles.SUPER_ADMIN &&
    brand.addedBy.toString() != addedBy
  )
    return next({ cause: 400, message: "Brand does not belong to this user" });

  //generate slug
  const slug = slugify(title, { lower: true, replacement: "-" });

  //discount
  const appliedPrice = basePrice - basePrice * ((discount || 0) / 100);

  //upload image
  if (!req.files?.length)
    return next({ cause: 400, message: "Image is required" });

  let Images = [];
  const folderId = generateUniqueString(4);

  const folder = brand.image.public_id.split(`${brand.folderId}/`)[0];

  for (const file of req.files) {
    const { secure_url, public_id } =
      await cloudinaryConnection().uploader.upload(file.path, {
        folder: folder + `${brand.folderId}` + `/Products/${folderId}`,
      });
    Images.push({ secure_url, public_id });
  }

  req.folder = folder + `${brand.folderId}` + `/Products/${folderId}`;

  const product = {
    title,
    slug,
    desc,
    stock,
    basePrice,
    appliedPrice,
    discount,
    specs: JSON.parse(specs),
    brandId,
    categoryId,
    subCategoryId,
    addedBy,
  };

  const newProduct = await Product.create(product);
  req.savedDocument = { model: Product, _id: newProduct._id };

  res.status(201).json({
    success: true,
    message: "Product added successfully",
    data: newProduct,
  });
};

// ========================================= updateProduct ================================//

/**
 * destructuring the required data from the request body
 * create new document in the database
 *
 */

export const updateProduct = async (req, res, next) => {
  //data

  const { _id } = req.authUser;
  const { title, desc, stock, basePrice, discount, specs, oldPublicId } =
    req.body;

  //check if the product exists
  const { productId } = req.params;
  const product = await Product.findById(productId);
  if (!product) return next({ cause: 404, message: "Product not found" });

  //check if the product belongs to the user
  if (
    req.authUser.role !== systemRoles.SUPER_ADMIN &&
    Product.addedBy.toString() !== _id.toString()
  )
    return next({
      cause: 400,
      message: "Product does not belong to this user",
    });

  if (title) product.title = title;
  const slug = slugify(title, { lower: true, replacement: "-" });
  product.slug = slug;
  if (desc) product.desc = desc;
  if (stock) product.stock = stock;
  if (specs) product.specs = JSON.parse(specs);

  const appliedPrice =
    (basePrice || product.basePrice) *
    (1 - (discount || product.discount) / 100);

  product.appliedPrice = appliedPrice;

  if (discount) product.discount = discount;
  if (basePrice) product.basePrice = basePrice;

  //images
  if (oldPublicId) {
    if (!req.file) return next({ cause: 400, message: "Image is required" });

    const folderPath = product.Images[0].public_id.split(
      `${product.folderId}/`
    )[0];

    const newPublicId = oldPublicId.split(`${product.folderId}`)[1];

    const { secure_url, public_id } =
      await cloudinaryConnection().uploader.upload(req.file.path, {
        public_id: newPublicId,
      });

    product.Images.map((image) => {
      if (image.public_id === oldPublicId) {
        image.secure_url = secure_url;
      }
    });
    req.folder = folderPath + `${product.folderId}`;
  }

  await product.save();

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: product,
  });
};

// ========================================= deleteProduct ================================//

/**
 * destructuring the required data from the request body
 * create new document in the database
 *
 */

export const deleteProduct = async (req, res, next) => {
}

// ========================================= getAllProduct ================================//

/**
 * destructuring the required data from the request body
 * create new document in the database
 *
 */

export const getAllProduct = async (req, res, next) => {
}

