import dotenv from "dotenv";

dotenv.config();

const env = {
  environment: process.env.ENVIRONMENT || "development",
  port: process.env.PORT || 5000,
  dbUrl: process.env.MONGO_URI,
  dbName: process.env.DB_NAME,
  jwtSecret: process.env.JWT_SECRET,

  googleAppPassword: process.env.GOOGLE_APP_PASSWORD,
  mailFrom: process.env.BUSINESS_EMAIL,
  contactUsEmail: process.env.BUSINESS_EMAIL,

  paymobApiKey: process.env.PAYMOB_API_KEY,
  paymobSecretKey: process.env.PAYMOB_SECRET_KEY,
  paymobPublicKey: process.env.PAYMOB_PUBLIC_KEY,
  paymobIframeId: process.env.PAYMOB_IFRAME_ID,
  paymobPaymentIntegrationId: Number(process.env.PAYMOB_PAYMENT_INTEGRATION_ID),
  paymobWebhookSecret: process.env.PAYMOB_WEBHOOK_SECRET,

  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,

  frontendUrl: process.env.FRONTEND_URL,
  backendUrl: process.env.BACKEND_URL,

  // allowedOrigins: [process.env.FRONTEND_URL || "http://localhost:3000"],
};

if (env.environment === "production") {
  env.allowedOrigins = [env.frontendUrl, "http://localhost:3000"];
} else {
  env.allowedOrigins = [env.frontendUrl, "http://localhost:3000"];
}

export default env;
