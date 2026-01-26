import recipesService from "./recipes.service.js";

// Admin: Create a new recipe
const createRecipe = async (req, res, next) => {
  try {
    const result = await recipesService.createRecipe(
      req.body,
      req.user.user_id,
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// Get all recipes (with filters and pagination)
const getRecipes = async (req, res, next) => {
  try {
    const filters = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      category: req.query.category,
      search: req.query.search,
      difficulty: req.query.difficulty,
      sortBy: req.query.sortBy || "newest",
      showHidden: false,
    };

    const result = await recipesService.getRecipes(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get recipes for admin dashboard
const getAdminRecipes = async (req, res, next) => {
  try {
    const filters = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      category: req.query.category,
      search: req.query.search,
      status: req.query.status || "all",
    };

    const result = await recipesService.getAdminRecipes(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get recipe by ID
const getRecipeById = async (req, res, next) => {
  try {
    const recipe = await recipesService.getRecipeById(req.params.recipeId);

    // Increment view count asynchronously (don't wait)
    recipesService.incrementViewCount(req.params.recipeId);

    res.json(recipe);
  } catch (error) {
    next(error);
  }
};

// Get recipe by slug (SEO friendly)
const getRecipeBySlug = async (req, res, next) => {
  try {
    const recipe = await recipesService.getRecipeBySlug(req.params.slug);

    // Increment view count asynchronously (don't wait)
    recipesService.incrementViewCount(recipe._id);

    res.json(recipe);
  } catch (error) {
    next(error);
  }
};

// Get recipes by category
const getRecipesByCategory = async (req, res, next) => {
  try {
    const result = await recipesService.getRecipesByCategory(
      req.params.category,
      req.query.page || 1,
      req.query.limit || 10,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Admin: Update recipe
const updateRecipe = async (req, res, next) => {
  try {
    const result = await recipesService.updateRecipe(
      req.params.recipeId,
      req.body,
      req.user.user_id,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Admin: Delete recipe
const deleteRecipe = async (req, res, next) => {
  try {
    const result = await recipesService.deleteRecipe(req.params.recipeId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Admin: Hide/Show recipe
const changeRecipeStatus = async (req, res, next) => {
  try {
    const result = await recipesService.changeRecipeStatus(
      req.params.recipeId,
      req.body.isHidden,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export default {
  createRecipe,
  getRecipes,
  getAdminRecipes,
  getRecipeById,
  getRecipeBySlug,
  getRecipesByCategory,
  updateRecipe,
  deleteRecipe,
  changeRecipeStatus,
};
