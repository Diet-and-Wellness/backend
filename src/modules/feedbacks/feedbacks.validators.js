import { body, query, param } from "express-validator";

// Validation for creating feedback
const createFeedback = [
  body("title")
    .trim()
    // .notEmpty()
    .optional()
    // .withMessage(["REQUIRED_FIELD"])
    .isLength({ min: 5, max: 150 })
    .withMessage(["INVALID_LENGTH", { min: 5, max: 150 }]),
  body("content")
    .trim()
    // .notEmpty()
    .optional()
    // .withMessage(["REQUIRED_FIELD"])
    .isLength({ min: 10, max: 1000 })
    .withMessage(["INVALID_LENGTH", { min: 10, max: 1000 }]),
  body("rating")
    // .notEmpty()
    .optional()
    // .withMessage(["REQUIRED_FIELD"])
    .isInt({ min: 1, max: 5 })
    .withMessage(["INVALID_RATING", { min: 1, max: 5 }]),
  body("theme")
    .optional()
    .isIn(["light", "dark"])
    .withMessage(["INVALID_VALUE", { field: "theme", values: "light, dark" }]),
  body("crop")
    .optional()
    .isIn(["full", "cropped"])
    .withMessage(["INVALID_VALUE", { field: "crop", values: "full, cropped" }]),
];

// Validation for updating feedback (admin only)
const updateFeedback = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 5, max: 150 })
    .withMessage(["INVALID_LENGTH", { min: 5, max: 150 }]),
  body("content")
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage(["INVALID_LENGTH", { min: 10, max: 1000 }]),
  body("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage(["INVALID_RATING", { min: 1, max: 5 }]),
  body("theme")
    .optional()
    .isIn(["light", "dark"])
    .withMessage(["INVALID_VALUE", { field: "theme", values: "light, dark" }]),
  body("crop")
    .optional()
    .isIn(["full", "cropped"])
    .withMessage(["INVALID_VALUE", { field: "crop", values: "full, cropped" }]),
  // Note: attachmentUrl is automatically populated by the image upload middleware
];

// Validation for feedback ID
const feedbackId = [
  param("feedbackId")
    .isMongoId()
    .withMessage(["INVALID_MONGO_ID_FORMAT", { field: "feedbackId" }]),
];

// Validation for toggle visibility
const toggleVisibility = [
  body("isHidden")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD"])
    .isBoolean()
    .withMessage(["INVALID_BOOLEAN"]),
];

// Reorder feedbacks validator
const reorderFeedbacks = [
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

// Validation for get feedbacks (filters)
const getFeedbacks = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage(["INVALID_PAGE", { min: 1 }]),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage(["INVALID_LIMIT", { min: 1, max: 100 }]),
  query("rating")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage(["INVALID_RATING", { min: 1, max: 5 }]),
  query("sortBy")
    .optional()
    .isIn(["newest", "oldest", "highestRating", "lowestRating", "priority"])
    .withMessage(["INVALID_SORT_OPTION"]),
  query("search")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage(["INVALID_LENGTH", { min: 1, max: 100 }]),
];

export default {
  createFeedback,
  updateFeedback,
  feedbackId,
  toggleVisibility,
  reorderFeedbacks,
  getFeedbacks,
};
