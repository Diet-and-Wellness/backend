import express from "express";
import authRoutes from "#modules/auth/auth.routes.js";
import profileRoutes from "#modules/profile/profile.routes.js";
import categoriesRoutes from "#modules/categories/categories.routes.js";
import articlesRoutes from "#modules/articles/articles.routes.js";
import recipesRoutes from "#modules/recipes/recipes.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/categories", categoriesRoutes);
router.use("/articles", articlesRoutes);
router.use("/recipes", recipesRoutes);

export default router;
