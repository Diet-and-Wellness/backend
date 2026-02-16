import express from "express";
import authenticate from "#middlewares/auth.js";
import handleValidationErrors from "#middlewares/validation.js";
import { ensureRoles } from "#middlewares/guards.js";
import imageUploadMiddleware from "#middlewares/imageUpload.js";
import controller from "./feedbacks.controller.js";
import validators from "./feedbacks.validators.js";
import { checkFeedbackExists } from "./feedbacks.middlewares.js";
import { standardLimiter, relaxedLimiter } from "#middlewares/rateLimiter.js";

const router = express.Router();

// Admin: Get all feedbacks (includes hidden)
router.get(
  "/admin",
  authenticate,
  standardLimiter,
  ensureRoles(["admin"]),
  validators.getFeedbacks,
  handleValidationErrors,
  controller.getAllFeedbacks,
);

// Admin: Get feedback by ID
router.get(
  "/admin/:feedbackId",
  authenticate,
  standardLimiter,
  ensureRoles(["admin"]),
  validators.feedbackId,
  handleValidationErrors,
  controller.getFeedbackById,
);

// Admin: Update feedback
router.put(
  "/admin/:feedbackId",
  authenticate,
  standardLimiter,
  ensureRoles(["admin"]),
  validators.feedbackId,
  validators.updateFeedback,
  handleValidationErrors,
  checkFeedbackExists,
  (req, res, next) => {
    req.cloudinaryOptions = { folder: "nutrition/feedbacks" };
    next();
  },
  imageUploadMiddleware.upload,
  imageUploadMiddleware.uploadToCloudinary,
  controller.updateFeedback,
);

// Admin: Delete feedback
router.delete(
  "/admin/:feedbackId",
  authenticate,
  standardLimiter,
  ensureRoles(["admin"]),
  validators.feedbackId,
  handleValidationErrors,
  controller.deleteFeedback,
);

// Admin: Hide/Show feedback
router.patch(
  "/admin/:feedbackId/status",
  authenticate,
  standardLimiter,
  ensureRoles(["admin"]),
  validators.feedbackId,
  validators.toggleVisibility,
  handleValidationErrors,
  controller.toggleFeedbackVisibility,
);

// Admin: Reorder feedbacks
router.patch(
  "/admin/reorder",
  authenticate,
  standardLimiter,
  ensureRoles(["admin"]),
  validators.reorderFeedbacks,
  handleValidationErrors,
  controller.reorderFeedbacks,
);

// Create new feedback (authenticated)
router.post(
  "/",
  authenticate,
  relaxedLimiter,
  ensureRoles(["admin"]),
  validators.createFeedback,
  handleValidationErrors,
  (req, res, next) => {
    req.cloudinaryOptions = { folder: "nutrition/feedbacks" };
    next();
  },
  imageUploadMiddleware.upload,
  imageUploadMiddleware.uploadToCloudinary,
  controller.createFeedback,
);

// Get all active feedbacks with filters and pagination (public)
router.get(
  "/",
  relaxedLimiter,
  validators.getFeedbacks,
  handleValidationErrors,
  controller.getActiveFeedbacks,
);

export default router;
