import mongoose from "mongoose";
import {
  SUBSCRIPTION_TYPES,
  SUBSCRIPTION_DURATIONS,
} from "#modules/subscriptions/subscriptions.constants.js";

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
      type: String,
      required: true, // e.g., "1 Month", "3 Months"
    },
    durationInDays: {
      type: Number,
      required: true,
      enum: Object.values(SUBSCRIPTION_DURATIONS),
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "EGP",
    },
    description: {
      type: String,
      default: "",
    },
    features: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

subscriptionSchema.methods.toJSON = function () {
  const subscription = this.toObject();

  // Remove sensitive fields
  delete subscription.__v;
  delete subscription.isHidden;

  // Rename fields
  subscription.id = subscription._id;
  delete subscription._id;

  return subscription;
};

export default mongoose.model("Subscription", subscriptionSchema);
