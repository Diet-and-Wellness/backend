// Language detection middleware

import { getLanguage } from "#utils/localization.js";

export const languageMiddleware = (req, res, next) => {
  // Detect language
  req.language = getLanguage(req);

  // Set response language header for client reference
  res.setHeader("Content-Language", req.language);

  next();
};

export default languageMiddleware;
