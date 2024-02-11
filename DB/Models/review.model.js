import { Schema, model } from "mongoose";

const reviewSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      //   unique: [true, "review text is required!"],
      minLength: [0, "too short review text"],
      maxLength: [100, "too long review text"],
      trim: true,
      lowercase: true,
    },
    rating: {
      type: Number,
      required: true,
      min: [1, "min rating is 1"],
      max: [5, "max rating is 5"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
  },
  { timestamps: true }
);

export default model("Review", reviewSchema);
