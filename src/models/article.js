import mongoose from "mongoose";
import {
  generateSlug,
  validateTags,
} from "#modules/articles/articles.helpers.js";
import { translate, ERROR_CODES } from "#utils/localization.js";

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
    language: {
      type: String,
      default: "en",
      enum: ["en", "ar"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: async function (value) {
          // Verify author exists
          const author = await mongoose.models.User.findById(value);
          return !!author;
        },
        message: "Author must be a valid user",
      },
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
          if (!category) {
            const error = new Error(
              translate(ERROR_CODES.CATEGORY_NOT_FOUND, "en"),
            );
            error.code = ERROR_CODES.CATEGORY_NOT_FOUND;
            error.status = 404;
            throw error;
          }
          if (category.type !== "article") {
            const error = new Error(
              translate(ERROR_CODES.CATEGORY_INVALID_TYPE_ARTICLE, "en"),
            );
            error.code = ERROR_CODES.CATEGORY_INVALID_TYPE_ARTICLE;
            error.status = 400;

            throw error;
          }
          if (!category.isActive) {
            const error = new Error(
              translate(ERROR_CODES.CATEGORY_INACTIVE, "en"),
            );
            error.code = ERROR_CODES.CATEGORY_INACTIVE;
            error.status = 400;
            throw error;
          }
          return true;
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
    imageUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

// Compound index for articles sorted by date
articleSchema.index({ isHidden: 1, createdAt: -1 });

// Create slug from title before saving
articleSchema.pre("validate", async function () {
  try {
    // Generate slug if not provided or title modified
    if (this.isModified("title") || this.isNew) {
      this.slug = await generateSlug(this.title, this._id);
    }

    // Validate tags
    if (this.isModified("tags") || this.isNew) {
      validateTags(this.tags);
    }
  } catch (error) {
    throw error;
  }
});

articleSchema.pre(["findOneAndUpdate", "updateOne"], async function () {
  try {
    const update = this.getUpdate();

    // Generate slug if title is being updated
    if (update.title) {
      update.slug = await generateSlug(update.title, this.getQuery()._id);
    }

    // Validate tags if being updated
    if (update.tags?.length > 0) {
      validateTags(update.tags);
    }
  } catch (error) {
    throw error;
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

  // Transform author object
  if (article.author && typeof article.author === "object") {
    article.author = {
      id: article.author._id,
      firstName: article.author.firstName,
      lastName: article.author.lastName,
      email: article.author.email,
      phone: article.author.phone,
    };
  }

  // Transform category object
  if (article.category && typeof article.category === "object") {
    article.category = {
      id: article.category._id,
      name: article.category.name,
      displayName: article.category.displayName,
      arDisplayName: article.category.arDisplayName,
    };
  }

  return article;
};

const Article = mongoose.model("Article", articleSchema);

export default Article;
