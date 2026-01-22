import dotenv from "dotenv";

dotenv.config();

const env = {
  port: process.env.PORT || 5000,
  dbUrl: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,

  googleAppPassword: process.env.GOOGLE_APP_PASSWORD,
  mailFrom: process.env.MAIL_FROM,
};

export default env;
