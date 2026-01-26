import express from "express";
import authenticate from "#middlewares/auth.js";
import handleValidationErrors from "#middlewares/validation.js";
import { ensureRoles } from "#middlewares/guards.js";
import controller from "./recipes.controller.js";
import validators from "./recipes.validators.js";

const router = express.Router();

// ADMIN ROUTES - MUST come before generic routes with similar patterns

// Admin: Create new recipe
router.post(
  "/admin",
  authenticate,
  ensureRoles(["admin"]),
  validators.createRecipe,
  handleValidationErrors,
  controller.createRecipe,
);

// Admin: Get all recipes (including hidden) for dashboard
router.get(
  "/admin",
  authenticate,
  ensureRoles(["admin"]),
  validators.getRecipes,
  handleValidationErrors,
  controller.getAdminRecipes,
);

// Admin: Update recipe
router.put(
  "/admin/:recipeId",
  authenticate,
  ensureRoles(["admin"]),
  validators.recipeId,
  validators.updateRecipe,
  handleValidationErrors,
  controller.updateRecipe,
);

// Admin: Delete recipe
router.delete(
  "/admin/:recipeId",
  authenticate,
  ensureRoles(["admin"]),
  validators.recipeId,
  handleValidationErrors,
  controller.deleteRecipe,
);

// Admin: Hide/Show recipe
router.patch(
  "/admin/:recipeId/status",
  authenticate,
  ensureRoles(["admin"]),
  validators.recipeId,
  validators.changeRecipeStatus,
  handleValidationErrors,
  controller.changeRecipeStatus,
);

// PUBLIC ROUTES - After authentication check (unauthenticated users reach here)

// Get all recipes with filters and pagination
router.get(
  "/",
  validators.getRecipes,
  handleValidationErrors,
  controller.getRecipes,
);

// Get recipes by category - MUST come before /:recipeId
router.get(
  "/category/:category",
  validators.categoryId,
  handleValidationErrors,
  controller.getRecipesByCategory,
);

// Get recipe by slug (SEO friendly URL) - MUST come before /:recipeId
router.get(
  "/slug/:slug",
  validators.recipeSlug,
  handleValidationErrors,
  controller.getRecipeBySlug,
);

// Get recipe by ID - MUST be after specific routes
router.get(
  "/:recipeId",
  validators.recipeId,
  handleValidationErrors,
  controller.getRecipeById,
);

export default router;
