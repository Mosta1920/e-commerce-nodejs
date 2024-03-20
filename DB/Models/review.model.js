import mongoose, { Schema, model } from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    reviewComment: {
      type: String,
      minLength: [0, "too short review text"],
      maxLength: [100, "too long review text"],
    },
    reviewRate: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      enum:[1,2,3,4,5],
      

    },
  },
  { timestamps: true }
);

export default mongoose.models.Review || model("Review", reviewSchema);
