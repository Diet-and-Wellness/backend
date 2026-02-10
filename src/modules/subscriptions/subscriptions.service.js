import mongoose from "mongoose";
import Subscription from "#models/subscription.js";
import Order from "#models/order.js";
import UserSubscription from "#models/userSubscription.js";
import { createPaymentIntention, generateCheckoutUrl } from "#utils/paymob.js";
import sendEmail from "#utils/email.js";
import {
  calculateExpiryDate,
  getDaysRemaining,
} from "./subscriptions.helpers.js";
import { ERROR_CODES, createError } from "#utils/localization.js";

// ============ SUBSCRIPTION PLANS ============

export const getAllSubscriptions = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const subscriptions = await Subscription.find({ isActive: true })
    .skip(skip)
    .limit(limit);

  const total = await Subscription.countDocuments({ isActive: true });

  return {
    data: subscriptions,
    pagination: {
      page,
      limit,
      total: total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getSubscriptionById = async (subscriptionId) => {
  return await Subscription.findById(subscriptionId);
};

export const createSubscription = async (subscriptionData) => {
  const subscription = new Subscription(subscriptionData);
  return await subscription.save();
};

export const updateSubscription = async (subscriptionId, updateData) => {
  const { name, ...allowedUpdates } = updateData;

  const subscription = await Subscription.findByIdAndUpdate(
    subscriptionId,
    allowedUpdates,
    { new: true, runValidators: true },
  );

  if (!subscription) {
    const error = createError(ERROR_CODES.SUBSCRIPTION_NOT_FOUND, 404, "en");
    throw error;
  }

  return subscription;
};

export const deleteSubscription = async (subscriptionId) => {
  const subscription = await Subscription.findByIdAndUpdate(
    subscriptionId,
    { isActive: false },
    { new: true },
  );

  if (!subscription) {
    const error = createError(ERROR_CODES.SUBSCRIPTION_NOT_FOUND, 404, "en");
    throw error;
  }

  return subscription;
};

export const getAllSubscriptionsAdmin = async (
  page = 1,
  limit = 10,
  includeInactive = true,
) => {
  const filter = includeInactive ? {} : { isActive: true };
  const skip = (page - 1) * limit;

  const subscriptions = await Subscription.find(filter).skip(skip).limit(limit);

  const total = await Subscription.countDocuments(filter);

  return {
    data: subscriptions,
    pagination: {
      page,
      limit,
      total: total,
      pages: Math.ceil(total / limit),
    },
  };
};

// ============ ORDER & PAYMENT FLOW ============

// Step 1: Create an order for subscription purchase
export const createSubscriptionOrder = async (userId, subscriptionId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate user ID
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      const error = createError(ERROR_CODES.INVALID_INPUT, 400, "en");
      throw error;
    }

    // Validate subscription exists and is active
    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      isActive: true,
    }).session(session);

    if (!subscription) {
      const error = createError(ERROR_CODES.SUBSCRIPTION_NOT_FOUND, 404, "en");
      throw error;
    }

    // Validate user exists
    const User = await import("#models/user.js")
      .then((m) => m.default)
      .catch(() => null);
    const userExists = await User.findById(userId).session(session);
    if (!userExists) {
      const error = createError(ERROR_CODES.USER_NOT_FOUND, 404, "en");
      throw error;
    }

    // Create order in database
    const order = new Order({
      user: userId,
      subscription: subscriptionId,
      amount: subscription.price,
      currency: subscription.currency || "EGP",
      status: "pending",
      paymentMethod: "card",
    });

    await order.save({ session });
    await session.commitTransaction();

    console.log(`Order created: ${order._id} for user: ${userId}`);
    return order;
  } catch (error) {
    await session.abortTransaction();
    console.error("Error creating subscription order:", error);
    throw error;
  } finally {
    session.endSession();
  }
};

