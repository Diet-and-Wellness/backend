import { body, query, param } from "express-validator";
import { ERROR_CODES, translate, getFieldName } from "#utils/localization.js";

const updateProfile = [
  body("firstName")
    .optional()
    .isLength({ min: 2 })
    .withMessage(["INVALID_LENGTH", { field: "firstName", min: 2, max: 50 }]),
  body("lastName")
    .optional()
    .isLength({ min: 2 })
    .withMessage(["INVALID_LENGTH", { field: "lastName", min: 2, max: 50 }]),
  body("phone")
    .optional()
    .isMobilePhone("ar-EG")
    .withMessage(["INVALID_PHONE_FORMAT"]),
  body("specialistInfo.specialization")
    .optional()
    .isLength({ min: 3 })
    .withMessage([
      "INVALID_LENGTH",
      { field: "specialization", min: 3, max: 100 },
    ]),
  body("specialistInfo.experienceYears")
    .optional()
    .isInt({ min: 0 })
    .withMessage(["INVALID_LENGTH", { field: "experienceYears", min: 0 }]),
];

const createSpecialistProfile = [
  body("firstName")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "firstName" }])
    .isLength({ min: 2 })
    .withMessage(["INVALID_LENGTH", { field: "firstName", min: 2, max: 50 }]),
  body("lastName")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "lastName" }])
    .isLength({ min: 2 })
    .withMessage(["INVALID_LENGTH", { field: "lastName", min: 2, max: 50 }]),
  body("email")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "email" }])
    .isEmail()
    .withMessage(["INVALID_EMAIL"]),
  body("phone")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "phone" }])
    .isMobilePhone("ar-EG")
    .withMessage(["INVALID_PHONE_FORMAT"]),
  body("password")
    .notEmpty()
    .withMessage(["PASSWORD_REQUIRED"])
    .isLength({ min: 6 })
    .withMessage(["INVALID_LENGTH", { field: "password", min: 6, max: 50 }]),
  body("specialization")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "specialization" }])
    .isLength({ min: 3 })
    .withMessage([
      "INVALID_LENGTH",
      { field: "specialization", min: 3, max: 100 },
    ]),
  body("experienceYears")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "experienceYears" }])
    .isInt({ min: 0 })
    .withMessage(["INVALID_INPUT"]),
];

const searchProfiles = [
  query("firstName")
    .optional()
    .isLength({ min: 1 })
    .withMessage(["INVALID_LENGTH", { field: "firstName", min: 1 }]),
  query("lastName")
    .optional()
    .isLength({ min: 1 })
    .withMessage(["INVALID_LENGTH", { field: "lastName", min: 1 }]),
  query("email")
    .optional()
    .isLength({ min: 1 })
    .withMessage(["INVALID_LENGTH", { field: "email", min: 1 }]),
  query("phone")
    .optional()
    .isLength({ min: 1 })
    .withMessage(["INVALID_LENGTH", { field: "phone", min: 1 }]),
  query("role")
    .optional()
    .isIn(["customer", "specialist", "admin"])
    .withMessage(["INVALID_ROLE"]),
  query("specialistStatus")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage(["INVALID_SPECIALIST_STATUS"]),
  query("specialization")
    .optional()
    .isLength({ min: 1 })
    .withMessage(["INVALID_LENGTH", { field: "specialization", min: 1 }]),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage(["INVALID_PAGE_NUMBER"]),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage(["INVALID_LIMIT_NUMBER"]),
];

const specialistId = [
  param("specialistId")
    .isMongoId()
    .withMessage(["INVALID_MONGO_ID_FORMAT", { field: "specialist" }]),
];

const userId = [
  param("userId")
    .isMongoId()
    .withMessage(["INVALID_MONGO_ID_FORMAT", { field: "user" }]),
];

export default {
  updateProfile,
  createSpecialistProfile,
  searchProfiles,
  specialistId,
  userId,
};
