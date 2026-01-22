import { body } from "express-validator";

const signup = [
  body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters long"),
  body("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters long"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is invalid"),
  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone("ar-EG")
    .withMessage("Phone number is invalid Egyptian format"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
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
      throw new Error("Either email or phone is required");
    }
    return true;
  }),
  body("password").notEmpty().withMessage("Password is required"),
];

const sendOtp = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is invalid"),
];

const verifyOtp = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is invalid"),
  body("code")
    .notEmpty()
    .withMessage("OTP code is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP code must be 6 digits"),
];

const refreshToken = [
  body("refreshToken").notEmpty().withMessage("Refresh token is required"),
];

const forgotPassword = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is invalid"),
];

const resetPassword = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is invalid"),
  body("code")
    .notEmpty()
    .withMessage("OTP code is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP code must be 6 digits"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
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
