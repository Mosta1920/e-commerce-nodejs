import { Schema, model } from "mongoose";
import { systemRoles } from "../../src/utils/system-roles.js";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      minlength: [3, "too short username"],
      maxlength: [20, "too long username"],
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    phoneNumbers: [
      {
        type: String,
        required: true,
      },
    ],
    addresses: [
      {
        type: String,
        required: true,
      },
    ],
    role: {
      type: String,
      enum: [systemRoles.USER, systemRoles.ADMIN , systemRoles.SUPER_ADMIN],
      default: systemRoles.USER,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    age: {
      type: Number,
      min: [18, "too young!"],
      max: [100, "too old!"],
    },
    // isActive: {
    //   type: Boolean,
    //   default: true,
    // },
    // isBlocked: {
    //   type: Boolean,
    //   default: false,
    // },
    isLoggedIn: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default model("User", userSchema);
