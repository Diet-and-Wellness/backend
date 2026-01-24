import Category from "#models/category.js";

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
      throw {
        message: "Invalid category type",
        status: 400,
      };
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
      throw {
        message: "Category not found",
        status: 404,
      };
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
      throw {
        message: "Category not found",
        status: 404,
      };
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
      throw {
        message: `Category "${categoryData.name}" already exists for type "${categoryData.type}"`,
        status: 409,
      };
    }

    const category = new Category(categoryData);
    await category.save();

    return category;
  } catch (error) {
    if (error.code === 11000) {
      throw {
        message: "Category with this name or slug already exists",
        status: 409,
      };
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
      throw {
        message: "Category not found",
        status: 404,
      };
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
      throw {
        message: `Cannot delete category. ${articleCount} article(s) are using this category`,
        status: 409,
      };
    }

    const category = await Category.findByIdAndDelete(categoryId);

    if (!category) {
      throw {
        message: "Category not found",
        status: 404,
      };
    }

    return {
      message: "Category deleted successfully",
    };
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
      throw {
        message: "Category not found",
        status: 404,
      };
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
