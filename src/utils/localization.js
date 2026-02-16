/**
 * Localization utility for multi-language error messages and translations
 * Automatically detects language from request headers or uses default (en)
 */

// Error code constants
export const ERROR_CODES = {
  // Validation errors (400)
  INVALID_INPUT: "INVALID_INPUT",
  MISSING_FIELD: "MISSING_FIELD",
  INVALID_FORMAT: "INVALID_FORMAT",
  INVALID_MONGO_ID: "INVALID_MONGO_ID",
  INVALID_EMAIL: "INVALID_EMAIL",
  PASSWORD_TOO_WEAK: "PASSWORD_TOO_WEAK",
  INVALID_ARRAY: "INVALID_ARRAY",
  FILE_REQUIRED: "FILE_REQUIRED",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  INVALID_FILE_TYPE: "INVALID_FILE_TYPE",
  INVALID_LANGUAGE: "INVALID_LANGUAGE",
  INVALID_URL: "INVALID_URL",

  // Authentication errors (401)
  UNAUTHORIZED: "UNAUTHORIZED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  INVALID_TOKEN: "INVALID_TOKEN",
  TOKEN_REQUIRED: "TOKEN_REQUIRED",

  // Authorization errors (403)
  FORBIDDEN: "FORBIDDEN",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
  ADMIN_ONLY: "ADMIN_ONLY",

  // Rate limiting errors (429)
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",

  // Not found errors (404)
  NOT_FOUND: "NOT_FOUND",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  RECIPE_NOT_FOUND: "RECIPE_NOT_FOUND",
  ARTICLE_NOT_FOUND: "ARTICLE_NOT_FOUND",
  CATEGORY_NOT_FOUND: "CATEGORY_NOT_FOUND",
  FEEDBACK_NOT_FOUND: "FEEDBACK_NOT_FOUND",

  // Conflict errors (409)
  DUPLICATE_ENTRY: "DUPLICATE_ENTRY",
  EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",
  USERNAME_ALREADY_EXISTS: "USERNAME_ALREADY_EXISTS",

  // Server errors (500)
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  EMAIL_SEND_ERROR: "EMAIL_SEND_ERROR",

  // Custom business logic errors
  OTP_EXPIRED: "OTP_EXPIRED",
  OTP_INVALID: "OTP_INVALID",
  INVALID_OTP_ATTEMPTS: "INVALID_OTP_ATTEMPTS",

  // Auth-specific errors
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
  PHONE_ALREADY_EXISTS: "PHONE_ALREADY_EXISTS",
  INVALID_REFRESH_TOKEN: "INVALID_REFRESH_TOKEN",
  EMAIL_NOT_FOUND: "EMAIL_NOT_FOUND",

  // Specialist-specific errors
  SPECIALIST_NOT_FOUND: "SPECIALIST_NOT_FOUND",
  USER_NOT_SPECIALIST: "USER_NOT_SPECIALIST",

  // Category errors
  //   INVALID_CATEGORY_TYPE: "INVALID_CATEGORY_TYPE",
  CATEGORY_ALREADY_EXISTS: "CATEGORY_ALREADY_EXISTS",
  CATEGORY_IN_USE: "CATEGORY_IN_USE",
  SLUG_ALREADY_EXISTS: "SLUG_ALREADY_EXISTS",

  // Recipe/Article errors
  DUPLICATE_TITLE: "DUPLICATE_TITLE",

  // Validator-specific errors
  REQUIRED_FIELD: "REQUIRED_FIELD",
  INVALID_LENGTH: "INVALID_LENGTH",
  INVALID_PHONE_FORMAT: "INVALID_PHONE_FORMAT",
  INVALID_SORT_OPTION: "INVALID_SORT_OPTION",
  INVALID_STATUS_OPTION: "INVALID_STATUS_OPTION",
  INVALID_ROLE: "INVALID_ROLE",
  INVALID_SPECIALIST_STATUS: "INVALID_SPECIALIST_STATUS",
  EMAIL_OR_PHONE_REQUIRED: "EMAIL_OR_PHONE_REQUIRED",
  EITHER_EMAIL_OR_PHONE_REQUIRED: "EITHER_EMAIL_OR_PHONE_REQUIRED",
  PASSWORD_REQUIRED: "PASSWORD_REQUIRED",
  OTP_CODE_REQUIRED: "OTP_CODE_REQUIRED",
  OTP_CODE_INVALID_LENGTH: "OTP_CODE_INVALID_LENGTH",
  INVALID_MONGO_ID_FORMAT: "INVALID_MONGO_ID_FORMAT",

  // Helper-specific errors (recipes & articles)
  SLUG_GENERATION_FAILED: "SLUG_GENERATION_FAILED",
  INGREDIENTS_REQUIRED: "INGREDIENTS_REQUIRED",
  MAX_INGREDIENTS_EXCEEDED: "MAX_INGREDIENTS_EXCEEDED",
  INGREDIENT_NAME_INVALID: "INGREDIENT_NAME_INVALID",
  INGREDIENT_QUANTITY_INVALID: "INGREDIENT_QUANTITY_INVALID",
  INGREDIENT_NAME_LENGTH_INVALID: "INGREDIENT_NAME_LENGTH_INVALID",
  INGREDIENT_UNIT_INVALID: "INGREDIENT_UNIT_INVALID",
  INSTRUCTIONS_REQUIRED: "INSTRUCTIONS_REQUIRED",
  MAX_INSTRUCTIONS_EXCEEDED: "MAX_INSTRUCTIONS_EXCEEDED",
  INSTRUCTION_DESCRIPTION_INVALID: "INSTRUCTION_DESCRIPTION_INVALID",
  INSTRUCTION_DESCRIPTION_TOO_SHORT: "INSTRUCTION_DESCRIPTION_TOO_SHORT",
  NUTRITION_INFO_INVALID: "NUTRITION_INFO_INVALID",
  NUTRITION_FIELD_INVALID: "NUTRITION_FIELD_INVALID",
  NUTRITION_FIELD_VALUE_INVALID: "NUTRITION_FIELD_VALUE_INVALID",
  TAGS_REQUIRED: "TAGS_REQUIRED",
  MAX_TAGS_EXCEEDED: "MAX_TAGS_EXCEEDED",
  TAG_INVALID: "TAG_INVALID",
  TAG_LENGTH_INVALID: "TAG_LENGTH_INVALID",
  PREP_TIME_INVALID: "PREP_TIME_INVALID",
  COOK_TIME_INVALID: "COOK_TIME_INVALID",
  INVALID_DIFFICULTY: "INVALID_DIFFICULTY",
  REFRESH_TOKEN_REQUIRED: "REFRESH_TOKEN_REQUIRED",
  DIFFICULTY_LEVEL_INVALID: "DIFFICULTY_LEVEL_INVALID",
  CATEGORY_INVALID_TYPE_RECIPE: "CATEGORY_INVALID_TYPE_RECIPE",
  CATEGORY_INVALID_TYPE_ARTICLE: "CATEGORY_INVALID_TYPE_ARTICLE",
  CATEGORY_INACTIVE: "CATEGORY_INACTIVE",
  ESTIMATED_READ_TIME_INVALID: "ESTIMATED_READ_TIME_INVALID",
  INVALID_BOOLEAN_VALUE: "INVALID_BOOLEAN_VALUE",
  INVALID_PAGE_NUMBER: "INVALID_PAGE_NUMBER",
  INVALID_LIMIT_NUMBER: "INVALID_LIMIT_NUMBER",
  INVALID_SLUG_FORMAT: "INVALID_SLUG_FORMAT",
  INVALID_ORDER: "INVALID_ORDER",
  INVALID_CATEGORY_TYPE: "INVALID_CATEGORY_TYPE",
  INVALID_UPDATES_ARRAY: "INVALID_UPDATES_ARRAY",
  PROFILE_DELETED_SUCCESS: "PROFILE_DELETED_SUCCESS",
  SPECIALIST_ACTIVATED_SUCCESS: "SPECIALIST_ACTIVATED_SUCCESS",
  SPECIALIST_DEACTIVATED_SUCCESS: "SPECIALIST_DEACTIVATED_SUCCESS",
  PASSWORD_RESET_SUCCESS: "PASSWORD_RESET_SUCCESS",
  OTP_SENT_SUCCESS: "OTP_SENT_SUCCESS",
  LOGOUT_SUCCESS: "LOGOUT_SUCCESS",
  OTP_VERIFIED_SUCCESS: "OTP_VERIFIED_SUCCESS",
  DELETE_SUCCESS: "DELETE_SUCCESS",
  RECIPE_NOT_AVAILABLE: "RECIPE_NOT_AVAILABLE",
  ARTICLE_NOT_AVAILABLE: "ARTICLE_NOT_AVAILABLE",
  INVALID_VALUE: "INVALID_VALUE",

  // Subscription-specific errors
  SUBSCRIPTION_NOT_FOUND: "SUBSCRIPTION_NOT_FOUND",
  USER_SUBSCRIPTION_NOT_FOUND: "USER_SUBSCRIPTION_NOT_FOUND",
  ORDER_NOT_FOUND: "ORDER_NOT_FOUND",
  NO_ACTIVE_SUBSCRIPTION: "NO_ACTIVE_SUBSCRIPTION",
  SUBSCRIPTION_REQUIRED: "SUBSCRIPTION_REQUIRED",
  PAYMENT_VERIFICATION_FAILED: "PAYMENT_VERIFICATION_FAILED",
  WEBHOOK_VERIFICATION_FAILED: "WEBHOOK_VERIFICATION_FAILED",
  INVALID_ORDER_ID: "INVALID_ORDER_ID",
  INVALID_SUBSCRIPTION_ID: "INVALID_SUBSCRIPTION_ID",
  PAYMOB_API_ERROR: "PAYMOB_API_ERROR",
  SUBSCRIPTION_CREATED: "SUBSCRIPTION_CREATED",
  PAYMENT_INITIATED: "PAYMENT_INITIATED",
  PAYMENT_SUCCESS: "PAYMENT_SUCCESS",
  SUBSCRIPTION_CANCELLED: "SUBSCRIPTION_CANCELLED",
  RENEWAL_INITIATED: "RENEWAL_INITIATED",
  WEBHOOK_PROCESSED: "WEBHOOK_PROCESSED",
  SUBSCRIPTION_ALREADY_EXISTS: "SUBSCRIPTION_ALREADY_EXISTS",
  SUBSCRIPTION_EXPIRED: "SUBSCRIPTION_EXPIRED",
  SUBSCRIPTION_NAME_INVALID: "SUBSCRIPTION_NAME_INVALID",
  SUBSCRIPTION_DISPLAY_NAME_REQUIRED: "SUBSCRIPTION_DISPLAY_NAME_REQUIRED",
  SUBSCRIPTION_DURATION_INVALID: "SUBSCRIPTION_DURATION_INVALID",
  SUBSCRIPTION_PRICE_INVALID: "SUBSCRIPTION_PRICE_INVALID",
  SUBSCRIPTION_FEATURES_INVALID: "SUBSCRIPTION_FEATURES_INVALID",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  ORDER_EXPIRED: "ORDER_EXPIRED",
  SUBSCRIPTION_UPDATED: "SUBSCRIPTION_UPDATED",
  SUBSCRIPTION_DELETED: "SUBSCRIPTION_DELETED",
  PAYMENT_PENDING: "PAYMENT_PENDING",
  PAYMENT_STATUS: "PAYMENT_STATUS",
  FILE_UPLOAD_ERROR: "FILE_UPLOAD_ERROR",
};

