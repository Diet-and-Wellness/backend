import mongoose from "mongoose";
import { RECIPE_UNITS } from "#modules/recipes/recipes.constants.js";

export const generateSlug = async (title, excludeId = null) => {
  if (!title) {
    throw new Error("Title is required to generate slug");
  }

  let slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with single

  // Check if slug already exists
  let existingRecipe = await mongoose.models.Recipe.findOne({
    slug,
    _id: { $ne: excludeId },
  });

  let counter = 1;
  while (existingRecipe) {
    if (counter === 1) {
      slug = `${slug}-${counter}`;
    } else {
      slug = slug.replace(/-\d+$/, `-${counter}`);
    }
    existingRecipe = await mongoose.models.Recipe.findOne({
      slug,
      _id: { $ne: excludeId },
    });
    counter++;
  }

  return slug;
};

export const validateIngredients = (ingredients) => {
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    throw new Error("At least one ingredient is required");
  }

  if (ingredients.length > 50) {
    throw new Error("Maximum 50 ingredients allowed");
  }

  ingredients.forEach((ingredient, index) => {
    if (!ingredient.name || typeof ingredient.name !== "string") {
      throw new Error(
        `Ingredient ${index + 1}: name is required and must be a string`,
      );
    }

    if (!ingredient.quantity || typeof ingredient.quantity !== "string") {
      throw new Error(
        `Ingredient ${index + 1}: quantity is required and must be a string`,
      );
    }

    if (ingredient.name.length < 2 || ingredient.name.length > 100) {
      throw new Error(
        `Ingredient ${index + 1}: name must be between 2 and 100 characters`,
      );
    }

    if (ingredient.unit && !RECIPE_UNITS.includes(ingredient.unit)) {
      throw new Error(
        `Ingredient ${index + 1}: invalid unit. Must be one of ${RECIPE_UNITS.join(", ")}`,
      );
    }
  });

  return true;
};

export const validateInstructions = (instructions) => {
  if (!Array.isArray(instructions) || instructions.length === 0) {
    throw new Error("Instructions must be an array");
  }

  if (instructions.length > 200) {
    throw new Error("Maximum 200 instruction steps allowed");
  }

  instructions.forEach((instruction, index) => {
    if (
      !instruction.description ||
      typeof instruction.description !== "string"
    ) {
      throw new Error(
        `Step ${index + 1}: description is required and must be a string`,
      );
    }

    if (instruction.description.length < 5) {
      throw new Error(
        `Step ${index + 1}: description must be at least 5 characters`,
      );
    }
  });

  return true;
};

export const validateNutritionInfo = (nutritionInfo) => {
  if (!nutritionInfo || typeof nutritionInfo !== "object") {
    throw new Error("Nutrition info must be an object");
  }

  const validFields = ["calories", "protein", "carbs", "fat", "fiber"];
  const fields = Object.keys(nutritionInfo);

  fields.forEach((field) => {
    if (!validFields.includes(field)) {
      throw new Error(`Invalid nutrition field: ${field}`);
    }

    if (typeof nutritionInfo[field] !== "number" || nutritionInfo[field] < 0) {
      throw new Error(`${field} must be a non-negative number`);
    }
  });

  return true;
};

export const validateTags = (tags) => {
  if (!Array.isArray(tags)) {
    throw new Error("Tags must be an array");
  }

  if (tags.length > 10) {
    throw new Error("Maximum 10 tags allowed");
  }

  tags.forEach((tag, index) => {
    if (typeof tag !== "string" || tag.trim().length === 0) {
      throw new Error(`Tag ${index + 1}: must be a non-empty string`);
    }

    if (tag.length > 50) {
      throw new Error(`Tag ${index + 1}: must not exceed 50 characters`);
    }
  });

  return true;
};
