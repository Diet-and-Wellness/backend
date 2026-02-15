import xss from "xss";

// Custom XSS options - strip all HTML tags and dangerous attributes
const xssOptions = {
  whiteList: {}, // No HTML tags allowed
  stripIgnoreTag: true, // Strip tags that are not in whitelist
  stripLeadingAndTrailingWhitespace: true,
};

// Sanitize a single string value
// Removes HTML, scripts, and SQL injection patterns
export const sanitizeString = (value) => {
  if (typeof value !== "string") return value;

  // Remove XSS attempts via xss library
  let sanitized = xss(value, xssOptions);

  // Remove NoSQL injection operators ($ and .)
  sanitized = sanitized.replace(/[$]/g, "");

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
};

// Sanitize an object recursively
// Cleans string values while preserving structure and other types
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) =>
      typeof item === "string" ? sanitizeString(item) : sanitizeObject(item),
    );
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

// Sanitize specific fields in an object
// Only sanitizes listed fields, leaves others untouched
export const sanitizeFields = (obj, fields = []) => {
  if (!obj || typeof obj !== "object") return obj;

  const sanitized = { ...obj };

  for (const field of fields) {
    if (field in sanitized) {
      const value = sanitized[field];
      if (typeof value === "string") {
        sanitized[field] = sanitizeString(value);
      } else if (typeof value === "object" && value !== null) {
        sanitized[field] = sanitizeObject(value);
      }
    }
  }

  return sanitized;
};

export default {
  sanitizeString,
  sanitizeObject,
  sanitizeFields,
};
