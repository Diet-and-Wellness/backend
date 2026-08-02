import mongoose from "mongoose";
import {
  SUBSCRIPTION_TYPES,
  SUBSCRIPTION_DURATIONS,
  SUBSCRIPTION_PLAN_TYPES,
  ACTIVE_DAYS,
} from "#modules/subscriptions/subscriptions.constants.js";
import { translateField } from "#modules/subscriptions/subscriptions.helpers.js";

// Subscription Plan Model - Stores available subscription types offered by the system
const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      enum: Object.values(SUBSCRIPTION_TYPES),
    },
    displayName: {
      type: {
        _id: false,
        ar: { type: String, required: true, trim: true },
        en: { type: String, required: true, trim: true },
      },
      required: true, // e.g., "1 Month", "3 Months"
    },
    durationInDays: {
      type: Number,
      required() {
        return this.type !== SUBSCRIPTION_PLAN_TYPES.ONE_TIME_OFFER;
      },
      enum: Object.values(SUBSCRIPTION_DURATIONS),
      validate: {
        validator(value) {
          return (
            this.type !== SUBSCRIPTION_PLAN_TYPES.ONE_TIME_OFFER ||
            value == null
          );
        },
        message: "One-time offers cannot have a subscription duration",
      },
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: ["EGP"],
      default: "EGP",
    },
    description: {
      type: {
        _id: false,
        ar: { type: String, required: true, trim: true },
        en: { type: String, required: true, trim: true },
      },
      default: "",
    },
    features: {
      type: [
        {
          _id: false,
          ar: { type: String, required: true, trim: true },
          en: { type: String, required: true, trim: true },
        },
      ],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    mostPopular: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: Object.values(SUBSCRIPTION_PLAN_TYPES),
      default: SUBSCRIPTION_PLAN_TYPES.SUBSCRIPTION_PLAN,
      validate: {
        validator(value) {
          return (
            this.name !== SUBSCRIPTION_TYPES.ASSESSMENT_RESULTS ||
            value === SUBSCRIPTION_PLAN_TYPES.ONE_TIME_OFFER
          );
        },
        message: "The assessment results plan must be a one-time offer",
      },
    },
    activeDays: {
      type: [String],
      enum: Object.values(ACTIVE_DAYS),
      default: [],
    },
    responseTimeInHours: {
      type: Number,
      default: 5,
    },
    planNote: {
      type: {
        _id: false,
        ar: { type: String, required: true, trim: true },
        en: { type: String, required: true, trim: true },
      },
      default: "",
      maxlength: 200,
    },
  },
  { timestamps: true },
);

subscriptionSchema.methods.toJSON = function () {
  const subscription = this.toObject();

  // Remove sensitive fields
  delete subscription.__v;
  delete subscription.isHidden;

  const lang = this._lang || "en"; // default language
  subscription.displayName = translateField(subscription.displayName, lang);
  subscription.description = translateField(subscription.description, lang);
  subscription.planNote = translateField(subscription.planNote, lang);
  subscription.features = (subscription.features || []).map((f) =>
    translateField(f, lang),
  );
  subscription.currency = translateField(subscription.currency, lang);

  // Rename fields
  subscription.id = subscription._id;
  delete subscription._id;

  return subscription;
};

export default mongoose.model("Subscription", subscriptionSchema);
