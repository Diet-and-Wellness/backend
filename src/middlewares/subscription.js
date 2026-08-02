import {
  isUserSubscribed,
  getUserResultsAccess,
  getUserSubscriptionStatus,
} from "#modules/subscriptions/subscriptions.service.js";
import { ERROR_CODES, getLanguage, translate } from "#utils/localization.js";

/**
 * SUBSCRIPTION MIDDLEWARE
 * Checks if user is subscribed and subscription is active
 * Can be used to protect routes that require a valid subscription
 */

/**
 * Require subscription middleware
 * Use this on routes that require users to be subscribed
 *
 * Example:
 * router.get("/premium-content", requireSubscription, controller.getPremiumContent)
 */
export const requireSubscription = async (req, res, next) => {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const isSubscribed = await isUserSubscribed(userId);

    if (!isSubscribed) {
      return res.status(403).json({
        success: false,
        message: "You need an active subscription to access this resource",
      });
    }

    // Subscription is valid, proceed
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Allow assessment results for an active subscriber or for a customer who
 * completed the dedicated one-time results purchase.
 */
export const requireResultsAccess = async (req, res, next) => {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const access = await getUserResultsAccess(userId);
    if (!access.hasAccess) {
      return res.status(403).json({
        success: false,
        code: ERROR_CODES.RESULTS_ACCESS_REQUIRED,
        message: translate(
          ERROR_CODES.RESULTS_ACCESS_REQUIRED,
          getLanguage(req),
        ),
      });
    }

    req.resultsAccess = access;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Attach subscription info middleware
 * Adds subscription details to req.subscription for easy access
 * Does not throw error if user is not subscribed
 *
 * Example:
 * router.get("/user-profile", attachSubscriptionInfo, controller.getUserProfile)
 * // In controller: const subscriptionStatus = req.subscription;
 */
export const attachSubscriptionInfo = async (req, res, next) => {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      req.subscription = null;
      return next();
    }

    const subscriptionStatus = await getUserSubscriptionStatus(userId);
    req.subscription = subscriptionStatus;

    next();
  } catch (error) {
    console.error("Error attaching subscription info:", error);
    req.subscription = null;
    next();
  }
};

/**
 * Check subscription with custom message
 * Allows specifying a custom error message
 *
 * Example:
 * router.get("/recipes", checkSubscription("You need premium to access recipes"), controller.getRecipes)
 */
export const checkSubscription = (customMessage = null) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.user_id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const isSubscribed = await isUserSubscribed(userId);

      if (!isSubscribed) {
        const message =
          customMessage ||
          "You need an active subscription to access this resource";
        return res.status(403).json({
          success: false,
          message,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
