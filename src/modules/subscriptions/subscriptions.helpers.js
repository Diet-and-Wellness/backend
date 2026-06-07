import { subscriptionConfirmationEmailTemplate } from "../../utils/emailTemplates.js";
import sendEmail from "#utils/email.js";

// Calculate subscription expiry date
export const calculateExpiryDate = (durationInDays, oldExpiryDate = null) => {
  if (!Number.isInteger(durationInDays) || durationInDays < 0) {
    throw new Error("durationInDays must be a non-negative integer");
  }

  let extraDays = 0;
  if (oldExpiryDate) {
    extraDays = getDaysRemaining(oldExpiryDate);
  }
  durationInDays += extraDays;

  const expiryDate = new Date();
  expiryDate.setHours(23, 59, 59, 999); // Normalize to end of day
  expiryDate.setDate(expiryDate.getDate() + durationInDays - 1);

  return expiryDate;
};

// Get days remaining until subscription expires
export const getDaysRemaining = (expiryDate) => {
  const now = new Date();

  if (!(expiryDate instanceof Date) || isNaN(expiryDate)) {
    throw new Error("Invalid expiryDate");
  }

  const timeDiff = expiryDate.getTime() - now.getTime();

  if (timeDiff <= 0) {
    return 0;
  }

  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
};

// Check if subscription will expire soon
export const isExpiringSoon = (expiryDate, daysThreshold = 7) => {
  const daysRemaining = getDaysRemaining(expiryDate);
  return daysRemaining > 0 && daysRemaining <= daysThreshold;
};

// Format subscription info for response
export const formatSubscriptionResponse = (userSubscription) => {
  const daysRemaining = getDaysRemaining(userSubscription.expiryDate);
  const isExpired = daysRemaining === 0;
  const expiringShortly = isExpiringSoon(userSubscription.expiryDate);

  return {
    id: userSubscription._id,
    status: isExpired ? "expired" : userSubscription.status,
    planName: userSubscription.subscription?.displayName,
    startDate: userSubscription.startDate,
    expiryDate: userSubscription.expiryDate,
    daysRemaining,
    isExpired,
    expiringShortly,
    subscriptionCount: userSubscription.subscriptionCount,
    isAutoRenewalEnabled: userSubscription.isAutoRenewalEnabled,
  };
};

// Format currency amount for display
export const formatCurrencyAmount = (amountCents, currency = "EGP") => {
  const amount = amountCents / 100;
  return `${amount.toFixed(2)} ${currency}`;
};

// Retry logic for Paymob API calls
export const retryWithBackoff = async (fn, maxRetries = 3, delayMs = 1000) => {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        // Exponential backoff
        const delay = delayMs * Math.pow(2, i);
        console.warn(
          `Attempt ${i + 1} failed. Retrying in ${delay}ms...`,
          error.message,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

// Send subscription confirmation email
export const sendSubscriptionConfirmationEmail = async (
  user,
  subscription,
  expiryDate,
) => {
  try {
    await sendEmail({
      to: user.email,
      subject: `Subscription Confirmed - ${subscription.displayName}`,
      html: subscriptionConfirmationEmailTemplate(subscription, expiryDate),
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
