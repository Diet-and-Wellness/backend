import mongoose from "mongoose";

const idTransform = (doc, ret) => {
  ret.id = ret._id;
  delete ret._id;
};

const choiceSchema = new mongoose.Schema(
  {
    text: {
      en: { type: String, required: true, trim: true },
      ar: { type: String, required: true, trim: true },
    },
    score: { type: Number, required: true, min: 0, max: 10 },
  },
  {
    _id: true,
    toJSON: { transform: idTransform },
    toObject: { transform: idTransform },
  },
);

const conditionSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    choiceIds: {
      type: [mongoose.Schema.Types.ObjectId],
      required: true,
      validate: {
        validator: (arr) => arr.length >= 1,
        message: "condition.choiceIds must contain at least one choice ID",
      },
    },
  },
  { _id: false },
);

const questionSchema = new mongoose.Schema(
  {
    text: {
      en: { type: String, required: true, trim: true },
      ar: { type: String, required: true, trim: true },
    },
    order: { type: Number, required: true, min: 1 },
    condition: { type: conditionSchema, default: null },
    choices: {
      type: [choiceSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length >= 2 && arr.length <= 10,
        message: "A question must have between 2 and 10 choices",
      },
    },
  },
  {
    _id: true,
    toJSON: { transform: idTransform },
    toObject: { transform: idTransform },
  },
);

const resultRangeSchema = new mongoose.Schema(
  {
    minScore: { type: Number, required: true, min: 0 },
    maxScore: { type: Number, required: true, min: 0 },
    label: {
      en: { type: String, required: true, trim: true },
      ar: { type: String, required: true, trim: true },
    },
    description: {
      en: { type: String, required: true, trim: true },
      ar: { type: String, required: true, trim: true },
    },
    recommendations: {
      type: [
        {
          en: { type: String, required: true, trim: true },
          ar: { type: String, required: true, trim: true },
        },
      ],
      default: [],
    },
  },
  { _id: false },
);

const assessmentSectionSchema = new mongoose.Schema(
  {
    form: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AssessmentForm",
      required: true,
      index: true,
    },
    title: {
      en: { type: String, required: true, trim: true },
      ar: { type: String, required: true, trim: true },
    },
    description: {
      en: { type: String, trim: true, default: "" },
      ar: { type: String, trim: true, default: "" },
    },
    order: { type: Number, required: true, min: 1 },
    questions: { type: [questionSchema], default: [] },
    resultRanges: {
      type: [resultRangeSchema],
      validate: {
        validator: function (ranges) {
          if (!ranges || ranges.length === 0) return false;
          const sorted = [...ranges].sort((a, b) => a.minScore - b.minScore);
          if (sorted[0].minScore !== 0) return false;
          for (let i = 0; i < sorted.length; i++) {
            if (sorted[i].maxScore <= sorted[i].minScore) return false;
            if (i > 0 && sorted[i].minScore !== sorted[i - 1].maxScore + 1)
              return false;
          }
          return true;
        },
        message:
          "Result ranges must be non-empty, start at 0, and be contiguous with no gaps or overlaps",
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
    toObject: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  },
);

const AssessmentSection = mongoose.model(
  "AssessmentSection",
  assessmentSectionSchema,
);
export default AssessmentSection;
