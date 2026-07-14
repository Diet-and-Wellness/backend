import Feedback from "#models/feedback.js";
import { ERROR_CODES, translate } from "#utils/localization.js";
import {
  serializeFeedback,
  serializeFeedbacks,
} from "#serializers/feedback.serializer.js";

// Create a new feedback
const createFeedback = async (feedbackData) => {
  try {
    const feedback = new Feedback(feedbackData);
    await feedback.save();

    // Populate user if it exists
    if (feedback.user) {
      await feedback.populate("user", "firstName lastName email");
    }

    return serializeFeedback(feedback);
  } catch (error) {
    throw error;
  }
};

// Get all feedbacks (admin only - includes hidden)
const getAllFeedbacks = async (filters = {}) => {
  const { page = 1, limit = 10, rating, search, sortBy } = filters;

  const query = {};

  // Apply rating filter
  if (rating) {
    query.rating = rating;
  }

  // Apply search filter (search in title, description, userName, userEmail)
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { userName: { $regex: search, $options: "i" } },
      { userEmail: { $regex: search, $options: "i" } },
    ];
  }

  // Determine sort order
  let sortObj = {};
  switch (sortBy) {
    case "oldest":
      sortObj = { createdAt: 1 };
      break;
    case "highestRating":
      sortObj = { rating: -1, createdAt: -1 };
      break;
    case "lowestRating":
      sortObj = { rating: 1, createdAt: -1 };
      break;
    case "newest":
      sortObj = { createdAt: -1 };
      break;
    case "priority":
    default:
      sortObj = { order: 1, createdAt: -1 };
      break;
  }

  try {
    const skip = (page - 1) * limit;

    const [feedbacks, totalCount] = await Promise.all([
      Feedback.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .populate("user", "firstName lastName email"),
      Feedback.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: serializeFeedbacks(feedbacks),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        limit: parseInt(limit),
      },
    };
  } catch (error) {
    throw error;
  }
};

// Get active feedbacks (public endpoint - excludes hidden)
const getActiveFeedbacks = async (filters = {}) => {
  const { page = 1, limit = 10, rating, search, sortBy } = filters;

  const query = {
    isHidden: false,
  };

  // Apply rating filter
  if (rating) {
    query.rating = rating;
  }

  // Apply search filter
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Determine sort order
  let sortObj = {};
  switch (sortBy) {
    case "oldest":
      sortObj = { createdAt: 1 };
      break;
    case "highestRating":
      sortObj = { rating: -1, createdAt: -1 };
      break;
    case "lowestRating":
      sortObj = { rating: 1, createdAt: -1 };
      break;
    case "newest":
      sortObj = { createdAt: -1 };
      break;
    case "priority":
    default:
      sortObj = { order: 1, createdAt: -1 };
      break;
  }

  try {
    const skip = (page - 1) * limit;

    const [feedbacks, totalCount] = await Promise.all([
      Feedback.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .select("-adminNotes"),
      Feedback.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: serializeFeedbacks(feedbacks),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        limit: parseInt(limit),
      },
    };
  } catch (error) {
    throw error;
  }
};

// Get feedback by ID
const getFeedbackById = async (feedbackId) => {
  try {
    const feedback = await Feedback.findById(feedbackId).populate(
      "user",
      "firstName lastName email",
    );

    if (!feedback) {
      const err = new Error(translate(ERROR_CODES.FEEDBACK_NOT_FOUND, "en"));
      err.code = ERROR_CODES.FEEDBACK_NOT_FOUND;
      err.status = 404;
      throw err;
    }

    return serializeFeedback(feedback);
  } catch (error) {
    throw error;
  }
};

// Update feedback (admin only)
const updateFeedback = async (feedbackId, updateData) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(feedbackId, updateData, {
      new: true,
      runValidators: true,
    }).populate("user", "firstName lastName email");

    if (!feedback) {
      const err = new Error(translate(ERROR_CODES.FEEDBACK_NOT_FOUND, "en"));
      err.code = ERROR_CODES.FEEDBACK_NOT_FOUND;
      err.status = 404;
      throw err;
    }

    return serializeFeedback(feedback);
  } catch (error) {
    throw error;
  }
};

// Delete feedback (admin only)
const deleteFeedback = async (feedbackId) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(feedbackId);

    if (!feedback) {
      const err = new Error(translate(ERROR_CODES.FEEDBACK_NOT_FOUND, "en"));
      err.code = ERROR_CODES.FEEDBACK_NOT_FOUND;
      err.status = 404;
      throw err;
    }

    return true;
  } catch (error) {
    throw error;
  }
};

// Hide/Show feedback (admin only)
const toggleFeedbackVisibility = async (feedbackId, isHidden) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      { isHidden },
      { new: true, runValidators: true },
    ).populate("user", "firstName lastName email");

    if (!feedback) {
      const err = new Error(translate(ERROR_CODES.FEEDBACK_NOT_FOUND, "en"));
      err.code = ERROR_CODES.FEEDBACK_NOT_FOUND;
      err.status = 404;
      throw err;
    }

    return serializeFeedback(feedback);
  } catch (error) {
    throw error;
  }
};

// Reorder feedbacks (admin only)
const reorderFeedbacks = async (feedbackUpdates) => {
  try {
    // feedbackUpdates should be array of { id, order }
    const bulkOps = feedbackUpdates.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } },
      },
    }));

    await Feedback.bulkWrite(bulkOps);
    return {
      success: true,
      message: "Feedbacks reordered successfully",
    };
  } catch (error) {
    throw error;
  }
};

export default {
  createFeedback,
  getAllFeedbacks,
  getActiveFeedbacks,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  toggleFeedbackVisibility,
  reorderFeedbacks,
};
