import { body, query, param } from "express-validator";

const updateProfile = [
  body("firstName")
    .optional()
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters"),
  body("lastName")
    .optional()
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters"),
  body("phone")
    .optional()
    .isMobilePhone("ar-EG")
    .withMessage("Phone number is invalid"),
  body("specialistInfo.specialization")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Specialization must be at least 3 characters"),
  body("specialistInfo.experienceYears")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Experience years must be a non-negative number"),
];

const createSpecialistProfile = [
  body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters"),
  body("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is invalid"),
  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone("ar-EG")
    .withMessage("Phone number is invalid"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("specialization")
    .notEmpty()
    .withMessage("Specialization is required")
    .isLength({ min: 3 })
    .withMessage("Specialization must be at least 3 characters"),
  body("experienceYears")
    .notEmpty()
    .withMessage("Experience years is required")
    .isInt({ min: 0 })
    .withMessage("Experience years must be a non-negative number"),
];

const searchProfiles = [
  query("firstName").optional().isLength({ min: 1 }),
  query("lastName").optional().isLength({ min: 1 }),
  query("email").optional().isLength({ min: 1 }),
  query("phone").optional().isLength({ min: 1 }),
  query("role")
    .optional()
    .isIn(["customer", "specialist", "admin"])
    .withMessage("Invalid role"),
  query("specialistStatus")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Invalid specialist status"),
  query("specialization")
    .optional()
    .isLength({ min: 1 })
    .withMessage("Specialization must not be empty"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive number"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

const specialistId = [
  param("specialistId").isMongoId().withMessage("Invalid specialist ID"),
];

const userId = [param("userId").isMongoId().withMessage("Invalid user ID")];

export default {
  updateProfile,
  createSpecialistProfile,
  searchProfiles,
  specialistId,
  userId,
};
