import { Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      // unique: [true, "Category name is required!"],
      minLength: [3, "too short Category name"],
      maxLength: [20, "too long Category name"],
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
      unique: true,
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

categorySchema.virtual("subcategories", {
  ref: "SubCategory",
  localField: "_id",
  foreignField: "categoryId",
});

export default model("Category", categorySchema);
