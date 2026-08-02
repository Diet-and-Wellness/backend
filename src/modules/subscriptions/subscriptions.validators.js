import { body, param, query } from "express-validator";
import { ERROR_CODES, translate } from "#utils/localization.js";
import {
  SUBSCRIPTION_TYPES,
  SUBSCRIPTION_DURATIONS,
  SUBSCRIPTION_PLAN_TYPES,
  ACTIVE_DAYS,
} from "./subscriptions.constants.js";

export const validateSubscriptionId = param("subscriptionId")
  .trim()
  .notEmpty()
  .withMessage([ERROR_CODES.REQUIRED_FIELD, { field: "subscriptionId" }])
  .isMongoId()
  .withMessage([
    ERROR_CODES.INVALID_MONGO_ID_FORMAT,
    { field: "subscriptionId" },
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
      {
        field: "reason",
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
    .withMessage([
      ERROR_CODES.INVALID_MONGO_ID,
      { field: "userSubscriptionId" },
    ]),
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
    .isIn(Object.values(SUBSCRIPTION_TYPES))
    .withMessage([ERROR_CODES.SUBSCRIPTION_NAME_INVALID]),

  body("displayName.en")
    .exists({ checkFalsy: true })
    .withMessage([ERROR_CODES.REQUIRED_FIELD, { field: "displayName.en" }])
    .isString()
    .withMessage([ERROR_CODES.INVALID_VALUE, { field: "displayName.en" }])
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage([ERROR_CODES.SUBSCRIPTION_DISPLAY_NAME_REQUIRED]),
  body("displayName.ar")
    .exists({ checkFalsy: true })
    .withMessage([ERROR_CODES.REQUIRED_FIELD, { field: "displayName.ar" }])
    .isString()
    .withMessage([ERROR_CODES.INVALID_VALUE, { field: "displayName.ar" }])
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage([ERROR_CODES.SUBSCRIPTION_DISPLAY_NAME_REQUIRED]),

  body("durationInDays")
    .custom((value, { req }) => {
      const type =
        req.body.type ?? SUBSCRIPTION_PLAN_TYPES.SUBSCRIPTION_PLAN;

      if (type === SUBSCRIPTION_PLAN_TYPES.ONE_TIME_OFFER) {
        return value === undefined || value === null;
      }

      return (
        Number.isInteger(Number(value)) &&
        Object.values(SUBSCRIPTION_DURATIONS).includes(Number(value))
      );
    })
    .withMessage([ERROR_CODES.SUBSCRIPTION_DURATION_INVALID]),
  body("price")
    .isFloat({ min: 0 })
    .withMessage([ERROR_CODES.SUBSCRIPTION_PRICE_INVALID]),

  body("description.en")
    .if(body("description").exists())
    .exists({ checkFalsy: true })
    .withMessage([ERROR_CODES.REQUIRED_FIELD, { field: "description.en" }])
    .isString()
    .withMessage([ERROR_CODES.INVALID_VALUE, { field: "description.en" }])
    .trim()
    .isLength({ max: 500 })
    .withMessage([
      ERROR_CODES.INVALID_LENGTH,
      {
        field: "description.en",
        min: 0,
        max: 500,
      },
    ]),

  body("description.ar")
    .if(body("description").exists())
    .exists({ checkFalsy: true })
    .withMessage([ERROR_CODES.REQUIRED_FIELD, { field: "description.ar" }])
    .isString()
    .withMessage([ERROR_CODES.INVALID_VALUE, { field: "description.ar" }])
    .trim()
    .isLength({ max: 500 })
    .withMessage([
      ERROR_CODES.INVALID_LENGTH,
      {
        field: "description.ar",
        min: 0,
        max: 500,
      },
    ]),

  body("features")
    .optional()
    .isArray()
    .withMessage([ERROR_CODES.SUBSCRIPTION_FEATURES_INVALID])
    .custom((features) => {
      for (const feature of features) {
        if (
          !feature ||
          typeof feature.en !== "string" ||
          !feature.en.trim() ||
          typeof feature.ar !== "string" ||
          !feature.ar.trim()
        ) {
          return false;
        }
      }

      return true;
    })
    .withMessage([ERROR_CODES.INVALID_LOCALIZED_OBJECT]),

  body("type")
    .optional()
    .isIn(Object.values(SUBSCRIPTION_PLAN_TYPES))
    .withMessage([
      ERROR_CODES.INVALID_VALUE,
      {
        field: "type",
        values: Object.values(SUBSCRIPTION_PLAN_TYPES).join(", "),
      },
    ]),
  body("activeDays")
    .optional()
    .isArray()
    .withMessage([ERROR_CODES.INVALID_VALUE, { field: "activeDays" }])
    .custom((days) => {
      const validDays = Object.values(ACTIVE_DAYS);
      if (days && !days.every((d) => validDays.includes(d))) {
        return false;
      }
      return true;
    })
    .withMessage([ERROR_CODES.INVALID_VALUE, { field: "activeDays" }]),
  body("responseTimeInHours")
    .optional()
    .isInt({ min: 0 })
    .withMessage([ERROR_CODES.INVALID_VALUE, { field: "responseTimeInHours" }]),

  body("planNote.en")
    .if(body("planNote").exists())
    .exists({ checkFalsy: true })
    .withMessage([ERROR_CODES.REQUIRED_FIELD, { field: "planNote.en" }])
    .isString()
    .withMessage([ERROR_CODES.INVALID_VALUE, { field: "planNote.en" }])
    .trim()
    .isLength({ max: 200 })
    .withMessage([
      ERROR_CODES.INVALID_LENGTH,
      {
        field: "planNote.en",
        min: 0,
        max: 200,
      },
    ]),
  body("planNote.ar")
    .if(body("planNote").exists())
    .exists({ checkFalsy: true })
    .withMessage([ERROR_CODES.REQUIRED_FIELD, { field: "planNote.ar" }])
    .isString()
    .withMessage([ERROR_CODES.INVALID_VALUE, { field: "planNote.ar" }])
    .trim()
    .isLength({ max: 200 })
    .withMessage([
      ERROR_CODES.INVALID_LENGTH,
      {
        field: "planNote.ar",
        min: 0,
        max: 200,
      },
    ]),
  body().custom((_, { req }) => {
    if (req.body.name !== SUBSCRIPTION_TYPES.ASSESSMENT_RESULTS) return true;
    return req.body.type === SUBSCRIPTION_PLAN_TYPES.ONE_TIME_OFFER;
  }).withMessage([
    ERROR_CODES.INVALID_VALUE,
    {
      field: "type",
      values: SUBSCRIPTION_PLAN_TYPES.ONE_TIME_OFFER,
    },
  ]),
];

export const validateUpdateSubscription = [
  validateSubscriptionId,
  body("name")
    .optional()
    .trim()
    .isIn(Object.values(SUBSCRIPTION_TYPES))
    .withMessage([ERROR_CODES.SUBSCRIPTION_NAME_INVALID]),

  body("displayName.en")
    .exists({ checkFalsy: true })
    .withMessage([ERROR_CODES.REQUIRED_FIELD, { field: "displayName.en" }])
    .isString()
    .withMessage([ERROR_CODES.INVALID_VALUE, { field: "displayName.en" }])
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage([ERROR_CODES.SUBSCRIPTION_DISPLAY_NAME_REQUIRED]),

  body("displayName.ar")
    .exists({ checkFalsy: true })
    .withMessage([ERROR_CODES.REQUIRED_FIELD, { field: "displayName.ar" }])
    .isString()
    .withMessage([ERROR_CODES.INVALID_VALUE, { field: "displayName.ar" }])
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage([ERROR_CODES.SUBSCRIPTION_DISPLAY_NAME_REQUIRED]),

  body("durationInDays")
    .optional()
    .custom((value, { req }) => {
      if (req.body.type === SUBSCRIPTION_PLAN_TYPES.ONE_TIME_OFFER) {
        return value === undefined || value === null;
      }

      return (
        Number.isInteger(Number(value)) &&
        Object.values(SUBSCRIPTION_DURATIONS).includes(Number(value))
      );
    })
    .withMessage([ERROR_CODES.SUBSCRIPTION_DURATION_INVALID]),

  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage([ERROR_CODES.SUBSCRIPTION_PRICE_INVALID]),

  body("description.en")
    .if(body("description").exists())
    .exists({ checkFalsy: true })
    .withMessage([ERROR_CODES.REQUIRED_FIELD, { field: "description.en" }])
    .isString()
    .withMessage([ERROR_CODES.INVALID_VALUE, { field: "description.en" }])
    .trim()
    .isLength({ max: 500 })
    .withMessage([
      ERROR_CODES.INVALID_LENGTH,
      {
        field: "description.en",
        min: 0,
        max: 500,
      },
    ]),
  body("description.ar")
    .if(body("description").exists())
    .exists({ checkFalsy: true })
    .withMessage([ERROR_CODES.REQUIRED_FIELD, { field: "description.ar" }])
    .isString()
    .withMessage([ERROR_CODES.INVALID_VALUE, { field: "description.ar" }])
    .trim()
    .isLength({ max: 500 })
    .withMessage([
      ERROR_CODES.INVALID_LENGTH,
      {
        field: "description.ar",
        min: 0,
        max: 500,
      },
    ]),

  body("features")
    .optional()
    .isArray()
    .withMessage([ERROR_CODES.SUBSCRIPTION_FEATURES_INVALID])
    .custom((features) => {
      for (const feature of features) {
        if (
          !feature ||
          typeof feature.en !== "string" ||
          !feature.en.trim() ||
          typeof feature.ar !== "string" ||
          !feature.ar.trim()
        ) {
          return false;
        }
      }

      return true;
    })
    .withMessage([ERROR_CODES.INVALID_LOCALIZED_OBJECT]),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage([ERROR_CODES.INVALID_BOOLEAN_VALUE]),
  body("type")
    .optional()
    .isIn(Object.values(SUBSCRIPTION_PLAN_TYPES))
    .withMessage([
      ERROR_CODES.INVALID_VALUE,
      {
        field: "type",
        values: Object.values(SUBSCRIPTION_PLAN_TYPES).join(", "),
      },
    ]),
  body("activeDays")
    .optional()
    .isArray()
    .withMessage([ERROR_CODES.INVALID_VALUE, { field: "activeDays" }])
    .custom((days) => {
      const validDays = Object.values(ACTIVE_DAYS);
      if (days && !days.every((d) => validDays.includes(d))) {
        return false;
      }
      return true;
    })
    .withMessage([ERROR_CODES.INVALID_VALUE, { field: "activeDays" }]),
  body("responseTimeInHours")
    .optional()
    .isInt({ min: 0 })
    .withMessage([ERROR_CODES.INVALID_VALUE, { field: "responseTimeInHours" }]),

  body("planNote.en")
    .if(body("planNote").exists())
    .exists({ checkFalsy: true })
    .withMessage([ERROR_CODES.REQUIRED_FIELD, { field: "planNote.en" }])
    .isString()
    .withMessage([ERROR_CODES.INVALID_VALUE, { field: "planNote.en" }])
    .trim()
    .isLength({ max: 200 })
    .withMessage([
      ERROR_CODES.INVALID_LENGTH,
      {
        field: "planNote.en",
        min: 0,
        max: 200,
      },
    ]),
  body("planNote.ar")
    .if(body("planNote").exists())
    .exists({ checkFalsy: true })
    .withMessage([ERROR_CODES.REQUIRED_FIELD, { field: "planNote.ar" }])
    .isString()
    .withMessage([ERROR_CODES.INVALID_VALUE, { field: "planNote.ar" }])
    .trim()
    .isLength({ max: 200 })
    .withMessage([
      ERROR_CODES.INVALID_LENGTH,
      {
        field: "planNote.ar",
        min: 0,
        max: 200,
      },
    ]),
];

export const validateDeleteSubscription = [validateSubscriptionId];

export const validateGetSubscriptions = [
  query("type")
    .optional()
    .isIn(Object.values(SUBSCRIPTION_PLAN_TYPES))
    .withMessage([
      ERROR_CODES.INVALID_VALUE,
      {
        field: "type",
        values: Object.values(SUBSCRIPTION_PLAN_TYPES).join(", "),
      },
    ]),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage([ERROR_CODES.INVALID_PAGE_NUMBER]),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage([ERROR_CODES.INVALID_LIMIT_NUMBER]),
];

export const validatePaymentStatus = [
  param("orderId")
    .trim()
    .notEmpty()
    .withMessage([ERROR_CODES.REQUIRED_FIELD, { field: "orderId" }])
    .isMongoId()
    .withMessage([ERROR_CODES.INVALID_MONGO_ID_FORMAT, { field: "orderId" }]),
];
