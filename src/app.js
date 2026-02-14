import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

import routes from "./routes.js";
import languageMiddleware from "#middlewares/language.js";
import sanitizationMiddleware from "#middlewares/sanitization.js";
import errorHandler from "#middlewares/error.js";
import { globalLimiter } from "#middlewares/rateLimiter.js";
import env from "#config/env.js";

const app = express();

// Middleware setup
// Security: HTTP Security Headers via Helmet
// Must be applied before CORS for proper header precedence
app.use(
  helmet({
    // X-Content-Type-Options: Prevents MIME type sniffing attacks
    // Ensures browsers respect the Content-Type header instead of guessing
    noSniff: true,

    // X-Frame-Options: Prevents clickjacking attacks
    // Prevents the site from being framed by other sites
    frameguard: {
      action: "deny",
    },

    // X-XSS-Protection: Legacy XSS protection for older browsers
    // Forces enable XSS filter and blocks page if attack detected
    xssFilter: true,

    // Strict-Transport-Security: Forces HTTPS connection
    // Prevents SSL stripping attacks by making browser always use HTTPS
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true, // Include in browser preload list
    },

    // Content-Security-Policy: Whitelist trusted resource sources
    // Prevents inline script injection and restricts resource loading
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline for inline styles if needed
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "data:", "https:"],
        connectSrc: [
          "'self'",
          process.env.FRONTEND_URL || "http://localhost:3000",
        ],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        upgradeInsecureRequests:
          process.env.NODE_ENV === "production" ? [] : null,
      },
      reportOnly: false, // Set to true to only report violations without blocking
    },

    // Referrer-Policy: Controls referrer information sharing
    // Prevents leaking sensitive URLs to third-party sites
    referrerPolicy: {
      policy: "strict-origin-when-cross-origin",
    },

    // X-Permitted-Cross-Domain-Policies: Restricts Flash/PDF access
    // Prevents old Flash/PDF files from bypassing CORS policies
    crossOriginEmbedderPolicy: true,

    // Permissions-Policy: Disable unnecessary browser features
    // Restricts access to camera, microphone, geolocation, etc.
    permissionsPolicy: {
      features: {
        camera: ["()"],
        microphone: ["()"],
        geolocation: ["()"],
        usb: ["()"],
      },
    },
  }),
);

app.use(
  cors({
    origin: function (origin, callback) {
      // For requests without Origin header (same-origin, Node.js calls), allow them
      // Origin header is only set for cross-origin requests
      if (!origin) return callback(null, true);

      // Check if origin is in whitelist
      if (env.allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Reject with error - express-cors will return 403 Forbidden
        callback(new Error("CORS policy: Origin not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept-Language"],
    maxAge: 86400, // 24 hours - cache preflight response
    optionsSuccessStatus: 200, // For older browsers that expect 200 for successful OPTIONS
  }),
);

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

// Security: Input Sanitization Middleware
// Prevents XSS attacks and NoSQL injection by sanitizing request bodies
app.use(sanitizationMiddleware);

// Logging middleware
// app.use(morgan("dev"));
app.use(morgan("combined"));

// Language detection middleware - MUST come early
app.use(languageMiddleware);
// Security: Global Rate Limiter - Safety net for all requests
// Applies to all routes as protection against traffic spikes
app.use(globalLimiter);

// Routes setup
app.use("/api", routes);

// Error handling middleware - MUST come last
app.use(errorHandler);

export default app;
