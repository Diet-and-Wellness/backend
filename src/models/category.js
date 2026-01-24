import mongoose from "mongoose";

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
categorySchema.pre("save", async function () {
  if (this.isModified("name")) {
    let slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    // Check if slug already exists
    let existingCategory = await mongoose.models.Category.findOne({
      slug,
      _id: { $ne: this._id },
    });
    let counter = 1;

    while (existingCategory) {
      slug = `${slug}-${counter}`;
      existingCategory = await mongoose.models.Category.findOne({
        slug,
        _id: { $ne: this._id },
      });
      counter++;
    }

    this.slug = slug;
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
