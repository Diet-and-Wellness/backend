// Enhanced validation middleware with localization support
// Converts express-validator errors to localized error codes

import { validationResult } from "express-validator";
import {
  getLanguage,
  translate,
  ERROR_CODES,
  getFieldName,
} from "#utils/localization.js";

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const lang = getLanguage(req);

    // Convert validation errors to structured format
    const formattedErrors = errors.array().map((err) => {
      // Extract field name and error message
      const field = err.path || err.param;
      const msg = err.msg;

      // Determine error code based on message
      let code = msg[0] || ERROR_CODES.INVALID_INPUT;

      if (msg.includes("required")) code = ERROR_CODES.MISSING_FIELD;
      else if (msg.includes("format")) code = ERROR_CODES.INVALID_FORMAT;
      else if (msg.includes("email")) code = ERROR_CODES.INVALID_EMAIL;
      else if (msg.includes("Mongo")) code = ERROR_CODES.INVALID_MONGO_ID;
      else if (msg.includes("array")) code = ERROR_CODES.INVALID_ARRAY;
      else if (msg.includes("password")) code = ERROR_CODES.PASSWORD_TOO_WEAK;

      return {
        field: getFieldName(field, lang),
        code,
        message: translate(code, lang, {
          field: getFieldName(field, lang),
          ...msg[1],
        }),
      };
    });

    return res.status(400).json({
      success: false,
      code: ERROR_CODES.INVALID_INPUT,
      message: translate(ERROR_CODES.INVALID_INPUT, lang),
      errors: formattedErrors,
    });
  }

  next();
};

export default handleValidationErrors;
