import mongoose from "mongoose";

const assessmentFormSchema = new mongoose.Schema(
  {
    title: {
      en: { type: String, required: true, trim: true },
      ar: { type: String, required: true, trim: true },
    },
    description: {
      en: { type: String, trim: true, default: "" },
      ar: { type: String, trim: true, default: "" },
    },
    isActive: { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sections: [
      { type: mongoose.Schema.Types.ObjectId, ref: "AssessmentSection" },
    ],
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

const AssessmentForm = mongoose.model("AssessmentForm", assessmentFormSchema);
export default AssessmentForm;
