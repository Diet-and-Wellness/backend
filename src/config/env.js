import dotenv from "dotenv";

dotenv.config();

const env = {
  port: process.env.PORT || 5000,
  dbUrl: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,

  googleAppPassword: process.env.GOOGLE_APP_PASSWORD,
  mailFrom: process.env.MAIL_FROM,

  paymobApiKey: process.env.PAYMOB_API_KEY,
  paymobSecretKey: process.env.PAYMOB_SECRET_KEY,
  paymobPublicKey: process.env.PAYMOB_PUBLIC_KEY,
  paymobIframeId: process.env.PAYMOB_IFRAME_ID,
  paymobPaymentIntegrationId: Number(process.env.PAYMOB_PAYMENT_INTEGRATION_ID),
  paymobWebhookSecret: process.env.PAYMOB_WEBHOOK_SECRET,
  frontendUrl: process.env.FRONTEND_URL,
  backendUrl: process.env.BACKEND_URL,

  allowedOrigins: [process.env.FRONTEND_URL || "http://localhost:3000"],
};

export default env;
