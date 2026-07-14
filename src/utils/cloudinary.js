import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import env from "#config/env.js";
import { translate, ERROR_CODES } from "#utils/localization.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
});

// Upload image to Cloudinary with optimization
const uploadImage = async (file, options = {}) => {
  try {
    if (!file || !file.buffer) {
      throw new Error(translate(ERROR_CODES.FILE_REQUIRED, "en"));
    }

    const folder = options.folder || "nutrition";

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: "auto",
          quality: "auto",
          fetch_format: "auto",
          width: 1600,
          // height: 600,
          crop: "limit", // Don't distort, fit within dimensions
          ...options,
        },
        (error, result) => {
          if (error)
            return reject(
              new Error(
                translate(ERROR_CODES.FILE_UPLOAD_ERROR, "en", {
                  error: error.message,
                }),
              ),
            );
          resolve(result);
        },
      );

      const readableStream = Readable.from(file.buffer);
      readableStream.pipe(uploadStream);
    });
  } catch (error) {
    throw new Error(
      translate(ERROR_CODES.FILE_UPLOAD_ERROR, "en", {
        error: error.message,
      }),
    );
  }
};

// Upload image from URL to Cloudinary
const uploadImageFromUrl = async (imageUrl, options = {}) => {
  try {
    const folder = options.folder || "nutrition";

    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: folder,
      resource_type: "auto",
      quality: "auto",
      fetch_format: "auto",
      width: 1600,
      //   height: 600,
      crop: "limit",
      ...options,
    });

    return result;
  } catch (error) {
    throw new Error(
      translate(ERROR_CODES.FILE_UPLOAD_ERROR, "en", {
        error: error.message,
      }),
    );
  }
};

// Generate optimized image URL from Cloudinary
const getOptimizedUrl = (publicId, options = {}) => {
  try {
    return cloudinary.url(publicId, {
      fetch_format: "auto",
      quality: "auto",
      width: 800,
      //   height: 600,
      crop: "limit",
      ...options,
    });
  } catch (error) {
    throw new Error(
      translate(ERROR_CODES.INVALID_VALUE, "en", {
        field: "public_id",
      }),
    );
  }
};

// Delete image from Cloudinary
const deleteImage = async (imageUrl) => {
  try {
    const publicId = extractPublicId(imageUrl);

    if (!publicId) {
      return {
        success: false,
        message: translate(ERROR_CODES.INVALID_VALUE, "en", {
          field: "public_id",
        }),
      };
    }

    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(
      translate(ERROR_CODES.FILE_UPLOAD_ERROR, "en", {
        error: error.message,
      }),
    );
  }
};

// Extract public ID from Cloudinary URL
const extractPublicId = (url) => {
  try {
    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/<cloud_name>/image/upload/<public_id>.<format>
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.\w+$/);
    return match ? match[1] : null;
  } catch (error) {
    throw new Error(
      translate(ERROR_CODES.INVALID_FORMAT, "en", {
        field: "cloudinary_url",
      }),
    );
  }
};

export default {
  uploadImage,
  uploadImageFromUrl,
  getOptimizedUrl,
  deleteImage,
  extractPublicId,
};
