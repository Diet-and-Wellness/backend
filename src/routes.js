import express from "express";
import authRoutes from "#modules/auth/auth.routes.js";
import profileRoutes from "#modules/profile/profile.routes.js";
import categoriesRoutes from "#modules/categories/categories.routes.js";
import articlesRoutes from "#modules/articles/articles.routes.js";
import recipesRoutes from "#modules/recipes/recipes.routes.js";
import subscriptionsRoutes from "#modules/subscriptions/subscriptions.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/categories", categoriesRoutes);
router.use("/articles", articlesRoutes);
router.use("/recipes", recipesRoutes);
router.use("/subscriptions", subscriptionsRoutes);

// Health check route
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
  });
});

// Default API root route (must come BEFORE 404)
router.use((req, res, next) => {
  if (req.path === "/") {
    return res.json({
      success: true,
      message: "API is up and running",
    });
  }
  next();
});

// Catch-all 404 for undefined routes
router.use("/", (req, res) => {
  console.warn(`Endpoint not found: ${req.originalUrl}`);

  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

export default router;
