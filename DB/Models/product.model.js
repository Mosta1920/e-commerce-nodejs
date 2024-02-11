import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    //strings
    title: {
      type: String,
      required: true,
      unique: [true, "product title is required!"],
      minLength: [3, "too short product title"],
      maxLength: [50, "too long product title"],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      required: true,
    },
    description: {
      type: String,
      required: true,
      minLength: [100, "too short product description"],
      maxLength: [500, "too long product description"],
      trim: true,
    },
    folderId: {
      type: String,
      required: true,
      unique: true,
    },

    // numbers
    basePrice: {
      type: Number,
      required: true,
      min: [0, "price can't be negative"],
    },
    discount: {
      type: Number,
      required: true,
      min: [0, "price after discount can't be negative"],
      default: 0,
    },
    appliedPrice: {
      type: Number,
      required: true,
      min: [0, "price can't be negative"],
    },
    stock: {
      type: Number,
      required: true,
      min: [0, "quantity can't be negative"],
      max: [100000, "quantity can't be more than 100000"],
      default: 0,
    },
    sold: {
      type: Number,
    },
    rate: {
      type: Number,
      default: 0,
      min: [0, "rate average can't be negative"],
      max: [5, "rate average can't be more than 5"],
    },
    rateCount: {
      type: Number,
      default: 0,
      min: [0, "rate count can't be negative"],
      max: [100000, "rate count can't be more than 100000"],
    },

    //arrays
    imageCover: {
      type: String,
    },
    Images: [
      {
        secure_url: { type: String, required: true },
        public_id: { type: String, required: true, unique: true },
      },
    ],
    specs: {
      type: Map,
      of: [String | Number],
    },

    // objects
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    subCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default model("Product", productSchema);
