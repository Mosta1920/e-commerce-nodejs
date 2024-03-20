import User from "../../../DB/Models/user.model.js";
import Product from "../../../DB/Models/product.model.js";
import Review from "../../../DB/Models/review.model.js";
import Order from "../../../DB/Models/order.model.js";

//==================== add review =========================//

/**
 * destructuring the required data from the request body
 * check if the product exist
 * check if the user has already bought the product
 * check if the user has already reviewed
 * add the document to the database
 * return the response
 */
export const addReview = async (req, res, next) => {
  const { reviewRate, reviewComment } = req.body;
  const { productId } = req.query;
  const user = req.authUser._id;

  // check if the product exist
  const userExist = await User.findById(user);
  if (!userExist) {
    return next({ cause: 404, message: "User not found" });
  }

  // check if the product exist
  const product = await Product.findById(productId);
  if (!product) {
    return next({ cause: 404, message: "Product not found" });
  }

  // check if the user has already bought the product
  const isProductValidToBeReviewed = await Order.findOne({
    user,
    "orderItems.productId": productId,
    orderStatus: "Delivered",
  });

  if (!isProductValidToBeReviewed) {
    return next({ cause: 400, message: "You should order this product first" });
  }

  //check if the user has already reviewed
  const reviewExist = await Review.findOne({
    user,
    productId,
  });
  if (reviewExist) {
    return next({
      cause: 400,
      message: "You have already reviewed this product",
    });
  }

  //add the review
  const review = await Review.create({
    productId,
    user,
    reviewRate,
    reviewComment,
  });
  if (!review) return next({ cause: 500, message: "Review not added" });

  //update the product review
  const reviews = await Review.find({ productId });
  let sumOfRates = 0;
  for (const review of reviews) {
    sumOfRates += review.reviewRate;
  }

  product.rate = Number(sumOfRates / reviews.length).toFixed(2);
  await product.save();

  res
    .status(201)
    .json({ message: "Review added successfully", review, product });
};

//==================== update review =========================//

/**
 *  check if the review exist
 *  Find the review by ID and update its rate and comment
 *  return the response
 */
export const updateReview = async (req, res, next) => {
  const { reviewId } = req.params;
  const { reviewRate, reviewComment } = req.body;

  // check if the review exist
  const review = await Review.findById(reviewId);
  if (!review) {
    return next({ cause: 404, message: "Review not found" });
  }

  // Find the review by ID and update its rate and comment
  const updatedReview = await Review.findByIdAndUpdate(
    reviewId,
    { reviewRate, reviewComment },
    { new: true }
  );

  if (!updatedReview) {
    return res.status(404).json({ message: "Review not found" });
  }
  res
    .status(200)
    .json({ message: "Review updated successfully", review: updatedReview });
};


//==================== all reviews for specific product =========================//

/**
 * get all reviews for specific product
 * return the response
 * check if the review exist
 * return the response
 */

export const getAllReviewsForSpecificProduct = async (req, res, next) => {
  const { productId } = req.params;

  const reviews = await Review.find({ productId });
  if (!reviews) return next({ cause: 404, message: "Reviews not found" });
  res.status(200).json({ reviews });
};
