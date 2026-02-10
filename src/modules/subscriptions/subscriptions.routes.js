import express from "express";
import * as controller from "./subscriptions.controller.js";
import * as validators from "./subscriptions.validators.js";
import authenticate from "#middlewares/auth.js";
import handleValidationErrors from "#middlewares/validation.js";
import { ensureRoles } from "#middlewares/guards.js";

const router = express.Router();

// ============ PUBLIC ENDPOINTS ============

//Fetch all available subscription plans
router.get("/", controller.getSubscriptions);

// ============ PROTECTED ENDPOINTS (require authentication) ============

// GET /api/subscriptions/me/status
router.get("/me/status", authenticate, controller.getMySubscriptionStatus);

// GET /api/subscriptions/me/history
router.get(
  "/me/history",
  authenticate,
  validators.validateHistoryQuery,
  handleValidationErrors,
  controller.getMySubscriptionHistory,
);

// GET /api/subscriptions/me/verify
router.get("/me/verify", authenticate, controller.verifyUserSubscription);

// POST /api/subscriptions/:subscriptionId/purchase
// Create order and initiate payment
router.post(
  "/:subscriptionId/purchase",
  authenticate,
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
  validators.validatePaymentStatus,
  handleValidationErrors,
  controller.checkPaymentStatus,
);

// POST /api/subscriptions/webhook
// Server-to-server webhook callback from Paymob, Verifies HMAC signature and updates payment status No auth required (Paymob doesn't provide JWT)
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
// ADMIN ROUTES - GET, Create, Update, Delete subscription plans
// Admin: Get all subscription plans (including inactive)
router.get(
  "/admin",
  authenticate,
  ensureRoles(["admin"]),
  controller.adminGetAllSubscriptions,
);

// Admin: Create a new subscription plan
router.post(
  "/admin",
  authenticate,
  ensureRoles(["admin"]),
  validators.validateCreateSubscription,
  handleValidationErrors,
  controller.adminCreateSubscription,
);

// Admin: Update a subscription plan
router.put(
  "/admin/:subscriptionId",
  authenticate,
  ensureRoles(["admin"]),
  validators.validateUpdateSubscription,
  handleValidationErrors,
  controller.adminUpdateSubscription,
);

// Admin: Delete (deactivate) a subscription plan
router.delete(
  "/admin/:subscriptionId",
  authenticate,
  ensureRoles(["admin"]),
  validators.validateDeleteSubscription,
  handleValidationErrors,
  controller.adminDeleteSubscription,
);

export default router;
