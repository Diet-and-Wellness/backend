import { sanitizeObject } from "#utils/sanitizer.js";

const sanitizationMiddleware = (req, res, next) => {
  // Only sanitize if request has a body
  if (!req.body) return next();

  // Skip webhook endpoints that need raw body verification
  if (req.path.includes("/webhook")) {
    return next();
  }

  // Only sanitize on methods that have bodies
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    req.body = sanitizeObject(req.body);
  }

  next();
};

export default sanitizationMiddleware;
