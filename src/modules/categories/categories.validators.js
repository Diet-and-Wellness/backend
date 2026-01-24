import { body, query, param } from "express-validator";

// Create category validator
const createCategory = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("displayName")
    .notEmpty()
    .withMessage("Display name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Display name must be between 2 and 100 characters"),
  body("type")
    .notEmpty()
    .withMessage("Type is required")
    .isIn(["article", "recipe"])
    .withMessage("Type must be either 'article' or 'recipe'"),
  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),
  body("order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Order must be a non-negative integer"),
];

// Update category validator
const updateCategory = [
  body("name")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("displayName")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Display name must be between 2 and 100 characters"),
  body("type")
    .optional()
    .isIn(["article", "recipe"])
    .withMessage("Type must be either 'article' or 'recipe'"),
  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),
  body("order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Order must be a non-negative integer"),
];

// Update status validator
const updateStatus = [
  body("isActive")
    .notEmpty()
    .withMessage("isActive is required")
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

// Reorder categories validator
const reorderCategories = [
  body("updates")
    .notEmpty()
    .withMessage("Updates are required")
    .isArray()
    .withMessage("Updates must be an array")
    .custom((value) => {
      if (!Array.isArray(value)) return false;
      return value.every(
        (item) => item.id && typeof item.order === "number" && item.order >= 0,
      );
    })
    .withMessage("Each update must have id and order (non-negative number)"),
];

// Get categories by type validator
const getCategoriesByType = [
  param("type")
    .notEmpty()
    .withMessage("Type is required")
    .isIn(["article", "recipe"])
    .withMessage("Type must be either 'article' or 'recipe'"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

// Category ID validator
const categoryId = [
  param("categoryId")
    .notEmpty()
    .withMessage("Category ID is required")
    .isMongoId()
    .withMessage("Category ID must be a valid MongoDB ID"),
];

// Category slug validator
const categorySlug = [
  param("slug")
    .notEmpty()
    .withMessage("Slug is required")
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),
];

// Query validators
const getCategories = [
  query("type")
    .optional()
    .isIn(["article", "recipe"])
    .withMessage("Type must be either 'article' or 'recipe'"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

export default {
  createCategory,
  updateCategory,
  updateStatus,
  reorderCategories,
  getCategoriesByType,
  categoryId,
  categorySlug,
  getCategories,
};
