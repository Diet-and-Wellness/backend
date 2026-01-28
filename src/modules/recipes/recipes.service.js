import Recipe from "#models/recipe.js";
import { ERROR_CODES, translate } from "#utils/localization.js";

// Create a new recipe (admin only)
const createRecipe = async (recipeData, userId) => {
  try {
    const recipe = new Recipe({
      ...recipeData,
      author: userId,
    });

    await recipe.save();
    return recipe;
  } catch (error) {
    if (error.code === 11000) {
      const err = new Error(
        translate(ERROR_CODES.DUPLICATE_TITLE, "en", { type: "recipe" }),
      );
      err.code = ERROR_CODES.DUPLICATE_TITLE;
      err.status = 409;
      throw err;
    }
    throw error;
  }
};

// Get all recipes (with filters and pagination)
const getRecipes = async (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    category,
    search,
    difficulty,
    sortBy = "newest",
    showHidden = false,
  } = filters;

  const query = {};

  // Default: don't show hidden recipes
  if (!showHidden) {
    query.isHidden = false;
  }

  // Apply category filter
  if (category) {
    query.category = category;
  }

  // Apply difficulty filter
  if (difficulty) {
    query.difficulty = difficulty;
  }

  // Apply search filter (search in title, description, and tags)
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Determine sort order
  let sortObj = {};
  switch (sortBy) {
    case "oldest":
      sortObj = { createdAt: 1 };
      break;
    case "mostViewed":
      sortObj = { viewCount: -1 };
      break;
    case "trending":
      // Trending: recent recipes with high view count
      sortObj = { viewCount: -1, createdAt: -1 };
      break;
    case "newest":
    default:
      sortObj = { createdAt: -1 };
  }

  const skip = (page - 1) * limit;

  try {
    const recipes = await Recipe.find(query)
      .populate("author", "firstName lastName email phone")
      .populate("category", "name displayName arDisplayName")
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    const total = await Recipe.countDocuments(query);

    return {
      data: recipes,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw error;
  }
};

// Get recipe by ID
const getRecipeById = async (recipeId) => {
  try {
    const recipe = await Recipe.findById(recipeId)
      .populate("author", "firstName lastName email phone")
      .populate("category", "name displayName arDisplayName");

    if (!recipe) {
      const error = new Error(translate(ERROR_CODES.RECIPE_NOT_FOUND, "en"));
      error.code = ERROR_CODES.RECIPE_NOT_FOUND;
      error.status = 404;
      throw error;
    }

    if (recipe.isHidden) {
      const error = new Error(
        translate(ERROR_CODES.RECIPE_NOT_AVAILABLE, "en"),
      );
      error.code = ERROR_CODES.RECIPE_NOT_AVAILABLE;
      error.status = 404;
      throw error;
    }

    return recipe;
  } catch (error) {
    throw error;
  }
};

// Get recipe by slug (SEO friendly)
const getRecipeBySlug = async (slug) => {
  try {
    const recipe = await Recipe.findOne({ slug })
      .populate("author", "firstName lastName email phone")
      .populate("category", "name displayName arDisplayName");

    if (!recipe) {
      const error = new Error(translate(ERROR_CODES.RECIPE_NOT_FOUND, "en"));
      error.code = ERROR_CODES.RECIPE_NOT_FOUND;
      error.status = 404;
      throw error;
    }

    if (recipe.isHidden) {
      const error = new Error(
        translate(ERROR_CODES.RECIPE_NOT_AVAILABLE, "en"),
      );
      error.code = ERROR_CODES.RECIPE_NOT_AVAILABLE;
      error.status = 404;
      throw error;
    }

    return recipe;
  } catch (error) {
    throw error;
  }
};

// Update recipe (admin only)
const updateRecipe = async (recipeId, updateData, user) => {
  try {
    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      const error = new Error(translate(ERROR_CODES.RECIPE_NOT_FOUND, "en"));
      error.code = ERROR_CODES.RECIPE_NOT_FOUND;
      error.status = 404;
      throw error;
    }

    // Only admin or author can update
    if (recipe.author.toString() !== user.user_id && user.role !== "admin") {
      const error = new Error(
        translate(ERROR_CODES.INSUFFICIENT_PERMISSIONS, "en"),
      );
      error.code = ERROR_CODES.INSUFFICIENT_PERMISSIONS;
      error.status = 403;
      throw error;
    }

    // Update allowed fields
    const allowedFields = [
      "title",
      "description",
      "content",
      "category",
      "ingredients",
      "instructions",
      "tags",
      "prepTime",
      "cookTime",
      "servings",
      "difficulty",
      "nutritionInfo",
    ];

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        recipe[field] = updateData[field];
      }
    });

    await recipe.save();

    return recipe;
  } catch (error) {
    throw error;
  }
};

// Delete recipe (admin only)
const deleteRecipe = async (recipeId) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(recipeId);

    if (!recipe) {
      const error = new Error(translate(ERROR_CODES.RECIPE_NOT_FOUND, "en"));
      error.code = ERROR_CODES.RECIPE_NOT_FOUND;
      error.status = 404;
      throw error;
    }

    return true;
  } catch (error) {
    throw error;
  }
};

// Hide/Show recipe (admin only)
const changeRecipeStatus = async (recipeId, isHidden) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(
      recipeId,
      { isHidden },
      { new: true, runValidators: true },
    );

    if (!recipe) {
      const error = new Error(translate(ERROR_CODES.RECIPE_NOT_FOUND, "en"));
      error.code = ERROR_CODES.RECIPE_NOT_FOUND;
      error.status = 404;
      throw error;
    }

    return recipe;
  } catch (error) {
    throw error;
  }
};

// Increment view count
const incrementViewCount = async (recipeId) => {
  try {
    await Recipe.findByIdAndUpdate(recipeId, { $inc: { viewCount: 1 } });
  } catch (error) {
    console.error("Error incrementing view count:", error);
  }
};

// Get admin dashboard data (all recipes with filters)
const getAdminRecipes = async (filters = {}) => {
  const { page = 1, limit = 10, category, search, status } = filters;

  const query = {};

  // Apply category filter
  if (category) {
    query.category = category;
  }

  switch (status) {
    case "inactive":
      query.isHidden = true;
      break;
    case "active":
      query.isHidden = false;
      break;
    case "all":
    default:
      break;
  }

  // Apply search filter
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  try {
    const recipes = await Recipe.find(query)
      .populate("author", "firstName lastName email phone")
      .populate("category", "name displayName arDisplayName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Recipe.countDocuments(query);

    return {
      data: recipes,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw error;
  }
};

// Get recipes by category
const getRecipesByCategory = async (category, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    const recipes = await Recipe.find({
      category,
      isHidden: false,
    })
      .populate("author", "firstName lastName email phone")
      .populate("category", "name displayName arDisplayName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Recipe.countDocuments({
      category,
      isHidden: false,
    });

    return {
      data: recipes,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw error;
  }
};

export default {
  createRecipe,
  getRecipes,
  getRecipeById,
  getRecipeBySlug,
  updateRecipe,
  deleteRecipe,
  changeRecipeStatus,
  incrementViewCount,
  getAdminRecipes,
  getRecipesByCategory,
};
