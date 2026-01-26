import mongoose from "mongoose";

/**
 * Generate a unique slug from title
 * @param {string} title - The title to slugify
 * @param {string} excludeId - The ID to exclude from duplicate check
 * @returns {Promise<string>} - The generated slug
 */
export const generateSlug = async (title, excludeId = null) => {
  if (!title) {
    throw new Error("Title is required to generate slug");
  }

  let slug = title
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

/**
 * Validate tags array
 * @param {Array} tags - Array of tag strings
 * @returns {boolean} - Valid or not
 * @throws {Error} - If validation fails
 */
export const validateTags = (tags) => {
  if (!Array.isArray(tags)) {
    throw new Error("Tags must be an array");
  }

  if (tags.length > 10) {
    throw new Error("Maximum 10 tags allowed");
  }

  tags.forEach((tag, index) => {
    if (typeof tag !== "string" || tag.trim().length === 0) {
      throw new Error(`Tag ${index + 1}: must be a non-empty string`);
    }

    if (tag.length > 50) {
      throw new Error(`Tag ${index + 1}: must not exceed 50 characters`);
    }
  });

  return true;
};
