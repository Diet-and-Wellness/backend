import express from "express";
import authenticate from "#middlewares/auth.js";
import handleValidationErrors from "#middlewares/validation.js";
import { ensureRoles } from "#middlewares/guards.js";
import controller from "./articles.controller.js";
import validators from "./articles.validators.js";
import { standardLimiter, relaxedLimiter } from "#middlewares/rateLimiter.js";

const router = express.Router();

// ADMIN ROUTES - MUST come before public routes with similar patterns

// Admin: Create new article
router.post(
  "/admin",
  authenticate,
  standardLimiter,
  ensureRoles(["admin"]),
  validators.createArticle,
  handleValidationErrors,
  controller.createArticle,
);

// Admin: Get all articles (including hidden)
router.get(
  "/admin",
  authenticate,
  standardLimiter,
  ensureRoles(["admin"]),
  validators.getArticles,
  handleValidationErrors,
  controller.getAdminArticles,
);

// Admin: Update article
router.put(
  "/admin/:articleId",
  authenticate,
  standardLimiter,
  ensureRoles(["admin"]),
  validators.articleId,
  validators.updateArticle,
  handleValidationErrors,
  controller.updateArticle,
);

// Admin: Delete article
router.delete(
  "/admin/:articleId",
  authenticate,
  standardLimiter,
  ensureRoles(["admin"]),
  validators.articleId,
  handleValidationErrors,
  controller.deleteArticle,
);

// Admin: Hide/Show article
router.patch(
  "/admin/:articleId/status",
  authenticate,
  standardLimiter,
  ensureRoles(["admin"]),
  validators.articleId,
  validators.changeArticleStatus,
  handleValidationErrors,
  controller.changeArticleStatus,
);

// PUBLIC ROUTES - After authentication check (unauthenticated users reach here)
// Get all published articles with filters and pagination
router.get(
  "/",
  relaxedLimiter,
  validators.getArticles,
  handleValidationErrors,
  controller.getArticles,
);

// Get articles by category - MUST come before /:articleId
router.get(
  "/category/:category",
  relaxedLimiter,
  validators.categoryId,
  handleValidationErrors,
  controller.getArticlesByCategory,
);

// Get article by slug (SEO friendly URL) - MUST come before /:articleId
router.get(
  "/slug/:slug",
  relaxedLimiter,
  validators.articleSlug,
  handleValidationErrors,
  controller.getArticleBySlug,
);

// Get article by ID - MUST be after specific routes
router.get(
  "/:articleId",
  relaxedLimiter,
  validators.articleId,
  handleValidationErrors,
  controller.getArticleById,
);

export default router;
