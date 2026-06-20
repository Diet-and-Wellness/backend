import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      // required: true,
      trim: true,
      index: true,
    },
    content: {
      type: String,
      // required: true,
      trim: true,
    },
    rating: {
      type: Number,
      // required: true,
      min: 1,
      max: 5,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      sparse: true,
    },
    isHidden: {
      type: Boolean,
      default: false,
      index: true,
    },
    attachmentUrl: {
      type: String,
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },
    crop: {
      type: String,
      enum: ["full", "cropped"],
      default: "full",
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ isHidden: 1, createdAt: -1 });
feedbackSchema.index({ order: 1, createdAt: -1 });

feedbackSchema.methods.toJSON = function () {
  const feedback = this.toObject();

  // Remove sensitive fields
  delete feedback.__v;

  // Rename fields
  feedback.id = feedback._id;
  delete feedback._id;

  return feedback;
};

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
