
import User from "../../../DB/Models/user.model.js";
import Coupon from "../../../DB/Models/coupon.model.js";
import CouponUsers from "../../../DB/Models/coupon-users.model.js";

import ApiFeatures from "../../utils/api-features.js";

import { couponValidation } from "../../utils/Coupon/coupon.validation.js";

// ========================================= addCoupon ================================//

/**
 * destructuring the required data from the request body
 * add the document to the database
 * return the response
 * check user login
 * check if the coupon code already exists
 * check if the coupon amount is fixed or percentage
 * check if the coupon amount is less than 100
 * check if the coupon date is valid
 * check if the coupon is fixed or percentage
 * check if the coupon is valid
 * check if the coupon is enabled
 * check if the coupon is expired
 * check if the coupon is disabled
 * check if the coupon is assigned to the user
 * check if the coupon is exceeded the max usage
 * return the response
 */

export const addCoupon = async (req, res, next) => {
  const {
    couponCode,
    couponAmount,
    fromDate,
    toDate,
    isFixed,
    isPercentage,
    Users, 
  } = req.body;

  const { _id: addedBy } = req.authUser;

  // couponcode check
  const isCouponCodeExist = await Coupon.findOne({ couponCode });
  if (isCouponCodeExist)
    return next({ message: "Coupon code already exist", cause: 409 });

  if (isFixed == isPercentage)
    return next({
      message: "Coupon can be either fixed or percentage",
      cause: 400,
    });

  if (isPercentage) {
    if (couponAmount > 100)
      return next({
        message: "Percentage should be less than 100",
        cause: 400,
      });
  }

  const couponObject = {
    couponCode,
    couponAmount,
    fromDate,
    toDate,
    isFixed,
    isPercentage,
    addedBy,
  };

  const coupon = await Coupon.create(couponObject);

  const userIds = [];
  for (const user of Users) {
    userIds.push(user.userId);
  }
  const isUserExist = await User.find({ _id: { $in: userIds } });
  if (isUserExist.length != Users.length)
    return next({ message: "User not found", cause: 404 });

  const couponUsers = await CouponUsers.create(
    Users.map((ele) => ({ ...ele, couponId: coupon._id }))
  );
  res
    .status(201)
    .json({ message: "Coupon added successfully", coupon, couponUsers });
};

// ========================================= Validate Coupon ================================//

/**
 * check if the coupon is valid
 */

export const validateCoupon = async (req, res, next) => {
  const { couponCode } = req.body;
  const { _id: userId } = req.authUser; 

  // couponValidation
  const isCouponValid = await couponValidation(couponCode, userId);
  if (isCouponValid.status) {
    return next({ message: isCouponValid.msg, cause: isCouponValid.status });
  }

  res.json({ message: "coupon is valid", coupon: isCouponValid });
};

// ========================================= updateCoupon ================================//

export const updateCoupon = async (req, res, next) => {
  const { couponId } = req.params;
  const { couponCode, couponAmount, fromDate, toDate, isFixed, isPercentage } =
    req.body;

  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    return next({ message: "Coupon not found", cause: 404 });
  }

  coupon.couponCode = couponCode || coupon.couponCode;
  coupon.couponAmount = couponAmount || coupon.couponAmount;
  coupon.fromDate = fromDate || coupon.fromDate;
  coupon.toDate = toDate || coupon.toDate;
  coupon.isFixed = isFixed || coupon.isFixed;
  coupon.isPercentage = isPercentage || coupon.isPercentage;

  await coupon.save();

  res.status(200).json({ message: "Coupon updated successfully", coupon });
};

// ========================================= deleteCoupon ================================//

export const deleteCoupon = async (req, res, next) => {
  const { couponId } = req.params;

  const coupon = await Coupon.findByIdAndDelete(couponId);
  if (!coupon) {
    return next({ message: "Coupon not found", cause: 404 });
  }


  res.status(200).json({
    success: true,
    message: "Coupon deleted successfully",
  });};

// ========================================= disableCoupon ================================//

export const disableCoupon = async (req, res, next) => {
  const { couponId } = req.params;
  const disabledBy = req.authUser._id;

  const coupon = await Coupon.findByIdAndUpdate(
    couponId,
    {
      disabledAt: new Date(),
      disabledBy,
      isEnabled: false,
      isDisabled: true,
    },
    { new: true }
  );

  if (!coupon) {
    return next({ message: "Coupon not found", cause: 404 });
  }

  res.status(200).json({ message: "Coupon disabled successfully", coupon });

  next({ message: "Failed to disable coupon", cause: 500 });
};

// ========================================= enableCoupon  ================================//

export const enableCoupon = async (req, res, next) => {
  const { couponId } = req.params;
  const enabledBy = req.authUser._id;

  const coupon = await Coupon.findByIdAndUpdate(
    couponId,
    {
      enabledAt: new Date(),
      enabledBy,
      isEnabled: true,
      isDisabled: false,
    },
    { new: true }
  );

  if (!coupon) {
    return next({ message: "Coupon not found", cause: 404 });
  }

  res.status(200).json({ message: "Coupon enabled successfully", coupon });
  next({ message: "Failed to enable coupon", cause: 500 });
};

// ========================================= getAllEnabledCoupon ================================//

export const getAllEnabledCoupon = async (req, res, next) => {
  const coupons = await Coupon.find({ isEnabled: true });

  res.status(200).json({ coupons });
  next({ message: "Failed to fetch enabled coupons", cause: 500 });
};

// ========================================= getAllDisabledCoupon ================================//

export const getAllDisabledCoupon = async (req, res, next) => {
  const coupons = await Coupon.find({ isDisabled: true });

  res.status(200).json({ coupons });
  next({ message: "Failed to fetch disabled coupons", cause: 500 });
};

// ========================================= getCouponById ================================//

export const getCouponById = async (req, res, next) => {
  const { couponId } = req.params;

  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    return next({ message: "Coupon not found", cause: 404 });
  }

  res.status(200).json({ coupon });
  next({ message: "Failed to fetch coupon", cause: 500 });
};

//================================================= Get all coupons API ============================================//

export const getAllCoupons = async (req, res, next) => {
  const { page, size, sort, ...search } = req.query;

  const features = new ApiFeatures(req.query, Coupon.find())
    .sort(sort)
    .pagination({ page, size })
    .search(search);

  const coupons = await features.mongooseQuery;

  res.status(200).json({
    success: true,
    message: "Coupons fetched successfully",
    data: coupons,
  });
};
