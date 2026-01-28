import mongoose from "mongoose";
import { ERROR_CODES, translate } from "#utils/localization.js";
import arabicToLatin from "#utils/arabicToLatin.js";

export const generateSlug = async (title, excludeId = null) => {
  if (!title) {
    const error = new Error(
      translate(ERROR_CODES.SLUG_GENERATION_FAILED, "en"),
    );
    error.code = ERROR_CODES.SLUG_GENERATION_FAILED;
    error.status = 400;
    throw error;
  }

  // Convert Arabic characters to Latin if title contains Arabic
  const processedTitle = /[\u0600-\u06FF]/.test(title)
    ? arabicToLatin(title)
    : title;

  let slug = processedTitle
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with single

  // Check if slug already exists
  let existingArticle = await mongoose.models.Article.findOne({
    slug,
    _id: { $ne: excludeId },
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
      _id: { $ne: excludeId },
    });
    counter++;
  }

  return slug;
};

export const validateTags = (tags, validation = false) => {
  if (!Array.isArray(tags)) {
    if (validation) {
      throw [ERROR_CODES.INVALID_ARRAY, { field: "tags" }];
    }
    const error = new Error(translate(ERROR_CODES.TAGS_REQUIRED, "en"));
    error.code = ERROR_CODES.TAGS_REQUIRED;
    error.status = 400;
    throw error;
  }

  if (tags.length > 10) {
    if (validation) {
      throw [ERROR_CODES.MAX_TAGS_EXCEEDED];
    }
    const error = new Error(translate(ERROR_CODES.MAX_TAGS_EXCEEDED, "en"));
    error.code = ERROR_CODES.MAX_TAGS_EXCEEDED;
    error.status = 400;
    throw error;
  }

  tags.forEach((tag, index) => {
    if (typeof tag !== "string" || tag.trim().length === 0) {
      if (validation) {
        throw [ERROR_CODES.TAG_INVALID, { index: index + 1 }];
      }

      const error = new Error(
        translate(ERROR_CODES.TAG_INVALID, "en", { index: index + 1 }),
      );
      error.code = ERROR_CODES.TAG_INVALID;
      error.status = 400;
      throw error;
    }

    if (tag.length > 50) {
      if (validation) {
        throw [ERROR_CODES.TAG_LENGTH_INVALID, { index: index + 1 }];
      }

      const error = new Error(
        translate(ERROR_CODES.TAG_LENGTH_INVALID, "en", { index: index + 1 }),
      );
      error.code = ERROR_CODES.TAG_LENGTH_INVALID;
      error.status = 400;
      throw error;
    }
  });

  return true;
};
