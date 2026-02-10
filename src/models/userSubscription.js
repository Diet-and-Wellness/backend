import mongoose from "mongoose";
import { SUBSCRIPTION_STATUS } from "#modules/subscriptions/subscriptions.constants.js";

// UserSubscription Model - Tracks active subscriptions for each user
// This tells us which subscription plan a user currently has and when it expires
const userSubscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Each user can have only one active subscription
      index: true,
    },
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },
    // Subscription status tracking
    status: {
      type: String,
      enum: Object.values(SUBSCRIPTION_STATUS),
      default: "active",
      index: true,
    },
    // Timeline for subscription
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
      index: true, // For efficient expiry queries
    },
    // Track subscription history - how many times user has subscribed
    subscriptionCount: {
      type: Number,
      default: 1,
      min: 1,
    },
    // Reference to the order that created this subscription
    currentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    // Renewal tracking
    isAutoRenewalEnabled: {
      type: Boolean,
      default: false,
    },
    lastRenewalDate: {
      type: Date,
    },
    renewalOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    // Cancellation tracking
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
    },
  },
  { timestamps: true },
);

// Pre-save hook to update status based on expiry date
userSubscriptionSchema.pre("save", function () {
  if (this.status === "active") {
    if (this.expiryDate < new Date()) {
      this.status = "expired";
    }
  }
});

// Compound index for efficient queries
userSubscriptionSchema.index({ status: 1, expiryDate: 1 });

userSubscriptionSchema.methods.toJSON = function () {
  const userSubscription = this.toObject();

  // Remove sensitive fields
  delete userSubscription.__v;

  delete userSubscription.webhookData; // Do not expose raw webhook data in API responses

  // Rename fields
  userSubscription.id = userSubscription._id;
  delete userSubscription._id;

  // Include subscription details if populated
  if (
    userSubscription.subscription &&
    typeof userSubscription.subscription === "object"
  ) {
    userSubscription.subscription = {
      id: userSubscription.subscription._id,
      name: userSubscription.subscription.name,
      displayName: userSubscription.subscription.displayName,
      price: userSubscription.subscription.price,
      durationInDays: userSubscription.subscription.durationInDays,
      description: userSubscription.subscription.description,
    };
  }

  return userSubscription;
};

export default mongoose.model("UserSubscription", userSubscriptionSchema);
