import { body, query, param } from "express-validator";

// Create category validator
const createCategory = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage(["REQUIRED_FIELD"])
    .isLength({ min: 2, max: 50 })
    .withMessage(["INVALID_LENGTH", { min: 2, max: 50 }]),
  body("displayName")
    .trim()
    .notEmpty()
    .withMessage(["REQUIRED_FIELD"])
    .isLength({ min: 2, max: 100 })
    .withMessage(["INVALID_LENGTH", { min: 2, max: 100 }]),
  body("arDisplayName")
    .trim()
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage(["INVALID_LENGTH", { min: 2, max: 100 }]),
  body("type")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD"])
    .isIn(["article", "recipe"])
    .withMessage(["INVALID_CATEGORY_TYPE"]),
  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage(["INVALID_LENGTH", { max: 500 }]),
  body("order")
    .optional()
    .isInt({ min: 0 })
    .withMessage(["INVALID_ORDER", { min: 0 }]),
];

// Update category validator
const updateCategory = [
  body("name")
    .trim()
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage(["INVALID_LENGTH", { min: 2, max: 50 }]),
  body("displayName")
    .trim()
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage(["INVALID_LENGTH", { min: 2, max: 100 }]),
  body("arDisplayName")
    .trim()
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage(["INVALID_LENGTH", { min: 2, max: 100 }]),
  body("type")
    .optional()
    .isIn(["article", "recipe"])
    .withMessage(["INVALID_CATEGORY_TYPE"]),
  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage(["INVALID_LENGTH", { max: 500 }]),
  body("order")
    .optional()
    .isInt({ min: 0 })
    .withMessage(["INVALID_ORDER", { min: 0 }]),
];

// Update status validator
const updateStatus = [
  body("isActive")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD"])
    .isBoolean()
    .withMessage(["INVALID_BOOLEAN_VALUE"]),
];

// Reorder categories validator
const reorderCategories = [
  body("updates")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD"])
    .isArray()
    .withMessage(["INVALID_ARRAY", { field: "updates" }])
    .custom((value) => {
      if (!Array.isArray(value)) return false;
      return value.every(
        (item) => item.id && typeof item.order === "number" && item.order >= 0,
      );
    })
    .withMessage(["INVALID_UPDATES_ARRAY"]),
];

// Get categories by type validator
const getCategoriesByType = [
  param("type")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD"])
    .isIn(["article", "recipe"])
    .withMessage(["INVALID_CATEGORY_TYPE"]),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage(["INVALID_PAGE_NUMBER"]),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage(["INVALID_LIMIT_NUMBER"]),
];

// Category ID validator
const categoryId = [
  param("categoryId")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD"])
    .isMongoId()
    .withMessage(["INVALID_MONGO_ID_FORMAT", { field: "category" }]),
];

// Category slug validator
const categorySlug = [
  param("slug")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD"])
    .matches(/^[a-z0-9-]+$/)
    .withMessage(["INVALID_SLUG_FORMAT"]),
];

// Query validators
const getCategories = [
  query("type")
    .optional()
    .isIn(["article", "recipe"])
    .withMessage(["INVALID_CATEGORY_TYPE"]),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage(["INVALID_PAGE_NUMBER"]),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage(["INVALID_LIMIT_NUMBER"]),
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
