import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../../../DB/Models/user.model.js";
import sendEmailService from "../services/send-email.service.js";

// ========================================= SignUp API ================================//

/**
 * destructuring the required data from the request body
 * check if the user already exists in the database using the email
 * if exists return error email is already exists
 * password hashing
 * create new document in the database
 * return the response
 */
export const signUp = async (req, res, next) => {
  // 1- destructure the required data from the request body
  const { username, email, password, age, role, phoneNumbers, addresses } =
    req.body;

  // 2- check if the user already exists in the database using the email
  const isEmailDuplicated = await User.findOne({ email });
  if (isEmailDuplicated) {
    return next(
      new Error("Email already exists,Please try another email", { cause: 409 })
    );
  }

  // 3- send confirmation email to the user
  const usertoken = jwt.sign({ email }, process.env.JWT_SECRET_LOGIN, {
    expiresIn: "2m",
  });

  const isEmailSent = await sendEmailService({
    to: email,
    subject: "Email Verification",
    message: `
        <h2>please click on this link to verify your email</h2>
        <a href="http://localhost:3000/auth/verify-email?token=${usertoken}">Verify Email</a>
        `,
  });

  // 4- check if email is sent successfully
  if (!isEmailSent) {
    return next(
      new Error("Email is not sent, please try again later", { cause: 500 })
    );
  }

  // check if the phone number already exists
  const phoneCheck = await User.findOne({ phoneNumbers });
  if (phoneCheck) {
    return res.status(409).json({
      success: false,
      message: "Phone number already exists",
    });
  }

  // 5- password hashing
  const hashedPassword = bcrypt.hashSync(password, +process.env.SALT_ROUNDS);

  // 6- create new document in the database
  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
    age,
    role,
    phoneNumbers,
    addresses,
  });

  // 7- return the response
  res.status(201).json({
    success: true,
    message:
      "User created successfully, please check your email to verify your account",
    data: newUser,
  });
};

// ========================================= Verify Email API ================================//
/**
 * destructuring token from the request query
 * verify the token
 * get user by email , isEmailVerified = false
 * if not return error user not found
 * if found
 * update isEmailVerified = true
 * return the response
 */
export const verifyEmail = async (req, res, next) => {
  const { token } = req.query;

  const decodedData = jwt.verify(token, process.env.JWT_SECRET_VERIFICATION);
  // get user by email , isEmailVerified = false
  const user = await User.findOneAndUpdate(
    {
      email: decodedData.email,
      isEmailVerified: false,
    },
    { isEmailVerified: true },
    { new: true }
  );

  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  res.status(200).json({
    success: true,
    message: "Email verified successfully, please try to login",
  });
};

// ========================================= SignIn API ================================//

/**
 * destructuring the required data from the request body
 * get user by email and check if isEmailVerified = true
 * if not return error invalid login credentials
 * if found
 * check password
 * if not return error invalid login credentials
 * if found
 * generate login token
 * updated isLoggedIn = true in database
 * return the response
 */

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;
  // get user by email
  const user = await User.findOne({ email });
  if (!user) {
    return next(new Error("Invalid email credentials", { cause: 404 }));
  }
  // check password
  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return next(new Error("Invalid password credentials", { cause: 404 }));
  }

  // generate login token
  const token = jwt.sign(
    { email, id: user._id, loggedIn: true },
    process.env.JWT_SECRET_LOGIN,
    { expiresIn: "1d" }
  );
  user.token = token;

  // updated isLoggedIn = true  in database
  user.isLoggedIn = true;
  await user.save();

  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    data: {
      token,
    },
  });
};

// ========================================= Forgot Password ================================//

/**
 * destructuring the required data from the request body
 * get user by email
 * if not return error user not found
 * generate password reset token
 * save it in the user document
 */

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Generate a password reset token and save it in the user document
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const resetToken = jwt.sign(
    { email },
    process.env.JWT_SECRET_LOGIN,
    { expiresIn: "15m" }
  );
  user.resetToken = resetToken;
  await user.save();

  // Send the password reset email to the user
  const isEmailSent = await sendEmailService({
    to: email,
    subject: "Password Reset",
    message: `
      <h2>Reset your password</h2>
      <p>Click on the following link to reset your password:</p>
      <a href="http://localhost:3000/reset-password?token=${resetToken}">Reset Password</a>
    `,
  });

  if (!isEmailSent) {
    return res.status(500).json({ message: "Failed to send email" });
  }

  res.status(200).json({ message: "Password reset email sent" });
};

// ========================================= Reset Password ================================//

/**
 * destructuring token from the request query
 * verify and decode the JWT token
 * get user by email
 * if not return error user not found
 * generate password reset token
 * save it in the user document
 * return the response
 */

export const resetPassword = async (req, res) => {
  const { token } = req.praams;

  const decoded = verifyToken(token, process.env.JWT_SECRET_LOGIN);

  // Generate a password reset token and save it in the user document
  const user = await User.findOne({ email: decoded?.email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const {newPassword} = req.body;
  user.password = newPassword;
  const resetPassData = await user.save();
 
  res.status(200).json({ message: "Password reset email sent" ,resetPassData });
};

// ========================================= Update Password ================================//

/**
 * destructuring the required data from the request body
 * verify and decode the JWT token
 * get user by email
 * if not return error user not found
 * hash the new password
 * update the password in the database
 * return the response
 */

export const updatePassword = async (req, res, next) => {
  const { token, newPassword } = req.body;

  // Verify and decode the JWT token
  const decoded = jwt.verify(token, process.env.JWT_SECRET_LOGIN);
  const email = decoded.email;

  // Find the user in the database using the email
  const user = await User.findOne({ email });

  // If the user does not exist, return an error
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  // Hash the new password
  const hashedPassword = bcrypt.hashSync(newPassword, +process.env.SALT_ROUNDS);

  // Update the password in the database
  user.password = hashedPassword;
  await user.save();

  // Return a success response
  res.json({ success: true, message: "Password updated successfully" });
};
