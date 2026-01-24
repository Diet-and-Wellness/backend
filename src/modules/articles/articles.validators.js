import { body, query, param } from "express-validator";

// Validation for creating an article (admin only)
const createArticle = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),
  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters"),
  body("content")
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 50 })
    .withMessage("Content must be at least 50 characters"),
  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Category must be a valid category ID"),
  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array")
    .custom((value) => {
      if (value && value.length > 10) {
        throw new Error("Maximum 10 tags allowed");
      }
      return true;
    }),
  body("estimatedReadTime")
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage("Estimated read time must be between 1 and 120 minutes"),
];

// Validation for updating an article
const updateArticle = [
  body("title")
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),
  body("description")
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters"),
  body("content")
    .optional()
    .isLength({ min: 50 })
    .withMessage("Content must be at least 50 characters"),
  body("category")
    .optional()
    .isMongoId()
    .withMessage("Category must be a valid category ID"),
  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array")
    .custom((value) => {
      if (value && value.length > 10) {
        throw new Error("Maximum 10 tags allowed");
      }
      return true;
    }),
  body("estimatedReadTime")
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage("Estimated read time must be between 1 and 120 minutes"),
];

// Validation for hiding articles
const changeArticleStatus = [
  body("isHidden")
    .notEmpty()
    .withMessage("isHidden is required")
    .isBoolean()
    .withMessage("isHidden must be a boolean"),
];

// Validation for getting articles with filters
const getArticles = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("category")
    .optional()
    .isMongoId()
    .withMessage("Category must be a valid category ID"),
  query("search")
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage("Search term must be between 1 and 100 characters"),
  query("sortBy")
    .optional()
    .isIn(["newest", "oldest", "mostViewed", "trending"])
    .withMessage("Invalid sort option"),
  query("status")
    .optional()
    .isIn(["active", "inactive", "all"])
    .withMessage("Invalid status option"),
];

// Validation for article ID
const articleId = [
  param("articleId")
    .notEmpty()
    .withMessage("Article ID is required")
    .isMongoId()
    .withMessage("Article ID must be a valid MongoDB ID"),
];

// Validation for category ID
const categoryId = [
  param("category")
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Category must be a valid MongoDB ID"),
];

// Validation for slug
const articleSlug = [
  param("slug")
    .notEmpty()
    .withMessage("Slug is required")
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),
];

export default {
  createArticle,
  updateArticle,
  changeArticleStatus,
  getArticles,
  articleId,
  categoryId,
  articleSlug,
};
