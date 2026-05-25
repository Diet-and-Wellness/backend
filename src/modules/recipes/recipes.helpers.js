import mongoose from "mongoose";
import { RECIPE_UNITS } from "#modules/recipes/recipes.constants.js";
import { ERROR_CODES, translate } from "#utils/localization.js";
import arabicToLatin from "#utils/arabicToLatin.js";

export const generateSlug = async (title, excludeId = null) => {
  if (!title) {
    const error = new Error(
      translate(ERROR_CODES.SLUG_GENERATION_FAILED, "en"),
    );
    error.code = ERROR_CODES.SLUG_GENERATION_FAILED;
    error.status = 400;
    throw error;
  }

  // Convert Arabic characters to Latin if title contains Arabic
  const processedTitle = /[\u0600-\u06FF]/.test(title)
    ? arabicToLatin(title)
    : title;

  let slug = processedTitle
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

export const validateIngredients = (ingredients, validation = false) => {
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    if (validation) {
      throw [ERROR_CODES.REQUIRED_FIELD, { field: "ingredients" }];
    }

    const error = new Error(translate(ERROR_CODES.INGREDIENTS_REQUIRED, "en"));
    error.code = ERROR_CODES.INGREDIENTS_REQUIRED;
    error.status = 400;
    throw error;
  }

  if (ingredients.length > 50) {
    if (validation) {
      throw [ERROR_CODES.MAX_INGREDIENTS_EXCEEDED];
    }

    const error = new Error(
      translate(ERROR_CODES.MAX_INGREDIENTS_EXCEEDED, "en"),
    );
    error.code = ERROR_CODES.MAX_INGREDIENTS_EXCEEDED;
    error.status = 400;
    throw error;
  }

  ingredients.forEach((ingredient, index) => {
    if (!ingredient.name || typeof ingredient.name !== "string") {
      if (validation) {
        throw [ERROR_CODES.INGREDIENT_NAME_INVALID, { index: index + 1 }];
      }

      const error = new Error(
        translate(ERROR_CODES.INGREDIENT_NAME_INVALID, "en", {
          index: index + 1,
        }),
      );
      error.code = ERROR_CODES.INGREDIENT_NAME_INVALID;
      error.status = 400;
      throw error;
    }

    if (!ingredient.quantity || typeof ingredient.quantity !== "string") {
      if (validation) {
        throw [ERROR_CODES.INGREDIENT_QUANTITY_INVALID, { index: index + 1 }];
      }

      const error = new Error(
        translate(ERROR_CODES.INGREDIENT_QUANTITY_INVALID, "en", {
          index: index + 1,
        }),
      );
      error.code = ERROR_CODES.INGREDIENT_QUANTITY_INVALID;
      error.status = 400;
      throw error;
    }

    if (ingredient.name.length < 2 || ingredient.name.length > 100) {
      if (validation) {
        throw [
          ERROR_CODES.INGREDIENT_NAME_LENGTH_INVALID,
          { index: index + 1 },
        ];
      }

      const error = new Error(
        translate(ERROR_CODES.INGREDIENT_NAME_LENGTH_INVALID, "en", {
          index: index + 1,
        }),
      );
      error.code = ERROR_CODES.INGREDIENT_NAME_LENGTH_INVALID;
      error.status = 400;
      throw error;
    }

    if (ingredient.unit && !RECIPE_UNITS.includes(ingredient.unit)) {
      if (validation) {
        throw [
          ERROR_CODES.INGREDIENT_UNIT_INVALID,
          { index: index + 1, units: RECIPE_UNITS.join(", ") },
        ];
      }

      const error = new Error(
        translate(ERROR_CODES.INGREDIENT_UNIT_INVALID, "en", {
          index: index + 1,
          units: RECIPE_UNITS.join(", "),
        }),
      );
      error.code = ERROR_CODES.INGREDIENT_UNIT_INVALID;
      error.status = 400;
      throw error;
    }
  });

  return true;
};

