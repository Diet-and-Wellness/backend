import mongoose from "mongoose";
import { generateSlug } from "#modules/categories/categories.helpers.js";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["article", "recipe"],
      required: true,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// Auto-generate slug from name before saving
categorySchema.pre("validate", async function () {
  if (this.isModified("name") || this.isNew) {
    this.slug = await generateSlug(this.name);
  }
});

// Compound index for active categories by type sorted by order
categorySchema.index({ type: 1, isActive: 1, order: 1 });

categorySchema.methods.toJSON = function () {
  const category = this.toObject();

  // Remove sensitive fields
  delete category.__v;

  // Rename fields
  category.id = category._id;
  delete category._id;

  return category;
};

const Category = mongoose.model("Category", categorySchema);

export default Category;
