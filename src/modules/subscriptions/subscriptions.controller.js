import {
  getAllSubscriptions,
  getSubscriptionById,
  createSubscriptionOrder,
  initiatePayment,
  getUserSubscription,
  isUserSubscribed,
  getUserSubscriptionStatus,
  getUserSubscriptionHistory,
  cancelUserSubscription,
  renewSubscription,
  processPaymentCallback,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getAllSubscriptionsAdmin,
} from "./subscriptions.service.js";
import {
  verifyTransactionCallbackSignature,
  getPaymobTransaction,
} from "#utils/paymob.js";
import { ERROR_CODES, getLanguage, translate } from "#utils/localization.js";

// ============ PUBLIC ENDPOINTS ============

// Fetch all available subscription plans
export const getSubscriptions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type || null;
    const result = await getAllSubscriptions(page, limit, type);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Get current user's subscription status (requires auth)
export const getMySubscriptionStatus = async (req, res, next) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: translate(ERROR_CODES.UNAUTHORIZED, getLanguage(req)),
      });
    }

    const status = await getUserSubscriptionStatus(userId);

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
};

// Get user's subscription history (requires auth)
export const getMySubscriptionHistory = async (req, res, next) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: translate(ERROR_CODES.UNAUTHORIZED, getLanguage(req)),
      });
    }

    const limit = parseInt(req.query.limit) || 10;
    const history = await getUserSubscriptionHistory(userId, limit);

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

// ============ PAYMENT FLOW ENDPOINTS ============

// POST /api/subscriptions/:subscriptionId/purchase
// Step 1: Create order and initiate payment
export const purchaseSubscription = async (req, res, next) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: translate(ERROR_CODES.UNAUTHORIZED, getLanguage(req)),
      });
    }

    const { subscriptionId } = req.params;

    // Validate subscription exists
    const subscription = await getSubscriptionById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: translate(
          ERROR_CODES.SUBSCRIPTION_NOT_FOUND,
          getLanguage(req),
        ),
      });
    }

    // Create order
    const order = await createSubscriptionOrder(userId, subscriptionId);

    // Initiate payment with Paymob
    const paymentDetails = await initiatePayment(order._id, userId);

    res.status(200).json({
      success: true,
      message: translate(ERROR_CODES.PAYMENT_INITIATED, getLanguage(req)),
      data: {
        orderId: paymentDetails.orderId,
        checkoutUrl: paymentDetails.checkoutUrl,
        intentionOrderId: paymentDetails.intentionOrderId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Step 2: Webhook callback from Paymob
// Verifies HMAC signature and processes payment status
export const handlePaymentWebhook = async (req, res, next) => {
  try {
    const hmacSignature = req.query.hmac;

    if (!hmacSignature) {
      console.error("Missing HMAC signature in webhook");
      return res.status(401).json({
        success: false,
        message: translate(
          ERROR_CODES.WEBHOOK_VERIFICATION_FAILED,
          getLanguage(req),
        ),
      });
    }

    // Verify webhook signature
    const isVerified = verifyTransactionCallbackSignature(
      req.body,
      hmacSignature,
    );
    // if (!isVerified) {
    //   console.warn("Webhook signature verification failed");
    //   res.status(401).json({
    //     success: false,
    //     message: translate(
    //       ERROR_CODES.WEBHOOK_VERIFICATION_FAILED,
    //       getLanguage(req),
    //     ),
    //   });
    // }

    // Process callback regardless of verification status (for logging)
    const result = await processPaymentCallback(req.body, isVerified);
    if (!result) {
      return res.status(401).json({
        success: false,
        message: translate(
          ERROR_CODES.WEBHOOK_VERIFICATION_FAILED,
          getLanguage(req),
        ),
      });
    }

    res.status(200).json({
      success: true,
      message: translate(ERROR_CODES.WEBHOOK_PROCESSED, getLanguage(req)),
    });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).json({
      success: false,
      message: translate(
        ERROR_CODES.WEBHOOK_VERIFICATION_FAILED,
        getLanguage(req),
      ),
      error: error.message,
    });
  }
};

// Called by frontend after redirect from Paymob, Checks payment status from webhook (webhook is source of truth)
export const checkPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: translate(ERROR_CODES.INVALID_INPUT, getLanguage(req)),
      });
    }

    // Import Order model
    const Order = (await import("#models/order.js")).default;
    const order = await Order.findById(orderId).populate([
      "user",
      "subscription",
    ]);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: translate(ERROR_CODES.ORDER_NOT_FOUND, getLanguage(req)),
      });
    }

    // if userId != order.user._id then not authorized
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: translate(ERROR_CODES.UNAUTHORIZED, getLanguage(req)),
      });
    }

    if (userId != order.user._id) {
      return res.status(401).json({
        success: false,
        message: translate(ERROR_CODES.UNAUTHORIZED, getLanguage(req)),
      });
    }

    // Webhook is the source of truth - check if webhook was received and processed
    if (!order.webhookReceived) {
      // Webhook hasn't arrived yet, payment might still be pending
      return res.status(202).json({
        success: false,
        status: "pending",
        message: translate(ERROR_CODES.PAYMENT_PENDING, getLanguage(req)),
        orderId: order._id,
      });
    }

    // Webhook has been processed, return final status
    if (order.status === "success") {
      return res.status(200).json({
        success: true,
        status: "success",
        message: translate(ERROR_CODES.PAYMENT_SUCCESS, getLanguage(req)),
        orderId: order._id,
        subscriptionId: order.subscription._id,
        expiryDate: order.subscription.expiryDate,
      });
    } else if (order.status === "failed") {
      return res.status(200).json({
        success: false,
        status: "failed",
        message: translate(ERROR_CODES.PAYMENT_FAILED, getLanguage(req)),
        reason: order.failureReason || "Payment failed",
        orderId: order._id,
      });
    } else {
      // Still processing or unknown status
      return res.status(202).json({
        success: false,
        status: order.status,
        message: translate(ERROR_CODES.PAYMENT_STATUS, getLanguage(req), {
          status: order.status,
        }),
        orderId: order._id,
      });
    }
  } catch (error) {
    next(error);
  }
};

