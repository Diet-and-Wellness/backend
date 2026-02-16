import Feedback from "#models/feedback.js";

export const checkFeedbackExists = async (req, res, next) => {
  const { feedbackId } = req.params;
  const feedback = await Feedback.findById(feedbackId);
  if (!feedback) {
    return res.status(404).json({
      message: "feedback not found",
    });
  }
  req.feedback = feedback;
  next();
};