// Translation dictionary - easily extensible
const translations = {
  en: {
    // Validation errors
    [ERROR_CODES.INVALID_INPUT]: "Invalid input provided",
    [ERROR_CODES.MISSING_FIELD]: "Required field is missing: {{field}}",
    [ERROR_CODES.INVALID_FORMAT]: "Invalid format for {{field}}",
    [ERROR_CODES.INVALID_VALUE]: "Invalid value for {{field}}",
    [ERROR_CODES.INVALID_MONGO_ID]: "Invalid ID format",
    [ERROR_CODES.INVALID_EMAIL]: "Invalid email address",
    [ERROR_CODES.PASSWORD_TOO_WEAK]:
      "Password must be at least 8 characters with uppercase, lowercase, and numbers",
    [ERROR_CODES.INVALID_ARRAY]: "{{field}} must be a valid array",
    [ERROR_CODES.FILE_REQUIRED]: "File is required",
    [ERROR_CODES.FILE_TOO_LARGE]: "File size exceeds maximum limit",
    [ERROR_CODES.INVALID_FILE_TYPE]: "Invalid file type, allowed: {{allowed}}",
    [ERROR_CODES.INVALID_URL]: "Invalid URL",

    // Authentication errors
    [ERROR_CODES.UNAUTHORIZED]: "Unauthorized access",
    [ERROR_CODES.INVALID_CREDENTIALS]: "Invalid email or password",
    [ERROR_CODES.TOKEN_EXPIRED]: "Authentication token has expired",
    [ERROR_CODES.INVALID_TOKEN]: "Invalid authentication token",
    [ERROR_CODES.TOKEN_REQUIRED]: "Authentication token is required",

    // Authorization errors
    [ERROR_CODES.FORBIDDEN]: "Access forbidden",
    [ERROR_CODES.INSUFFICIENT_PERMISSIONS]:
      "You don't have permission to perform this action",
    [ERROR_CODES.ADMIN_ONLY]: "This action is restricted to administrators",

    // Rate limiting errors
    [ERROR_CODES.TOO_MANY_REQUESTS]:
      "Too many requests. Please try again {{field}} minutes later",

    // Not found errors
    [ERROR_CODES.NOT_FOUND]: "Resource not found",
    [ERROR_CODES.USER_NOT_FOUND]: "User not found",
    [ERROR_CODES.RECIPE_NOT_FOUND]: "Recipe not found",
    [ERROR_CODES.ARTICLE_NOT_FOUND]: "Article not found",
    [ERROR_CODES.CATEGORY_NOT_FOUND]: "Category not found",
    [ERROR_CODES.FEEDBACK_NOT_FOUND]: "Feedback not found",

    // Conflict errors
    [ERROR_CODES.DUPLICATE_ENTRY]: "This entry already exists",
    [ERROR_CODES.EMAIL_ALREADY_EXISTS]: "Email address is already registered",
    [ERROR_CODES.USERNAME_ALREADY_EXISTS]: "Username is already taken",

    // Server errors
    [ERROR_CODES.INTERNAL_SERVER_ERROR]: "An unexpected error occurred",
    [ERROR_CODES.DATABASE_ERROR]: "Database error occurred",
    [ERROR_CODES.EMAIL_SEND_ERROR]: "Failed to send email",

    // Business logic errors
    [ERROR_CODES.OTP_EXPIRED]: "OTP has expired",
    [ERROR_CODES.OTP_INVALID]: "Invalid OTP",
    [ERROR_CODES.INVALID_OTP_ATTEMPTS]: "Too many invalid OTP attempts",

    // Auth-specific errors
    [ERROR_CODES.EMAIL_NOT_VERIFIED]: "Please verify your email first",
    [ERROR_CODES.PHONE_ALREADY_EXISTS]: "Phone number is already registered",
    [ERROR_CODES.INVALID_REFRESH_TOKEN]: "Invalid refresh token",
    [ERROR_CODES.EMAIL_NOT_FOUND]: "Email address not found",

    // Specialist-specific errors
    [ERROR_CODES.SPECIALIST_NOT_FOUND]: "Specialist not found",
    [ERROR_CODES.USER_NOT_SPECIALIST]: "User is not a specialist",

    // Category errors
    // [ERROR_CODES.INVALID_CATEGORY_TYPE]: "Invalid category type",
    [ERROR_CODES.CATEGORY_ALREADY_EXISTS]:
      "Category already exists for this type",
    [ERROR_CODES.CATEGORY_IN_USE]:
      "Cannot delete category. {{count}} item(s) are using this category",
    [ERROR_CODES.SLUG_ALREADY_EXISTS]:
      "A category with this name or slug already exists",

    // Recipe/Article errors
    [ERROR_CODES.DUPLICATE_TITLE]: "A {{type}} with this title already exists",

    // Validator-specific errors
    [ERROR_CODES.REQUIRED_FIELD]: "{{field}} is required",
    [ERROR_CODES.INVALID_LENGTH]:
      "{{field}} must be {{min}}-{{max}} characters long",
    [ERROR_CODES.INVALID_PHONE_FORMAT]:
      "Phone number is invalid Egyptian format",
    [ERROR_CODES.INVALID_SORT_OPTION]: "Invalid sort option",
    [ERROR_CODES.INVALID_STATUS_OPTION]: "Invalid status option",
    [ERROR_CODES.INVALID_ROLE]: "Invalid role",
    [ERROR_CODES.INVALID_SPECIALIST_STATUS]: "Invalid specialist status",
    [ERROR_CODES.EMAIL_OR_PHONE_REQUIRED]: "Email or phone number is required",
    [ERROR_CODES.EITHER_EMAIL_OR_PHONE_REQUIRED]:
      "Either email or phone is required",
    [ERROR_CODES.PASSWORD_REQUIRED]: "Password is required",
    [ERROR_CODES.OTP_CODE_REQUIRED]: "OTP code is required",
    [ERROR_CODES.OTP_CODE_INVALID_LENGTH]: "OTP code must be 6 digits",
    [ERROR_CODES.INVALID_MONGO_ID_FORMAT]: "Invalid {{field}} ID",

    // Helper-specific errors
    [ERROR_CODES.SLUG_GENERATION_FAILED]: "Title is required to generate slug",
    [ERROR_CODES.INGREDIENTS_REQUIRED]: "At least one ingredient is required",
    [ERROR_CODES.MAX_INGREDIENTS_EXCEEDED]: "Maximum 50 ingredients allowed",
    [ERROR_CODES.INGREDIENT_NAME_INVALID]:
      "Ingredient {{index}}: name is required and must be a string",
    [ERROR_CODES.INGREDIENT_QUANTITY_INVALID]:
      "Ingredient {{index}}: quantity is required and must be a string",
    [ERROR_CODES.INGREDIENT_NAME_LENGTH_INVALID]:
      "Ingredient {{index}}: name must be between 2 and 100 characters",
    [ERROR_CODES.INGREDIENT_UNIT_INVALID]:
      "Ingredient {{index}}: invalid unit. Must be one of {{units}}",
    [ERROR_CODES.INSTRUCTIONS_REQUIRED]: "Instructions must be an array",
    [ERROR_CODES.MAX_INSTRUCTIONS_EXCEEDED]:
      "Maximum 200 instruction steps allowed",
    [ERROR_CODES.INSTRUCTION_DESCRIPTION_INVALID]:
      "Step {{index}}: description is required and must be a string",
    [ERROR_CODES.INSTRUCTION_DESCRIPTION_TOO_SHORT]:
      "Step {{index}}: description must be at least 5 characters",
    [ERROR_CODES.NUTRITION_INFO_INVALID]: "Nutrition info must be an object",
    [ERROR_CODES.NUTRITION_FIELD_INVALID]: "Invalid nutrition field: {{field}}",
    [ERROR_CODES.NUTRITION_FIELD_VALUE_INVALID]:
      "{{field}} must be a non-negative number",
    [ERROR_CODES.TAGS_REQUIRED]: "Tags must be an array",
    [ERROR_CODES.MAX_TAGS_EXCEEDED]: "Maximum 10 tags allowed",
    [ERROR_CODES.TAG_INVALID]: "Tag {{index}}: must be a non-empty string",
    [ERROR_CODES.TAG_LENGTH_INVALID]:
      "Tag {{index}}: must not exceed 50 characters",
    [ERROR_CODES.PREP_TIME_INVALID]:
      "Prep time must be between 0 and 480 minutes",
    [ERROR_CODES.COOK_TIME_INVALID]:
      "Cook time must be between 0 and 480 minutes",
    [ERROR_CODES.INVALID_DIFFICULTY]: "Invalid difficulty",
    [ERROR_CODES.REFRESH_TOKEN_REQUIRED]: "Refresh token is required",
    [ERROR_CODES.DIFFICULTY_LEVEL_INVALID]: "Invalid difficulty level",
    [ERROR_CODES.CATEGORY_INVALID_TYPE_RECIPE]:
      "Category must be of type 'recipe'",
    [ERROR_CODES.CATEGORY_INVALID_TYPE_ARTICLE]:
      "Category must be of type 'article'",
    [ERROR_CODES.CATEGORY_INACTIVE]: "Category must be active",
    [ERROR_CODES.ESTIMATED_READ_TIME_INVALID]:
      "Estimated read time must be between 1 and 120 minutes",
    [ERROR_CODES.INVALID_BOOLEAN_VALUE]: "Invalid boolean value",
    [ERROR_CODES.INVALID_PAGE_NUMBER]: "Page number must be a positive integer",
    [ERROR_CODES.INVALID_LIMIT_NUMBER]:
      "Limit number must be between 1 and 100",
    [ERROR_CODES.INVALID_SLUG_FORMAT]:
      "Slug must contain only lowercase letters, numbers, and hyphens",
    [ERROR_CODES.INVALID_ORDER]: "Order must be a non-negative integer",
    [ERROR_CODES.INVALID_CATEGORY_TYPE]:
      "Type must be either 'article' or 'recipe'",
    [ERROR_CODES.INVALID_UPDATES_ARRAY]:
      "Updates array formate is [ {id: string, order: positive integer} ]",
    [ERROR_CODES.PROFILE_DELETED_SUCCESS]: "Profile deleted successfully",
    [ERROR_CODES.SPECIALIST_ACTIVATED_SUCCESS]:
      "Specialist activated successfully",
    [ERROR_CODES.SPECIALIST_DEACTIVATED_SUCCESS]:
      "Specialist deactivated successfully",
    [ERROR_CODES.PASSWORD_RESET_SUCCESS]: "Password reset successfully",
    [ERROR_CODES.OTP_SENT_SUCCESS]: "OTP sent successfully",
    [ERROR_CODES.LOGOUT_SUCCESS]: "Logged out successfully",
    [ERROR_CODES.OTP_VERIFIED_SUCCESS]: "OTP verified successfully",
    [ERROR_CODES.DELETE_SUCCESS]: "{{item}} deleted successfully",
    [ERROR_CODES.RECIPE_NOT_AVAILABLE]: "Recipe not available",
    [ERROR_CODES.ARTICLE_NOT_AVAILABLE]: "Article not available",
    [ERROR_CODES.INVALID_LANGUAGE]:
      "Invalid language. Supported languages are: en, ar",

    // Subscription errors
    [ERROR_CODES.SUBSCRIPTION_NOT_FOUND]: "Subscription plan not found",
    [ERROR_CODES.USER_SUBSCRIPTION_NOT_FOUND]: "User not subscribed before",
    [ERROR_CODES.ORDER_NOT_FOUND]: "Order not found",
    [ERROR_CODES.NO_ACTIVE_SUBSCRIPTION]: "No active subscription found",
    [ERROR_CODES.SUBSCRIPTION_REQUIRED]:
      "You need an active subscription to access this resource",
    [ERROR_CODES.PAYMENT_VERIFICATION_FAILED]: "Payment verification failed",
    [ERROR_CODES.WEBHOOK_VERIFICATION_FAILED]:
      "Webhook signature verification failed",
    [ERROR_CODES.INVALID_ORDER_ID]: "Invalid order ID format",
    [ERROR_CODES.INVALID_SUBSCRIPTION_ID]: "Invalid subscription ID format",
    [ERROR_CODES.PAYMOB_API_ERROR]: "Error communicating with payment gateway",
    [ERROR_CODES.SUBSCRIPTION_CREATED]:
      "Subscription plan created successfully",
    [ERROR_CODES.PAYMENT_INITIATED]: "Payment initiated successfully",
    [ERROR_CODES.PAYMENT_SUCCESS]:
      "Payment successful and subscription activated",
    [ERROR_CODES.SUBSCRIPTION_CANCELLED]: "Subscription cancelled successfully",
    [ERROR_CODES.RENEWAL_INITIATED]: "Renewal payment initiated successfully",
    [ERROR_CODES.WEBHOOK_PROCESSED]: "Webhook processed successfully",
    [ERROR_CODES.SUBSCRIPTION_ALREADY_EXISTS]:
      "Subscription plan with this name already exists",
    [ERROR_CODES.SUBSCRIPTION_EXPIRED]: "Subscription has expired",
    [ERROR_CODES.SUBSCRIPTION_NAME_INVALID]:
      "Plan name must be one of: 1_month, 3_months, 6_months, 12_months",
    [ERROR_CODES.SUBSCRIPTION_DISPLAY_NAME_REQUIRED]:
      "Display name is required and must be 2-50 characters",
    [ERROR_CODES.SUBSCRIPTION_DURATION_INVALID]:
      "Duration must be between 1 and 730 days",
    [ERROR_CODES.SUBSCRIPTION_PRICE_INVALID]: "Price must be a positive number",
    [ERROR_CODES.SUBSCRIPTION_FEATURES_INVALID]:
      "Features must be an array of strings",
    [ERROR_CODES.PAYMENT_FAILED]: "Payment failed. Please try again",
    [ERROR_CODES.ORDER_EXPIRED]: "Order has expired",
    [ERROR_CODES.SUBSCRIPTION_UPDATED]:
      "Subscription plan updated successfully",
    [ERROR_CODES.SUBSCRIPTION_DELETED]:
      "Subscription plan deleted successfully",
    [ERROR_CODES.PAYMENT_PENDING]: "Payment is still pending",
    [ERROR_CODES.PAYMENT_STATUS]: "Payment status: {{status}}",
    [ERROR_CODES.FILE_UPLOAD_ERROR]: "File upload error",
  },

  ar: {
    // Validation errors
    [ERROR_CODES.INVALID_INPUT]: "إدخال غير صحيح",
    [ERROR_CODES.MISSING_FIELD]: "الحقل المطلوب مفقود: {{field}}",
    [ERROR_CODES.INVALID_FORMAT]: "صيغة غير صحيحة للحقل {{field}}",
    [ERROR_CODES.INVALID_VALUE]: "قيمة غير صحيحة للحقل {{field}}",
    [ERROR_CODES.INVALID_MONGO_ID]: "صيغة المعرف غير صحيحة",
    [ERROR_CODES.INVALID_EMAIL]: "عنوان بريد إلكتروني غير صحيح",
    [ERROR_CODES.PASSWORD_TOO_WEAK]:
      "يجب أن تكون كلمة المرور 8 أحرف على الأقل وتحتوي على أحرف كبيرة وصغيرة وأرقام",
    [ERROR_CODES.INVALID_ARRAY]: "{{field}} يجب أن يكون مصفوفة صحيحة",
    [ERROR_CODES.FILE_REQUIRED]: "الملف مطلوب",
    [ERROR_CODES.FILE_TOO_LARGE]: "حجم الملف يتجاوز الحد الأقصى",
    [ERROR_CODES.INVALID_FILE_TYPE]:
      "نوع الملف غير صحيح، يمكن استخدام: {{allowed}}",
    [ERROR_CODES.INVALID_URL]: "رابط غير صحيح",

    // Authentication errors
    [ERROR_CODES.UNAUTHORIZED]: "وصول غير مصرح به",
    [ERROR_CODES.INVALID_CREDENTIALS]: "بريد إلكتروني أو كلمة مرور غير صحيحة",
    [ERROR_CODES.TOKEN_EXPIRED]: "انتهت صلاحية رمز المصادقة",
    [ERROR_CODES.INVALID_TOKEN]: "رمز مصادقة غير صحيح",
    [ERROR_CODES.TOKEN_REQUIRED]: "رمز المصادقة مطلوب",

    // Authorization errors
    [ERROR_CODES.FORBIDDEN]: "الوصول مرفوع",
    [ERROR_CODES.INSUFFICIENT_PERMISSIONS]:
      "ليس لديك الإذن للقيام بهذا الإجراء",
    [ERROR_CODES.ADMIN_ONLY]: "هذا الإجراء مقيد بالمسؤولين",

    // Rate limiting errors
    [ERROR_CODES.TOO_MANY_REQUESTS]:
      "عدد كبير جداً من الطلبات. يرجى المحاولة بعد {{field}} دقيقه",

    // Not found errors
    [ERROR_CODES.NOT_FOUND]: "المورد غير موجود",
    [ERROR_CODES.USER_NOT_FOUND]: "المستخدم غير موجود",
    [ERROR_CODES.RECIPE_NOT_FOUND]: "الوصفة غير موجودة",
    [ERROR_CODES.ARTICLE_NOT_FOUND]: "المقالة غير موجودة",
    [ERROR_CODES.CATEGORY_NOT_FOUND]: "الفئة غير موجودة",
    [ERROR_CODES.FEEDBACK_NOT_FOUND]: "الملاحظات غير موجودة",

    // Conflict errors
    [ERROR_CODES.DUPLICATE_ENTRY]: "هذا الإدخال موجود بالفعل",
    [ERROR_CODES.EMAIL_ALREADY_EXISTS]: "عنوان البريد الإلكتروني مسجل بالفعل",
    [ERROR_CODES.USERNAME_ALREADY_EXISTS]: "اسم المستخدم مأخوذ بالفعل",

    // Server errors
    [ERROR_CODES.INTERNAL_SERVER_ERROR]: "حدث خطأ غير متوقع",
    [ERROR_CODES.DATABASE_ERROR]: "حدث خطأ في قاعدة البيانات",
    [ERROR_CODES.EMAIL_SEND_ERROR]: "فشل إرسال البريد الإلكتروني",

    // Business logic errors
    [ERROR_CODES.OTP_EXPIRED]: "انتهت صلاحية كلمة المرور لمرة واحدة",
    [ERROR_CODES.OTP_INVALID]: "كلمة المرور لمرة واحدة غير صحيحة",
    [ERROR_CODES.INVALID_OTP_ATTEMPTS]:
      "عدد كبير جداً من محاولات كلمة المرور غير الصحيحة",

    // Auth-specific errors
    [ERROR_CODES.EMAIL_NOT_VERIFIED]: "يرجى التحقق من بريدك الإلكتروني أولاً",
    [ERROR_CODES.PHONE_ALREADY_EXISTS]: "رقم الهاتف مسجل بالفعل",
    [ERROR_CODES.INVALID_REFRESH_TOKEN]: "رمز التحديث غير صحيح",
    [ERROR_CODES.EMAIL_NOT_FOUND]: "عنوان البريد الإلكتروني غير موجود",

    // Specialist-specific errors
    [ERROR_CODES.SPECIALIST_NOT_FOUND]: "المتخصص غير موجود",
    [ERROR_CODES.USER_NOT_SPECIALIST]: "المستخدم ليس متخصصاً",

    // Category errors
    // [ERROR_CODES.INVALID_CATEGORY_TYPE]: "نوع الفئة غير صحيح",
    [ERROR_CODES.CATEGORY_ALREADY_EXISTS]: "الفئة موجودة بالفعل لهذا النوع",
    [ERROR_CODES.CATEGORY_IN_USE]:
      "لا يمكن حذف الفئة. {{count}} عنصر (عناصر) يستخدم (تستخدم) هذه الفئة",
    [ERROR_CODES.SLUG_ALREADY_EXISTS]: "فئة بهذا الاسم أو الرابط موجودة بالفعل",

    // Recipe/Article errors
    [ERROR_CODES.DUPLICATE_TITLE]: "يوجد {{type}} بهذا العنوان بالفعل",

    // Validator-specific errors
    [ERROR_CODES.REQUIRED_FIELD]: "{{field}} مطلوب",
    [ERROR_CODES.INVALID_LENGTH]: "{{field}} يجب أن يكون {{min}}-{{max}} حرفاً",
    [ERROR_CODES.INVALID_PHONE_FORMAT]: "صيغة رقم الهاتف المصري غير صحيحة",
    [ERROR_CODES.INVALID_SORT_OPTION]: "خيار الفرز غير صحيح",
    [ERROR_CODES.INVALID_STATUS_OPTION]: "خيار الحالة غير صحيح",
    [ERROR_CODES.INVALID_ROLE]: "دور غير صحيح",
    [ERROR_CODES.INVALID_SPECIALIST_STATUS]: "حالة متخصص غير صحيحة",
    [ERROR_CODES.EMAIL_OR_PHONE_REQUIRED]:
      "البريد الإلكتروني أو رقم الهاتف مطلوب",
    [ERROR_CODES.EITHER_EMAIL_OR_PHONE_REQUIRED]:
      "البريد الإلكتروني أو رقم الهاتف مطلوب",
    [ERROR_CODES.PASSWORD_REQUIRED]: "كلمة المرور مطلوبة",
    [ERROR_CODES.OTP_CODE_REQUIRED]: "رمز كلمة المرور لمرة واحدة مطلوب",
    [ERROR_CODES.OTP_CODE_INVALID_LENGTH]: "رمز OTP يجب أن يكون 6 أرقام",
    [ERROR_CODES.INVALID_MONGO_ID_FORMAT]: "معرف {{field}} غير صحيح",

    // Helper-specific errors
    [ERROR_CODES.SLUG_GENERATION_FAILED]: "العنوان مطلوب لإنشاء الرابط",
    [ERROR_CODES.INGREDIENTS_REQUIRED]: "مكون واحد على الأقل مطلوب",
    [ERROR_CODES.MAX_INGREDIENTS_EXCEEDED]: "الحد الأقصى 50 مكون",
    [ERROR_CODES.INGREDIENT_NAME_INVALID]:
      "المكون {{index}}: الاسم مطلوب ويجب أن يكون نصاً",
    [ERROR_CODES.INGREDIENT_QUANTITY_INVALID]:
      "المكون {{index}}: الكمية مطلوبة ويجب أن تكون نصاً",
    [ERROR_CODES.INGREDIENT_NAME_LENGTH_INVALID]:
      "المكون {{index}}: الاسم يجب أن يكون بين 2 و100 حرف",
    [ERROR_CODES.INGREDIENT_UNIT_INVALID]:
      "المكون {{index}}: وحدة غير صحيحة. يجب أن تكون من {{units}}",
    [ERROR_CODES.INSTRUCTIONS_REQUIRED]: "التعليمات يجب أن تكون مصفوفة",
    [ERROR_CODES.MAX_INSTRUCTIONS_EXCEEDED]: "الحد الأقصى 200 خطوة تعليمات",
    [ERROR_CODES.INSTRUCTION_DESCRIPTION_INVALID]:
      "الخطوة {{index}}: الوصف مطلوب ويجب أن يكون نصاً",
    [ERROR_CODES.INSTRUCTION_DESCRIPTION_TOO_SHORT]:
      "الخطوة {{index}}: الوصف يجب أن يكون 5 أحرف على الأقل",
    [ERROR_CODES.NUTRITION_INFO_INVALID]: "معلومات التغذية يجب أن تكون كائناً",
    [ERROR_CODES.NUTRITION_FIELD_INVALID]: "حقل التغذية غير صحيح: {{field}}",
    [ERROR_CODES.NUTRITION_FIELD_VALUE_INVALID]:
      "{{field}} يجب أن يكون رقماً غير سالب",
    [ERROR_CODES.TAGS_REQUIRED]: "الوسوم يجب أن تكون مصفوفة",
    [ERROR_CODES.MAX_TAGS_EXCEEDED]: "الحد الأقصى 10 وسوم",
    [ERROR_CODES.TAG_INVALID]: "الوسم {{index}}: يجب أن يكون نصاً غير فارغ",
    [ERROR_CODES.TAG_LENGTH_INVALID]:
      "الوسم {{index}}: يجب ألا يتجاوز 50 حرفاً",
    [ERROR_CODES.PREP_TIME_INVALID]: "وقت التحضير يجب أن يكون بين 0 و480 دقيقة",
    [ERROR_CODES.COOK_TIME_INVALID]: "وقت الطهي يجب أن يكون بين 0 و480 دقيقة",
    [ERROR_CODES.INVALID_DIFFICULTY]: "مستوى الصعوبة غير صحيح",
    [ERROR_CODES.REFRESH_TOKEN_REQUIRED]: "رمز التحديث مطلوب",
    [ERROR_CODES.DIFFICULTY_LEVEL_INVALID]: "مستوى الصعوبة غير صحيح",
    [ERROR_CODES.CATEGORY_INVALID_TYPE_RECIPE]:
      "الفئة يجب أن تكون من نوع 'وصفة'",
    [ERROR_CODES.CATEGORY_INVALID_TYPE_ARTICLE]:
      "الفئة يجب أن تكون من نوع 'مقالة'",
    [ERROR_CODES.CATEGORY_INACTIVE]: "يجب أن تكون الفئة نشطة",
    [ERROR_CODES.ESTIMATED_READ_TIME_INVALID]:
      "وقت القراءة المقدر يجب أن يكون بين 1 و120 دقيقة",
    [ERROR_CODES.INVALID_BOOLEAN_VALUE]: "قيمة منطقية غير صحيحة",
    [ERROR_CODES.INVALID_PAGE_NUMBER]:
      "رقم الصفحة يجب أن يكون عدداً صحيحاً موجبا",
    [ERROR_CODES.INVALID_LIMIT_NUMBER]: "عدد الصفوف يجب أن يكون بين 1 و100",
    [ERROR_CODES.INVALID_SLUG_FORMAT]:
      "الرابط يجب أن يحتوي على أحرف وأرقام وشرطات فقط",
    [ERROR_CODES.INVALID_ORDER]: "الترتيب يجب أن يكون عدداً صحيحاً غير سالب",
    [ERROR_CODES.INVALID_CATEGORY_TYPE]:
      "نوع الفئة يجب ان يكون 'وصفة' او 'مقالة'",
    [ERROR_CODES.INVALID_UPDATES_ARRAY]:
      "مصفوفة التحديثات يجب ان تكون من نوع [ {id: string, order: positive integer} ]",
    [ERROR_CODES.PROFILE_DELETED_SUCCESS]: "تم حذف الملف الشخصي بنجاح",
    [ERROR_CODES.SPECIALIST_ACTIVATED_SUCCESS]: "تم تفعيل المتخصص بنجاح",
    [ERROR_CODES.SPECIALIST_DEACTIVATED_SUCCESS]:
      "تم إلغاء تفعيل المتخصص بنجاح",
    [ERROR_CODES.PASSWORD_RESET_SUCCESS]: "تم إعادة تعيين كلمة المرور بنجاح",
    [ERROR_CODES.OTP_SENT_SUCCESS]: "تم إرسال كلمة المرور لمرة واحدة بنجاح",
    [ERROR_CODES.LOGOUT_SUCCESS]: "تم تسجيل الخروج بنجاح",
    [ERROR_CODES.OTP_VERIFIED_SUCCESS]:
      "تم التحقق من كلمة المرور لمرة واحدة بنجاح",
    [ERROR_CODES.DELETE_SUCCESS]: "{{item}} تم حذفه بنجاح",
    [ERROR_CODES.RECIPE_NOT_AVAILABLE]: "الوصفة غير متاحة",
    [ERROR_CODES.ARTICLE_NOT_AVAILABLE]: "المقالة غير متاحة",
    [ERROR_CODES.INVALID_LANGUAGE]: "لغة غير صحيحة. اللغات المدعومة هي: en, ar",

    // Subscription errors
    [ERROR_CODES.SUBSCRIPTION_NOT_FOUND]: "خطة الاشتراك غير موجودة",
    [ERROR_CODES.USER_SUBSCRIPTION_NOT_FOUND]: "المستخدم لم يشتركss من قبل",
    [ERROR_CODES.ORDER_NOT_FOUND]: "الطلب غير موجود",
    [ERROR_CODES.NO_ACTIVE_SUBSCRIPTION]: "لا توجد اشتراكات نشطة",
    [ERROR_CODES.SUBSCRIPTION_REQUIRED]:
      "تحتاج إلى اشتراك نشط للوصول إلى هذا المورد",
    [ERROR_CODES.PAYMENT_VERIFICATION_FAILED]: "فشل التحقق من الدفع",
    [ERROR_CODES.WEBHOOK_VERIFICATION_FAILED]: "فشل التحقق من توقيع الخطاف",
    [ERROR_CODES.INVALID_ORDER_ID]: "صيغة معرف الطلب غير صحيحة",
    [ERROR_CODES.INVALID_SUBSCRIPTION_ID]: "صيغة معرف الاشتراك غير صحيحة",
    [ERROR_CODES.PAYMOB_API_ERROR]: "حدث خطأ في الاتصال بوسيط الدفع",
    [ERROR_CODES.SUBSCRIPTION_CREATED]: "تم إنشاء خطة الاشتراك بنجاح",
    [ERROR_CODES.PAYMENT_INITIATED]: "تم بدء الدفع بنجاح",
    [ERROR_CODES.PAYMENT_SUCCESS]: "نجح الدفع وتم تفعيل الاشتراك",
    [ERROR_CODES.SUBSCRIPTION_CANCELLED]: "تم إلغاء الاشتراك بنجاح",
    [ERROR_CODES.RENEWAL_INITIATED]: "تم بدء دفع التجديد بنجاح",
    [ERROR_CODES.WEBHOOK_PROCESSED]: "تم معالجة الخطاف بنجاح",
    [ERROR_CODES.SUBSCRIPTION_ALREADY_EXISTS]:
      "خطة اشتراك بهذا الاسم موجودة بالفعل",
    [ERROR_CODES.SUBSCRIPTION_EXPIRED]: "انتهت صلاحية الاشتراك",
    [ERROR_CODES.SUBSCRIPTION_NAME_INVALID]:
      "يجب أن يكون اسم الخطة أحدًا من: 1_month, 3_months, 6_months, 12_months",
    [ERROR_CODES.SUBSCRIPTION_DISPLAY_NAME_REQUIRED]:
      "اسم العرض مطلوب ويجب أن يكون بين 2-50 حرفًا",
    [ERROR_CODES.SUBSCRIPTION_DURATION_INVALID]:
      "يجب أن تكون المدة بين 1 و 730 يومًا",
    [ERROR_CODES.SUBSCRIPTION_PRICE_INVALID]: "يجب أن يكون السعر رقمًا موجبًا",
    [ERROR_CODES.SUBSCRIPTION_FEATURES_INVALID]:
      "يجب أن تكون الميزات مصفوفة من السلاسل النصية",
    [ERROR_CODES.PAYMENT_FAILED]: "فشل الدفع. يرجى المحاولة مرة أخرى",
    [ERROR_CODES.ORDER_EXPIRED]: "انتهت صلاحية الطلب",
    [ERROR_CODES.SUBSCRIPTION_UPDATED]: "تم تحديث خطة الاشتراك بنجاح",
    [ERROR_CODES.SUBSCRIPTION_DELETED]: "تم حذف خطة الاشتراك بنجاح",
    [ERROR_CODES.PAYMENT_PENDING]: "الدفع لا يزال معلقًا",
    [ERROR_CODES.PAYMENT_STATUS]: "حالة الدفع: {{status}}",
    [ERROR_CODES.FILE_UPLOAD_ERROR]: "خطاء في تحميل الملف",
  },
};

