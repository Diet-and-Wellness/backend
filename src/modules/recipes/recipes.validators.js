import { body, query, param } from "express-validator";
import {
  validateIngredients,
  validateInstructions,
  validateTags,
  validateNutritionInfo,
} from "./recipes.helpers.js";
import { RECIPE_DIFFICULTIES } from "./recipes.constants.js";

// Validation for creating a recipe (admin only)
const createRecipe = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "title" }])
    .isLength({ min: 5, max: 200 })
    .withMessage(["INVALID_LENGTH", { min: 5, max: 200 }]),
  body("description")
    .trim()
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "description" }])
    .isLength({ min: 10, max: 500 })
    .withMessage(["INVALID_LENGTH", { min: 10, max: 500 }]),
  body("content")
    .trim()
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "content" }])
    .isLength({ min: 50 })
    .withMessage(["INVALID_LENGTH", { min: 50 }]),
  body("language")
    .optional()
    .isIn(["en", "ar"])
    .withMessage(["INVALID_LANGUAGE"]),
  body("category")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "category" }])
    .isMongoId()
    .withMessage(["INVALID_MONGO_ID_FORMAT", { field: "category" }]),
  body("ingredients")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "ingredients" }])
    .isArray({ min: 1 })
    .withMessage(["INVALID_ARRAY", { field: "ingredients" }])
    .custom((value) => {
      validateIngredients(value, true);
      return true;
    }),
  body("instructions")
    .optional()
    .isArray()
    .withMessage(["INVALID_ARRAY", { field: "instructions" }])
    .custom((value) => {
      if (value && value.length > 0) {
        validateInstructions(value, true);
      }
      return true;
    }),
  body("tags")
    .optional()
    .isArray()
    .withMessage(["INVALID_ARRAY", { field: "tags" }])
    .custom((value) => {
      if (value && value.length > 0) {
        validateTags(value, true);
      }
      return true;
    }),
  body("prepTime")
    .optional()
    .isInt({ min: 0, max: 480 })
    .withMessage(["INVALID_LENGTH", { field: "prepTime", min: 0, max: 480 }]),
  body("cookTime")
    .optional()
    .isInt({ min: 0, max: 480 })
    .withMessage(["INVALID_LENGTH", { field: "cookTime", min: 0, max: 480 }]),
  body("servings")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage(["INVALID_LENGTH", { field: "servings", min: 1, max: 50 }]),
  body("difficulty")
    .optional()
    .isIn(RECIPE_DIFFICULTIES)
    .withMessage(["INVALID_VALUE", { field: "difficulty" }]),
  body("nutritionInfo")
    .optional()
    .isObject()
    .withMessage(["INVALID_INPUT", { field: "nutritionInfo" }])
    .custom((value) => {
      if (value) {
        validateNutritionInfo(value, true);
      }
      return true;
    }),
];

// Validation for updating a recipe
const updateRecipe = [
  body("title")
    .trim()
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage(["INVALID_LENGTH", { min: 5, max: 200 }]),
  body("description")
    .trim()
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage(["INVALID_LENGTH", { min: 10, max: 500 }]),
  body("content")
    .trim()
    .optional()
    .isLength({ min: 50 })
    .withMessage(["INVALID_LENGTH", { min: 50 }]),
  body("language")
    .optional()
    .isIn(["en", "ar"])
    .withMessage(["INVALID_LANGUAGE"]),
  body("category")
    .optional()
    .isMongoId()
    .withMessage(["INVALID_MONGO_ID_FORMAT", { field: "category" }]),
  body("ingredients")
    .optional()
    .isArray({ min: 1 })
    .withMessage(["INVALID_ARRAY", { field: "ingredients" }])
    .custom((value) => {
      if (value) {
        validateIngredients(value, true);
      }
      return true;
    }),
  body("instructions")
    .optional()
    .isArray()
    .withMessage(["INVALID_ARRAY", { field: "instructions" }])
    .custom((value) => {
      if (value && value.length > 0) {
        validateInstructions(value, true);
      }
      return true;
    }),
  body("tags")
    .optional()
    .isArray()
    .withMessage(["INVALID_ARRAY", { field: "tags" }])
    .custom((value) => {
      if (value && value.length > 0) {
        validateTags(value, true);
      }
      return true;
    }),
  body("prepTime")
    .optional()
    .isInt({ min: 0, max: 480 })
    .withMessage(["INVALID_LENGTH", { field: "prepTime", min: 0, max: 480 }]),
  body("cookTime")
    .optional()
    .isInt({ min: 0, max: 480 })
    .withMessage(["INVALID_LENGTH", { field: "cookTime", min: 0, max: 480 }]),
  body("servings")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage(["INVALID_LENGTH", { field: "servings", min: 1, max: 50 }]),
  body("difficulty")
    .optional()
    .isIn(RECIPE_DIFFICULTIES)
    .withMessage(["INVALID_VALUE", { field: "difficulty" }]),
  body("nutritionInfo")
    .optional()
    .isObject()
    .withMessage(["INVALID_INPUT", { field: "nutritionInfo" }])
    .custom((value) => {
      if (value) {
        validateNutritionInfo(value, true);
      }
      return true;
    }),
];

// Validation for hiding recipes
const changeRecipeStatus = [
  body("isHidden")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "isHidden" }])
    .isBoolean()
    .withMessage(["INVALID_BOOLEAN_VALUE", { field: "isHidden" }]),
];

// Validation for getting recipes with filters
const getRecipes = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage(["INVALID_PAGE_NUMBER"]),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage(["INVALID_LIMIT_NUMBER", { min: 1, max: 100 }]),
  query("category")
    .optional()
    .isMongoId()
    .withMessage(["INVALID_MONGO_ID_FORMAT", { field: "category" }]),
  query("search")
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage(["INVALID_LENGTH", { min: 1, max: 100 }]),
  query("difficulty")
    .optional()
    .isIn(RECIPE_DIFFICULTIES)
    .withMessage(["INVALID_DIFFICULTY"]),
  query("sortBy")
    .optional()
    .isIn(["newest", "oldest", "mostViewed", "trending"])
    .withMessage(["INVALID_SORT_OPTION"]),
  query("status")
    .optional()
    .isIn(["active", "inactive", "all"])
    .withMessage(["INVALID_STATUS_OPTION"]),
];

// Validation for recipe ID
const recipeId = [
  param("recipeId")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "recipeId" }])
    .isMongoId()
    .withMessage(["INVALID_MONGO_ID_FORMAT", { field: "recipe" }]),
];

// Validation for category ID
const categoryId = [
  param("category")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "category" }])
    .isMongoId()
    .withMessage(["INVALID_MONGO_ID_FORMAT", { field: "category" }]),
];

// Validation for slug
const recipeSlug = [
  param("slug")
    .notEmpty()
    .withMessage(["REQUIRED_FIELD", { field: "slug" }])
    .matches(/^[a-z0-9-]+$/)
    .withMessage(["INVALID_SLUG_FORMAT"]),
];

export default {
  createRecipe,
  updateRecipe,
  changeRecipeStatus,
  getRecipes,
  recipeId,
  categoryId,
  recipeSlug,
};
