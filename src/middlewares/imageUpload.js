import multer from "multer";
import cloudinaryService from "#utils/cloudinary.js";
import { translate, ERROR_CODES } from "#utils/localization.js";

// Configure multer for in-memory storage
const storage = multer.memoryStorage();

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  // Check MIME type
  const allowedMimes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/jpg",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error(
      translate(ERROR_CODES.INVALID_FILE_TYPE, "en", {
        allowed: "JPEG, PNG, WebP, GIF",
      }),
    );
    err.code = ERROR_CODES.INVALID_FILE_TYPE;
    err.status = 400;
    cb(err);
  }
};

// Multer upload configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

// Middleware to handle image upload to Cloudinary
// Processes file, uploads to Cloudinary, and attaches URL to request
const uploadToCloudinary = async (req, res, next) => {
  // If no file is provided, continue to next middleware
  if (!req.file) {
    return next();
  }

  // Validate file exists
  if (!req.file.buffer) {
    const err = new Error(translate(ERROR_CODES.FILE_REQUIRED, "en"));
    err.code = ERROR_CODES.FILE_REQUIRED;
    err.status = 400;
    return next(err);
  }

  try {
    // Upload to Cloudinary using the utility function
    const cloudinaryResult = await cloudinaryService.uploadImage(
      req.file,
      req.cloudinaryOptions,
    );

    req.body.attachmentUrl = cloudinaryResult.secure_url;
    req.uploadedCloudinaryUrl = cloudinaryResult.secure_url;
    next();
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    const err = new Error(
      translate(ERROR_CODES.FILE_UPLOAD_ERROR || "FILE_UPLOAD_ERROR", "en"),
    );
    err.code = ERROR_CODES.FILE_UPLOAD_ERROR || "FILE_UPLOAD_ERROR";
    err.status = 400;
    err.originalError = error.message;
    next(err);
  }
};

export default {
  upload: upload.single("attachment"),
  uploadToCloudinary,
};
