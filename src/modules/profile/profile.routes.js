import express from "express";
import authenticate from "#middlewares/auth.js";
import handleValidationErrors from "#middlewares/validation.js";
import controller from "./profile.controller.js";
import validators from "./profile.validators.js";
import { ensureRoles } from "./profile.guards.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get current user's profile
router.get("/", controller.getProfile);

// Update current user's profile
router.put(
  "/",
  validators.updateProfile,
  handleValidationErrors,
  controller.updateProfile,
);

// Search and filter profiles (admin/specialists only)
router.get(
  "/search",
  ensureRoles(["admin", "specialist"]),
  validators.searchProfiles,
  handleValidationErrors,
  controller.searchProfiles,
);

// Get specific user profile details (admin/specialists only)
router.get(
  "/:userId",
  ensureRoles(["admin", "specialist"]),
  validators.userId,
  handleValidationErrors,
  controller.getProfileDetails,
);

// Admin: Delete user profile
router.delete(
  "/:userId",
  ensureRoles(["admin"]),
  validators.userId,
  handleValidationErrors,
  controller.deleteProfile,
);

// Admin: Create specialist profile
router.post(
  "/specialists",
  ensureRoles(["admin"]),
  validators.createSpecialistProfile,
  handleValidationErrors,
  controller.createSpecialistProfile,
);

// Admin: Activate specialist
router.patch(
  "/specialists/:specialistId/activate",
  ensureRoles(["admin"]),
  validators.specialistId,
  handleValidationErrors,
  controller.activateSpecialist,
);

// Admin: Deactivate specialist
router.patch(
  "/specialists/:specialistId/deactivate",
  ensureRoles(["admin"]),
  validators.specialistId,
  handleValidationErrors,
  controller.deactivateSpecialist,
);

export default router;
