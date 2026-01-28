export const ENGLISH_RECIPE_UNITS = [
  "g",
  "kg",
  "ml",
  "l",
  "cup",
  "tbsp", // "tablespoon"
  "tsp", // "teaspoon"
  "piece",
  "slice",
];
export const ARABIC_RECIPE_UNITS = [
  "جرام",
  "كيلوجرام",
  "مل",
  "لتر",
  "كوب",
  "ملعقة كبيرة",
  "ملعقة صغيرة",
  "قطعة",
  "شريحة",
];

export const RECIPE_UNITS = ENGLISH_RECIPE_UNITS.concat(ARABIC_RECIPE_UNITS)
  .filter(Boolean)
  .concat([""]);

export const ENGLISH_RECIPE_DIFFICULTIES = ["easy", "medium", "hard"];
export const ARABIC_RECIPE_DIFFICULTIES = ["سهل", "متوسط", "صعب"];

export const RECIPE_DIFFICULTIES = ENGLISH_RECIPE_DIFFICULTIES.concat(
  ARABIC_RECIPE_DIFFICULTIES,
).filter(Boolean);
