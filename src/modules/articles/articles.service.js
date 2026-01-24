import Article from "#models/article.js";

// Create a new article (admin only)
const createArticle = async (articleData, userId) => {
  try {
    const article = new Article({
      ...articleData,
      author: userId,
    });

    await article.save();

    return article;
  } catch (error) {
    if (error.code === 11000) {
      throw {
        message: "An article with this title already exists",
        status: 409,
      };
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
      .populate("author", "firstName lastName email")
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
    const article = await Article.findById(articleId).populate(
      "author",
      "firstName lastName email",
    );

    if (!article) {
      throw {
        message: "Article not found",
        status: 404,
      };
    }

    if (article.isHidden) {
      throw {
        message: "Article is hidden",
        status: 404,
      };
    }

    return article;
  } catch (error) {
    throw error;
  }
};

// Get article by slug
const getArticleBySlug = async (slug) => {
  try {
    const article = await Article.findOne({ slug }).populate(
      "author",
      "firstName lastName email",
    );

    if (!article) {
      throw {
        message: "Article not found",
        status: 404,
      };
    }

    if (article.isHidden) {
      throw {
        message: "Article is not available",
        status: 404,
      };
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
const updateArticle = async (articleId, updateData, userId) => {
  try {
    // Find article and verify it exists and user is author (or admin can update any)
    const article = await Article.findById(articleId);

    if (!article) {
      throw {
        message: "Article not found",
        status: 404,
      };
    }

    // Allow updates only by article author or admin
    // Note: admin check should be done in controller via ensureRoles middleware
    if (article.author.toString() !== userId) {
      throw {
        message: "You are not authorized to update this article",
        status: 403,
      };
    }

    // Fields that can be updated
    const allowedFields = [
      "title",
      "description",
      "content",
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
      throw {
        message: "Article not found",
        status: 404,
      };
    }

    return {
      message: "Article deleted successfully",
    };
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
      throw {
        message: "Article not found",
        status: 404,
      };
    }

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
  } = filters;

  const query = {};

  // Apply category filter
  if (category) {
    query.category = category;
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
      .populate("author", "firstName lastName email")
      .sort({ createdAt: -1 })
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
const getArticlesByCategory = async (category, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    const articles = await Article.find({
      category,
      isHidden: false,
    })
      .populate("author", "firstName lastName email")
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
