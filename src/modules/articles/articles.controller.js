import articlesService from "./articles.service.js";
import { getLanguage, translate } from "#utils/localization.js";

// Admin: Create a new article
const createArticle = async (req, res, next) => {
  try {
    const result = await articlesService.createArticle(
      req.body,
      req.user.user_id,
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// Get all published articles (with filters and pagination)
const getArticles = async (req, res, next) => {
  try {
    const filters = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      category: req.query.category,
      search: req.query.search,
      sortBy: req.query.sortBy || "newest",
      showHidden: false, // Regular users don't see hidden articles
      language: getLanguage(req) || "en", // Default to English if not specified
    };

    const result = await articlesService.getArticles(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get articles for admin dashboard (includes hidden and unpublished)
const getAdminArticles = async (req, res, next) => {
  try {
    const filters = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      category: req.query.category,
      search: req.query.search,
      sortBy: req.query.sortBy || "newest",
      status: req.query.status || "all", // all, active, hidden
      language: req.query.lang || getLanguage(req) || "en", // Default to English if not specified
    };

    const result = await articlesService.getAdminArticles(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get article by ID
const getArticleById = async (req, res, next) => {
  try {
    const article = await articlesService.getArticleById(req.params.articleId);

    // Increment view count asynchronously (don't wait)
    articlesService.incrementViewCount(req.params.articleId);

    res.json(article);
  } catch (error) {
    next(error);
  }
};

// Get article by slug (SEO friendly)
const getArticleBySlug = async (req, res, next) => {
  try {
    const article = await articlesService.getArticleBySlug(req.params.slug);

    // Increment view count asynchronously (don't wait)
    articlesService.incrementViewCount(article.id);

    res.json(article);
  } catch (error) {
    next(error);
  }
};

// Get articles by category
const getArticlesByCategory = async (req, res, next) => {
  try {
    const result = await articlesService.getArticlesByCategory(
      req.params.category,
      req.query.page || 1,
      req.query.limit || 10,
      getLanguage(req) || "en", // Default to English if not specified
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Admin: Update article
const updateArticle = async (req, res, next) => {
  try {
    const result = await articlesService.updateArticle(
      req.params.articleId,
      req.body,
      req.user,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Admin: Delete article
const deleteArticle = async (req, res, next) => {
  try {
    const result = await articlesService.deleteArticle(req.params.articleId);
    res.json({
      message: translate("DELETE_SUCCESS", getLanguage(req), {
        item: translate("article", getLanguage(req)),
      }),
    });
  } catch (error) {
    next(error);
  }
};
// Admin: Change article status (hide/show)
const changeArticleStatus = async (req, res, next) => {
  try {
    const result = await articlesService.changeArticleStatus(
      req.params.articleId,
      req.body.isHidden,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export default {
  createArticle,
  getArticles,
  getAdminArticles,
  getArticleById,
  getArticleBySlug,
  getArticlesByCategory,
  updateArticle,
  deleteArticle,
  changeArticleStatus,
};
