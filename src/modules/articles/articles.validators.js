import { body, query, param } from "express-validator";
import { validateTags } from "./articles.helpers.js";

// Validation for creating an article (admin only)
const createArticle = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "title" }])
    .isLength({ min: 5, max: 200 })
    .withMessage(["INVALID_LENGTH", { min: 5, max: 200 }]),
  body("description")
    .trim()
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "description" }])
    .isLength({ min: 10, max: 500 })
    .withMessage(["INVALID_LENGTH", { min: 10, max: 500 }]),
  body("content")
    .trim()
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "content" }])
    .isLength({ min: 50 })
    .withMessage(["INVALID_LENGTH", { min: 50, max: 10000 }]),
  body("language")
    .optional()
    .isIn(["en", "ar"])
    .withMessage(["INVALID_LANGUAGE"]),
  body("category")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "category" }])
    .isMongoId()
    .withMessage(["INVALID_MONGO_ID_FORMAT", { field: "category" }]),
  body("tags")
    .optional()
    .isArray()
    .withMessage(["TAGS_REQUIRED"])
    .custom((value) => {
      if (value && value.length > 0) {
        validateTags(value, true);
      }
      return true;
    }),
  body("estimatedReadTime")
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage(["ESTIMATED_READ_TIME_INVALID", { min: 1, max: 120 }]),
];

// Validation for updating an article
const updateArticle = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage(["INVALID_LENGTH", { min: 5, max: 200 }]),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage(["INVALID_LENGTH", { min: 10, max: 500 }]),
  body("content")
    .optional()
    .trim()
    .isLength({ min: 50 })
    .withMessage(["INVALID_LENGTH", { min: 50, max: 10000 }]),
  body("language")
    .optional()
    .isIn(["en", "ar"])
    .withMessage(["INVALID_LANGUAGE"]),
  body("category")
    .optional()
    .isMongoId()
    .withMessage(["INVALID_MONGO_ID_FORMAT", { field: "category" }]),
  body("tags")
    .optional()
    .isArray()
    .withMessage(["TAGS_REQUIRED"])
    .custom((value) => {
      if (value && value.length > 0) {
        validateTags(value, true);
      }
      return true;
    }),
  body("estimatedReadTime")
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage(["ESTIMATED_READ_TIME_INVALID"]),
];

// Validation for hiding articles
const changeArticleStatus = [
  body("isHidden")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD"])
    .isBoolean()
    .withMessage(["INVALID_BOOLEAN_VALUE"]),
];

// Validation for getting articles with filters
const getArticles = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage(["INVALID_PAGE_NUMBER"]),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage(["INVALID_LIMIT_NUMBER"]),
  query("category")
    .optional()
    .isMongoId()
    .withMessage(["INVALID_MONGO_ID_FORMAT", { field: "category" }]),
  query("search")
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage(["INVALID_LENGTH", { min: 1, max: 100 }]),
  query("sortBy")
    .optional()
    .isIn(["newest", "oldest", "mostViewed", "trending"])
    .withMessage(["INVALID_SORT_OPTION"]),
  query("status")
    .optional()
    .isIn(["active", "inactive", "all"])
    .withMessage(["INVALID_STATUS_OPTION"]),
];

// Validation for article ID
const articleId = [
  param("articleId")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD"])
    .isMongoId()
    .withMessage(["INVALID_MONGO_ID_FORMAT", { field: "article" }]),
];

// Validation for category ID
const categoryId = [
  param("category")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD"])
    .isMongoId()
    .withMessage(["INVALID_MONGO_ID_FORMAT", { field: "category" }]),
];

// Validation for slug
const articleSlug = [
  param("slug")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD"])
    .matches(/^[a-z0-9-]+$/)
    .withMessage(["INVALID_SLUG_FORMAT"]),
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
