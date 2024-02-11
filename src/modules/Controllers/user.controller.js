import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import slugify from "slugify";

import User from "../../../DB/Models/user.model.js";
import Category from "../../../DB/Models/category.model.js";
import SubCategory from "../../../DB/Models/sub-category.model.js";
import Brand from "../../../DB/Models/brand.model.js";
import Product from "../../../DB/Models/product.model.js";

import { systemRoles } from "../../utils/system-roles.js";
import cloudinaryConnection from "../../utils/cloudinary.js";
import generateUniqueString from "../../utils/generate-unique-string.js";

import sendEmailService from "../services/send-email.service.js";

// ========================================= updateUser ================================//

/**
 *
 */

export const updateUser = async (req, res) => {
  // destructuring the required data from the request body
  const { _id } = req.authUser;
  const { phoneNumbers, addresses } = req.body;

  // check if the user exists
  const user = await User.findOne({ _id });

  // check if the phone number already exists
  const phoneCheck = await User.findOne({ phoneNumbers });
  if (phoneCheck) {
    return res.status(409).json({
      success: false,
      message: "Phone number already exists",
    });
  }

  user.phoneNumbers = phoneNumbers;
  user.addresses = addresses;

  await user.save();

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: user,
  });
};

// ========================================= deleteUser ================================//

/**
 *
 */

export const deleteUser = async (req, res) => {
  const { _id } = req.authUser;
  const { userId } = req.params;

  // check if the user exists
  const user = await User.findByIdAndDelete({ _id });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
};

// ========================================= getAllUser ================================//

/**
 *
 */

export const getAllUser = async (req, res) => {

  const users = await User.find();

  res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    data: users,
  })
};
