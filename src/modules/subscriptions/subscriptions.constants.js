// Subscription plan types (subscription_plan vs one_time_offer)
export const SUBSCRIPTION_PLAN_TYPES = {
  SUBSCRIPTION_PLAN: "subscription_plan",
  ONE_TIME_OFFER: "one_time_offer",
};

export const ACTIVE_DAYS = {
  SUNDAY: "sunday",
  MONDAY: "monday",
  TUESDAY: "tuesday",
  WEDNESDAY: "wednesday",
  THURSDAY: "thursday",
  FRIDAY: "friday",
  SATURDAY: "saturday",
};

// Subscription types/names
export const SUBSCRIPTION_TYPES = {
  BASIC: "basic",
  STANDARD: "standard",
  PREMIUM: "premium",
};

// Order status values
export const ORDER_STATUS = {
  PENDING: "pending", // Created but not yet processed
  PROCESSING: "processing", // Sent to Paymob, awaiting payment
  SUCCESS: "success", // Payment completed successfully
  FAILED: "failed", // Payment failed
  CANCELLED: "cancelled", // User cancelled
  EXPIRED: "expired", // Payment intent expired
};

// Subscription status values
export const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
};

// Subscription duration in days
export const SUBSCRIPTION_DURATIONS = {
  ONE_MONTH: 30,
  TWO_MONTHS: 60,
  THREE_MONTHS: 90,
  SIX_MONTHS: 180,
  TWELVE_MONTHS: 365,
};