export const validateInstructions = (instructions, validation = false) => {
  if (!Array.isArray(instructions) || instructions.length === 0) {
    if (validation) {
      throw [ERROR_CODES.INSTRUCTIONS_REQUIRED];
    }

    const error = new Error(translate(ERROR_CODES.INSTRUCTIONS_REQUIRED, "en"));
    error.code = ERROR_CODES.INSTRUCTIONS_REQUIRED;
    error.status = 400;
    throw error;
  }

  if (instructions.length > 200) {
    if (validation) {
      throw [ERROR_CODES.MAX_INSTRUCTIONS_EXCEEDED];
    }

    const error = new Error(
      translate(ERROR_CODES.MAX_INSTRUCTIONS_EXCEEDED, "en"),
    );
    error.code = ERROR_CODES.MAX_INSTRUCTIONS_EXCEEDED;
    error.status = 400;
    throw error;
  }

  instructions.forEach((instruction, index) => {
    if (
      !instruction.description ||
      typeof instruction.description !== "string"
    ) {
      if (validation) {
        throw [
          ERROR_CODES.INSTRUCTION_DESCRIPTION_INVALID,
          { index: index + 1 },
        ];
      }

      const error = new Error(
        translate(ERROR_CODES.INSTRUCTION_DESCRIPTION_INVALID, "en", {
          index: index + 1,
        }),
      );
      error.code = ERROR_CODES.INSTRUCTION_DESCRIPTION_INVALID;
      error.status = 400;
      throw error;
    }

    if (instruction.description.length < 5) {
      if (validation) {
        throw [
          ERROR_CODES.INSTRUCTION_DESCRIPTION_TOO_SHORT,
          { index: index + 1 },
        ];
      }

      const error = new Error(
        translate(ERROR_CODES.INSTRUCTION_DESCRIPTION_TOO_SHORT, "en", {
          index: index + 1,
        }),
      );
      error.code = ERROR_CODES.INSTRUCTION_DESCRIPTION_TOO_SHORT;
      error.status = 400;
      throw error;
    }
  });

  return true;
};

export const validateNutritionInfo = (nutritionInfo, validation = false) => {
  if (!nutritionInfo || typeof nutritionInfo !== "object") {
    if (validation) {
      throw [ERROR_CODES.NUTRITION_INFO_INVALID];
    }

    const error = new Error(
      translate(ERROR_CODES.NUTRITION_INFO_INVALID, "en"),
    );
    error.code = ERROR_CODES.NUTRITION_INFO_INVALID;
    error.status = 400;
    throw error;
  }

  const validFields = ["calories", "protein", "carbs", "fat", "fiber"];
  const fields = Object.keys(nutritionInfo);

  fields.forEach((field) => {
    if (!validFields.includes(field)) {
      if (validation) {
        throw [ERROR_CODES.NUTRITION_FIELD_INVALID, { field }];
      }

      const error = new Error(
        translate(ERROR_CODES.NUTRITION_FIELD_INVALID, "en", { field }),
      );
      error.code = ERROR_CODES.NUTRITION_FIELD_INVALID;
      error.status = 400;
      throw error;
    }

    const value = Number(nutritionInfo[field]);
    if (isNaN(value) || value < 0) {
      if (validation) {
        throw [ERROR_CODES.NUTRITION_FIELD_VALUE_INVALID, { field }];
      }

      const error = new Error(
        translate(ERROR_CODES.NUTRITION_FIELD_VALUE_INVALID, "en", { field }),
      );
      error.code = ERROR_CODES.NUTRITION_FIELD_VALUE_INVALID;
      error.status = 400;
      throw error;
    }
  });

  return true;
};

export const validateTags = (tags, validation = false) => {
  if (!Array.isArray(tags)) {
    if (validation) {
      throw [ERROR_CODES.TAGS_REQUIRED];
    }

    const error = new Error(translate(ERROR_CODES.TAGS_REQUIRED, "en"));
    error.code = ERROR_CODES.TAGS_REQUIRED;
    error.status = 400;
    throw error;
  }

  if (tags.length > 10) {
    if (validation) {
      throw [ERROR_CODES.MAX_TAGS_EXCEEDED];
    }

    const error = new Error(translate(ERROR_CODES.MAX_TAGS_EXCEEDED, "en"));
    error.code = ERROR_CODES.MAX_TAGS_EXCEEDED;
    error.status = 400;
    throw error;
  }

  tags.forEach((tag, index) => {
    if (typeof tag !== "string" || tag.trim().length === 0) {
      if (validation) {
        throw [ERROR_CODES.TAG_INVALID, { index: index + 1 }];
      }

      const error = new Error(
        translate(ERROR_CODES.TAG_INVALID, "en", { index: index + 1 }),
      );
      error.code = ERROR_CODES.TAG_INVALID;
      error.status = 400;
      throw error;
    }

    if (tag.length > 50) {
      if (validation) {
        throw [ERROR_CODES.TAG_LENGTH_INVALID, { index: index + 1 }];
      }

      const error = new Error(
        translate(ERROR_CODES.TAG_LENGTH_INVALID, "en", { index: index + 1 }),
      );
      error.code = ERROR_CODES.TAG_LENGTH_INVALID;
      error.status = 400;
      throw error;
    }
  });

  return true;
};
