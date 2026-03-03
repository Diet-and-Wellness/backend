import express from "express";
import authenticate from "#middlewares/auth.js";
import handleValidationErrors from "#middlewares/validation.js";
import controller from "./profile.controller.js";
import validators from "./profile.validators.js";
import { ensureRoles } from "#middlewares/guards.js";
import { standardLimiter } from "#middlewares/rateLimiter.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get current user's profile
router.get("/", standardLimiter, controller.getProfile);

// Update current user's profile
router.put(
  "/",
  standardLimiter,
  validators.updateProfile,
  handleValidationErrors,
  controller.updateProfile,
);

// Search and filter profiles (admin/specialists only)
router.get(
  "/search",
  standardLimiter,
  ensureRoles(["admin", "specialist"]),
  validators.searchProfiles,
  handleValidationErrors,
  controller.searchProfiles,
);

// Get specific user profile details (admin/specialists only)
router.get(
  "/:userId",
  standardLimiter,
  ensureRoles(["admin", "specialist"]),
  validators.userId,
  handleValidationErrors,
  controller.getProfileDetails,
);

// Admin: Delete user profile
router.delete(
  "/:userId",
  standardLimiter,
  ensureRoles(["admin"]),
  validators.userId,
  handleValidationErrors,
  controller.deleteProfile,
);

// Admin: Create specialist profile
router.post(
  "/specialists",
  standardLimiter,
  ensureRoles(["admin"]),
  validators.createSpecialistProfile,
  handleValidationErrors,
  controller.createSpecialistProfile,
);

// Admin: Activate specialist
router.patch(
  "/specialists/:specialistId/activate",
  standardLimiter,
  ensureRoles(["admin"]),
  validators.specialistId,
  handleValidationErrors,
  controller.activateSpecialist,
);

// Admin: Deactivate specialist
router.patch(
  "/specialists/:specialistId/deactivate",
  standardLimiter,
  ensureRoles(["admin"]),
  validators.specialistId,
  handleValidationErrors,
  controller.deactivateSpecialist,
);

// Admin: Assign customers to a specialist
router.patch(
  "/specialists/:specialistId/assign-customers",
  standardLimiter,
  ensureRoles(["admin"]),
  validators.assignCustomersToSpecialist,
  handleValidationErrors,
  controller.assignCustomersToSpecialist,
);

export default router;
