import Article from "#models/article.js";
import { ERROR_CODES, translate } from "#utils/localization.js";

// Create a new article (admin only)
const createArticle = async (articleData, userId) => {
  try {
    const article = new Article({
      ...articleData,
      author: userId,
    });

    await article.save();
    await article.populate([
      { path: "author", select: "firstName lastName email phone" },
      { path: "category", select: "name displayName arDisplayName" },
    ]);

    return article;
  } catch (error) {
    if (error.code === 11000) {
      const err = new Error(
        translate(ERROR_CODES.DUPLICATE_TITLE, "en", { type: "article" }),
      );
      err.code = ERROR_CODES.DUPLICATE_TITLE;
      err.status = 409;
      throw err;
    }
    throw error;
  }
};

// Get all articles (with filters and pagination)
const getArticles = async (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    category,
    search,
    sortBy = "newest",
    showHidden = false,
    language,
  } = filters;

  const query = {};

  // Default: don't show hidden articles
  if (!showHidden) {
    query.isHidden = false;
  }

  // Apply category filter
  if (category) {
    query.category = category;
  }

  // Apply language filter
  if (language) {
    query.language = language;
  }

  // Apply search filter (search in title, description, and tags)
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Determine sort order
  let sortObj = {};
  switch (sortBy) {
    case "oldest":
      sortObj = { createdAt: 1 };
      break;
    case "mostViewed":
      sortObj = { viewCount: -1 };
      break;
    case "trending":
      // Trending: recent articles with high view count
      sortObj = { viewCount: -1, createdAt: -1 };
      break;
    case "newest":
    default:
      sortObj = { createdAt: -1 };
  }

  const skip = (page - 1) * limit;

  try {
    const articles = await Article.find(query)
      .populate("author", "firstName lastName email phone")
      .populate("category", "name displayName arDisplayName")
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    const total = await Article.countDocuments(query);

    return {
      data: articles,
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

// Get article by ID
const getArticleById = async (articleId) => {
  try {
    const article = await Article.findById(articleId)
      .populate("author", "firstName lastName email phone")
      .populate("category", "name displayName arDisplayName");

    if (!article) {
      const err = new Error(translate(ERROR_CODES.ARTICLE_NOT_FOUND, "en"));
      err.code = ERROR_CODES.ARTICLE_NOT_FOUND;
      err.status = 404;
      throw err;
    }

    if (article.isHidden) {
      const err = new Error(translate(ERROR_CODES.ARTICLE_NOT_AVAILABLE, "en"));
      err.code = ERROR_CODES.ARTICLE_NOT_AVAILABLE;
      err.status = 404;
      throw err;
    }

    return article;
  } catch (error) {
    throw error;
  }
};

// Get article by slug
const getArticleBySlug = async (slug) => {
  try {
    const article = await Article.findOne({ slug })
      .populate("author", "firstName lastName email phone")
      .populate("category", "name displayName arDisplayName");

    if (!article) {
      const error = new Error(translate(ERROR_CODES.ARTICLE_NOT_FOUND, "en"));
      error.code = ERROR_CODES.ARTICLE_NOT_FOUND;
      error.status = 404;
      throw error;
    }

    if (article.isHidden) {
      const error = new Error(
        translate(ERROR_CODES.ARTICLE_NOT_AVAILABLE, "en"),
      );
      error.code = ERROR_CODES.ARTICLE_NOT_AVAILABLE;
      error.status = 404;
      throw error;
    }

    return article;
  } catch (error) {
    throw error;
  }
};

// Increment view count
const incrementViewCount = async (articleId) => {
  try {
    await Article.findByIdAndUpdate(articleId, { $inc: { viewCount: 1 } });
  } catch (error) {
    console.error("Error incrementing view count:", error);
  }
};

// Update article (admin only)
const updateArticle = async (articleId, updateData, user) => {
  try {
    // Find article and verify it exists and user is author (or admin can update any)
    const article = await Article.findById(articleId);

    if (!article) {
      const error = new Error(translate(ERROR_CODES.ARTICLE_NOT_FOUND, "en"));
      error.code = ERROR_CODES.ARTICLE_NOT_FOUND;
      error.status = 404;
      throw error;
    }

    // Allow updates only by article author or admin
    // Note: admin check should be done in controller via ensureRoles middleware
    if (article.author.toString() !== user.user_id && user.role !== "admin") {
      const error = new Error(
        translate(ERROR_CODES.INSUFFICIENT_PERMISSIONS, "en"),
      );
      error.code = ERROR_CODES.INSUFFICIENT_PERMISSIONS;
      error.status = 403;
      throw error;
    }

    // Fields that can be updated
    const allowedFields = [
      "title",
      "description",
      "content",
      "language",
      "category",
      "tags",
      "estimatedReadTime",
    ];

    const filteredData = {};
    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    const updatedArticle = await Article.findByIdAndUpdate(
      articleId,
      filteredData,
      {
        new: true,
        runValidators: true,
      },
    );
    await article.populate([
      { path: "author", select: "firstName lastName email phone" },
      { path: "category", select: "name displayName arDisplayName" },
    ]);

    return updatedArticle;
  } catch (error) {
    throw error;
  }
};

// Delete article (admin only)
const deleteArticle = async (articleId) => {
  try {
    const article = await Article.findByIdAndDelete(articleId);

    if (!article) {
      const error = new Error(translate(ERROR_CODES.ARTICLE_NOT_FOUND, "en"));
      error.code = ERROR_CODES.ARTICLE_NOT_FOUND;
      error.status = 404;
      throw error;
    }

    return true;
  } catch (error) {
    throw error;
  }
};

// Hide/Show article (admin only)
const changeArticleStatus = async (articleId, isHidden) => {
  try {
    const article = await Article.findByIdAndUpdate(
      articleId,
      { isHidden },
      { new: true, runValidators: true }, // run pre-validators
    );

    if (!article) {
      const error = new Error(translate(ERROR_CODES.ARTICLE_NOT_FOUND, "en"));
      error.code = ERROR_CODES.ARTICLE_NOT_FOUND;
      error.status = 404;
      throw error;
    }

    await article.populate([
      { path: "author", select: "firstName lastName email phone" },
      { path: "category", select: "name displayName arDisplayName" },
    ]);

    return article;
  } catch (error) {
    throw error;
  }
};

// Get admin dashboard data (all articles with filters)
const getAdminArticles = async (filters = {}) => {
  const {
    page = 1,
    limit = 10,
    category,
    search,
    status,
    sortBy = "newest",
    language,
  } = filters;

  const query = {};

  // Apply category filter
  if (category) {
    query.category = category;
  }

  // Apply language filter
  if (language && language !== "all") {
    query.language = language;
  }

  // Apply status filter (all or hidden)
  switch (status) {
    case "inactive":
      query.isHidden = true;
      break;
    case "active":
      query.isHidden = false;
      break;
    case "all":
    default:
      break;
  }

  // Apply search filter
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Determine sort order
  let sortObj = {};
  switch (sortBy) {
    case "oldest":
      sortObj = { createdAt: 1 };
      break;
    case "mostViewed":
      sortObj = { viewCount: -1 };
      break;
    case "trending":
      // Trending: recent articles with high view count
      sortObj = { viewCount: -1, createdAt: -1 };
      break;
    case "newest":
    default:
      sortObj = { createdAt: -1 };
  }

  const skip = (page - 1) * limit;

  try {
    const articles = await Article.find(query)
      .populate("author", "firstName lastName email phone")
      .populate("category", "name displayName arDisplayName")
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    const total = await Article.countDocuments(query);

    return {
      data: articles,
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

// Get articles by category
const getArticlesByCategory = async (
  category,
  page = 1,
  limit = 10,
  language = "en",
) => {
  try {
    const skip = (page - 1) * limit;

    const articles = await Article.find({
      category,
      language,
      isHidden: false,
    })
      .populate("author", "firstName lastName email phone")
      .populate("category", "name displayName arDisplayName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Article.countDocuments({
      category,
      isHidden: false,
    });

    return {
      data: articles,
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

export default {
  createArticle,
  getArticles,
  getArticleById,
  getArticleBySlug,
  updateArticle,
  deleteArticle,
  changeArticleStatus,
  incrementViewCount,
  getAdminArticles,
  getArticlesByCategory,
};
