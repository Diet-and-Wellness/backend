import Category from "#models/category.js";
import { ERROR_CODES, translate } from "#utils/localization.js";

// Get all categories (with type filter)
const getCategories = async (type, page = 1, limit = 20) => {
  try {
    const query = { isActive: true };
    if (type) {
      query.type = type;
    }

    const skip = (page - 1) * limit;

    const categories = await Category.find(query)
      .sort({ order: 1, displayName: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Category.countDocuments(query);

    return {
      data: categories,
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

// Get categories by type with pagination
const getCategoriesByType = async (type, page = 1, limit = 20) => {
  try {
    if (!["article", "recipe"].includes(type)) {
      const error = new Error(
        translate(ERROR_CODES.INVALID_CATEGORY_TYPE, "en"),
      );
      error.code = ERROR_CODES.INVALID_CATEGORY_TYPE;
      error.status = 400;
      throw error;
    }

    const skip = (page - 1) * limit;

    const categories = await Category.find({ type, isActive: true })
      .sort({ order: 1, displayName: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Category.countDocuments({ type, isActive: true });

    return {
      data: categories,
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

// Get category by ID
const getCategoryById = async (categoryId) => {
  try {
    const category = await Category.findById(categoryId);

    if (!category) {
      const error = new Error(translate(ERROR_CODES.CATEGORY_NOT_FOUND, "en"));
      error.code = ERROR_CODES.CATEGORY_NOT_FOUND;
      error.status = 404;
      throw error;
    }

    return category;
  } catch (error) {
    throw error;
  }
};

// Get category by slug
const getCategoryBySlug = async (slug) => {
  try {
    const category = await Category.findOne({ slug });

    if (!category) {
      const error = new Error(translate(ERROR_CODES.CATEGORY_NOT_FOUND, "en"));
      error.code = ERROR_CODES.CATEGORY_NOT_FOUND;
      error.status = 404;
      throw error;
    }

    return category;
  } catch (error) {
    throw error;
  }
};

// Create category (admin only)
const createCategory = async (categoryData) => {
  try {
    // Check if category with same name already exists
    const existingCategory = await Category.findOne({
      name: categoryData.name.toLowerCase(),
      type: categoryData.type,
    });

    if (existingCategory) {
      const error = new Error(
        translate(ERROR_CODES.CATEGORY_ALREADY_EXISTS, "en"),
      );
      error.code = ERROR_CODES.CATEGORY_ALREADY_EXISTS;
      error.status = 409;
      throw error;
    }

    const category = new Category(categoryData);
    await category.save();

    return category;
  } catch (error) {
    if (error.code === 11000) {
      const err = new Error(translate(ERROR_CODES.SLUG_ALREADY_EXISTS, "en"));
      err.code = ERROR_CODES.SLUG_ALREADY_EXISTS;
      err.status = 409;
      throw err;
    }
    throw error;
  }
};

// Update category (admin only)
const updateCategory = async (categoryId, updateData) => {
  try {
    // Prevent updating type
    const { name, displayName, description, order, type } = updateData;

    const category = await Category.findByIdAndUpdate(
      categoryId,
      { name, displayName, description, order },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!category) {
      const error = new Error(translate(ERROR_CODES.CATEGORY_NOT_FOUND, "en"));
      error.code = ERROR_CODES.CATEGORY_NOT_FOUND;
      error.status = 404;
      throw error;
    }

    return category;
  } catch (error) {
    throw error;
  }
};

// Delete category (admin only)
const deleteCategory = async (categoryId) => {
  try {
    // Check if category is used by any articles or recipes
    const articleCount = await import("#models/article.js").then((m) =>
      m.default.countDocuments({ category: categoryId }),
    );

    if (articleCount > 0) {
      const error = new Error(
        translate(ERROR_CODES.CATEGORY_IN_USE, "en", { count: articleCount }),
      );
      error.code = ERROR_CODES.CATEGORY_IN_USE;
      error.status = 409;
      throw error;
    }

    const category = await Category.findByIdAndDelete(categoryId);

    if (!category) {
      const error = new Error(translate(ERROR_CODES.CATEGORY_NOT_FOUND, "en"));
      error.code = ERROR_CODES.CATEGORY_NOT_FOUND;
      error.status = 404;
      throw error;
    }

    return true;
  } catch (error) {
    throw error;
  }
};

// Update category active status (admin only)
const updateCategoryStatus = async (categoryId, isActive) => {
  try {
    const category = await Category.findByIdAndUpdate(
      categoryId,
      { isActive },
      { new: true },
    );

    if (!category) {
      const error = new Error(translate(ERROR_CODES.CATEGORY_NOT_FOUND, "en"));
      error.code = ERROR_CODES.CATEGORY_NOT_FOUND;
      error.status = 404;
      throw error;
    }

    return category;
  } catch (error) {
    throw error;
  }
};

// Get all categories (including inactive) for admin
const getAllCategories = async (type, page, limit) => {
  try {
    const query = {};
    if (type) {
      query.type = type;
    }

    const skip = (page - 1) * limit;

    const categories = await Category.find(query)
      .sort({ order: 1, displayName: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Category.countDocuments(query);

    return {
      data: categories,
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

// Reorder categories (admin only)
const reorderCategories = async (categoryUpdates) => {
  try {
    // categoryUpdates should be array of { id, order }
    const bulkOps = categoryUpdates.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } },
      },
    }));

    await Category.bulkWrite(bulkOps);

    return {
      message: "Categories reordered successfully",
    };
  } catch (error) {
    throw error;
  }
};

export default {
  getCategories,
  getCategoriesByType,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryStatus,
  getAllCategories,
  reorderCategories,
};