// Step 2: Generate payment intention with Paymob
export const initiatePayment = async (orderId, user_id) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate IDs
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      const error = createError(ERROR_CODES.INVALID_INPUT, 400, "en");
      throw error;
    }

    if (!user_id || !mongoose.Types.ObjectId.isValid(user_id)) {
      const error = createError(ERROR_CODES.INVALID_INPUT, 400, "en");
      throw error;
    }

    // Validate user exists
    const User = await import("#models/user.js")
      .then((m) => m.default)
      .catch(() => null);
    const user = await User.findById(user_id).session(session);
    if (!user) {
      const error = createError(ERROR_CODES.USER_NOT_FOUND, 404, "en");
      throw error;
    }

    // Get order with subscription details (within transaction)
    const order = await Order.findById(orderId)
      .populate(
        "subscription",
        "id displayName price durationInDays description isActive features currency",
      )
      .session(session);

    if (!order) {
      const error = createError(ERROR_CODES.ORDER_NOT_FOUND, 404, "en");
      throw error;
    }

    // Validate order belongs to user
    if (order.user.toString() !== user_id) {
      const error = createError(ERROR_CODES.UNAUTHORIZED, 401, "en");
      throw error;
    }

    // Validate order is in pending status
    if (order.status !== "pending") {
      const error = createError(ERROR_CODES.INVALID_ORDER_STATUS, 400, "en");
      throw error;
    }

    // Create payment intention with Paymob
    const intention = await createPaymentIntention(
      orderId.toString(),
      order.amount,
      order.subscription,
      user,
    );

    // Update order with Paymob intention details (within transaction)
    order.paymobIntentionId = intention.id;
    order.paymobOrderId = intention.intention_order_id;
    order.status = "processing";
    await order.save({ session });

    await session.commitTransaction();

    // Generate checkout URL for user redirection (after successful commit)
    const checkoutUrl = generateCheckoutUrl(intention.client_secret);

    console.log(
      `Payment initiated for order ${orderId}, intention: ${intention.id}`,
    );

    return {
      orderId: order._id,
      checkoutUrl,
      intentionId: intention.id,
      clientSecret: intention.client_secret,
      intentionOrderId: intention.intention_order_id,
    };
  } catch (error) {
    await session.abortTransaction();
    console.error("Error initiating payment:", error);
    throw error;
  } finally {
    session.endSession();
  }
};

// Step 3: Handle successful payment (called after user completes payment via webhook)
const handlePaymentSuccess = async (orderId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate order ID
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      const error = createError(ERROR_CODES.INVALID_INPUT, 400, "en");
      throw error;
    }

    // Update order status
    const order = await Order.findById(orderId)
      .populate(
        "subscription",
        "id displayName price currency durationInDays description isActive features",
      )
      .populate("user", "id firstName lastName email phone")
      .session(session);

    if (!order) {
      const error = createError(ERROR_CODES.ORDER_NOT_FOUND, 404, "en");
      throw error;
    }

    // The webhook has already been HMAC verified, so we can trust the payment success
    // Update order status
    order.status = "success";
    order.paymentMethod = "card";
    await order.save({ session });

    // Create or update user subscription
    let userSubscription = await UserSubscription.findOne({
      user: order.user._id,
    }).session(session);

    const subscription = order.subscription;
    const startDate = new Date();
    const expiryDate = calculateExpiryDate(
      subscription.durationInDays,
      userSubscription?.expiryDate,
    );

    console.log("Creating/Updating user subscription for order:", orderId);

    if (userSubscription) {
      // User already has a subscription - increment count and update expiry
      userSubscription.subscription = subscription._id;
      userSubscription.status = "active";
      userSubscription.expiryDate = expiryDate;
      userSubscription.subscriptionCount += 1;
      userSubscription.currentOrder = order._id;
      userSubscription.lastRenewalDate = startDate;
    } else {
      // First time subscription
      userSubscription = new UserSubscription({
        user: order.user._id,
        subscription: subscription._id,
        startDate,
        expiryDate,
        currentOrder: order._id,
        subscriptionCount: 1,
      });
    }

    await userSubscription.save({ session });
    await session.commitTransaction();

    console.log(
      `Payment success processed for user: ${order.user._id}, expires: ${expiryDate}`,
    );

    return {
      success: true,
      userSubscription,
    };
  } catch (error) {
    await session.abortTransaction();
    console.error("Error handling payment success:", error);
    throw error;
  } finally {
    session.endSession();
  }
};

// Step 3: Handle failed or cancelled payment
const handlePaymentFailure = async (orderId, reason = "Payment failed") => {
  try {
    // Validate order ID
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      const error = createError(ERROR_CODES.INVALID_INPUT, 400, "en");
      throw error;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      const error = createError(ERROR_CODES.ORDER_NOT_FOUND, 404, "en");
      throw error;
    }

    order.status = "failed";
    order.failureReason = reason || "Payment declined by payment gateway";
    await order.save();

    console.log(`Payment failed for order: ${orderId}, reason: ${reason}`);

    return {
      success: false,
      orderId: order._id,
    };
  } catch (error) {
    console.error("Error handling payment failure:", error);
    throw error;
  }
};

