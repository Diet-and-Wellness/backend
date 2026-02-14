import express from "express";
import * as controller from "./subscriptions.controller.js";
import * as validators from "./subscriptions.validators.js";
import authenticate from "#middlewares/auth.js";
import handleValidationErrors from "#middlewares/validation.js";
import { ensureRoles } from "#middlewares/guards.js";
import {
  standardLimiter,
  relaxedLimiter,
  moderateLimiter,
} from "#middlewares/rateLimiter.js";

const router = express.Router();

// ============ PUBLIC ENDPOINTS ============

//Fetch all available subscription plans
router.get("/", relaxedLimiter, controller.getSubscriptions);

// ============ PROTECTED ENDPOINTS (require authentication) ============

// GET /api/subscriptions/me/status
router.get(
  "/me/status",
  authenticate,
  standardLimiter,
  controller.getMySubscriptionStatus,
);

// GET /api/subscriptions/me/history
router.get(
  "/me/history",
  authenticate,
  standardLimiter,
  validators.validateHistoryQuery,
  handleValidationErrors,
  controller.getMySubscriptionHistory,
);

// GET /api/subscriptions/me/verify
router.get(
  "/me/verify",
  authenticate,
  standardLimiter,
  controller.verifyUserSubscription,
);

// POST /api/subscriptions/:subscriptionId/purchase
router.post(
  "/:subscriptionId/purchase",
  authenticate,
  moderateLimiter,
  validators.validatePurchaseSubscription,
  handleValidationErrors,
  controller.purchaseSubscription,
);

// GET /api/subscriptions/payment/status/:orderId
// Called by frontend after redirect from Paymob
// Checks payment status from webhook (webhook is source of truth)
router.get(
  "/payment/status/:orderId",
  authenticate,
  standardLimiter,
  validators.validatePaymentStatus,
  handleValidationErrors,
  controller.checkPaymentStatus,
);

// POST /api/subscriptions/webhook
router.post("/webhook", controller.handlePaymentWebhook);

// // Cancel user's current subscription
// router.post(
//   "/cancel",
//   authenticate,
//   validators.validateCancelSubscription,
//   handleValidationErrors,
//   controller.cancelSubscription,
// );

// // Renew subscription for user
// router.post(
//   "/renew",
//   authenticate,
//   validators.validateRenewalSubscription,
//   handleValidationErrors,
//   controller.renewUserSubscription,
// );

// ============ ADMIN ENDPOINTS (require admin role) ============

// Admin: Get all subscription plans (including inactive)
router.get(
  "/admin",
  authenticate,
  standardLimiter,
  ensureRoles(["admin"]),
  controller.adminGetAllSubscriptions,
);

// Admin: Create a new subscription plan
router.post(
  "/admin",
  authenticate,
  standardLimiter,
  ensureRoles(["admin"]),
  validators.validateCreateSubscription,
  handleValidationErrors,
  controller.adminCreateSubscription,
);

// Admin: Update a subscription plan
router.put(
  "/admin/:subscriptionId",
  authenticate,
  standardLimiter,
  ensureRoles(["admin"]),
  validators.validateUpdateSubscription,
  handleValidationErrors,
  controller.adminUpdateSubscription,
);

// Admin: Delete (deactivate) a subscription plan
router.delete(
  "/admin/:subscriptionId",
  authenticate,
  standardLimiter,
  ensureRoles(["admin"]),
  validators.validateDeleteSubscription,
  handleValidationErrors,
  controller.adminDeleteSubscription,
);

export default router;
