import { Schema, model } from "mongoose";

const brandSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      // unique: [true, "Brand name is required!"],
      minLength: [2, "too short Brand name"],
      maxLength: [20, "too long Brand name"],
      trim: true,
      // lowercase: true,
    },
    slug: {
      type: String,
      lowercase: true,
      required: true,
      trim: true,
    },
    image: {
      secure_url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
        // unique: true,
      },
    },
    folderId: {
      type: String,
      required: true,
      // unique: true,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    subCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { timestamps: true }
);

export default model("Brand", brandSchema);
