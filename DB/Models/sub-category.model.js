import { Schema, model } from "mongoose";

const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      // unique: [true, "subCategory name is required!"],
      minLength: [3, "too short subCategory name"],
      maxLength: [20, "too long subCategory name"],
      trim: true,
      // lowercase: true,
    },
    slug: {
      type: String,
      lowercase: true,
      // required: true,
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
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

subCategorySchema.virtual("Brands", {
  ref: "Brand",
  localField: "_id",
  foreignField: "subCategoryId",
});

export default model("SubCategory", subCategorySchema);
