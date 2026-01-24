import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
      validate: {
        validator: async function (value) {
          // Verify category exists and is for articles
          const category = await mongoose.models.Category.findById(value);
          return category && category.type === "article" && category.isActive;
        },
        message: "Category must be a valid active article category",
      },
    },
    tags: [
      {
        type: String,
        lowercase: true,
      },
    ],
    isHidden: {
      type: Boolean,
      default: false,
      index: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    estimatedReadTime: {
      type: Number, // in minutes
      default: 5,
    },
  },
  { timestamps: true },
);

// Compound index for articles sorted by date
articleSchema.index({ isHidden: 1, createdAt: -1 });

// Create slug from title before saving
articleSchema.pre("validate", async function () {
  // validate author exists
  if (this.isModified("author") || this.isNew) {
    await validateAuthor(this.author);
  }

  // validate category exists
  if (this.isModified("category") || this.isNew) {
    await validateCategory(this.category);
  }

  // Automatic slug generation
  if (this.isModified("title") || this.isNew) {
    this.slug = await createSlug(this);
  }
  // Validate tags count
  if (this.isModified("tags") || this.isNew) {
    // Limit to maximum 10 tags
    validateTags(this.tags);
  }
});

articleSchema.pre(["findOneAndUpdate", "updateOne"], async function () {
  const update = this.getUpdate();

  if (update.author) {
    await validateAuthor(update.author);
  }

  if (update.category) {
    await validateCategory(update.category);
  }

  if (update.title) {
    update.slug = await createSlug(update, this.getQuery()._id);
  }

  if (update.tags) {
    validateTags(update.tags);
  }
});

articleSchema.methods.toJSON = function () {
  const article = this.toObject();

  // Remove sensitive fields
  delete article.__v;
  delete article.isHidden;

  // Rename fields
  article.id = article._id;
  delete article._id;

  return article;
};

const validateAuthor = async (authorId) => {
  const author = await mongoose.models.User.findById(authorId);
  if (!author) {
    throw new Error("Author not found");
  }
  return true;
};

const validateCategory = async (categoryId) => {
  const category = await mongoose.models.Category.findById(categoryId);

  if (!category) {
    throw new Error("Category not found");
  }

  if (category.type !== "article" || !category.isActive) {
    throw new Error("Category must be a valid active article category");
  }

  return true;
};

const createSlug = async (article, articleId) => {
  let slug = article.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with single

  // Check if slug already exists
  let existingArticle = await mongoose.models.Article.findOne({
    slug,
    _id: { $ne: article._id || articleId },
  });
  let counter = 1;

  while (existingArticle) {
    if (counter === 1) {
      slug = `${slug}-${counter}`;
    } else {
      slug = slug.replace(/-\d+$/, `-${counter}`);
    }
    existingArticle = await mongoose.models.Article.findOne({
      slug,
      _id: { $ne: article._id },
    });
    counter++;
  }

  return slug;
};

const validateTags = (tags) => {
  if (tags.length > 10) {
    throw new Error("Maximum 10 tags allowed");
  }
  return true;
};

const Article = mongoose.model("Article", articleSchema);

export default Article;
