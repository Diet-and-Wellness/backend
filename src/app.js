import express from "express";
import cors from "cors";
import morgan from "morgan";

import routes from "./routes.js";
import languageMiddleware from "#middlewares/language.js";
import errorHandler from "#middlewares/error.js";

const app = express();

// Middleware setup
app.use(cors());

// Raw body for Paymob webhook HMAC verification
// Must be before express.json() for webhook endpoint
app.use(
  express.json({
    verify: (req, res, buf) => {
      // Store raw body for webhook verification
      if (req.path === "/api/subscriptions/webhook") {
        req.rawBody = buf.toString("utf8");
      }
    },
  }),
);

// Logging middleware
// app.use(morgan("dev"));
app.use(morgan("combined"));

// Language detection middleware - MUST come early
app.use(languageMiddleware);

// Routes setup
app.use("/api", routes);

// Error handling middleware - MUST come last
app.use(errorHandler);

export default app;
