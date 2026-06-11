import User from "#models/user.js";
import UserSubscription from "#models/userSubscription.js";
import Article from "#models/article.js";
import Recipe from "#models/recipe.js";
import Feedback from "#models/feedback.js";
import cloudinaryService from "#utils/cloudinary.js";
import { ERROR_CODES, translate, getLanguage } from "#utils/localization.js";

// Get user's own profile
const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error(translate(ERROR_CODES.USER_NOT_FOUND, "en"));
    error.code = ERROR_CODES.USER_NOT_FOUND;
    error.status = 404;
    throw error;
  }
  const userObj = user.toJSON();
  if (user.role === "specialist") {
    userObj.assignedCustomersCount = await User.countDocuments({
      specialist: user._id,
    });
  }
  if (user.role === "customer") {
    const userSubscription = await UserSubscription.findOne({
      user: user._id,
    }).populate("subscription");
    userObj.subscription = userSubscription ?? null;
  }
  return userObj;
};

// Search and filter profiles (admin/specialists only)
const searchProfiles = async (query, requesterRole) => {
  const filters = {};

  // Search by name (firstName or lastName)
  if (query.firstName) {
    filters.firstName = { $regex: query.firstName, $options: "i" };
  }
  if (query.lastName) {
    filters.lastName = { $regex: query.lastName, $options: "i" };
  }
  if (query.email) {
    filters.email = { $regex: query.email, $options: "i" };
  }
  if (query.phone) {
    filters.phone = { $regex: query.phone, $options: "i" };
  }
  // Filter by role
  if (query.role) {
    filters.role = query.role;
  }
  // Filter by specialist status (if role is specialist)
  if (query.specialistStatus) {
    filters["specialistInfo.status"] = query.specialistStatus;
  }
  // Filter by specialization
  if (query.specialization) {
    filters["specialistInfo.specialization"] = {
      $regex: query.specialization,
      $options: "i",
    };
  }

  const skip = (query.page - 1) * query.limit || 0;
  const limit = query.limit || 10;

  const users = await User.find(filters)
    .limit(limit)
    .skip(skip)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(filters);

  const data = await Promise.all(
    users.map(async (user) => {
      const userObj = user.toJSON();
      if (user.role === "specialist") {
        userObj.assignedCustomersCount = await User.countDocuments({
          specialist: user._id,
        });
      }
      if (user.role === "customer") {
        const userSubscription = await UserSubscription.findOne({
          user: user._id,
        }).populate("subscription");
        userObj.subscription = userSubscription ?? null;
      }
      return userObj;
    }),
  );

  return {
    data,
    pagination: {
      total,
      page: query.page || 1,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

// Update user profile
const updateProfile = async (userId, updateData) => {
  // Prevent updating sensitive fields
  const allowedFields = ["firstName", "lastName", "phone", "avatarUrl"];

  // If user is specialist, allow updating specialist info
  const user = await User.findById(userId);
  if (user?.role === "specialist" && updateData.specialistInfo) {
    allowedFields.push("specialistInfo");
  }

  const filteredData = {};
  if (updateData) {
    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });
  }

  // Delete old avatar from Cloudinary if being replaced
  if (filteredData.avatarUrl && user?.avatarUrl) {
    cloudinaryService.deleteImage(user.avatarUrl).catch(() => {});
  }

  const updatedUser = await User.findByIdAndUpdate(userId, filteredData, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    const error = new Error(translate(ERROR_CODES.USER_NOT_FOUND, "en"));
    error.code = ERROR_CODES.USER_NOT_FOUND;
    error.status = 404;
    throw error;
  }
  return updatedUser;
};

// Admin: Create specialist profile
const createSpecialistProfile = async (specialistData, requesterRole) => {
  const exists = await User.findOne({ email: specialistData.email });
  if (exists) {
    const error = new Error(translate(ERROR_CODES.EMAIL_ALREADY_EXISTS, "en"));
    error.code = ERROR_CODES.EMAIL_ALREADY_EXISTS;
    error.status = 409;
    throw error;
  }

  const specialist = await User.create({
    firstName: specialistData.firstName,
    lastName: specialistData.lastName,
    email: specialistData.email,
    phone: specialistData.phone,
    passwordHash: specialistData.password,
    role: "specialist",
    specialistInfo: {
      specialization: specialistData.specialization,
      experienceYears: specialistData.experienceYears,
      status: "inactive", // Newly created specialists start inactive
    },
  });

  return specialist;
};

// Admin: Activate specialist
const activateSpecialist = async (specialistId, requesterRole) => {
  const specialist = await User.findById(specialistId);
  if (!specialist) {
    const error = new Error(translate(ERROR_CODES.SPECIALIST_NOT_FOUND, "en"));
    error.code = ERROR_CODES.SPECIALIST_NOT_FOUND;
    error.status = 404;
    throw error;
  }
  if (specialist.role !== "specialist") {
    const error = new Error(translate(ERROR_CODES.USER_NOT_SPECIALIST, "en"));
    error.code = ERROR_CODES.USER_NOT_SPECIALIST;
    error.status = 400;
    throw error;
  }

  specialist.specialistInfo.status = "active";
  await specialist.save();

  return specialist;
};

// Admin: Deactivate specialist
const deactivateSpecialist = async (specialistId, requesterRole) => {
  const specialist = await User.findById(specialistId);
  if (!specialist) {
    const error = new Error(translate(ERROR_CODES.SPECIALIST_NOT_FOUND, "en"));
    error.code = ERROR_CODES.SPECIALIST_NOT_FOUND;
    error.status = 404;
    throw error;
  }
  if (specialist.role !== "specialist") {
    const error = new Error(translate(ERROR_CODES.USER_NOT_SPECIALIST, "en"));
    error.code = ERROR_CODES.USER_NOT_SPECIALIST;
    error.status = 400;
    throw error;
  }

  specialist.specialistInfo.status = "inactive";
  await specialist.save();

  return specialist;
};

// Admin: Assign one or more customers to a specialist
const assignCustomersToSpecialist = async (specialistId, customerIds) => {
  const specialist = await User.findById(specialistId);
  if (!specialist) {
    const error = new Error(translate(ERROR_CODES.SPECIALIST_NOT_FOUND, "en"));
    error.code = ERROR_CODES.SPECIALIST_NOT_FOUND;
    error.status = 404;
    throw error;
  }
  if (specialist.role !== "specialist") {
    const error = new Error(translate(ERROR_CODES.USER_NOT_SPECIALIST, "en"));
    error.code = ERROR_CODES.USER_NOT_SPECIALIST;
    error.status = 400;
    throw error;
  }

  // Validate all provided IDs are customers
  const customers = await User.find({
    _id: { $in: customerIds },
    role: "customer",
  }).select("_id");

  if (customers.length !== customerIds.length) {
    const error = new Error(translate(ERROR_CODES.INVALID_CUSTOMER_IDS, "en"));
    error.code = ERROR_CODES.INVALID_CUSTOMER_IDS;
    error.status = 400;
    throw error;
  }

  // Assign all customers to the specialist
  await User.updateMany(
    { _id: { $in: customerIds } },
    { specialist: specialistId },
  );

  return { assignedCount: customerIds.length };
};

const deleteProfile = async (userId, requesterRole) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error(translate(ERROR_CODES.USER_NOT_FOUND, "en"));
    error.code = ERROR_CODES.USER_NOT_FOUND;
    error.status = 404;
    throw error;
  }

  await user.deleteOne();
  return true;
};