// ============ SUBSCRIPTION MANAGEMENT ============

// Cancel user's current subscription
export const cancelSubscription = async (req, res, next) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: translate(ERROR_CODES.UNAUTHORIZED, getLanguage(req)),
      });
    }

    const { reason } = req.body;

    const userSubscription = await cancelUserSubscription(userId, reason);

    res.status(200).json({
      success: true,
      message: translate(ERROR_CODES.SUBSCRIPTION_CANCELLED, getLanguage(req)),
      data: userSubscription,
    });
  } catch (error) {
    next(error);
  }
};

// Renew subscription for user
export const renewUserSubscription = async (req, res, next) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: translate(ERROR_CODES.UNAUTHORIZED, getLanguage(req)),
      });
    }

    const { userSubscriptionId } = req.body;

    if (!userSubscriptionId) {
      return res.status(400).json({
        success: false,
        message: translate(ERROR_CODES.INVALID_INPUT, getLanguage(req)),
      });
    }

    const paymentDetails = await renewSubscription(userId, userSubscriptionId);

    res.status(200).json({
      success: true,
      message: translate(ERROR_CODES.RENEWAL_INITIATED, getLanguage(req)),
      data: {
        orderId: paymentDetails.orderId,
        checkoutUrl: paymentDetails.checkoutUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Check if user is currently subscribed (useful for auth middleware)
export const verifyUserSubscription = async (req, res, next) => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: translate(ERROR_CODES.UNAUTHORIZED, getLanguage(req)),
      });
    }

    const isSubscribed = await isUserSubscribed(userId);

    res.status(200).json({
      success: true,
      isSubscribed,
    });
  } catch (error) {
    next(error);
  }
};

// ============ ADMIN ENDPOINTS ============
// Admin: Get all subscription plans (including inactive)
export const adminGetAllSubscriptions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const includeInactive = req.query.includeInactive === "true";
    const type = req.query.type || null;
    const result = await getAllSubscriptionsAdmin(
      page,
      limit,
      includeInactive,
      type,
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Admin: Create a new subscription plan
export const adminCreateSubscription = async (req, res, next) => {
  try {
    const {
      name,
      displayName,
      durationInDays,
      price,
      description,
      features,
      type,
      activeDays,
      responseTimeInHours,
      planNote,
    } = req.body;

    // Validate required fields
    if (!name || !displayName || !durationInDays || price === undefined) {
      return res.status(400).json({
        success: false,
        message: translate(ERROR_CODES.INVALID_INPUT, getLanguage(req)),
      });
    }

    const subscriptionData = {
      name,
      displayName,
      durationInDays,
      price,
      description: description || "",
      features: features || [],
      type: type || null,
      activeDays: activeDays || [],
      responseTimeInHours: responseTimeInHours || 0,
      planNote: planNote || "",
      isActive: true,
    };

    const subscription = await createSubscription(subscriptionData);

    res.status(201).json(subscription);
  } catch (error) {
    if (error.message.includes("duplicate key")) {
      return res.status(409).json({
        success: false,
        message: translate(
          ERROR_CODES.SUBSCRIPTION_ALREADY_EXISTS,
          getLanguage(req),
        ),
      });
    }
    next(error);
  }
};

//Admin: Update a subscription plan
export const adminUpdateSubscription = async (req, res, next) => {
  try {
    const { subscriptionId } = req.params;
    const updateData = req.body;

    // Validate subscription ID
    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        message: translate(ERROR_CODES.INVALID_INPUT, getLanguage(req)),
      });
    }

    const subscription = await updateSubscription(subscriptionId, updateData);

    res.status(200).json(subscription);
  } catch (error) {
    if (error.message === "Subscription plan not found") {
      return res.status(404).json({
        success: false,
        message: translate(
          ERROR_CODES.SUBSCRIPTION_NOT_FOUND,
          getLanguage(req),
        ),
      });
    }
    next(error);
  }
};

//Admin: Delete (deactivate) a subscription plan
export const adminDeleteSubscription = async (req, res, next) => {
  try {
    const { subscriptionId } = req.params;

    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        message: translate(ERROR_CODES.INVALID_INPUT, getLanguage(req)),
      });
    }

    const subscription = await deleteSubscription(subscriptionId);

    res.status(200).json(subscription);
  } catch (error) {
    if (error.message === "Subscription plan not found") {
      return res.status(404).json({
        success: false,
        message: translate(
          ERROR_CODES.SUBSCRIPTION_NOT_FOUND,
          getLanguage(req),
        ),
      });
    }
    next(error);
  }
};
