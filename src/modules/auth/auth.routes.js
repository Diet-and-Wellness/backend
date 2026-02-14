import express from "express";
import controller from "./auth.controller.js";
import validators from "./auth.validators.js";
import handleValidationErrors from "#middlewares/validation.js";
import authenticate from "#middlewares/auth.js";
import {
  strictLoginLimiter,
  moderateLimiter,
  emailRateLimiter,
} from "#middlewares/rateLimiter.js";

const router = express.Router();

// TIER 1: Very Strict - OTP sending (2 per hour per email)
router.post(
  "/send-otp",
  emailRateLimiter,
  validators.sendOtp,
  handleValidationErrors,
  controller.sendOtp,
);

// TIER 1: Very Strict - OTP verification (3 per 15 mins per user)
router.post(
  "/verify-otp",
  strictLoginLimiter,
  validators.verifyOtp,
  handleValidationErrors,
  controller.verifyOtp,
);

// TIER 2: Moderate - Signup (5 per 15 mins)
router.post(
  "/signup",
  moderateLimiter,
  validators.signup,
  handleValidationErrors,
  controller.signup,
);

// TIER 1: Very Strict - Login (3 per 15 mins per user)
router.post(
  "/login",
  strictLoginLimiter,
  validators.login,
  handleValidationErrors,
  controller.login,
);

// TIER 2: Moderate - Refresh token (5 per 15 mins)
router.post(
  "/refresh-token",
  moderateLimiter,
  validators.refreshToken,
  handleValidationErrors,
  controller.refreshToken,
);

// TIER 2: Moderate - Forgot password request (5 per 15 mins)
router.post(
  "/forgot-password",
  moderateLimiter,
  validators.forgotPassword,
  handleValidationErrors,
  controller.forgotPassword,
);

// TIER 2: Moderate - Reset password (5 per 15 mins)
router.post(
  "/reset-password",
  moderateLimiter,
  validators.resetPassword,
  handleValidationErrors,
  controller.resetPassword,
);

// TIER 2: Moderate - Logout (5 per 15 mins)
router.post(
  "/logout",
  moderateLimiter,
  authenticate,
  validators.logout,
  handleValidationErrors,
  controller.logout,
);

export default router;
