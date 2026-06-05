import express from "express";
import { emailRateLimiter } from "#middlewares/rateLimiter.js";
import validators from "./contactus.validators.js";
import handleValidationErrors from "#middlewares/validation.js";
import controller from "./contactus.controller.js";

const router = express.Router();

// Public route to submit contact us form
router.post(
  "/",
  emailRateLimiter,
  validators.submitContactUs,
  handleValidationErrors,
  controller.submitContactUsForm,
);

export default router;
