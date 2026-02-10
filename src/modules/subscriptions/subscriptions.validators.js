import { body, param, query } from "express-validator";
import { ERROR_CODES } from "#utils/localization.js";

export const validateSubscriptionId = param("subscriptionId")
  .trim()
  .notEmpty()
  .withMessage([ERROR_CODES.REQUIRED_FIELD, { field: "Subscription ID" }])
  .isMongoId()
  .withMessage([
    ERROR_CODES.INVALID_MONGO_ID_FORMAT,
    { field: "Subscription ID" },
  ]);

export const validatePurchaseSubscription = [validateSubscriptionId];

export const validateCancelSubscription = [
  body("reason")
    .optional()
    .trim()
    .isString()
    .withMessage([ERROR_CODES.INVALID_VALUE, { field: "reason" }])
    .isLength({ max: 500 })
    .withMessage([
      ERROR_CODES.INVALID_LENGTH,
      "en",
      {
        field: "Reason",
        min: 0,
        max: 500,
      },
    ]),
];

export const validateRenewalSubscription = [
  body("userSubscriptionId")
    .trim()
    .notEmpty()
    .withMessage([ERROR_CODES.REQUIRED_FIELD, { field: "userSubscriptionId" }])
    .isMongoId()
    .withMessage([ERROR_CODES.INVALID_MONGO_ID]),
];

export const validateHistoryQuery = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage([ERROR_CODES.INVALID_LIMIT_NUMBER]),
];

// ============ ADMIN VALIDATION ============
export const validateCreateSubscription = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage([ERROR_CODES.REQUIRED_FIELD, { field: "name" }])
    .isIn(["1_month", "3_months", "6_months", "12_months"])
    .withMessage([ERROR_CODES.SUBSCRIPTION_NAME_INVALID]),
  body("displayName")
    .trim()
    .notEmpty()
    .withMessage([ERROR_CODES.REQUIRED_FIELD, { field: "displayName" }])
    .isLength({ min: 2, max: 50 })
    .withMessage([ERROR_CODES.SUBSCRIPTION_DISPLAY_NAME_REQUIRED]),
  body("durationInDays")
    .isInt({ min: 1, max: 730 })
    .withMessage([ERROR_CODES.SUBSCRIPTION_DURATION_INVALID]),
  body("price")
    .isFloat({ min: 0 })
    .withMessage([ERROR_CODES.SUBSCRIPTION_PRICE_INVALID]),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage([
      ERROR_CODES.INVALID_LENGTH,
      "en",
      {
        field: "Description",
        min: 0,
        max: 500,
      },
    ]),
  body("features")
    .optional()
    .isArray()
    .withMessage([ERROR_CODES.SUBSCRIPTION_FEATURES_INVALID])
    .custom((features) => {
      if (features && !features.every((f) => typeof f === "string")) {
        throw new Error("All features must be strings");
      }
      return true;
    }),
];

export const validateUpdateSubscription = [
  validateSubscriptionId,
  body("name")
    .optional()
    .trim()
    .isIn(["1_month", "3_months", "6_months", "12_months"])
    .withMessage([ERROR_CODES.SUBSCRIPTION_NAME_INVALID]),
  body("displayName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage([ERROR_CODES.SUBSCRIPTION_DISPLAY_NAME_REQUIRED]),
  body("durationInDays")
    .optional()
    .isInt({ min: 1, max: 730 })
    .withMessage([ERROR_CODES.SUBSCRIPTION_DURATION_INVALID]),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage([ERROR_CODES.SUBSCRIPTION_PRICE_INVALID]),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage([
      ERROR_CODES.INVALID_LENGTH,
      "en",
      {
        field: "Description",
        min: 0,
        max: 500,
      },
    ]),
  body("features")
    .optional()
    .isArray()
    .withMessage([ERROR_CODES.SUBSCRIPTION_FEATURES_INVALID])
    .custom((features) => {
      if (features && !features.every((f) => typeof f === "string")) {
        throw new Error("All features must be strings");
      }
      return true;
    }),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage([ERROR_CODES.INVALID_BOOLEAN_VALUE]),
];

export const validateDeleteSubscription = [validateSubscriptionId];

export const validatePaymentStatus = [
  param("orderId")
    .trim()
    .notEmpty()
    .withMessage([ERROR_CODES.REQUIRED_FIELD, { field: "Order ID" }])
    .isMongoId()
    .withMessage([ERROR_CODES.INVALID_MONGO_ID_FORMAT, { field: "Order ID" }]),
];
