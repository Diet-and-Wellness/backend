import categoriesService from "./categories.service.js";

// Get all active categories (optional type filter)
const getCategories = async (req, res, next) => {
  try {
    const result = await categoriesService.getCategories(
      req.query.type,
      req.query.page || 1,
      req.query.limit || 20,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get categories by type with pagination
const getCategoriesByType = async (req, res, next) => {
  try {
    const result = await categoriesService.getCategoriesByType(
      req.params.type,
      req.query.page || 1,
      req.query.limit || 20,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get category by ID
const getCategoryById = async (req, res, next) => {
  try {
    const result = await categoriesService.getCategoryById(
      req.params.categoryId,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get category by slug
const getCategoryBySlug = async (req, res, next) => {
  try {
    const result = await categoriesService.getCategoryBySlug(req.params.slug);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Admin: Create category
const createCategory = async (req, res, next) => {
  try {
    const result = await categoriesService.createCategory(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// Admin: Update category
const updateCategory = async (req, res, next) => {
  try {
    const result = await categoriesService.updateCategory(
      req.params.categoryId,
      req.body,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Admin: Delete category
const deleteCategory = async (req, res, next) => {
  try {
    const result = await categoriesService.deleteCategory(
      req.params.categoryId,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Admin: Update category status
const updateCategoryStatus = async (req, res, next) => {
  try {
    const result = await categoriesService.updateCategoryStatus(
      req.params.categoryId,
      req.body.isActive,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Admin: Get all categories (including inactive)
const getAllCategories = async (req, res, next) => {
  try {
    const result = await categoriesService.getAllCategories(
      req.query.type,
      req.query.page || 1,
      req.query.limit || 20,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Admin: Reorder categories
const reorderCategories = async (req, res, next) => {
  try {
    const result = await categoriesService.reorderCategories(req.body.updates);
    res.json(result);
  } catch (error) {
    next(error);
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