/**
 * Get the user's preferred language from request
 * Priority: query param > header > cookie > default
 */
export const getLanguage = (req) => {
  const lang =
    req.query.lang ||
    req.headers["accept-language"]
      ?.split(",")[0]
      ?.split("-")[0]
      ?.toLowerCase() ||
    req.cookies?.lang ||
    "en";

  return translations[lang] ? lang : "en";
};

/**
 * Field name translations for validation messages
 */
export const fieldNames = {
  en: {
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone number",
    password: "Password",
    title: "Title",
    description: "Description",
    content: "Content",
    category: "Category",
    tags: "Tags",
    ingredients: "Ingredients",
    instructions: "Instructions",
    nutrition: "Nutrition info",
    difficulty: "Difficulty",
    cookTime: "Cook time",
    prepTime: "Prep time",
    servings: "Servings",
    code: "OTP code",
    refreshToken: "Refresh token",
    specialization: "Specialization",
    experienceYears: "Experience years",
    estimatedReadTime: "Estimated read time",
    search: "Search",
    user: "User",
    specialist: "Specialist",
    admin: "Admin",
    category: "Category",
    article: "Article",
    recipe: "Recipe",
    calories: "Calories",
    protein: "Protein",
    fat: "Fat",
    carbs: "Carbohydrates",
    fiber: "Fiber",
    isHidden: "Is hidden",
    name: "Name",
    displayName: "Display name",
    price: "Price",
    durationInDays: "Duration in days",
    reason: "Reason",
    subscriptionPlan: "Subscription plan",
    userSubscriptionId: "User subscription ID",
    rating: "Rating",
    review: "Review",
    feedback: "Feedback",
  },
  ar: {
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    email: "البريد الإلكتروني",
    phone: "رقم الهاتف",
    password: "كلمة المرور",
    title: "العنوان",
    description: "الوصف",
    content: "المحتوى",
    category: "الفئة",
    tags: "الوسوم",
    ingredients: "المكونات",
    instructions: "التعليمات",
    nutrition: "معلومات التغذية",
    difficulty: "مستوى الصعوبة",
    cookTime: "وقت الطهي",
    prepTime: "وقت التحضير",
    servings: "عدد الحصص",
    code: "رمز OTP",
    refreshToken: "رمز التحديث",
    specialization: "التخصص",
    experienceYears: "سنوات الخبرة",
    estimatedReadTime: "وقت القراءة المتوقع",
    search: "بحث",
    user: "المستخدم",
    specialist: "المتخصص",
    admin: "المسؤول",
    category: "الفئة",
    article: "مقالة",
    recipe: "وصفة",
    calories: "السعرات الحرارية",
    protein: "البروتين",
    fat: "الدهون",
    carbs: "الكربوهيدرات",
    fiber: "الألياف",
    isHidden: "مخفي",
    name: "الاسم",
    displayName: "اسم العرض",
    price: "السعر",
    durationInDays: "المدة بالأيام",
    reason: "السبب",
    subscriptionPlan: "خطة الاشتراك",
    userSubscriptionId: "معرف الاشتراك الخاص بالمستخدم",
    rating: "التقييم",
    review: "المراجعة",
    feedback: "الملاحظات",
  },
};

