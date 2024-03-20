import mongoose, { Schema, model } from "mongoose";

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: [3, "too short subCategory name"],
      maxLength: [20, "too long subCategory name"],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: {
      secure_url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
    folderId: {
      type: String,
      required: true,
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

export default mongoose.models.SubCategory || model("SubCategory", subCategorySchema);