// ============ USER SUBSCRIPTION MANAGEMENT ============

// Get user's current subscription
export const getUserSubscription = async (userId) => {
  return await UserSubscription.findOne({ userId })
    .populate(
      "subscription",
      "id displayName price currency durationInDays description isActive features",
    )
    .populate("currentOrder", "id subscription amount status createdAt");
};

// Check if user is subscribed and subscription is active
export const isUserSubscribed = async (userId) => {
  try {
    // Validate user ID
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return false;
    }

    const userSubscription = await UserSubscription.findOne({
      user: userId,
      status: "active",
    });

    if (!userSubscription) {
      return false;
    }

    // Check if subscription hasn't expired
    const expired = userSubscription.expiryDate < new Date();

    if (userSubscription.status === "active" && expired) {
      userSubscription.status = "expired";
      await userSubscription.save();
      return false;
    }

    return !expired;
  } catch (error) {
    console.error("Error checking user subscription:", error);
    return false;
  }
};

// Get subscription status for a user
export const getUserSubscriptionStatus = async (userId) => {
  try {
    // Validate user ID
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      const error = createError(ERROR_CODES.INVALID_INPUT, 400, "en");
      throw error;
    }

    let userSubscription = await UserSubscription.findOne({ user: userId })
      .populate(
        "subscription",
        "id displayName price currency durationInDays description isActive features",
      )
      .populate(
        "currentOrder",
        "id currency amount status paymentMethod webhookReceived createdAt",
      );

    if (!userSubscription) {
      return {
        isSubscribed: false,
        status: null,
      };
    }

    const now = new Date();
    const isExpired = userSubscription.expiryDate < now;
    if (userSubscription.status === "active" && isExpired) {
      userSubscription.status = "expired";
      userSubscription = await userSubscription.save();
    }

    return {
      id: userSubscription._id,
      currentOrder: userSubscription.currentOrder,
      isSubscribed: !isExpired,
      status: userSubscription.status,
      subscription: userSubscription.subscription,
      expiryDate: userSubscription.expiryDate,
      subscriptionCount: userSubscription.subscriptionCount,
      daysRemaining: getDaysRemaining(userSubscription.expiryDate),
      startDate: userSubscription.startDate,
      lastRenewalDate: userSubscription.lastRenewalDate,
    };
  } catch (error) {
    console.error("Error getting user subscription status:", error);
    throw error;
  }
};

// Get user subscription history (all orders)
export const getUserSubscriptionHistory = async (
  userId,
  limit = 10,
  page = 1,
) => {
  try {
    // Validate user ID
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      const error = createError(ERROR_CODES.INVALID_INPUT, 400, "en");
      throw error;
    }

    // Validate pagination
    const validLimit = Math.min(Math.max(limit, 1), 100);
    const skip = (page - 1) * validLimit;

    const [history, total] = await Promise.all([
      Order.find({ user: userId })
        .populate(
          "subscription",
          "id displayName price currency durationInDays description isActive features",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(validLimit),
      Order.countDocuments({ user: userId }),
    ]);

    return {
      data: history,
      pagination: {
        total,
        page,
        limit: validLimit,
        pages: Math.ceil(total / validLimit),
      },
    };
  } catch (error) {
    console.error("Error getting user subscription history:", error);
    throw error;
  }
};

// Cancel user subscription
export const cancelUserSubscription = async (userId, reason = "") => {
  const userSubscription = await UserSubscription.findOne({ user: userId });

  if (!userSubscription) {
    throw new Error("No active subscription found");
  }

  userSubscription.status = "cancelled";
  userSubscription.cancelledAt = new Date();
  userSubscription.cancellationReason = reason;
  await userSubscription.save();

  return userSubscription;
};

// Renew subscription for user
export const renewSubscription = async (userId, userSubscriptionId) => {
  try {
    // Initiate payment
    const user = await (
      await import("#models/user.js").then((m) => m.default).catch(() => null)
    ).findById(userId);
    if (!user) {
      const error = createError(ERROR_CODES.USER_NOT_FOUND, 404, "en");
      throw error;
    }

    const userSubscription =
      await UserSubscription.findById(userSubscriptionId);
    if (!userSubscription || userSubscription.user.toString() !== userId) {
      const error = createError(ERROR_CODES.SUBSCRIPTION_NOT_FOUND, 404, "en");
      throw error;
    }
    const subscriptionId = userSubscription.subscription._id;

    // Create order for renewal
    const order = await createSubscriptionOrder(userId, subscriptionId);

    const paymentDetails = await initiatePayment(order._id, user);

    return {
      order: order._id,
      ...paymentDetails,
    };
  } catch (error) {
    console.error("Error renewing subscription:", error);
    throw error;
  }
};

