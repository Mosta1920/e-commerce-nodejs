import slugify from "slugify";

import Brand from "../../../DB/Models/brand.model.js";
import Product from "../../../DB/Models/product.model.js";
import { systemRoles } from "../../utils/system-roles.js";
import cloudinaryConnection from "../../utils/cloudinary.js";
import generateUniqueString from "../../utils/generate-unique-string.js";

import ApiFeatures from "../../utils/api-features.js";

//================================= Add product API =================================//


/**
 * destructuring the required data from the request body
 * create new document in the database
 * check user login
 * check if the brand already exists
 * check if the category exists
 * check if the subcategory exists
 * generate slug
 * upload image to cloudinary
 * generate the product object
 * save the product
 * add product to the brand
 * add product to the category
 * add product to the subcategory
 * add product to the user
 */

export const addProduct = async (req, res, next) => {
  // data from the request body
  const { title, desc, basePrice, discount, stock, specs } = req.body;
  // data from the request query
  const { categoryId, subCategoryId, brandId } = req.query;
  // data from the request authUser
  const addedBy = req.authUser._id;

  // brand check
  const brand = await Brand.findById(brandId);
  if (!brand) return next({ cause: 404, message: "Brand not found" });

  // category check
  if (brand.categoryId.toString() !== categoryId)
    return next({ cause: 400, message: "Brand not found in this category" });
  // sub-category check
  if (brand.subCategoryId.toString() !== subCategoryId)
    return next({
      cause: 400,
      message: "Brand not found in this sub-category",
    });

  // who will be authorized to add a product
  if (
    req.authUser.role !== systemRoles.SUPER_ADMIN &&
    brand.addedBy.toString() !== addedBy.toString()
  )
    return next({
      cause: 403,
      message: "You are not authorized to add a product to this brand",
    });

  // generate the product  slug
  const slug = slugify(title, { lower: true, replacement: "-" }); //  lowercase: true

  //  applied price calculations
  const appliedPrice = basePrice - (basePrice * (discount || 0)) / 100;

  //Images
  if (!req.files?.length)
    return next({ cause: 400, message: "Images are required" });
  const Images = [];
  const folderId = generateUniqueString(4);
  const folderPath = brand.image.public_id.split(`${brand.folderId}/`)[0];

  for (const file of req.files) {
    // ecommerce-project/Categories/4aa3/SubCategories/fhgf/Brands/5asf/z2wgc418otdljbetyotn
    const { secure_url, public_id } =
      await cloudinaryConnection().uploader.upload(file.path, {
        folder: folderPath + `${brand.folderId}/Products/${folderId}`,
      });
    Images.push({ secure_url, public_id });
  }
  req.folder = folderPath + `${brand.folderId}/Products/${folderId}`;

  // prepare the product object for db
  const product = {
    title,
    desc,
    slug,
    basePrice,
    discount,
    appliedPrice,
    stock,
    specs: JSON.parse(specs),
    categoryId,
    subCategoryId,
    brandId,
    addedBy,
    Images,
    folderId,
  };

  const newProduct = await Product.create(product);
  req.savedDocuments = { model: Product, _id: newProduct._id };

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: newProduct,
  });
};

//================================================= Update product API ============================================//

/**
 * destructuring the required data from the request body
 * check if the product exist
 * check if logggedIn user is authorized to update the product
 * update the product
 * return the response
 */

export const updateProduct = async (req, res, next) => {
  // data from the request body
  const { title, desc, specs, stock, basePrice, discount, oldPublicId } =
    req.body;
  // data for condition
  const { productId } = req.params;
  // data from the request authUser
  const addedBy = req.authUser._id;

  // prodcuct Id
  const product = await Product.findById(productId);
  if (!product) return next({ cause: 404, message: "Product not found" });

  // who will be authorized to update a product
  if (
    req.authUser.role !== systemRoles.SUPER_ADMIN &&
    product.addedBy.toString() !== addedBy.toString()
  )
    return next({
      cause: 403,
      message: "You are not authorized to update this product",
    });

  // title update
  if (title) {
    product.title = title;
    product.slug = slugify(title, { lower: true, replacement: "-" });
  }
  if (desc) product.desc = desc;
  if (specs) product.specs = JSON.parse(specs);
  if (stock) product.stock = stock;

  // prices changes
  // const appliedPrice = (basePrice || product.basePrice) - ((basePrice || product.basePrice) * (discount || product.discount) / 100)
  const appliedPrice =
    (basePrice || product.basePrice) *
    (1 - (discount || product.discount) / 100);
  product.appliedPrice = appliedPrice;

  if (basePrice) product.basePrice = basePrice;
  if (discount) product.discount = discount;

  if (oldPublicId) {
    if (!req.file)
      return next({ cause: 400, message: "Please select new image" });

    const folderPath = product.Images[0].public_id.split(
      `${product.folderId}/`
    )[0];
    const newPublicId = oldPublicId.split(`${product.folderId}/`)[1];

    // console.log('folderPath', folderPath)
    // console.log('newPublicId', newPublicId)
    // console.log(`oldPublicId`, oldPublicId);

    const { secure_url } = await cloudinaryConnection().uploader.upload(
      req.file.path,
      {
        folder: folderPath + `${product.folderId}`,
        public_id: newPublicId,
      }
    );
    product.Images.map((img) => {
      if (img.public_id === oldPublicId) {
        img.secure_url = secure_url;
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

//================================================= Delete product API ============================================//

/**
 * destructuring the required data from the request params
 * check if the product exist
 * check if logggedIn user is authorized to delete the product
 * delete the product
 * return the response
 * delete image from cloudinary
 * delete brand
 * delete category
 * delete subcategory
 * delete product
 * return the response
 */
export const deleteProduct = async (req, res, next) => {
  const { productId } = req.params;
  const { categoryId, subCategoryId, brandId } = req.query;

  const deletedBy = req.authUser._id;

  const product = await Product.findById(productId);

  if (!product) {
    return next({ cause: 404, message: "Product not found" });
  }

  // who will be authorized to delete a product
  if (
    req.authUser.role !== systemRoles.SUPER_ADMIN &&
    product.deletedBy.toString() !== deletedBy.toString()
  )
    return next({
      cause: 403,
      message: "You are not authorized to delete this product",
    });

  // Delete brand
  const prodyctDelete = await Product.findByIdAndDelete(productId);
  if (!prodyctDelete) {
    return res.status(404).json({ message: "Product not found" });
  }

  const brand = await Brand.findById(brandId);
  const folderPath = brand.image.public_id.split(`${brand.folderId}/`)[0];

  // Delete image from cloudinary
  await cloudinaryConnection().api.delete_resources_by_prefix(
    folderPath + `${brand.folderId}/Products/${product.folderId}`
  );

  // Delete folder from cloudinary
  await cloudinaryConnection().api.delete_folder(
    folderPath + `${brand.folderId}/Products/${product.folderId}`
  );

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
};

//================================================= Get all products API ============================================//

/**
 * get all products
 * return the response
 */

export const getAllProduct = async (req, res, next) => {
  const { page, size, sort, ...search } = req.query;

  const features = new ApiFeatures(req.query, Product.find())
    .sort(sort)
    .pagination({ page, size })
    .search(search);

  const products = await features.mongooseQuery.populate([{ path: "Reviews" }]);

  res.status(200).json({
    success: true,
    message: "Products fetched successfully",
    data: products,
  });
};
