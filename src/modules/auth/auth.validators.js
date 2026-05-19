import { body } from "express-validator";
import { ERROR_CODES, translate } from "#utils/localization.js";

const signup = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "firstName" }])
    .isLength({ min: 2 })
    .withMessage(["INVALID_LENGTH", { min: 2 }]),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "lastName" }])
    .isLength({ min: 2 })
    .withMessage(["INVALID_LENGTH", { min: 2 }]),
  body("email")
    .trim()
    .toLowerCase()
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
    .isLength({ min: 6 })
    .withMessage(["INVALID_LENGTH", { min: 6 }]),
  //   body("role")
  //     .optional()
  //     .isIn(["customer", "specialist", "admin"])
  //     .withMessage("Role is invalid"),
  //   body("specialistInfo.specialization")
  //     .if(body("role").equals("specialist"))
  //     .notEmpty()
  //     .withMessage("specialistInfo.specialization is required")
  //     .isLength({ min: 3 })
  //     .withMessage(
  //       "specialistInfo.specialization must be at least 3 characters long",
  //     ),
  //   body("specialistInfo.experienceYears")
  //     .if(body("role").equals("specialist"))
  //     .notEmpty()
  //     .withMessage("specialistInfo.experienceYears is required")
  //     .isInt({ min: 0 })
  //     .withMessage(
  //       "specialistInfo.experienceYears must be a non-negative integer",
  //     ),
];

const login = [
  // one of email and phone is required
  body().custom((value, { req }) => {
    if (!req?.body?.email && !req?.body?.phone) {
      throw ["EITHER_EMAIL_OR_PHONE_REQUIRED"];
    }
    return true;
  }),
  body("password")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "password" }]),
];

const sendOtp = [
  body("email")
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "email" }])
    .isEmail()
    .withMessage(["INVALID_EMAIL"]),
];

const verifyOtp = [
  body("email")
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "email" }])
    .isEmail()
    .withMessage(["INVALID_EMAIL"]),
  body("code")
    .trim()
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "code" }])
    .isLength({ min: 6, max: 6 })
    .withMessage(["INVALID_LENGTH", { min: 6, max: 6 }]),
];

// Refresh token is read exclusively from the httpOnly cookie.
// No body field is accepted or validated.
const refreshToken = [];

const forgotPassword = [
  body("email")
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "email" }])
    .isEmail()
    .withMessage(["INVALID_EMAIL"]),
];

const resetPassword = [
  body("email")
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "email" }])
    .isEmail()
    .withMessage(["INVALID_EMAIL"]),
  body("code")
    .trim()
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "code" }])
    .isLength({ min: 6, max: 6 })
    .withMessage(["INVALID_LENGTH", { min: 6, max: 6 }]),
  body("password")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "password" }])
    .isLength({ min: 6 })
    .withMessage(["INVALID_LENGTH", { min: 6, max: 50 }]),
];

const logout = [];

export default {
  signup,
  login,
  refreshToken,
  logout,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
};
