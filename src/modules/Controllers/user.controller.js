import User from "../../../DB/Models/user.model.js";

// ========================================= Update User ================================//

/**
 * destructuring the required data from the request body
 * check if the user exists
 * check if the phone number already exists
 * update the user
 * return the response
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

// ========================================= Delete User ================================//

/**
 * destructuring the required data from params
 * check if the user exists
 * deleted the user
 */

export const deleteUser = async (req, res) => {
  const { userId } = req.params;

  // check if the user exists
  const deletedUser = await User.findByIdAndUpdate(
    userId,
    { isDeleted: true },
    { new: true }
  );
  if (!deletedUser) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "User account  deleted successfully",
    user: deletedUser,
  });
};

// ========================================= Get All Users ================================//

/**
 * get all users
 */

export const getAllUsers = async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    data: users,
  });
};
