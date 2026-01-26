import { body, query, param } from "express-validator";
import {
  validateIngredients,
  validateInstructions,
  validateTags,
  validateNutritionInfo,
} from "./recipes.helpers.js";

// Validation for creating a recipe (admin only)
const createRecipe = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),
  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters"),
  body("content")
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 50 })
    .withMessage("Content must be at least 50 characters"),
  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Category must be a valid category ID"),
  body("ingredients")
    .notEmpty()
    .withMessage("Ingredients are required")
    .isArray({ min: 1 })
    .withMessage("At least one ingredient is required")
    .custom((value) => {
      validateIngredients(value);
      return true;
    }),
  body("instructions")
    .optional()
    .isArray()
    .withMessage("Instructions must be an array")
    .custom((value) => {
      if (value && value.length > 0) {
        validateInstructions(value);
      }
      return true;
    }),
  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array")
    .custom((value) => {
      if (value && value.length > 0) {
        validateTags(value);
      }
      return true;
    }),
  body("prepTime")
    .optional()
    .isInt({ min: 0, max: 480 })
    .withMessage("Prep time must be between 0 and 480 minutes"),
  body("cookTime")
    .optional()
    .isInt({ min: 0, max: 480 })
    .withMessage("Cook time must be between 0 and 480 minutes"),
  body("servings")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Servings must be between 1 and 50"),
  body("difficulty")
    .optional()
    .isIn(["easy", "medium", "hard"])
    .withMessage("Difficulty must be easy, medium, or hard"),
  body("nutritionInfo")
    .optional()
    .isObject()
    .withMessage("Nutrition info must be an object")
    .custom((value) => {
      if (value) {
        validateNutritionInfo(value);
      }
      return true;
    }),
];

// Validation for updating a recipe
const updateRecipe = [
  body("title")
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),
  body("description")
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage("Description must be between 10 and 500 characters"),
  body("content")
    .optional()
    .isLength({ min: 50 })
    .withMessage("Content must be at least 50 characters"),
  body("category")
    .optional()
    .isMongoId()
    .withMessage("Category must be a valid category ID"),
  body("ingredients")
    .optional()
    .isArray({ min: 1 })
    .withMessage("At least one ingredient is required")
    .custom((value) => {
      if (value) {
        validateIngredients(value);
      }
      return true;
    }),
  body("instructions")
    .optional()
    .isArray()
    .withMessage("Instructions must be an array")
    .custom((value) => {
      if (value && value.length > 0) {
        validateInstructions(value);
      }
      return true;
    }),
  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array")
    .custom((value) => {
      if (value && value.length > 10) {
        throw new Error("Maximum 10 tags allowed");
      }
      return true;
    }),
  body("prepTime")
    .optional()
    .isInt({ min: 0, max: 480 })
    .withMessage("Prep time must be between 0 and 480 minutes"),
  body("cookTime")
    .optional()
    .isInt({ min: 0, max: 480 })
    .withMessage("Cook time must be between 0 and 480 minutes"),
  body("servings")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Servings must be between 1 and 50"),
  body("difficulty")
    .optional()
    .isIn(["easy", "medium", "hard"])
    .withMessage("Difficulty must be easy, medium, or hard"),
  body("nutritionInfo")
    .optional()
    .isObject()
    .withMessage("Nutrition info must be an object")
    .custom((value) => {
      if (value) {
        validateNutritionInfo(value);
      }
      return true;
    }),
];

// Validation for hiding recipes
const changeRecipeStatus = [
  body("isHidden")
    .notEmpty()
    .withMessage("isHidden is required")
    .isBoolean()
    .withMessage("isHidden must be a boolean"),
];

// Validation for getting recipes with filters
const getRecipes = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("category")
    .optional()
    .isMongoId()
    .withMessage("Category must be a valid category ID"),
  query("search")
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage("Search term must be between 1 and 100 characters"),
  query("difficulty")
    .optional()
    .isIn(["easy", "medium", "hard"])
    .withMessage("Invalid difficulty"),
  query("sortBy")
    .optional()
    .isIn(["newest", "oldest", "mostViewed", "trending"])
    .withMessage("Invalid sort option"),
];

// Validation for recipe ID
const recipeId = [
  param("recipeId")
    .notEmpty()
    .withMessage("Recipe ID is required")
    .isMongoId()
    .withMessage("Recipe ID must be a valid MongoDB ID"),
];

// Validation for category ID
const categoryId = [
  param("category")
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Category must be a valid MongoDB ID"),
];

// Validation for slug
const recipeSlug = [
  param("slug")
    .notEmpty()
    .withMessage("Slug is required")
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),
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
