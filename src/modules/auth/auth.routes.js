import express from "express";
import controller from "./auth.controller.js";
import validators from "./auth.validators.js";
import handleValidationErrors from "#middlewares/validation.js";
import authenticate from "#middlewares/auth.js";

const router = express.Router();

router.post(
  "/send-otp",
  validators.sendOtp,
  handleValidationErrors,
  controller.sendOtp,
);
router.post(
  "/verify-otp",
  validators.verifyOtp,
  handleValidationErrors,
  controller.verifyOtp,
);
router.post(
  "/signup",
  validators.signup,
  handleValidationErrors,
  controller.signup,
);
router.post(
  "/login",
  validators.login,
  handleValidationErrors,
  controller.login,
);
router.post(
  "/refresh-token",
  validators.refreshToken,
  handleValidationErrors,
  controller.refreshToken,
);
router.post(
  "/forgot-password",
  validators.forgotPassword,
  handleValidationErrors,
  controller.forgotPassword,
);
router.post(
  "/reset-password",
  validators.resetPassword,
  handleValidationErrors,
  controller.resetPassword,
);
router.post(
  "/logout",
  authenticate,
  validators.logout,
  handleValidationErrors,
  controller.logout,
);

export default router;
