import feedbacksService from "./feedbacks.service.js";
import { getLanguage, translate, getFieldName } from "#utils/localization.js";
import cloudinaryService from "#utils/cloudinary.js";

// Create a new feedback (public endpoint)
const createFeedback = async (req, res, next) => {
  try {
    const feedbackData = {
      title: req.body.title,
      rating: req.body.rating,
      content: req.body.content,
      attachmentUrl: req.body.attachmentUrl || null,
      user: req.user?.user_id || null,
      ...(req.body.theme !== undefined && { theme: req.body.theme }),
      ...(req.body.crop !== undefined && { crop: req.body.crop }),
    };

    const result = await feedbacksService.createFeedback(feedbackData);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// Get all feedbacks (admin only - includes hidden)
const getAllFeedbacks = async (req, res, next) => {
  try {
    const filters = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      rating: req.query.rating,
      search: req.query.search,
      sortBy: req.query.sortBy,
    };

    const result = await feedbacksService.getAllFeedbacks(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get active feedbacks (public endpoint - excludes hidden)
const getActiveFeedbacks = async (req, res, next) => {
  try {
    const filters = {
      page: req.query.page || 1,
      limit: req.query.limit || 10,
      rating: req.query.rating,
      search: req.query.search,
      sortBy: req.query.sortBy,
    };

    const result = await feedbacksService.getActiveFeedbacks(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get feedback by ID
const getFeedbackById = async (req, res, next) => {
  try {
    const result = await feedbacksService.getFeedbackById(
      req.params.feedbackId,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Update feedback (admin only)
const updateFeedback = async (req, res, next) => {
  try {
    const updateData = {
      ...(req.body.title && { title: req.body.title }),
      ...(req.body.content && { content: req.body.content }),
      ...(req.body.rating && { rating: req.body.rating }),
      ...(req.body.attachmentUrl && { attachmentUrl: req.body.attachmentUrl }),
      ...(req.body.theme !== undefined && { theme: req.body.theme }),
      ...(req.body.crop !== undefined && { crop: req.body.crop }),
    };

    // get feedback by ID
    const feedback = await feedbacksService.getFeedbackById(
      req.params.feedbackId,
    );
    if (!feedback) {
      const err = new Error(
        translate(ERROR_CODES.FEEDBACK_NOT_FOUND, getLanguage(req)),
      );
      err.code = ERROR_CODES.FEEDBACK_NOT_FOUND;
      err.status = 404;
      throw err;
    }

    if (
      feedback.attachmentUrl &&
      updateData.attachmentUrl !== feedback.attachmentUrl
    ) {
      await cloudinaryService.deleteImage(feedback.attachmentUrl);
    }

    const result = await feedbacksService.updateFeedback(
      req.params.feedbackId,
      updateData,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Delete feedback (admin only)
const deleteFeedback = async (req, res, next) => {
  try {
    // get feedback by ID
    const feedback = await feedbacksService.getFeedbackById(
      req.params.feedbackId,
    );
    if (!feedback) {
      const err = new Error(
        translate(ERROR_CODES.FEEDBACK_NOT_FOUND, getLanguage(req)),
      );
      err.code = ERROR_CODES.FEEDBACK_NOT_FOUND;
      err.status = 404;
      throw err;
    }

    if (feedback.attachmentUrl) {
      await cloudinaryService.deleteImage(feedback.attachmentUrl);
    }

    const result = await feedbacksService.deleteFeedback(req.params.feedbackId);
    res.json({
      message: translate("DELETE_SUCCESS", getLanguage(req), {
        item: getFieldName("feedback", getLanguage(req)),
      }),
    });
  } catch (error) {
    next(error);
  }
};

// Hide/Show feedback (admin only)
const toggleFeedbackVisibility = async (req, res, next) => {
  try {
    const { isHidden } = req.body;
    const result = await feedbacksService.toggleFeedbackVisibility(
      req.params.feedbackId,
      isHidden,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Reorder feedbacks (admin only)
const reorderFeedbacks = async (req, res, next) => {
  try {
    const result = await feedbacksService.reorderFeedbacks(req.body.updates);
    res.json(result);
  } catch (error) {
    next(error);
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
