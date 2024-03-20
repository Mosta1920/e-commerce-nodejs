import mongoose, { Schema, model } from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    couponCode: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    couponAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    couponStatus: {
      type: String,
      default: "valid",
      enum: ["valid", "expired"],
    },
    isFixed: {
      type: Boolean,
      default: false,
    },
    isPercentage: {
      type: Boolean,
      default: false,
    },
    fromDate: {
      type: String,
      required: true,
    },
    toDate: {
      type: String,
      required: true,
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    disabledAt: {
      type: Date,
    },
    disabledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    enabledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    enabledAt: {
      type: Date,
    },
    addedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },

  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