/**
 * Get translated field name
 */
export const getFieldName = (fieldKey, lang = "en") => {
  const names = fieldNames[lang] || fieldNames.en;
  return names[fieldKey] || fieldKey;
};

/**
 * Translate a message with optional field replacements
 */
export const translate = (code, lang = "en", data = {}) => {
  const dict = translations[lang] || translations.en;
  let message = dict[code] || code;

  // Replace placeholders like {{field}}
  Object.keys(data).forEach((key) => {
    message = message.replace(
      new RegExp(`{{${key}}}`, "g"),
      getFieldName(data[key], lang),
    );
  });

  return message;
};

/**
 * Create a localized error object
 */
export const createError = (code, statusCode = 400, lang = "en", data = {}) => {
  const error = new Error(translate(code, lang, data));
  error.code = code;
  error.status = statusCode;
  error.lang = lang;
  error.translatedMessage = translate(code, lang, data);
  return error;
};

/**
 * MongoDB error to error code mapping
 */
const mongoErrorMap = {
  11000: {
    code: ERROR_CODES.DUPLICATE_ENTRY,
    status: 409,
    messageMap: {
      email: ERROR_CODES.EMAIL_ALREADY_EXISTS,
      username: ERROR_CODES.USERNAME_ALREADY_EXISTS,
    },
  },
  CastError: {
    code: ERROR_CODES.INVALID_MONGO_ID,
    status: 400,
  },
  ValidationError: {
    code: ERROR_CODES.INVALID_INPUT,
    status: 400,
  },
};

/**
 * Convert MongoDB errors to localized error codes
 */
export const mapMongoError = (error, lang = "en") => {
  // Handle duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    const mapping = mongoErrorMap[11000].messageMap;
    const code = mapping[field] || mongoErrorMap[11000].code;
    return {
      code,
      status: 409,
      message: translate(code, lang),
    };
  }

  // Handle validation errors
  if (error.name === "ValidationError") {
    const messages = Object.keys(error.errors).map((field) => {
      return {
        field: getFieldName(field, lang),
        code: error.errors[field].message || ERROR_CODES.MISSING_FIELD,
        message: translate(
          error.errors[field].message || ERROR_CODES.MISSING_FIELD,
          lang,
          { field: getFieldName(field, lang) },
          error.errors[field],
        ),
      };
    });

    return {
      code: ERROR_CODES.INVALID_INPUT,
      status: 400,
      errors: messages,
    };
  }

  // Handle cast errors
  if (error.name === "CastError") {
    return {
      code: ERROR_CODES.INVALID_MONGO_ID,
      status: 400,
      message: translate(ERROR_CODES.INVALID_MONGO_ID, lang),
    };
  }

  return null;
};
