import { Schema, model } from "mongoose";

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: [true, "coupon code is required!"],
      trim: true,
      lowercase: true,
    },
    discount: {
      type: Number,
      required: true,
      min: [0, "min discount is 0"],
      max: [100, "max discount is 100"],
    },
    expireDate: {
      type: Date,
      required: true,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default model("Coupon", couponSchema);
