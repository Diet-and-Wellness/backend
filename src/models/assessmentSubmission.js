import mongoose from "mongoose";

const answerSnapshotSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    questionText: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    choiceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    choiceText: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    score: { type: Number, required: true },
    wasConditional: { type: Boolean, default: false },
  },
  { _id: false },
);

const resultSnapshotSchema = new mongoose.Schema(
  {
    label: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    description: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    recommendations: {
      type: [
        {
          en: { type: String, required: true },
          ar: { type: String, required: true },
        },
      ],
      default: [],
    },
  },
  { _id: false },
);

const sectionResultSchema = new mongoose.Schema(
  {
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssessmentSection",
      required: true,
    },
    sectionTitle: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    sectionScore: { type: Number, required: true, min: 0 },
    result: { type: resultSnapshotSchema, required: true },
    answers: { type: [answerSnapshotSchema], default: [] },
  },
  { _id: false },
);

const assessmentSubmissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    form: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssessmentForm",
      required: true,
    },
    // in_progress: section-by-section flow is ongoing
    // completed: all sections answered and finalized
    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
      index: true,
    },
    totalScore: { type: Number, default: 0 },
    sectionResults: { type: [sectionResultSchema], default: [] },
    submittedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// One submission per user per form
assessmentSubmissionSchema.index({ user: 1, form: 1 }, { unique: true });

assessmentSubmissionSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

const AssessmentSubmission = mongoose.model(
  "AssessmentSubmission",
  assessmentSubmissionSchema,
);
export default AssessmentSubmission;
