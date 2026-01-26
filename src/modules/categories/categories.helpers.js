import mongoose from "mongoose";

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
  let existingCategory = await mongoose.models.Category.findOne({
    slug,
    _id: { $ne: excludeId },
  });

  let counter = 1;
  while (existingCategory) {
    if (counter === 1) {
      slug = `${slug}-${counter}`;
    } else {
      slug = slug.replace(/-\d+$/, `-${counter}`);
    }
    existingCategory = await mongoose.models.Category.findOne({
      slug,
      _id: { $ne: excludeId },
    });
    counter++;
  }

  return slug;
};
