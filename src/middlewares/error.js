/**
 * Centralized error handling middleware
 * Handles all types of errors: validation, MongoDB, authentication, and generic
 * Returns localized, structured error responses
 */

import {
  getLanguage,
  translate,
  ERROR_CODES,
  mapMongoError,
} from "#utils/localization.js";
import cloudinaryService from "#utils/cloudinary.js";

const errorHandler = (err, req, res, next) => {
  const lang = getLanguage(req);
  let errorResponse = {
    success: false,
    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    message: translate(ERROR_CODES.INTERNAL_SERVER_ERROR, lang),
  };
  let statusCode = 500;

  // Log error for debugging
  console.error("[ERROR]", {
    code: err.code,
    message: err.message,
    stack: err.stack,
    name: err.name,
    err: err.errors,
  });

  // Handle custom app errors (with code property)
  if (err.code && err.status) {
    errorResponse = {
      success: false,
      code: err.code,
      message: translate(err.code, lang, err.params || {}),
    };
    statusCode = err.status;
  }
  //  handle PayMob API errors
  else if (err.name === "PayMobError") {
    errorResponse = {
      success: false,
      code: ERROR_CODES.PAYMOB_API_ERROR,
      message: translate(ERROR_CODES.PAYMOB_API_ERROR, lang),
      errors: err.errors || [],
    };
    statusCode = 400;
  }
  // Handle MongoDB errors
  else if (err.name && ["ValidationError", "CastError"].includes(err.name)) {
    const mongoError = mapMongoError(err, lang);
    if (mongoError) {
      errorResponse = {
        success: false,
        code: err.code || mongoError.code,
        errors: mongoError.errors,
        message: mongoError.message,
      };
      statusCode = mongoError.status;
    }
  }
  // Handle duplicate key error (MongoDB 11000)
  else if (err.code === 11000) {
    const mongoError = mapMongoError(err, lang);
    if (mongoError) {
      errorResponse = {
        success: false,
        code: mongoError.code,
        message: mongoError.message,
      };
      statusCode = mongoError.status;
    }
  }
  // Handle JWT errors
  else if (err.name === "JsonWebTokenError") {
    errorResponse = {
      success: false,
      code: ERROR_CODES.INVALID_TOKEN,
      message: translate(ERROR_CODES.INVALID_TOKEN, lang),
    };
    statusCode = 401;
  } else if (err.name === "TokenExpiredError") {
    errorResponse = {
      success: false,
      code: ERROR_CODES.TOKEN_EXPIRED,
      message: translate(ERROR_CODES.TOKEN_EXPIRED, lang),
    };
    statusCode = 401;
  }
  // Handle standard HTTP errors with status
  else if (err.status) {
    statusCode = err.status;
    errorResponse = {
      success: false,
      code: err.code || ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: err.message,
    };
  }

  // Clean up any image uploaded to Cloudinary during this request if the request failed
  if (req.uploadedCloudinaryUrl) {
    cloudinaryService.deleteImage(req.uploadedCloudinaryUrl).catch((e) => {
      console.error("[CLOUDINARY ROLLBACK FAILED]", e.message);
    });
  }

  res.status(statusCode).json(errorResponse);
};

export default errorHandler;
