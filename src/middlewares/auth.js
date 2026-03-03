import env from "#config/env.js";
import jwt from "#utils/jwt.js";
import { getLanguage, ERROR_CODES, translate } from "#utils/localization.js";
import User from "#models/user.js";

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const lang = getLanguage(req);

    return res.status(401).json({
      success: false,
      code: ERROR_CODES.INVALID_TOKEN,
      message: translate(ERROR_CODES.INVALID_TOKEN, lang),
    });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verifyAccessToken(token);
    req.user = decoded;

    // Update lastSeen asynchronously — do not block the request
    User.findByIdAndUpdate(decoded.user_id, { lastSeen: new Date() }).exec();

    next();
  } catch {
    const lang = getLanguage(req);

    return res.status(401).json({
      success: false,
      code: ERROR_CODES.INVALID_TOKEN,
      message: translate(ERROR_CODES.INVALID_TOKEN, lang),
    });
  }
};

export default authenticate;