// ============ WEBHOOK & CALLBACK HANDLING ============

// Process webhook callback from Paymob
export const processPaymentCallback = async (callbackData, isVerified) => {
  try {
    // Verify HMAC signature (source of truth)
    if (!isVerified) {
      console.error(
        "Webhook signature verification failed - rejecting webhook",
      );
      return false;
    }

    // Validate webhook data structure
    if (!callbackData || typeof callbackData !== "object") {
      console.error("Invalid webhook data structure");
      return false;
    }

    // Extract all possible order identifiers from webhook
    const paymobOrderId = callbackData.obj?.order?.id;
    const transactionId = callbackData.obj?.id;
    const redirectionUrl =
      callbackData.obj?.payment_key_claims?.redirection_url;

    // Try to extract orderId from redirection URL as last resort
    let orderId = null;
    if (redirectionUrl && typeof redirectionUrl === "string") {
      try {
        const url = new URL(redirectionUrl);
        orderId = url.searchParams.get("orderId");
      } catch (e) {
        console.log("Could not parse redirection URL from webhook");
      }
    }

    // Find order in database using any of the identifiers (in order of reliability)
    let order = null;

    if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
      order = await Order.findById(orderId)
        .populate(
          "subscription",
          "id displayName price currency durationInDays description isActive features",
        )
        .populate("user", "id firstName lastName email phone");
    }

    if (!order && paymobOrderId) {
      order = await Order.findOne({ paymobOrderId })
        .populate(
          "subscription",
          "id displayName price currency durationInDays description isActive features",
        )
        .populate("user", "id firstName lastName email phone");
    }

    if (!order && transactionId) {
      order = await Order.findOne({
        paymobTransactionId: transactionId,
      })
        .populate(
          "subscription",
          "id displayName price currency durationInDays description isActive features",
        )
        .populate("user", "id firstName lastName email phone");
    }

    if (!order) {
      console.error(
        "Order not found - webhook identifiers: orderId:",
        orderId,
        "paymobOrderId:",
        paymobOrderId,
        "transactionId:",
        transactionId,
      );
      return false;
    }

    // Mark webhook as received and save transaction details
    order.webhookReceived = true;
    order.webhookData = callbackData;
    if (transactionId) {
      order.paymobTransactionId = transactionId;
    }
    if (paymobOrderId) {
      order.paymobOrderId = paymobOrderId;
    }
    await order.save();

    // Process based on payment success status
    if (callbackData.obj?.success === true) {
      await handlePaymentSuccess(order._id);
    } else {
      const failureReason =
        callbackData.obj?.error_message ||
        callbackData.error_message ||
        "Payment declined by payment gateway";
      await handlePaymentFailure(order._id, failureReason);
    }

    return true;
  } catch (error) {
    console.error("Error processing payment callback:", error);
    throw error;
  }
};

// ============ HELPER FUNCTIONS ============

// Send subscription confirmation email
const sendSubscriptionConfirmationEmail = async (
  user,
  subscription,
  expiryDate,
) => {
  try {
    const expiryFormatted = expiryDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    await sendEmail({
      to: user.email,
      subject: `Subscription Confirmed - ${subscription.displayName}`,
      html: `
        <h2>Thank you for your subscription!</h2>
        <p>Your subscription has been activated successfully.</p>
        <ul>
          <li><strong>Plan:</strong> ${subscription.displayName}</li>
          <li><strong>Duration:</strong> ${subscription.durationInDays} days</li>
          <li><strong>Expiry Date:</strong> ${expiryFormatted}</li>
        </ul>
        <p>Enjoy your subscription benefits!</p>
      `,
    });
  } catch (error) {
    console.error("Error sending subscription confirmation email:", error);
  }
};

// Should be run periodically (e.g., via cron job)
export const checkAndUpdateExpiredSubscriptions = async () => {
  try {
    const now = new Date();
    const result = await UserSubscription.updateMany(
      {
        status: "active",
        expiryDate: { $lt: now },
      },
      {
        status: "expired",
      },
    );

    console.log(
      `Updated ${result.modifiedCount} expired subscriptions to expired status`,
    );
    return result;
  } catch (error) {
    console.error("Error updating expired subscriptions:", error);
    throw error;
  }
};