// Admin: Dashboard stats
const getDashboardStats = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // 22 queries → 5 parallel $facet aggregations (one round-trip per collection)
  const [
    articleStats,
    recipeStats,
    feedbackStats,
    userStats,
    subscriptionStats,
  ] = await Promise.all([
    Article.aggregate([
      {
        $facet: {
          total: [{ $count: "n" }],
          active: [{ $match: { isHidden: false } }, { $count: "n" }],
          hidden: [{ $match: { isHidden: true } }, { $count: "n" }],
          thisMonth: [
            { $match: { createdAt: { $gte: startOfMonth } } },
            { $count: "n" },
          ],
          activeThisMonth: [
            {
              $match: { isHidden: false, createdAt: { $gte: startOfMonth } },
            },
            { $count: "n" },
          ],
          hiddenThisMonth: [
            {
              $match: { isHidden: true, createdAt: { $gte: startOfMonth } },
            },
            { $count: "n" },
          ],
        },
      },
    ]),

    Recipe.aggregate([
      {
        $facet: {
          total: [{ $count: "n" }],
          active: [{ $match: { isHidden: false } }, { $count: "n" }],
          hidden: [{ $match: { isHidden: true } }, { $count: "n" }],
          thisMonth: [
            { $match: { createdAt: { $gte: startOfMonth } } },
            { $count: "n" },
          ],
          activeThisMonth: [
            {
              $match: { isHidden: false, createdAt: { $gte: startOfMonth } },
            },
            { $count: "n" },
          ],
          hiddenThisMonth: [
            {
              $match: { isHidden: true, createdAt: { $gte: startOfMonth } },
            },
            { $count: "n" },
          ],
        },
      },
    ]),

    Feedback.aggregate([
      {
        $facet: {
          total: [{ $count: "n" }],
          visible: [{ $match: { isHidden: false } }, { $count: "n" }],
          hidden: [{ $match: { isHidden: true } }, { $count: "n" }],
          avgRating: [{ $group: { _id: null, avg: { $avg: "$rating" } } }],
          thisMonth: [
            { $match: { createdAt: { $gte: startOfMonth } } },
            { $count: "n" },
          ],
          visibleThisMonth: [
            {
              $match: { isHidden: false, createdAt: { $gte: startOfMonth } },
            },
            { $count: "n" },
          ],
          hiddenThisMonth: [
            {
              $match: { isHidden: true, createdAt: { $gte: startOfMonth } },
            },
            { $count: "n" },
          ],
        },
      },
    ]),

    User.aggregate([
      {
        $facet: {
          clientsTotal: [{ $match: { role: "customer" } }, { $count: "n" }],
          clientsThisMonth: [
            { $match: { role: "customer", createdAt: { $gte: startOfMonth } } },
            { $count: "n" },
          ],
          unassignedClients: [
            { $match: { role: "customer", specialist: null } },
            { $count: "n" },
          ],
          specialistsTotal: [
            { $match: { role: "specialist" } },
            { $count: "n" },
          ],
          specialistsThisMonth: [
            {
              $match: { role: "specialist", createdAt: { $gte: startOfMonth } },
            },
            { $count: "n" },
          ],
          specialistsActive: [
            {
              $match: { role: "specialist", "specialistInfo.status": "active" },
            },
            { $count: "n" },
          ],
          specialistsActiveThisMonth: [
            {
              $match: {
                role: "specialist",
                "specialistInfo.status": "active",
                createdAt: { $gte: startOfMonth },
              },
            },
            { $count: "n" },
          ],
          specialistsInactive: [
            {
              $match: {
                role: "specialist",
                "specialistInfo.status": "inactive",
              },
            },
            { $count: "n" },
          ],
          specialistsInactiveThisMonth: [
            {
              $match: {
                role: "specialist",
                "specialistInfo.status": "inactive",
                createdAt: { $gte: startOfMonth },
              },
            },
            { $count: "n" },
          ],
        },
      },
    ]),

    UserSubscription.aggregate([
      {
        $facet: {
          active: [{ $match: { status: "active" } }, { $count: "n" }],
          expired: [{ $match: { status: "expired" } }, { $count: "n" }],
          cancelled: [{ $match: { status: "cancelled" } }, { $count: "n" }],
          expiringSoon: [
            {
              $match: {
                status: "active",
                expiryDate: { $gte: now, $lte: sevenDaysFromNow },
              },
            },
            { $count: "n" },
          ],
          thisMonth: [
            { $match: { createdAt: { $gte: startOfMonth } } },
            { $count: "n" },
          ],
          activeThisMonth: [
            {
              $match: {
                status: "active",
                createdAt: { $gte: startOfMonth },
              },
            },
            { $count: "n" },
          ],
          expiredThisMonth: [
            {
              $match: {
                status: "expired",
                createdAt: { $gte: startOfMonth },
              },
            },
            { $count: "n" },
          ],
          cancelledThisMonth: [
            {
              $match: {
                status: "cancelled",
                createdAt: { $gte: startOfMonth },
              },
            },
            { $count: "n" },
          ],
        },
      },
    ]),
  ]);

  // Helper: safely extract a count from a $facet result
  const c = (stats, key) => stats[0]?.[key]?.[0]?.n ?? 0;

  const clientsTotal = c(userStats, "clientsTotal");
  const activeSubscriptions = c(subscriptionStats, "active");
  const expiredSubscriptions = c(subscriptionStats, "expired");
  const cancelledSubscriptions = c(subscriptionStats, "cancelled");
  const rawAvg = feedbackStats[0]?.avgRating?.[0]?.avg ?? null;

  return {
    articles: {
      total: c(articleStats, "total"),
      thisMonth: c(articleStats, "thisMonth"),
      active: c(articleStats, "active"),
      activeThisMonth: c(articleStats, "activeThisMonth"),
      hidden: c(articleStats, "hidden"),
      hiddenThisMonth: c(articleStats, "hiddenThisMonth"),
    },
    recipes: {
      total: c(recipeStats, "total"),
      thisMonth: c(recipeStats, "thisMonth"),
      active: c(recipeStats, "active"),
      activeThisMonth: c(recipeStats, "activeThisMonth"),
      hidden: c(recipeStats, "hidden"),
      hiddenThisMonth: c(recipeStats, "hiddenThisMonth"),
    },
    feedbacks: {
      total: c(feedbackStats, "total"),
      thisMonth: c(feedbackStats, "thisMonth"),
      visible: c(feedbackStats, "visible"),
      visibleThisMonth: c(feedbackStats, "visibleThisMonth"),
      hidden: c(feedbackStats, "hidden"),
      hiddenThisMonth: c(feedbackStats, "hiddenThisMonth"),
      averageRating: rawAvg !== null ? Math.round(rawAvg * 10) / 10 : null,
    },
    clients: {
      total: clientsTotal,
      thisMonth: c(userStats, "clientsThisMonth"),
      unassignedToSpecialist: c(userStats, "unassignedClients"),
    },
    subscriptions: {
      thisMonth: c(subscriptionStats, "thisMonth"),
      active: activeSubscriptions,
      activeThisMonth: c(subscriptionStats, "activeThisMonth"),
      expired: expiredSubscriptions,
      expiredThisMonth: c(subscriptionStats, "expiredThisMonth"),
      cancelled: cancelledSubscriptions,
      cancelledThisMonth: c(subscriptionStats, "cancelledThisMonth"),
      expiringSoon: c(subscriptionStats, "expiringSoon"),
    },
    specialists: {
      total: c(userStats, "specialistsTotal"),
      thisMonth: c(userStats, "specialistsThisMonth"),
      active: c(userStats, "specialistsActive"),
      activeThisMonth: c(userStats, "specialistsActiveThisMonth"),
      inactive: c(userStats, "specialistsInactive"),
      inactiveThisMonth: c(userStats, "specialistsInactiveThisMonth"),
    },
    insights: {
      articlesAddedThisMonth: c(articleStats, "thisMonth"),
      recipesAddedThisMonth: c(recipeStats, "thisMonth"),
      newClientsThisMonth: c(userStats, "clientsThisMonth"),
      newSpecialistsThisMonth: c(userStats, "specialistsThisMonth"),
      subscriptionsExpiringSoon: c(subscriptionStats, "expiringSoon"),
    },
  };
};

export default {
  getProfile,
  searchProfiles,
  updateProfile,
  createSpecialistProfile,
  deleteProfile,
  activateSpecialist,
  deactivateSpecialist,
  assignCustomersToSpecialist,
  getDashboardStats,
};
