import express from "express";
import authenticate from "#middlewares/auth.js";
import handleValidationErrors from "#middlewares/validation.js";
import { ensureRoles } from "#middlewares/guards.js";
import controller from "./categories.controller.js";
import validators from "./categories.validators.js";

const router = express.Router();

// PUBLIC ROUTES (no authentication required)

// Get all active categories (optional type filter)
router.get(
  "/",
  validators.getCategories,
  handleValidationErrors,
  controller.getCategories,
);

// Get categories by type with pagination
router.get(
  "/type/:type",
  validators.getCategoriesByType,
  handleValidationErrors,
  controller.getCategoriesByType,
);

// Get category by slug
router.get(
  "/slug/:slug",
  validators.categorySlug,
  handleValidationErrors,
  controller.getCategoryBySlug,
);

// Get category by ID
router.get(
  "/:categoryId",
  validators.categoryId,
  handleValidationErrors,
  controller.getCategoryById,
);

// PROTECTED ROUTES (authentication required)
router.use(authenticate);

// ADMIN ROUTES

// Admin: Create category
router.post(
  "/",
  ensureRoles(["admin"]),
  validators.createCategory,
  handleValidationErrors,
  controller.createCategory,
);

// Admin: Get all categories (including inactive)
router.get(
  "/admin/all",
  ensureRoles(["admin"]),
  validators.getCategories,
  handleValidationErrors,
  controller.getAllCategories,
);

// Admin: Update category
router.put(
  "/admin/:categoryId",
  ensureRoles(["admin"]),
  validators.categoryId,
  validators.updateCategory,
  handleValidationErrors,
  controller.updateCategory,
);

// Admin: Update category status
router.patch(
  "/admin/:categoryId/status",
  ensureRoles(["admin"]),
  validators.categoryId,
  validators.updateStatus,
  handleValidationErrors,
  controller.updateCategoryStatus,
);

// Admin: Delete category
router.delete(
  "/admin/:categoryId",
  ensureRoles(["admin"]),
  validators.categoryId,
  handleValidationErrors,
  controller.deleteCategory,
);

// Admin: Reorder categories
router.patch(
  "/admin/reorder",
  ensureRoles(["admin"]),
  validators.reorderCategories,
  handleValidationErrors,
  controller.reorderCategories,
);

export default router;
